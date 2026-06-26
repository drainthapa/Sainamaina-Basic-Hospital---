const { query } = require('../config/db');

async function store({ userId, tokenHash, userAgent, ipAddress, expiresAt }) {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, userAgent || null, ipAddress || null, expiresAt]
  );
}

async function findValid(tokenHash) {
  const result = await query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revoke(tokenHash) {
  await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
}

async function revokeAllForUser(userId) {
  await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
}

module.exports = { store, findValid, revoke, revokeAllForUser };
