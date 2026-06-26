import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { galleryApi, fileUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const TYPE_LABEL_KEYS = { photo: 'gallery.photo', video: 'gallery.video' };

export default function GalleryListPage() {
  const { type } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    galleryApi.listAlbums({ album_type: type, limit: 50 }).then((res) => {
      setAlbums(res.data.data);
      setIsLoading(false);
    });
  }, [type]);

  const titleKey = TYPE_LABEL_KEYS[type] || 'nav.mediaCenter';

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t(titleKey)}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.mediaCenter')}</li>
              <li>{t(titleKey)}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px' }}>
        {isLoading ? <p>{t('common.loading')}</p> : albums.length === 0 ? <p>{t('common.detailsNotAvailable')}</p> : (
          <div className="row">
            {albums.map((album) => (
              <div className="gallery-block col-md-3 col-sm-6 col-xs-12" key={album.id}>
                <Link to={`/gallery/${type}/${album.id}`}>
                  <img
                    src={fileUrl(album.cover_image_url) || '/assets/images/nepal-logo.png'}
                    alt={field(album, 'title')}
                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                  <p style={{ marginTop: 8 }}>{field(album, 'title')} ({album.media_count})</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
