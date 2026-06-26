-- A single category table drives News, Notices, Press Releases, Tender Notices, Health Articles, Events.
-- module_type partitions these logically distinct listing pages while sharing one table + one CMS form.
CREATE TABLE news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_type VARCHAR(30) NOT NULL DEFAULT 'news'
    CHECK (module_type IN ('news', 'notice', 'press_release', 'tender_notice', 'health_article', 'event', 'achievement')),
  name_en VARCHAR(150) NOT NULL,
  name_np VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_categories_module_type ON news_categories(module_type);

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  module_type VARCHAR(30) NOT NULL DEFAULT 'news'
    CHECK (module_type IN ('news', 'notice', 'press_release', 'tender_notice', 'health_article', 'event', 'achievement')),
  title_en VARCHAR(500) NOT NULL,
  title_np VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  summary_en TEXT,
  summary_np TEXT,
  body_en TEXT,
  body_np TEXT,
  bs_date VARCHAR(50),
  ad_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER NOT NULL DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_news_slug ON news(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_module_type ON news(module_type);
CREATE INDEX idx_news_category_id ON news(category_id);
CREATE INDEX idx_news_ad_date ON news(ad_date DESC);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_deleted_at ON news(deleted_at);

CREATE TRIGGER trg_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
