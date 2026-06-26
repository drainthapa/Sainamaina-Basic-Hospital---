const { query } = require('../config/db');

async function findByEmail(email) {
  const result = await query(
    `SELECT u.*, r.name AS role_name, r.permissions AS role_permissions
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1 AND u.deleted_at IS NULL`,
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.is_active, u.last_login_at, u.created_at,
            r.name AS role_name, r.permissions AS role_permissions
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1 AND u.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

async function findRoleByName(name) {
  const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
  return result.rows[0] || null;
}

async function updateLastLogin(userId) {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
}

async function setResetToken(userId, token, expiresAt) {
  await query(
    'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
    [token, expiresAt, userId]
  );
}

async function findByResetToken(token) {
  const result = await query(
    `SELECT * FROM users
     WHERE reset_password_token = $1 AND reset_password_expires > NOW() AND deleted_at IS NULL`,
    [token]
  );
  return result.rows[0] || null;
}

async function updatePassword(userId, passwordHash) {
  await query(
    `UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

async function create({ roleId, email, passwordHash, fullName, phone }) {
  const result = await query(
    `INSERT INTO users (role_id, email, password_hash, full_name, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, phone, created_at`,
    [roleId, email, passwordHash, fullName, phone || null]
  );
  return result.rows[0];
}

async function list({ limit = 50, offset = 0 } = {}) {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.is_active, u.last_login_at, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.deleted_at IS NULL
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

async function listRoles() {
  const result = await query('SELECT id, name, description FROM roles ORDER BY name');
  return result.rows;
}

async function setActive(userId, isActive) {
  const result = await query(
    'UPDATE users SET is_active = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id',
    [isActive, userId]
  );
  return result.rowCount > 0;
}

async function softDelete(userId) {
  const result = await query(
    'UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [userId]
  );
  return result.rowCount > 0;
}

async function updateRole(userId, roleId) {
  const result = await query(
    'UPDATE users SET role_id = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id',
    [roleId, userId]
  );
  return result.rowCount > 0;
}

module.exports = {
  findByEmail,
  findById,
  findRoleByName,
  updateLastLogin,
  setResetToken,
  findByResetToken,
  updatePassword,
  create,
  list,
  listRoles,
  setActive,
  softDelete,
  updateRole,
};
