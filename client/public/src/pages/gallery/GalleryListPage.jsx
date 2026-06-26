import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { galleryApi, fileUrl } from '../../api/client';

const TYPE_LABELS = { photo: 'तस्विर संग्रह', video: 'वृत्त चित्र' };

export default function GalleryListPage() {
  const { type } = useParams();
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    galleryApi.listAlbums({ album_type: type, limit: 50 }).then((res) => {
      setAlbums(res.data.data);
      setIsLoading(false);
    });
  }, [type]);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{TYPE_LABELS[type] || 'ग्यालरी'}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>मिडिया सेन्टर</li>
              <li>{TYPE_LABELS[type]}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {isLoading ? <p>लोड हुँदैछ...</p> : albums.length === 0 ? <p>विवरण उपलब्ध हुन सकेन!</p> : (
          <div className="row">
            {albums.map((album) => (
              <div className="gallery-block col-md-3 col-sm-6 col-xs-12" key={album.id}>
                <Link to={`/gallery/${type}/${album.id}`}>
                  <img
                    src={fileUrl(album.cover_image_url) || '/assets/images/nepal-logo.png'}
                    alt={album.title_np}
                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                  <p style={{ marginTop: 8 }}>{album.title_np} ({album.media_count})</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
