import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import { fileUrl } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function GalleryPreview({ items }) {
  const { field } = useLanguage();
  if (!items || items.length === 0) return null;

  return (
    <section className="causes-section">
      <div className="container">
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={4}
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            992: { slidesPerView: 4 },
          }}
          className="causes-carousel"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <Link to={`/gallery/photo/${item.id}`} className="display-block">
                <div className="inner-box">
                  <div className="image-box">
                    <figure>
                      <img style={{ height: 190, width: '100%', objectFit: 'cover' }} src={fileUrl(item.cover_image_url)} alt={field(item, 'title')} />
                    </figure>
                  </div>
                  <p className="gallery-caption">{field(item, 'title')}</p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
