CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en VARCHAR(255) NOT NULL,
  title_np VARCHAR(255) NOT NULL,
  album_type VARCHAR(20) NOT NULL DEFAULT 'photo' CHECK (album_type IN ('photo', 'video')),
  cover_image_url VARCHAR(500),
  bs_date VARCHAR(50),
  ad_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_gallery_albums_type ON gallery_albums(album_type);
CREATE INDEX idx_gallery_albums_deleted_at ON gallery_albums(deleted_at);

CREATE TRIGGER trg_gallery_albums_updated_at
  BEFORE UPDATE ON gallery_albums
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  media_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  media_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption_en VARCHAR(255),
  caption_np VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_media_album_id ON gallery_media(album_id);
