const { query } = require('../config/db');

async function create({ fullName, address, email, message }) {
  const result = await query(
    `INSERT INTO contact_submissions (full_name, address, email, message)
     VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
    [fullName, address || null, email, message]
  );
  return result.rows[0];
}

async function list({ limit = 50, offset = 0, unreadOnly = false } = {}) {
  const where = unreadOnly ? 'WHERE is_read = FALSE' : '';
  const result = await query(
    `SELECT * FROM contact_submissions ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await query(`SELECT COUNT(*) FROM contact_submissions ${where}`);
  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function markRead(id) {
  const result = await query(
    'UPDATE contact_submissions SET is_read = TRUE WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

async function remove(id) {
  const result = await query('DELETE FROM contact_submissions WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

module.exports = { create, list, markRead, remove };
