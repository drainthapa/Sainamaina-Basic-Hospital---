const { query, withTransaction } = require('../config/db');

async function listAlbums({ limit = 20, offset = 0, albumType, publishedOnly = false } = {}) {
  const conditions = ['a.deleted_at IS NULL'];
  const params = [];
  if (albumType) {
    params.push(albumType);
    conditions.push(`a.album_type = $${params.length}`);
  }
  if (publishedOnly) conditions.push('a.is_published = TRUE');

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(
    `SELECT a.*,
            (SELECT COUNT(*) FROM gallery_media m WHERE m.album_id = a.id) AS media_count
     FROM gallery_albums a
     WHERE ${where}
     ORDER BY a.ad_date DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const countResult = await query(`SELECT COUNT(*) FROM gallery_albums a WHERE ${where}`, countParams);

  return { rows: result.rows, total: parseInt(countResult.rows[0].count, 10) };
}

async function findAlbumById(id) {
  const albumResult = await query('SELECT * FROM gallery_albums WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (!albumResult.rows[0]) return null;
  const mediaResult = await query(
    'SELECT * FROM gallery_media WHERE album_id = $1 ORDER BY sort_order ASC, created_at ASC',
    [id]
  );
  return { ...albumResult.rows[0], media: mediaResult.rows };
}

async function createAlbum(data, mediaItems = []) {
  return withTransaction(async (client) => {
    const albumResult = await client.query(
      `INSERT INTO gallery_albums (title_en, title_np, album_type, cover_image_url, bs_date, ad_date, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        data.title_en, data.title_np, data.album_type || 'photo', data.cover_image_url || null,
        data.bs_date || null, data.ad_date || new Date(), data.is_published !== false,
      ]
    );
    const album = albumResult.rows[0];
    for (const [index, item] of mediaItems.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await client.query(
        `INSERT INTO gallery_media (album_id, media_url, thumbnail_url, media_type, caption_en, caption_np, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [album.id, item.media_url, item.thumbnail_url || null, item.media_type || 'image',
          item.caption_en || null, item.caption_np || null, index]
      );
    }
    return album;
  });
}

async function addMedia(albumId, mediaItems = []) {
  return withTransaction(async (client) => {
    const inserted = [];
    for (const item of mediaItems) {
      // eslint-disable-next-line no-await-in-loop
      const result = await client.query(
        `INSERT INTO gallery_media (album_id, media_url, thumbnail_url, media_type, caption_en, caption_np, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [albumId, item.media_url, item.thumbnail_url || null, item.media_type || 'image',
          item.caption_en || null, item.caption_np || null, item.sort_order || 0]
      );
      inserted.push(result.rows[0]);
    }
    return inserted;
  });
}

async function deleteMedia(mediaId) {
  const result = await query('DELETE FROM gallery_media WHERE id = $1 RETURNING id', [mediaId]);
  return result.rowCount > 0;
}

async function updateAlbum(id, data) {
  const result = await query(
    `UPDATE gallery_albums SET
       title_en = COALESCE($1, title_en),
       title_np = COALESCE($2, title_np),
       cover_image_url = COALESCE($3, cover_image_url),
       bs_date = COALESCE($4, bs_date),
       ad_date = COALESCE($5, ad_date),
       is_published = COALESCE($6, is_published)
     WHERE id = $7 AND deleted_at IS NULL
     RETURNING *`,
    [data.title_en, data.title_np, data.cover_image_url, data.bs_date, data.ad_date, data.is_published, id]
  );
  return result.rows[0] || null;
}

async function softDeleteAlbum(id) {
  const result = await query(
    'UPDATE gallery_albums SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  listAlbums, findAlbumById, createAlbum, addMedia, deleteMedia, updateAlbum, softDeleteAlbum,
};
