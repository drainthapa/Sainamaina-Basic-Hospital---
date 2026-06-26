const { query } = require('../config/db');

async function record({ userId, action, entityType, entityId, metadata, ipAddress }) {
  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId || null, action, entityType || null, entityId || null, JSON.stringify(metadata || {}), ipAddress || null]
  );
}

async function list({ limit = 50, offset = 0, entityType } = {}) {
  const conditions = [];
  const params = [];
  if (entityType) {
    params.push(entityType);
    conditions.push(`entity_type = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);
  const result = await query(
    `SELECT al.*, u.full_name AS user_name, u.email AS user_email
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return result.rows;
}

module.exports = { record, list };
