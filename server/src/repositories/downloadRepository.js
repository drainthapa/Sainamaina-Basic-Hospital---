const { query } = require('../config/db');

async function list({ limit = 20, offset = 0, docType, categoryId, search } = {}) {
  const conditions = ['d.deleted_at IS NULL'];
  const params = [];

  if (docType) {
    params.push(docType);
    conditions.push(`d.doc_type = $${params.length}`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`d.category_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(d.title_en ILIKE $${params.length} OR d.title_np ILIKE $${params.length})`);
  }

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(
    `SELECT d.*, c.name_en AS category_name_en, c.name_np AS category_name_np
     FROM downloads d
     LEFT JOIN download_categories c ON c.id = d.category_id
     WHERE ${where}
     ORDER BY d.sort_order ASC, d.ad_date DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const countResult = await query(`SELECT COUNT(*) FROM downloads d WHERE ${where}`, countParams);

  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function findById(id) {
  const result = await query('SELECT * FROM downloads WHERE id = $1 AND deleted_at IS NULL', [id]);
  return result.rows[0] || null;
}

async function incrementDownloadCount(id) {
  await query('UPDATE downloads SET download_count = download_count + 1 WHERE id = $1', [id]);
}

async function create(data) {
  const result = await query(
    `INSERT INTO downloads (
       category_id, doc_type, title_en, title_np, file_url, file_name, file_size_kb,
       bs_date, ad_date, sort_order
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.category_id || null, data.doc_type, data.title_en, data.title_np,
      data.file_url, data.file_name || null, data.file_size_kb || null,
      data.bs_date || null, data.ad_date || new Date(), data.sort_order || 0,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await query(
    `UPDATE downloads SET
       category_id = COALESCE($1, category_id),
       title_en = COALESCE($2, title_en),
       title_np = COALESCE($3, title_np),
       file_url = COALESCE($4, file_url),
       file_name = COALESCE($5, file_name),
       file_size_kb = COALESCE($6, file_size_kb),
       bs_date = COALESCE($7, bs_date),
       ad_date = COALESCE($8, ad_date),
       sort_order = COALESCE($9, sort_order)
     WHERE id = $10 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.category_id, data.title_en, data.title_np, data.file_url, data.file_name,
      data.file_size_kb, data.bs_date, data.ad_date, data.sort_order, id,
    ]
  );
  return result.rows[0] || null;
}

async function softDelete(id) {
  const result = await query(
    'UPDATE downloads SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = { list, findById, incrementDownloadCount, create, update, softDelete };
