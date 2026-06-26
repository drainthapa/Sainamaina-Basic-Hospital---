const { query } = require('../config/db');

async function list({ limit = 50, offset = 0, publishedOnly = false } = {}) {
  const conditions = ['deleted_at IS NULL'];
  if (publishedOnly) conditions.push('is_published = TRUE');
  const result = await query(
    `SELECT * FROM departments
     WHERE ${conditions.join(' AND ')}
     ORDER BY sort_order ASC, created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await query(
    `SELECT COUNT(*) FROM departments WHERE ${conditions.join(' AND ')}`
  );
  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function findById(id) {
  const result = await query('SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL', [id]);
  return result.rows[0] || null;
}

async function findBySlug(slug) {
  const result = await query('SELECT * FROM departments WHERE slug = $1 AND deleted_at IS NULL', [slug]);
  return result.rows[0] || null;
}

async function slugExists(slug) {
  const result = await query('SELECT 1 FROM departments WHERE slug = $1 AND deleted_at IS NULL', [slug]);
  return result.rowCount > 0;
}

async function create(data) {
  const result = await query(
    `INSERT INTO departments (name_en, name_np, slug, description_en, description_np, image_url, sort_order, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.name_en, data.name_np, data.slug, data.description_en || null, data.description_np || null,
      data.image_url || null, data.sort_order || 0, data.is_published !== false,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await query(
    `UPDATE departments SET
       name_en = COALESCE($1, name_en),
       name_np = COALESCE($2, name_np),
       description_en = COALESCE($3, description_en),
       description_np = COALESCE($4, description_np),
       image_url = COALESCE($5, image_url),
       sort_order = COALESCE($6, sort_order),
       is_published = COALESCE($7, is_published)
     WHERE id = $8 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.name_en, data.name_np, data.description_en, data.description_np,
      data.image_url, data.sort_order, data.is_published, id,
    ]
  );
  return result.rows[0] || null;
}

async function softDelete(id) {
  const result = await query(
    'UPDATE departments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = { list, findById, findBySlug, slugExists, create, update, softDelete };
