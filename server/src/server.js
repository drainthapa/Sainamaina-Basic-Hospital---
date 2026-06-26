require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query('SELECT 1');
    logger.info('Connected to PostgreSQL.');
  } catch (err) {
    logger.error(`Failed to connect to PostgreSQL: ${err.message}`);
    logger.error('Check your .env DB_* settings and that PostgreSQL is running.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
