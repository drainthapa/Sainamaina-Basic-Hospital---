const staffRepository = require('../repositories/staffRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const { staff_type: staffType, department_id: departmentId } = req.query;
  const publishedOnly = !req.user;
  const { rows, total } = await staffRepository.list({
    limit, offset, staffType, departmentId, publishedOnly,
  });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const getById = asyncHandler(async (req, res) => {
  const staff = await staffRepository.findById(req.params.id);
  if (!staff) throw ApiError.notFound('Staff member not found');
  if (!staff.is_published && !req.user) throw ApiError.notFound('Staff member not found');
  return sendSuccess(res, staff);
});

const create = asyncHandler(async (req, res) => {
  const { schedules, ...data } = req.body;
  const staff = await staffRepository.create(data);
  if (Array.isArray(schedules) && schedules.length > 0) {
    await staffRepository.replaceSchedules(staff.id, schedules);
  }
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'staff', entityId: staff.id, ipAddress: req.ip,
  });
  return sendSuccess(res, staff, 201);
});

const update = asyncHandler(async (req, res) => {
  const { schedules, ...data } = req.body;
  const staff = await staffRepository.update(req.params.id, data);
  if (!staff) throw ApiError.notFound('Staff member not found');
  if (Array.isArray(schedules)) {
    await staffRepository.replaceSchedules(staff.id, schedules);
  }
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'staff', entityId: staff.id, ipAddress: req.ip,
  });
  return sendSuccess(res, staff);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await staffRepository.softDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('Staff member not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'staff', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Staff member deleted' });
});

module.exports = { list, getById, create, update, remove };
