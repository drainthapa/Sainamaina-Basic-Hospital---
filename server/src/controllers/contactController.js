const contactRepository = require('../repositories/contactRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

const submit = asyncHandler(async (req, res) => {
  const { fullName, address, email, message } = req.body;
  const submission = await contactRepository.create({ fullName, address, email, message });
  return sendSuccess(res, { message: 'Thank you for contacting us. We will respond soon.', id: submission.id }, 201);
});

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const { rows, total } = await contactRepository.list({ limit, offset, unreadOnly: req.query.unread === 'true' });
  return sendSuccess(res, rows, 200, { total, limit, offset });
});

const markRead = asyncHandler(async (req, res) => {
  const updated = await contactRepository.markRead(req.params.id);
  if (!updated) throw ApiError.notFound('Submission not found');
  return sendSuccess(res, { message: 'Marked as read' });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await contactRepository.remove(req.params.id);
  if (!deleted) throw ApiError.notFound('Submission not found');
  return sendSuccess(res, { message: 'Submission deleted' });
});

module.exports = { submit, list, markRead, remove };
