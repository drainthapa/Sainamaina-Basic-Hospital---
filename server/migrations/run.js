#!/usr/bin/env node
/**
 * Lightweight SQL migration runner.
 * Usage:
 *   node migrations/run.js up        - apply all pending migrations
 *   node migrations/run.js down      - revert the most recent migration
 *   node migrations/run.js status    - list applied / pending migrations
 *
 * Migration files live in this directory, named:
 *   001_create_extensions.sql
 *   001_create_extensions.down.sql   (optional, for `down`)
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../src/config/db');

const MIGRATIONS_DIR = __dirname;

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function getMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort();
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT name FROM schema_migrations ORDER BY id ASC');
  return result.rows.map((r) => r.name);
}

async function up() {
  await ensureMigrationsTable();
  const files = getMigrationFiles();
  const applied = await getAppliedMigrations();
  const pending = files.filter((f) => !applied.includes(f));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed to apply ${file}:`, err.message);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }
}

async function down() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  if (applied.length === 0) {
    console.log('No migrations to revert.');
    return;
  }
  const last = applied[applied.length - 1];
  const downFile = last.replace(/\.sql$/, '.down.sql');
  const downPath = path.join(MIGRATIONS_DIR, downFile);

  if (!fs.existsSync(downPath)) {
    console.error(`No down migration found for ${last} (expected ${downFile})`);
    process.exitCode = 1;
    return;
  }

  const sql = fs.readFileSync(downPath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('DELETE FROM schema_migrations WHERE name = $1', [last]);
    await client.query('COMMIT');
    console.log(`Reverted: ${last}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed to revert ${last}:`, err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

async function status() {
  await ensureMigrationsTable();
  const files = getMigrationFiles();
  const applied = await getAppliedMigrations();
  console.log('\nMigration status:');
  for (const file of files) {
    console.log(`  [${applied.includes(file) ? 'x' : ' '}] ${file}`);
  }
  console.log('');
}

async function main() {
  const cmd = process.argv[2] || 'up';
  try {
    if (cmd === 'up') await up();
    else if (cmd === 'down') await down();
    else if (cmd === 'status') await status();
    else {
      console.error(`Unknown command: ${cmd}. Use up | down | status.`);
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main();
