const contentRepository = require('../repositories/contentRepository');
const categoryRepository = require('../repositories/categoryRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { slugify } = require('../utils/slugify');

// --- Pages (About, History, Mission, Vision, Organization Structure, etc.) ---

const listPages = asyncHandler(async (req, res) => {
  const pages = await contentRepository.listPages();
  return sendSuccess(res, pages);
});

const getPage = asyncHandler(async (req, res) => {
  const page = await contentRepository.findPageBySlug(req.params.slug);
  if (!page) throw ApiError.notFound('Page not found');
  return sendSuccess(res, page);
});

const updatePage = asyncHandler(async (req, res) => {
  const page = await contentRepository.updatePage(req.params.slug, req.body);
  if (!page) throw ApiError.notFound('Page not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'page', entityId: page.id, ipAddress: req.ip,
  });
  return sendSuccess(res, page);
});

// --- FAQs ---

const listFaqs = asyncHandler(async (req, res) => {
  const faqs = await contentRepository.listFaqs({ publishedOnly: !req.user });
  return sendSuccess(res, faqs);
});

const createFaq = asyncHandler(async (req, res) => {
  const faq = await contentRepository.createFaq(req.body);
  await auditLogRepository.record({
    userId: req.user.id, action: 'create', entityType: 'faq', entityId: faq.id, ipAddress: req.ip,
  });
  return sendSuccess(res, faq, 201);
});

const updateFaq = asyncHandler(async (req, res) => {
  const faq = await contentRepository.updateFaq(req.params.id, req.body);
  if (!faq) throw ApiError.notFound('FAQ not found');
  await auditLogRepository.record({
    userId: req.user.id, action: 'update', entityType: 'faq', entityId: faq.id, ipAddress: req.ip,
  });
  return sendSuccess(res, faq);
});

const deleteFaq = asyncHandler(async (req, res) => {
  const deleted = await contentRepository.deleteFaq(req.params.id);
  if (!deleted) throw ApiError.notFound('FAQ not found');
  return sendSuccess(res, { message: 'FAQ deleted' });
});

// --- Site settings ---

const getSettings = asyncHandler(async (req, res) => {
  const settings = await contentRepository.getAllSettings();
  return sendSuccess(res, settings);
});

const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const setting = await contentRepository.setSetting(key, value);
  await auditLogRepository.record({
    userId: req.user.id, action: 'update_setting', entityType: 'site_setting', ipAddress: req.ip,
    metadata: { key },
  });
  return sendSuccess(res, setting);
});

// --- Categories (news_categories + download_categories) ---

const listNewsCategories = asyncHandler(async (req, res) => {
  const categories = await categoryRepository.listNewsCategories(req.query.module_type);
  return sendSuccess(res, categories);
});

const createNewsCategory = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.name_en, 'category');
  const category = await categoryRepository.createNewsCategory({ ...req.body, slug });
  return sendSuccess(res, category, 201);
});

const listDownloadCategories = asyncHandler(async (req, res) => {
  const categories = await categoryRepository.listDownloadCategories(req.query.doc_type);
  return sendSuccess(res, categories);
});

const createDownloadCategory = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.name_en, 'category');
  const category = await categoryRepository.createDownloadCategory({ ...req.body, slug });
  return sendSuccess(res, category, 201);
});

module.exports = {
  listPages, getPage, updatePage,
  listFaqs, createFaq, updateFaq, deleteFaq,
  getSettings, updateSetting,
  listNewsCategories, createNewsCategory, listDownloadCategories, createDownloadCategory,
};
