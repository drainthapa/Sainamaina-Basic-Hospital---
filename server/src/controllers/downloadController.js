const downloadRepository = require('../repositories/downloadRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const { doc_type: docType, category_id: categoryId, search } = req.query;
  const { rows, total } = await downloadRepository.list({ limit, offset, docType, categoryId, search });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const getById = asyncHandler(async (req, res) => {
  const item = await downloadRepository.findById(req.params.id);
  if (!item) throw ApiError.notFound('Document not found');
  return sendSuccess(res, item);
});

// Records a download count then returns the file URL for the client to redirect/open.
const trackDownload = asyncHandler(async (req, res) => {
  const item = await downloadRepository.findById(req.params.id);
  if (!item) throw ApiError.notFound('Document not found');
  await downloadRepository.incrementDownloadCount(item.id);
  return sendSuccess(res, { file_url: item.file_url, file_name: item.file_name });
});

const create = asyncHandler(async (req, res) => {
  const item = await downloadRepository.create(req.body);
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'download', entityId: item.id, ipAddress: req.ip,
  });
  return sendSuccess(res, item, 201);
});

const update = asyncHandler(async (req, res) => {
  const item = await downloadRepository.update(req.params.id, req.body);
  if (!item) throw ApiError.notFound('Document not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'download', entityId: item.id, ipAddress: req.ip,
  });
  return sendSuccess(res, item);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await downloadRepository.softDelete(req.params.id);
  if (!deleted) throw ApiError.notFound('Document not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'download', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Document deleted' });
});

module.exports = { list, getById, trackDownload, create, update, remove };
