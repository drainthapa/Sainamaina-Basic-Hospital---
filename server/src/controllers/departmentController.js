const departmentRepository = require('../repositories/departmentRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { slugify, ensureUniqueSlug } = require('../utils/slugify');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  // Public requests (no authenticated CMS user) only ever see published, non-deleted rows.
  const publishedOnly = !req.user;
  const { rows, total } = await departmentRepository.list({ limit, offset, publishedOnly });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const getBySlug = asyncHandler(async (req, res) => {
  const department = await departmentRepository.findBySlug(req.params.slug);
  if (!department) throw ApiError.notFound('Department not found');
  if (!department.is_published && !req.user) throw ApiError.notFound('Department not found');
  return sendSuccess(res, department);
});

const getById = asyncHandler(async (req, res) => {
  const department = await departmentRepository.findById(req.params.id);
  if (!department) throw ApiError.notFound('Department not found');
  return sendSuccess(res, department);
});

const create = asyncHandler(async (req, res) => {
  const baseSlug = slugify(req.body.name_en, 'department');
  const slug = await ensureUniqueSlug(baseSlug, departmentRepository.slugExists);
  const department = await departmentRepository.create({ ...req.body, slug });
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'department', entityId: department.id, ipAddress: req.ip,
  });
  return sendSuccess(res, department, 201);
});

const update = asyncHandler(async (req, res) => {
  const department = await departmentRepository.update(req.params.id, req.body);
  if (!department) throw ApiError.notFound('Department not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'department', entityId: department.id, ipAddress: req.ip,
  });
  return sendSuccess(res, department);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await departmentRepository.softDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('Department not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'department', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Department deleted' });
});

module.exports = { list, getBySlug, getById, create, update, remove };
