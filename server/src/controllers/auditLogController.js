const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const rows = await auditLogRepository.list({ limit, offset, entityType: req.query.entity_type });
  return sendSuccess(res, rows);
});

module.exports = { list };
