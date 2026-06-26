const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';
const UPLOAD_DIR = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || '../uploads');
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10;

if (PROVIDER === 'local' && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function safeFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const random = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${random}${ext}`;
}

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4', 'video/webm',
];

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  return cb(new Error(`File type not allowed: ${file.mimetype}`));
}

// Local disk storage. When STORAGE_PROVIDER=cloudinary or s3, swap this for
// memoryStorage + an upload step in the controller/service layer that pushes
// the buffer to the respective SDK and returns a public URL. The rest of the
// app only ever deals with the resulting `file_url` string, so that swap is
// isolated to this one file.
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, safeFilename(file.originalname)),
});

const upload = multer({
  storage: PROVIDER === 'local' ? localStorage : multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

/** Build the public URL for a locally-stored file from its multer filename. */
function buildPublicUrl(filename) {
  return `/uploads/${filename}`;
}

module.exports = { upload, buildPublicUrl, PROVIDER, UPLOAD_DIR };
