const newsRepository = require('../repositories/newsRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { slugify, ensureUniqueSlug } = require('../utils/slugify');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const {
    module_type: moduleType, category_id: categoryId, search, featured,
  } = req.query;
  // CMS users (logged in) can request any status via ?status=; public visitors only ever get published.
  const status = req.user ? (req.query.status || undefined) : 'published';
  const { rows, total } = await newsRepository.list({
    limit, offset, moduleType, categoryId, status, search, featuredOnly: featured === 'true',
  });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const getBySlug = asyncHandler(async (req, res) => {
  const item = await newsRepository.findBySlug(req.params.slug);
  if (!item) throw ApiError.notFound('Content not found');
  if (item.status !== 'published' && !req.user) throw ApiError.notFound('Content not found');
  if (!req.user) await newsRepository.incrementViews(item.id);
  return sendSuccess(res, item);
});

const getById = asyncHandler(async (req, res) => {
  const item = await newsRepository.findById(req.params.id);
  if (!item) throw ApiError.notFound('Content not found');
  return sendSuccess(res, item);
});

const create = asyncHandler(async (req, res) => {
  const baseSlug = slugify(req.body.title_en, req.body.module_type || 'news');
  const slug = await ensureUniqueSlug(baseSlug, newsRepository.slugExists);
  const item = await newsRepository.create({ ...req.body, slug, author_id: req.user.id });
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'news', entityId: item.id, ipAddress: req.ip,
  });
  return sendSuccess(res, item, 201);
});

const update = asyncHandler(async (req, res) => {
  const item = await newsRepository.update(req.params.id, req.body);
  if (!item) throw ApiError.notFound('Content not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'news', entityId: item.id, ipAddress: req.ip,
  });
  return sendSuccess(res, item);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await newsRepository.softDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('Content not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'news', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Content deleted' });
});

module.exports = { list, getBySlug, getById, create, update, remove };
