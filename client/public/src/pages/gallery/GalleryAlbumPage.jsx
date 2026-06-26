import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { galleryApi, fileUrl } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const TYPE_LABEL_KEYS = { photo: 'gallery.photo', video: 'gallery.video' };

export default function GalleryAlbumPage() {
  const { type, id } = useParams();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    setIsLoading(true);
    galleryApi.getAlbum(id).then((res) => setAlbum(res.data.data)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.loading')}</div>;
  if (!album) return <div className="auto-container" style={{ padding: '40px 0' }}>{t('common.notFound')}</div>;

  const slides = album.media.map((m) => ({ src: fileUrl(m.media_url), title: field(m, 'caption') }));

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{field(album, 'title')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li><Link to={`/gallery/${type}`}>{t('nav.mediaCenter')}</Link></li>
              <li>{field(album, 'title')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <div className="row">
          {album.media.map((item, i) => (
            <div className="gallery-block col-md-3 col-sm-6 col-xs-12" key={item.id}>
              {item.media_type === 'video' ? (
                <video src={fileUrl(item.media_url)} controls style={{ width: '100%' }} />
              ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); setLightboxIndex(i); }} className="light-box">
                  <img src={fileUrl(item.media_url)} alt={field(item, 'caption') || ''} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                </a>
              )}
              {field(item, 'caption') && <p style={{ marginTop: 6, fontSize: 13 }}>{field(item, 'caption')}</p>}
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={slides}
      />
    </>
  );
}
