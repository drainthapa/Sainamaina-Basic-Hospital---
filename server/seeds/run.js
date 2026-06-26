#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const ROLES = [
  {
    name: 'super_admin',
    description: 'Full system access',
    is_system: true,
    permissions: { all: true },
  },
  {
    name: 'hospital_administrator',
    description: 'Manages hospital-wide content and staff',
    is_system: true,
    permissions: {
      departments: ['create', 'read', 'update', 'delete'],
      staff: ['create', 'read', 'update', 'delete'],
      news: ['create', 'read', 'update', 'delete', 'publish'],
      downloads: ['create', 'read', 'update', 'delete'],
      gallery: ['create', 'read', 'update', 'delete'],
      pages: ['read', 'update'],
      users: ['read'],
    },
  },
  {
    name: 'content_editor',
    description: 'Creates and edits public-facing content',
    is_system: true,
    permissions: {
      news: ['create', 'read', 'update'],
      downloads: ['create', 'read', 'update'],
      gallery: ['create', 'read', 'update'],
      pages: ['read', 'update'],
    },
  },
  {
    name: 'doctor',
    description: 'Manages own profile and schedule',
    is_system: true,
    permissions: { own_profile: ['read', 'update'] },
  },
  {
    name: 'reception_staff',
    description: 'Manages notices and basic front-desk content',
    is_system: true,
    permissions: { news: ['create', 'read'], downloads: ['read'] },
  },
  {
    name: 'read_only',
    description: 'View-only access to the CMS',
    is_system: true,
    permissions: { '*': ['read'] },
  },
];

const NEWS_CATEGORIES = [
  { module_type: 'news', name_en: 'General News', name_np: 'समाचार', slug: 'general-news' },
  { module_type: 'notice', name_en: 'Notices', name_np: 'सूचना', slug: 'notices' },
  { module_type: 'press_release', name_en: 'Press Release', name_np: 'प्रेस विज्ञप्ति', slug: 'press-release' },
  { module_type: 'tender_notice', name_en: 'Tender Notice', name_np: 'बोलपत्र सूचना', slug: 'tender-notice' },
  { module_type: 'health_article', name_en: 'Health Awareness', name_np: 'स्वास्थ्य सचेतना', slug: 'health-awareness' },
  { module_type: 'event', name_en: 'Events', name_np: 'कार्यक्रम', slug: 'events' },
];

const DOWNLOAD_CATEGORIES = [
  { doc_type: 'act', name_en: 'Acts', name_np: 'ऐन', slug: 'acts' },
  { doc_type: 'policy', name_en: 'Policies', name_np: 'नीति', slug: 'policies' },
  { doc_type: 'guideline', name_en: 'Guidelines', name_np: 'निर्देशिका', slug: 'guidelines' },
  { doc_type: 'form', name_en: 'Forms', name_np: 'फारमहरू', slug: 'forms' },
  { doc_type: 'action_plan', name_en: 'Action Plan', name_np: 'कार्यविधी / कार्ययोजना', slug: 'action-plan' },
  { doc_type: 'budget_program', name_en: 'Budget & Program', name_np: 'बजेट तथा कार्यक्रम', slug: 'budget-program' },
  { doc_type: 'annual_report', name_en: 'Annual Reports', name_np: 'वार्षिक प्रतिवेदन', slug: 'annual-reports' },
  { doc_type: 'other_report', name_en: 'Other Reports', name_np: 'अन्य प्रतिवेदन', slug: 'other-reports' },
  { doc_type: 'publication', name_en: 'Publications', name_np: 'प्रकाशनहरू', slug: 'publications' },
  { doc_type: 'citizen_charter', name_en: 'Citizen Charter', name_np: 'नागरिक वडापत्र', slug: 'citizen-charter' },
  { doc_type: 'unicode_download', name_en: 'Unicode Downloads', name_np: 'युनिकोड डाउनलोड', slug: 'unicode-downloads' },
];

const SERVICE_CATEGORIES = [
  { name_en: 'Emergency Services', name_np: 'आकस्मिक सेवा', is_emergency: true },
  { name_en: 'OPD', name_np: 'ओ.पी.डी.', is_emergency: false },
  { name_en: 'IPD', name_np: 'आई.पी.डी.', is_emergency: false },
  { name_en: 'Laboratory', name_np: 'प्रयोगशाला', is_emergency: false },
  { name_en: 'Radiology', name_np: 'रेडियोलोजी', is_emergency: false },
  { name_en: 'Pharmacy', name_np: 'फार्मेसी', is_emergency: false },
  { name_en: 'Immunization', name_np: 'खोप सेवा', is_emergency: false },
  { name_en: 'Maternal Care', name_np: 'मातृ स्वास्थ्य सेवा', is_emergency: false },
  { name_en: 'Child Health', name_np: 'बाल स्वास्थ्य सेवा', is_emergency: false },
  { name_en: 'Dental', name_np: 'दन्त सेवा', is_emergency: false },
  { name_en: 'Eye Care', name_np: 'नेत्र सेवा', is_emergency: false },
];

