-- Generic editable page content: History, Mission, Vision, Objectives, Organization Structure,
-- Citizen Charter narrative, Medical Superintendent message, Hospital Profile, etc.
-- Each is a single row identified by a fixed slug, editable as rich text from the CMS.
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(150) UNIQUE NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255) NOT NULL,
  content_en TEXT,
  content_np TEXT,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Polymorphic attachments: extra files attached to a news item, a page, etc.,
-- beyond the single primary file_url that downloads/news already carry.
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type VARCHAR(50) NOT NULL,
  parent_id UUID NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size_kb INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_parent ON attachments(parent_type, parent_id);

CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en VARCHAR(500) NOT NULL,
  question_np VARCHAR(500) NOT NULL,
  answer_en TEXT NOT NULL,
  answer_np TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Key/value site-wide settings: contact info, emergency numbers, social links, site name, etc.
CREATE TABLE site_settings (
  key VARCHAR(150) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
