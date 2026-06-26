const { query } = require('../config/db');

async function list({ limit = 50, offset = 0, staffType, departmentId, publishedOnly = false } = {}) {
  const conditions = ['s.deleted_at IS NULL'];
  const params = [];

  if (staffType) {
    params.push(staffType);
    conditions.push(`s.staff_type = $${params.length}`);
  }
  if (departmentId) {
    params.push(departmentId);
    conditions.push(`s.department_id = $${params.length}`);
  }
  if (publishedOnly) conditions.push('s.is_published = TRUE');

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(
    `SELECT s.*, d.name_en AS department_name_en, d.name_np AS department_name_np
     FROM staff s
     LEFT JOIN departments d ON d.id = s.department_id
     WHERE ${where}
     ORDER BY s.sort_order ASC, s.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const countResult = await query(`SELECT COUNT(*) FROM staff s WHERE ${where}`, countParams);

  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function findById(id) {
  const result = await query(
    `SELECT s.*, d.name_en AS department_name_en, d.name_np AS department_name_np
     FROM staff s
     LEFT JOIN departments d ON d.id = s.department_id
     WHERE s.id = $1 AND s.deleted_at IS NULL`,
    [id]
  );
  if (!result.rows[0]) return null;
  const schedules = await query('SELECT * FROM staff_schedules WHERE staff_id = $1 ORDER BY day_of_week', [id]);
  return { ...result.rows[0], schedules: schedules.rows };
}

async function create(data) {
  const result = await query(
    `INSERT INTO staff (
       department_id, full_name, staff_type, designation_en, designation_np,
       qualification, specialization, biography_en, biography_np, photo_url,
       email, phone, social_links, sort_order, is_published
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      data.department_id || null, data.full_name, data.staff_type || 'support',
      data.designation_en, data.designation_np, data.qualification || null,
      data.specialization || null, data.biography_en || null, data.biography_np || null,
      data.photo_url || null, data.email || null, data.phone || null,
      JSON.stringify(data.social_links || {}), data.sort_order || 0, data.is_published !== false,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await query(
    `UPDATE staff SET
       department_id = COALESCE($1, department_id),
       full_name = COALESCE($2, full_name),
       staff_type = COALESCE($3, staff_type),
       designation_en = COALESCE($4, designation_en),
       designation_np = COALESCE($5, designation_np),
       qualification = COALESCE($6, qualification),
       specialization = COALESCE($7, specialization),
       biography_en = COALESCE($8, biography_en),
       biography_np = COALESCE($9, biography_np),
       photo_url = COALESCE($10, photo_url),
       email = COALESCE($11, email),
       phone = COALESCE($12, phone),
       social_links = COALESCE($13, social_links),
       sort_order = COALESCE($14, sort_order),
       is_published = COALESCE($15, is_published)
     WHERE id = $16 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.department_id, data.full_name, data.staff_type, data.designation_en, data.designation_np,
      data.qualification, data.specialization, data.biography_en, data.biography_np, data.photo_url,
      data.email, data.phone, data.social_links ? JSON.stringify(data.social_links) : null,
      data.sort_order, data.is_published, id,
    ]
  );
  return result.rows[0] || null;
}

async function softDelete(id) {
  const result = await query(
    'UPDATE staff SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

async function replaceSchedules(staffId, schedules) {
  await query('DELETE FROM staff_schedules WHERE staff_id = $1', [staffId]);
  for (const s of schedules) {
    // eslint-disable-next-line no-await-in-loop
    await query(
      'INSERT INTO staff_schedules (staff_id, day_of_week, start_time, end_time) VALUES ($1,$2,$3,$4)',
      [staffId, s.day_of_week, s.start_time, s.end_time]
    );
  }
}

module.exports = { list, findById, create, update, softDelete, replaceSchedules };