const PAGES = [
  { slug: 'introduction', title_en: 'Introduction', title_np: 'परिचय', content_en: '', content_np: '' },
  { slug: 'history', title_en: 'History', title_np: 'स्थापना इतिहास', content_en: '', content_np: '' },
  { slug: 'mission', title_en: 'Mission', title_np: 'अभियान', content_en: '', content_np: '' },
  { slug: 'vision', title_en: 'Vision', title_np: 'दृष्टिकोण', content_en: '', content_np: '' },
  { slug: 'objectives', title_en: 'Objectives', title_np: 'उद्देश्यहरू', content_en: '', content_np: '' },
  { slug: 'organization-structure', title_en: 'Organization Structure', title_np: 'संगठनात्मक संरचना', content_en: '', content_np: '' },
  { slug: 'citizen-charter', title_en: 'Citizen Charter', title_np: 'नागरिक वडापत्र', content_en: '', content_np: '' },
  { slug: 'hospital-profile', title_en: 'Hospital Profile', title_np: 'अस्पताल प्रोफाइल', content_en: '', content_np: '' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Roles
    const roleIds = {};
    for (const role of ROLES) {
      const res = await client.query(
        `INSERT INTO roles (name, description, permissions, is_system)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, permissions = EXCLUDED.permissions
         RETURNING id, name`,
        [role.name, role.description, JSON.stringify(role.permissions), role.is_system]
      );
      roleIds[res.rows[0].name] = res.rows[0].id;
    }
    console.log(`Seeded ${ROLES.length} roles.`);

    // Super admin user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sainamainahospital.gov.np';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await client.query(
      `INSERT INTO users (role_id, email, password_hash, full_name, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [roleIds.super_admin, adminEmail, passwordHash, 'Super Admin']
    );
    console.log(`Seeded super admin user: ${adminEmail} (password: ${adminPassword} - CHANGE THIS)`);

    // News categories
    for (const cat of NEWS_CATEGORIES) {
      await client.query(
        `INSERT INTO news_categories (module_type, name_en, name_np, slug)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.module_type, cat.name_en, cat.name_np, cat.slug]
      );
    }
    console.log(`Seeded ${NEWS_CATEGORIES.length} news categories.`);

    // Download categories
    for (const cat of DOWNLOAD_CATEGORIES) {
      await client.query(
        `INSERT INTO download_categories (doc_type, name_en, name_np, slug)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.doc_type, cat.name_en, cat.name_np, cat.slug]
      );
    }
    console.log(`Seeded ${DOWNLOAD_CATEGORIES.length} download categories.`);

    // Generic pages
    for (const page of PAGES) {
      await client.query(
        `INSERT INTO pages (slug, title_en, title_np, content_en, content_np)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [page.slug, page.title_en, page.title_np, page.content_en, page.content_np]
      );
    }
    console.log(`Seeded ${PAGES.length} pages.`);

    // Hospital services (no department link by default - CMS users can assign one later)
    for (const svc of SERVICE_CATEGORIES) {
      const slug = svc.name_en.toLowerCase().replace(/\s+/g, '-');
      await client.query(
        `INSERT INTO services (name_en, name_np, slug, is_emergency, is_published)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (slug) DO NOTHING`,
        [svc.name_en, svc.name_np, slug, svc.is_emergency]
      );
    }
    console.log(`Seeded ${SERVICE_CATEGORIES.length} hospital services.`);

    // Site settings defaults
    const defaultSettings = {
      site_name: {
        name_en: 'Sainamaina Basic Hospital', name_np: 'सैनामैना आधारभुत अस्पताल',
        municipality_en: 'Sainamaina Municipality', municipality_np: 'सैनामैना नगरपालिका',
      },
      contact: { phone: '', emergency_phone: '', email: '', address_en: '', address_np: '' },
      social_links: { facebook: '', twitter: '', youtube: '' },
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      await client.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [key, JSON.stringify(value)]
      );
    }
    console.log('Seeded default site settings.');

    await client.query('COMMIT');
    console.log('\nSeed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
