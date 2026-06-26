const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    'WARNING: JWT_ACCESS_SECRET / JWT_REFRESH_SECRET are not set. ' +
      'Set them in your .env file before running in production.'
  );
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role_name, email: user.email },
    ACCESS_SECRET || 'dev_access_secret',
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET || 'dev_refresh_secret', {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET || 'dev_access_secret');
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET || 'dev_refresh_secret');
}

/** Hash a refresh token for storage (never store raw tokens in the DB). */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Parse "7d" / "15m" style duration strings into milliseconds, for cookie maxAge. */
function durationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  durationToMs,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
};
