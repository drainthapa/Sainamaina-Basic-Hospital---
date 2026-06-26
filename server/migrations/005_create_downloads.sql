-- One table backs every document-listing page on the site (Acts, Policies, Guidelines, Forms,
-- Budget Programs, Annual Reports, Other Reports, Unicode Downloads, Publications, Citizen Charter).
-- doc_type filters which public page a row appears on; the CMS form is identical for all of them.
CREATE TABLE download_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type VARCHAR(40) NOT NULL
    CHECK (doc_type IN (
      'act', 'policy', 'guideline', 'form', 'action_plan', 'budget_program', 'annual_report',
      'other_report', 'publication', 'citizen_charter', 'unicode_download', 'other'
    )),
  name_en VARCHAR(150) NOT NULL,
  name_np VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_download_categories_doc_type ON download_categories(doc_type);

CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES download_categories(id) ON DELETE SET NULL,
  doc_type VARCHAR(40) NOT NULL
    CHECK (doc_type IN (
      'act', 'policy', 'guideline', 'form', 'action_plan', 'budget_program', 'annual_report',
      'other_report', 'publication', 'citizen_charter', 'unicode_download', 'other'
    )),
  title_en VARCHAR(500) NOT NULL,
  title_np VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size_kb INTEGER,
  bs_date VARCHAR(50),
  ad_date DATE NOT NULL DEFAULT CURRENT_DATE,
  download_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_downloads_doc_type ON downloads(doc_type);
CREATE INDEX idx_downloads_category_id ON downloads(category_id);
CREATE INDEX idx_downloads_ad_date ON downloads(ad_date DESC);
CREATE INDEX idx_downloads_deleted_at ON downloads(deleted_at);

CREATE TRIGGER trg_downloads_updated_at
  BEFORE UPDATE ON downloads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
