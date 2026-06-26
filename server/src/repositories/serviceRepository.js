const { query } = require('../config/db');

async function list({ limit = 50, offset = 0, departmentId, category, emergencyOnly = false, publishedOnly = false } = {}) {
  const conditions = ['s.deleted_at IS NULL'];
  const params = [];

  if (departmentId) {
    params.push(departmentId);
    conditions.push(`s.department_id = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`s.category = $${params.length}`);
  }
  if (emergencyOnly) conditions.push('s.is_emergency = TRUE');
  if (publishedOnly) conditions.push('s.is_published = TRUE');

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(
    `SELECT s.*, d.name_en AS department_name_en, d.name_np AS department_name_np
     FROM services s
     LEFT JOIN departments d ON d.id = s.department_id
     WHERE ${where}
     ORDER BY s.sort_order ASC, s.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const countResult = await query(`SELECT COUNT(*) FROM services s WHERE ${where}`, countParams);

  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function findById(id) {
  const result = await query(
    `SELECT s.*, d.name_en AS department_name_en, d.name_np AS department_name_np
     FROM services s LEFT JOIN departments d ON d.id = s.department_id
     WHERE s.id = $1 AND s.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

async function findBySlug(slug) {
  const result = await query(
    `SELECT s.*, d.name_en AS department_name_en, d.name_np AS department_name_np
     FROM services s LEFT JOIN departments d ON d.id = s.department_id
     WHERE s.slug = $1 AND s.deleted_at IS NULL`,
    [slug]
  );
  return result.rows[0] || null;
}

async function slugExists(slug) {
  const result = await query('SELECT 1 FROM services WHERE slug = $1 AND deleted_at IS NULL', [slug]);
  return result.rowCount > 0;
}

async function create(data) {
  const result = await query(
    `INSERT INTO services (
       department_id, name_en, name_np, slug, description_en, description_np,
       icon, category, is_emergency, sort_order, is_published
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      data.department_id || null, data.name_en, data.name_np, data.slug,
      data.description_en || null, data.description_np || null, data.icon || null,
      data.category || null, !!data.is_emergency, data.sort_order || 0, data.is_published !== false,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await query(
    `UPDATE services SET
       department_id = COALESCE($1, department_id),
       name_en = COALESCE($2, name_en),
       name_np = COALESCE($3, name_np),
       description_en = COALESCE($4, description_en),
       description_np = COALESCE($5, description_np),
       icon = COALESCE($6, icon),
       category = COALESCE($7, category),
       is_emergency = COALESCE($8, is_emergency),
       sort_order = COALESCE($9, sort_order),
       is_published = COALESCE($10, is_published)
     WHERE id = $11 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.department_id, data.name_en, data.name_np, data.description_en, data.description_np,
      data.icon, data.category, data.is_emergency, data.sort_order, data.is_published, id,
    ]
  );
  return result.rows[0] || null;
}

async function softDelete(id) {
  const result = await query(
    'UPDATE services SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = { list, findById, findBySlug, slugExists, create, update, softDelete };
