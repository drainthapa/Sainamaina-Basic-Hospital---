const galleryRepository = require('../repositories/galleryRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

const listAlbums = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const { album_type: albumType } = req.query;
  const publishedOnly = !req.user;
  const { rows, total } = await galleryRepository.listAlbums({ limit, offset, albumType, publishedOnly });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const getAlbum = asyncHandler(async (req, res) => {
  const album = await galleryRepository.findAlbumById(req.params.id);
  if (!album) throw ApiError.notFound('Album not found');
  if (!album.is_published && !req.user) throw ApiError.notFound('Album not found');
  return sendSuccess(res, album);
});

const createAlbum = asyncHandler(async (req, res) => {
  const { media, ...albumData } = req.body;
  const album = await galleryRepository.createAlbum(albumData, media || []);
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'gallery_album', entityId: album.id, ipAddress: req.ip,
  });
  return sendSuccess(res, album, 201);
});

const addMedia = asyncHandler(async (req, res) => {
  const { media } = req.body;
  if (!Array.isArray(media) || media.length === 0) {
    throw ApiError.badRequest('media must be a non-empty array');
  }
  const inserted = await galleryRepository.addMedia(req.params.id, media);
  await auditLogRepository.record({
    userId: req.user.id, action: 'add_media', entityType: 'gallery_album', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, inserted, 201);
});

const updateAlbum = asyncHandler(async (req, res) => {
  const album = await galleryRepository.updateAlbum(req.params.id, req.body);
  if (!album) throw ApiError.notFound('Album not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'gallery_album', entityId: album.id, ipAddress: req.ip,
  });
  return sendSuccess(res, album);
});

const removeMedia = asyncHandler(async (req, res) => {
  const deleted = await galleryRepository.deleteMedia(req.params.mediaId);
  if (!deleted) throw ApiError.notFound('Media item not found');
  return sendSuccess(res, { message: 'Media item deleted' });
});

const removeAlbum = asyncHandler(async (req, res) => {
  const deleted = await galleryRepository.softDeleteAlbum(req.params.id);
  if (!deleted) throw ApiError.notFound('Album not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'delete', entityType: 'gallery_album', entityId: req.params.id, ipAddress: req.ip,
  });
  return sendSuccess(res, { message: 'Album deleted' });
});

module.exports = { listAlbums, getAlbum, createAlbum, addMedia, updateAlbum, removeMedia, removeAlbum };
