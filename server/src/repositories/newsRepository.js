const { query } = require('../config/db');

async function list({
  limit = 20, offset = 0, moduleType, categoryId, status = 'published',
  search, featuredOnly = false,
} = {}) {
  const conditions = ['n.deleted_at IS NULL'];
  const params = [];

  if (moduleType) {
    params.push(moduleType);
    conditions.push(`n.module_type = $${params.length}`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`n.category_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`n.status = $${params.length}`);
  }
  if (featuredOnly) conditions.push('n.is_featured = TRUE');
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(n.title_en ILIKE $${params.length} OR n.title_np ILIKE $${params.length})`);
  }

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(
    `SELECT n.*, c.name_en AS category_name_en, c.name_np AS category_name_np
     FROM news n
     LEFT JOIN news_categories c ON c.id = n.category_id
     WHERE ${where}
     ORDER BY n.ad_date DESC, n.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const countResult = await query(`SELECT COUNT(*) FROM news n WHERE ${where}`, countParams);

  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function findById(id) {
  const result = await query(
    `SELECT n.*, c.name_en AS category_name_en, c.name_np AS category_name_np
     FROM news n LEFT JOIN news_categories c ON c.id = n.category_id
     WHERE n.id = $1 AND n.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

async function findBySlug(slug) {
  const result = await query(
    `SELECT n.*, c.name_en AS category_name_en, c.name_np AS category_name_np
     FROM news n LEFT JOIN news_categories c ON c.id = n.category_id
     WHERE n.slug = $1 AND n.deleted_at IS NULL`,
    [slug]
  );
  return result.rows[0] || null;
}

async function slugExists(slug) {
  const result = await query('SELECT 1 FROM news WHERE slug = $1 AND deleted_at IS NULL', [slug]);
  return result.rowCount > 0;
}

async function incrementViews(id) {
  await query('UPDATE news SET views = views + 1 WHERE id = $1', [id]);
}

async function create(data) {
  const result = await query(
    `INSERT INTO news (
       category_id, author_id, module_type, title_en, title_np, slug,
       summary_en, summary_np, body_en, body_np, bs_date, ad_date, expiry_date,
       is_featured, status, meta_title, meta_description
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      data.category_id || null, data.author_id || null, data.module_type || 'news',
      data.title_en, data.title_np, data.slug, data.summary_en || null, data.summary_np || null,
      data.body_en || null, data.body_np || null, data.bs_date || null, data.ad_date || new Date(),
      data.expiry_date || null, !!data.is_featured, data.status || 'published',
      data.meta_title || null, data.meta_description || null,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await query(
    `UPDATE news SET
       category_id = COALESCE($1, category_id),
       title_en = COALESCE($2, title_en),
       title_np = COALESCE($3, title_np),
       summary_en = COALESCE($4, summary_en),
       summary_np = COALESCE($5, summary_np),
       body_en = COALESCE($6, body_en),
       body_np = COALESCE($7, body_np),
       bs_date = COALESCE($8, bs_date),
       ad_date = COALESCE($9, ad_date),
       expiry_date = COALESCE($10, expiry_date),
       is_featured = COALESCE($11, is_featured),
       status = COALESCE($12, status),
       meta_title = COALESCE($13, meta_title),
       meta_description = COALESCE($14, meta_description)
     WHERE id = $15 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.category_id, data.title_en, data.title_np, data.summary_en, data.summary_np,
      data.body_en, data.body_np, data.bs_date, data.ad_date, data.expiry_date,
      data.is_featured, data.status, data.meta_title, data.meta_description, id,
    ]
  );
  return result.rows[0] || null;
}

async function softDelete(id) {
  const result = await query(
    'UPDATE news SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  list, findById, findBySlug, slugExists, incrementViews, create, update, softDelete,
};
