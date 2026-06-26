const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const {
  signAccessToken, signRefreshToken, verifyRefreshToken, hashToken, durationToMs, REFRESH_EXPIRES_IN,
} = require('../utils/tokenService');
const { ApiError } = require('../utils/apiResponse');

async function login({ email, password, userAgent, ipAddress }) {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokenUser = { id: user.id, role_name: user.role_name, email: user.email };
  const accessToken = signAccessToken(tokenUser);
  const refreshToken = signRefreshToken(tokenUser);

  await refreshTokenRepository.store({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + durationToMs(REFRESH_EXPIRES_IN)),
  });

  await userRepository.updateLastLogin(user.id);
  await auditLogRepository.record({ userId: user.id, action: 'login', ipAddress });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id, email: user.email, fullName: user.full_name, role: user.role_name,
    },
  };
}

async function refresh({ refreshToken, userAgent, ipAddress }) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepository.findValid(tokenHash);
  if (!stored) throw ApiError.unauthorized('Refresh token has been revoked or is unknown');

  const user = await userRepository.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  // Rotate: revoke old token, issue a new pair
  await refreshTokenRepository.revoke(tokenHash);

  const tokenUser = { id: user.id, role_name: user.role_name, email: user.email };
  const newAccessToken = signAccessToken(tokenUser);
  const newRefreshToken = signRefreshToken(tokenUser);

  await refreshTokenRepository.store({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + durationToMs(REFRESH_EXPIRES_IN)),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout({ refreshToken }) {
  if (!refreshToken) return;
  await refreshTokenRepository.revoke(hashToken(refreshToken));
}

async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await userRepository.findByEmail((await userRepository.findById(userId)).email);
  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  const newHash = await bcrypt.hash(newPassword, 12);
  await userRepository.updatePassword(userId, newHash);
  await refreshTokenRepository.revokeAllForUser(userId);
  await auditLogRepository.record({ userId, action: 'change_password' });
}

async function forgotPassword({ email }) {
  const user = await userRepository.findByEmail(email);
  // Always behave the same way whether or not the email exists, to avoid leaking which emails are registered.
  if (!user) return { token: null };

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await userRepository.setResetToken(user.id, token, expiresAt);
  await auditLogRepository.record({ userId: user.id, action: 'forgot_password_requested' });

  // NOTE: actual email delivery (e.g. via nodemailer/SES) is not wired up yet in this MVP.
  // Returning the token here only because there is no email service configured;
  // in production this must be emailed to the user, never returned in the API response.
  return { token };
}

async function resetPassword({ token, newPassword }) {
  const user = await userRepository.findByResetToken(token);
  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired');

  const newHash = await bcrypt.hash(newPassword, 12);
  await userRepository.updatePassword(user.id, newHash);
  await refreshTokenRepository.revokeAllForUser(user.id);
  await auditLogRepository.record({ userId: user.id, action: 'password_reset' });
}

module.exports = { login, refresh, logout, changePassword, forgotPassword, resetPassword };
