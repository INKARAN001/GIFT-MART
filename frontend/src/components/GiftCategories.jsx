import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../styles/gift-categories.css';

import CategoryGallery from './CategoryGallery';

// All images live under public/photos/ (single copy — no duplicate src/ imports)
const GIFT_BOX_GALLERY = [
  '/photos/giftbox/whatsapp-hero.jpeg',
  '/photos/giftbox/1.jpeg',
  '/photos/giftbox/2.jpeg',
  '/photos/giftbox/3.jpeg',
  '/photos/giftbox/4.jpeg',
  '/photos/giftbox/5.jpeg',
];

const FLASH_CARDS_GALLERY = [
  '/photos/flashcards/4.jpeg',
  '/photos/flashcards/3.jpeg',
  '/photos/flashcards/2.jpeg',
  '/photos/flashcards/1.jpeg',
  '/photos/flashcards/5.jpeg',
  '/photos/flashcards/6.jpeg',
  '/photos/flashcards/7.jpeg',
  '/photos/flashcards/8.jpeg',
];

const FRAMES_GALLERY = [
  '/photos/frames/frames_2.jpeg',
  '/photos/frames/frames_3.jpeg',
  '/photos/frames/frames_4.jpeg',
  '/photos/frames/frames_5.jpeg',
  '/photos/frames/frames_6.jpeg',
  '/photos/frames/frames_1.jpeg',
];

const BOUQUET_GALLERY = [
  '/photos/bouquet/gallery/01.jpeg',
  '/photos/bouquet/1.jpeg',
  '/photos/bouquet/chocolate Boquet.jpeg',
  '/photos/bouquet/5.jpeg',
  '/photos/bouquet/gallery/05.jpeg',
  '/photos/bouquet/gallery/06.jpeg',
  '/photos/bouquet/gallery/07.jpeg',
  '/photos/bouquet/gallery/08.jpeg',
  '/photos/bouquet/gallery/09.jpeg',
  '/photos/bouquet/gallery/10.jpeg',
  '/photos/bouquet/gallery/11.jpeg',
  '/photos/bouquet/gallery/12.jpeg',
  '/photos/bouquet/gallery/13.jpeg',
  '/photos/bouquet/gallery/14.jpeg',
  '/photos/bouquet/gallery/15.jpeg',
  '/photos/bouquet/gallery/16.jpeg',
  '/photos/bouquet/gallery/17.jpeg',
  '/photos/bouquet/gallery/18.jpeg',
  '/photos/bouquet/3.jpeg',
  '/photos/bouquet/gallery/20.jpeg',
  '/photos/bouquet/gallery/21.jpeg',
  '/photos/bouquet/gallery/22.jpeg',
  '/photos/bouquet/gallery/23.jpeg',
  '/photos/bouquet/gallery/24.jpeg',
  '/photos/bouquet/2.jpeg',
];

const GALLERIES = {
  'Gift Box': {
    images: GIFT_BOX_GALLERY,
    title: '🎁 Gift Box Collection',
  },
  'Flash Cards': {
    images: FLASH_CARDS_GALLERY,
    title: '✉️ Flash Cards Collection',
  },
  'Frames': {
    images: FRAMES_GALLERY,
    title: '🖼️ Frames Collection',
  },
  'Bouquet': {
    images: BOUQUET_GALLERY,
    title: '💐 Bouquet Collection',
  },
};

const CATEGORIES = [
  { name: 'Bouquet', image: '/photos/bouquet/gallery/01.jpeg', hasGallery: true },
  { name: 'Gift Box', image: '/photos/giftbox/1.jpeg', hasGallery: true },
  { name: 'Flash Cards', image: '/photos/flashcards/4.jpeg', hasGallery: true },
  { name: 'Frames', image: '/photos/frames/frames_1.jpeg', hasGallery: true },
];

export default function GiftCategories() {
  const [gallery, setGallery] = useState(null);

  const openGallery = (categoryName) => (e) => {
    e.preventDefault();
    setGallery({ category: categoryName, index: 0 });
  };

  const closeGallery = () => setGallery(null);

  const activeConfig = gallery ? GALLERIES[gallery.category] : null;

  return (
    <>
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
