const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { durationToMs, REFRESH_EXPIRES_IN } = require('../utils/tokenService');

const REFRESH_COOKIE_NAME = 'refresh_token';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: durationToMs(REFRESH_EXPIRES_IN),
    path: '/api/auth',
  });
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({
    email, password, userAgent: req.headers['user-agent'], ipAddress: req.ip,
  });
  setRefreshCookie(res, result.refreshToken);
  return sendSuccess(res, { accessToken: result.accessToken, user: result.user });
});

const refresh = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
  const tokenFromBody = req.body ? req.body.refreshToken : undefined;
  const result = await authService.refresh({
    refreshToken: tokenFromCookie || tokenFromBody,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  setRefreshCookie(res, result.refreshToken);
  return sendSuccess(res, { accessToken: result.accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
  const tokenFromBody = req.body ? req.body.refreshToken : undefined;
  await authService.logout({ refreshToken: tokenFromCookie || tokenFromBody });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  return sendSuccess(res, { message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  return sendSuccess(res, { user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword({ userId: req.user.id, currentPassword, newPassword });
  return sendSuccess(res, { message: 'Password changed successfully' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword({ email });
  // Same response regardless of whether the email exists, to avoid account enumeration.
  return sendSuccess(res, {
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword({ token, newPassword });
  return sendSuccess(res, { message: 'Password has been reset. Please log in.' });
});

module.exports = { login, refresh, logout, me, changePassword, forgotPassword, resetPassword };
