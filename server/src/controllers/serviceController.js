const serviceRepository = require('../repositories/serviceRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { slugify, ensureUniqueSlug } = require('../utils/slugify');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const { department_id: departmentId, category, emergency } = req.query;
  const publishedOnly = !req.user;
  const { rows, total } = await serviceRepository.list({
    limit, offset, departmentId, category, emergencyOnly: emergency === 'true', publishedOnly,
  });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const getBySlug = asyncHandler(async (req, res) => {
  const service = await serviceRepository.findBySlug(req.params.slug);
  if (!service) throw ApiError.notFound('Service not found');
  if (!service.is_published && !req.user) throw ApiError.notFound('Service not found');
  return sendSuccess(res, service);
});

const getById = asyncHandler(async (req, res) => {
  const service = await serviceRepository.findById(req.params.id);
  if (!service) throw ApiError.notFound('Service not found');
  return sendSuccess(res, service);
});

const create = asyncHandler(async (req, res) => {
  const baseSlug = slugify(req.body.name_en, 'service');
  const slug = await ensureUniqueSlug(baseSlug, serviceRepository.slugExists);
  const service = await serviceRepository.create({ ...req.body, slug });
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'service', entityId: service.id, ipAddress: req.ip,
  });
  return sendSuccess(res, service, 201);
});

const update = asyncHandler(async (req, res) => {
  const service = await serviceRepository.update(req.params.id, req.body);
  if (!service) throw ApiError.notFound('Service not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'service', entityId: service.id, ipAddress: req.ip,
  });
  return sendSuccess(res, service);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await serviceRepository.softDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('Service not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'service', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Service deleted' });
});

module.exports = { list, getBySlug, getById, create, update, remove };
