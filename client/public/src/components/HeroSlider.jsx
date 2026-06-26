import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import './HeroSlider.css';

const FALLBACK_SLIDES = [
  { image: '/assets/images/slider/hospital_one.jpg', title: 'सैनामैना आधारभुत अस्पताल' },
  { image: '/assets/images/slider/hospital_two.jpg', title: 'सैनामैना आधारभुत अस्पताल' },
  { image: '/assets/images/slider/hospital_three.jpg', title: 'सैनामैना आधारभुत अस्पताल' },
];

export default function HeroSlider({ slides }) {
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;

  return (
    <section className="main-slider">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop
        className="hero-swiper"
      >
        {items.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="psdesc hidden-xs flex-caption">
              <div className="ps-desc">
                <h3><a href="#">{slide.title}</a></h3>
              </div>
            </div>
            <div className="fleximg">
              <div style={{ textAlign: 'center' }}>
                <img src={slide.image} alt={slide.title || ''} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
