import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../styles/gift-categories.css';

import CategoryGallery from './CategoryGallery';

// ── Category cover images (used in the carousel) ──────────────────────────
import boquetImg from '../boquet/1.jpeg';
import flashCardsImg from '../Flash cards/1.jpeg';
import framesImg from '../frames/1.jpeg';
import giftBoxImg from '../gift box/1.jpeg';

// ── Gift Box gallery images (6 photos) ────────────────────────────────────
import gb0 from '../gift box/WhatsApp Image 2026-02-21 at 15.44.27.jpeg';
import gb1 from '../gift box/1.jpeg';
import gb2 from '../gift box/2.jpeg';
import gb3 from '../gift box/3.jpeg';
import gb4 from '../gift box/4.jpeg';
import gb5 from '../gift box/5.jpeg';

// ── Flash Cards gallery images (8 photos) ─────────────────────────────────
import fc1 from '../Flash cards/1.jpeg';
import fc2 from '../Flash cards/2.jpeg';
import fc3 from '../Flash cards/3.jpeg';
import fc4 from '../Flash cards/4.jpeg';
import fc5 from '../Flash cards/5.jpeg';
import fc6 from '../Flash cards/6.jpeg';
import fc7 from '../Flash cards/7.jpeg';
import fc8 from '../Flash cards/8.jpeg';

// ── Frames gallery images (6 photos) ─────────────────────────────────────
import fr1 from '../frames/1.jpeg';
import fr2 from '../frames/2.jpeg';
import fr3 from '../frames/3.jpeg';
import fr4 from '../frames/4.jpeg';
import fr5 from '../frames/5.jpeg';
import fr6 from '../frames/6.jpeg';

// ── Bouquet gallery images (25 photos) ───────────────────────────────────
import bq1 from '../boquet/1.jpeg';
import bq2 from '../boquet/2.jpeg';
import bq3 from '../boquet/3.jpeg';
import bq4 from '../boquet/4.jpeg';
import bq5 from '../boquet/5.jpeg';
import bq6 from '../boquet/6.jpeg';
import bq7 from '../boquet/7.jpeg';
import bq8 from '../boquet/8.jpeg';
import bq9 from '../boquet/9.jpeg';
import bq10 from '../boquet/10.jpeg';
import bq11 from '../boquet/11.jpeg';
import bq12 from '../boquet/12.jpeg';
import bq13 from '../boquet/13.jpeg';
import bq14 from '../boquet/14.jpeg';
import bq15 from '../boquet/15.jpeg';
import bq16 from '../boquet/16.jpeg';
import bq17 from '../boquet/17.jpeg';
import bq18 from '../boquet/18.jpeg';
import bq19 from '../boquet/19.jpeg';
import bq20 from '../boquet/20.jpeg';
import bq21 from '../boquet/21.jpeg';
import bq22 from '../boquet/22.jpeg';
import bq23 from '../boquet/23.jpeg';
import bq24 from '../boquet/24.jpeg';
import bq25 from '../boquet/25.jpeg';

// ── Gallery configs per category ─────────────────────────────────────────
const GALLERIES = {
  'Gift Box': {
    images: [gb0, gb1, gb2, gb3, gb4, gb5],
    title: '🎁 Gift Box Collection',
  },
  'Flash Cards': {
    images: [fc1, fc2, fc3, fc4, fc5, fc6, fc7, fc8],
    title: '✉️ Flash Cards Collection',
  },
  'Frames': {
    images: [fr2, fr3, fr4, fr5, fr6, fr1],
    title: '🖼️ Frames Collection',
  },
  'Bouquet': {
    images: [bq1, bq2, bq3, bq4, bq5, bq6, bq7, bq8, bq9, bq10, bq11, bq12,
      bq13, bq14, bq15, bq16, bq17, bq18, bq19, bq20, bq21, bq22, bq23, bq24, bq25],
    title: '💐 Bouquet Collection',
  },
};

// ── Carousel category definitions ────────────────────────────────────────
const CATEGORIES = [
  { name: 'Bouquet', image: boquetImg, hasGallery: true },
  { name: 'Gift Box', image: giftBoxImg, hasGallery: true },
  { name: 'Flash Cards', image: flashCardsImg, hasGallery: true },
  { name: 'Frames', image: framesImg, hasGallery: true },
];

export default function GiftCategories() {
  // { category: string, index: number } | null
  const [gallery, setGallery] = useState(null);

  const openGallery = (categoryName) => (e) => {
    e.preventDefault();
    setGallery({ category: categoryName, index: 0 });
  };

  const closeGallery = () => setGallery(null);

  const activeConfig = gallery ? GALLERIES[gallery.category] : null;

  return (
    <>
      {/* ── Lightbox — renders above everything ─────────────────────── */}
      {gallery && activeConfig && (
        <CategoryGallery
          images={activeConfig.images}
          title={activeConfig.title}
          activeIndex={gallery.index}
          onSelect={(i) => setGallery((g) => ({ ...g, index: i }))}
          onClose={closeGallery}
        />
      )}

      <section className="gift-categories-section">
        <h2 className="categories-title">Our Products</h2>

        <div className="swiper-container-h">
          <Swiper
            modules={[Autoplay]}
            slidesPerView={3}
            centeredSlides={true}
            spaceBetween={30}
            loop={true}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            className="products-swiper"
          >
            {CATEGORIES.map((cat) => (
              <SwiperSlide key={cat.name}>
                {/* Opens photo gallery lightbox — no navigation to /products */}
                <a
                  href="#"
                  className="swiper-slide-link"
                  onClick={openGallery(cat.name)}
                  aria-label={`View ${cat.name} photo gallery`}
                >
                  <img src={cat.image} alt={cat.name} />
                  <div className="swiper-slide-overlay">
                    <span className="swiper-slide-name">{cat.name}</span>
                    <span className="swiper-slide-cta">View Gallery →</span>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
}
