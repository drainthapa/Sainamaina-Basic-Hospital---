const { query } = require('../config/db');

async function findPageBySlug(slug) {
  const result = await query('SELECT * FROM pages WHERE slug = $1', [slug]);
  return result.rows[0] || null;
}

async function listPages() {
  const result = await query('SELECT id, slug, title_en, title_np, updated_at FROM pages ORDER BY title_en');
  return result.rows;
}

async function updatePage(slug, data) {
  const result = await query(
    `UPDATE pages SET
       title_en = COALESCE($1, title_en),
       title_np = COALESCE($2, title_np),
       content_en = COALESCE($3, content_en),
       content_np = COALESCE($4, content_np),
       meta_title = COALESCE($5, meta_title),
       meta_description = COALESCE($6, meta_description)
     WHERE slug = $7
     RETURNING *`,
    [data.title_en, data.title_np, data.content_en, data.content_np, data.meta_title, data.meta_description, slug]
  );
  return result.rows[0] || null;
}

async function listFaqs({ publishedOnly = false } = {}) {
  const where = publishedOnly ? 'WHERE is_published = TRUE' : '';
  const result = await query(`SELECT * FROM faqs ${where} ORDER BY sort_order ASC`);
  return result.rows;
}

async function createFaq(data) {
  const result = await query(
    `INSERT INTO faqs (question_en, question_np, answer_en, answer_np, sort_order, is_published)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.question_en, data.question_np, data.answer_en, data.answer_np, data.sort_order || 0, data.is_published !== false]
  );
  return result.rows[0];
}

async function updateFaq(id, data) {
  const result = await query(
    `UPDATE faqs SET
       question_en = COALESCE($1, question_en),
       question_np = COALESCE($2, question_np),
       answer_en = COALESCE($3, answer_en),
       answer_np = COALESCE($4, answer_np),
       sort_order = COALESCE($5, sort_order),
       is_published = COALESCE($6, is_published)
     WHERE id = $7 RETURNING *`,
    [data.question_en, data.question_np, data.answer_en, data.answer_np, data.sort_order, data.is_published, id]
  );
  return result.rows[0] || null;
}

async function deleteFaq(id) {
  const result = await query('DELETE FROM faqs WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

async function getAllSettings() {
  const result = await query('SELECT key, value FROM site_settings');
  const settings = {};
  for (const row of result.rows) settings[row.key] = row.value;
  return settings;
}

async function getSetting(key) {
  const result = await query('SELECT value FROM site_settings WHERE key = $1', [key]);
  return result.rows[0] ? result.rows[0].value : null;
}

async function setSetting(key, value) {
  const result = await query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
     RETURNING *`,
    [key, JSON.stringify(value)]
  );
  return result.rows[0];
}

module.exports = {
  findPageBySlug, listPages, updatePage,
  listFaqs, createFaq, updateFaq, deleteFaq,
  getAllSettings, getSetting, setSetting,
};
