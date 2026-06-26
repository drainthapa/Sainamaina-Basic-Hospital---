const path = require('path');
const { ApiError } = require('../utils/apiResponse');
const { sendSuccess } = require('../utils/apiResponse');
const { buildPublicUrl, PROVIDER } = require('../utils/storage');
const asyncHandler = require('../middleware/asyncHandler');

const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded (expected field name "file")');

  if (PROVIDER !== 'local') {
    // Hook point for Cloudinary/S3: req.file.buffer holds the file when using memoryStorage.
    // Push to the provider's SDK here and return its public URL instead.
    throw ApiError.internal(`Storage provider "${PROVIDER}" is not wired up yet in this MVP build.`);
  }

  return sendSuccess(res, {
    file_url: buildPublicUrl(req.file.filename),
    file_name: req.file.originalname,
    file_size_kb: Math.round(req.file.size / 1024),
    mime_type: req.file.mimetype,
  }, 201);
});

module.exports = { uploadSingle };
