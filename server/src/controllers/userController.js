const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const rows = await userRepository.list({ limit, offset });
  return sendSuccess(res, rows, 200, { total: rows.length, limit, offset });
});

const listRoles = asyncHandler(async (req, res) => {
  const roles = await userRepository.listRoles();
  return sendSuccess(res, roles);
});

const create = asyncHandler(async (req, res) => {
  const { email, password, fullName, phone, roleId } = req.body;
  const existing = await userRepository.findByEmail(email);
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userRepository.create({ roleId, email, passwordHash, fullName, phone });
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'user', entityId: user.id, ipAddress: req.ip,
  });
  return sendSuccess(res, user, 201);
});

const updateRole = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  const updated = await userRepository.updateRole(req.params.id, roleId);
  if (!updated) throw ApiError.notFound('User not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update_role', entityType: 'user', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Role updated' });
});

const setActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (req.params.id === req.user.id && isActive === false) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }
  const updated = await userRepository.setActive(req.params.id, isActive);
  if (!updated) throw ApiError.notFound('User not found');
  if (!isActive) await refreshTokenRepository.revokeAllForUser(req.params.id);
  await auditLogRepository.record({
    userId: req.user.id, action: isActive ? 'activate_user' : 'deactivate_user',
    entityType: 'user', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: isActive ? 'User activated' : 'User deactivated' });
});

const remove = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw ApiError.badRequest('You cannot delete your own account');
  const deleted = await userRepository.softDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('User not found');
  await refreshTokenRepository.revokeAllForUser(req.params.id);
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'user', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'User deleted' });
});

module.exports = { list, listRoles, create, updateRole, setActive, remove };
