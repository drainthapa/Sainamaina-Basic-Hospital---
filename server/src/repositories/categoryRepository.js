const { query } = require('../config/db');

async function listNewsCategories(moduleType) {
  const params = [];
  let where = '';
  if (moduleType) {
    params.push(moduleType);
    where = 'WHERE module_type = $1';
  }
  const result = await query(
    `SELECT * FROM news_categories ${where} ORDER BY name_en ASC`,
    params
  );
  return result.rows;
}

async function createNewsCategory(data) {
  const result = await query(
    `INSERT INTO news_categories (module_type, name_en, name_np, slug) VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.module_type, data.name_en, data.name_np, data.slug]
  );
  return result.rows[0];
}

async function listDownloadCategories(docType) {
  const params = [];
  let where = '';
  if (docType) {
    params.push(docType);
    where = 'WHERE doc_type = $1';
  }
  const result = await query(
    `SELECT * FROM download_categories ${where} ORDER BY name_en ASC`,
    params
  );
  return result.rows;
}

async function createDownloadCategory(data) {
  const result = await query(
    `INSERT INTO download_categories (doc_type, name_en, name_np, slug) VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.doc_type, data.name_en, data.name_np, data.slug]
  );
  return result.rows[0];
}

module.exports = {
  listNewsCategories, createNewsCategory, listDownloadCategories, createDownloadCategory,
};
