import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { displayCategoryLabel } from '../../utils/categoryLabel';
import { getImageSrc } from '../../utils/imageUrl';

/** Matches overlay-badge-* rules in tailwind.css */
const OVERLAY_BADGE_VARIANTS = new Set(['trending', 'new', 'bestseller', 'popular']);

function overlayBadgeVariant(cat) {
  const raw = cat?.overlay != null && String(cat.overlay).trim() !== '' ? String(cat.overlay) : 'Trending';
  const normalized = raw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return OVERLAY_BADGE_VARIANTS.has(normalized) ? normalized : 'trending';
}

function overlayBadgeLabel(cat) {
  return cat?.overlay != null && String(cat.overlay).trim() !== '' ? String(cat.overlay) : 'Trending';
}

/**
 * Curated categories — horizontal carousel with snap, arrows, and dots.
 */
export default function CategoryCarousel({ categoryCards }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((i) => {
    const el = scrollerRef.current;
    if (!el || !categoryCards.length) return;
    const cards = el.querySelectorAll('[data-carousel-card]');
    const card = cards[i];
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [categoryCards.length]);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !categoryCards.length) return;
    const cards = el.querySelectorAll('[data-carousel-card]');
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((node, i) => {
      const left = node.offsetLeft;
      const right = left + node.offsetWidth;
      const center = (left + right) / 2;
      const d = Math.abs(center - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, [categoryCards.length]);

  const carouselDeckKey = categoryCards.map((c) => c.slug || c.id || '').join('|');

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      window.requestAnimationFrame(updateActiveFromScroll);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    updateActiveFromScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [updateActiveFromScroll, carouselDeckKey]);

  const goDir = (dir) => {
    const n = categoryCards.length;
    if (n <= 1) return;
    const next = (active + dir + n) % n;
    scrollToIndex(next);
  };

  if (!categoryCards.length) return null;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goDir(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goDir(1);
    }
  };

  return (
    <div
      className="relative group/carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Curated categories"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Edge fades */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 sm:w-16 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 sm:w-16 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent"
        aria-hidden
      />

      <button
        type="button"
        onClick={() => goDir(-1)}
        disabled={categoryCards.length <= 1}
        className="absolute left-0 sm:left-2 top-1/2 z-[2] -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-700 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100 dark:hover:bg-primary dark:disabled:hover:bg-slate-900"
        aria-label="Previous category (loops to end)"
      >
        <span className="material-symbols-outlined text-2xl">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={() => goDir(1)}
        disabled={categoryCards.length <= 1}
        className="absolute right-0 sm:right-2 top-1/2 z-[2] -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-700 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100 dark:hover:bg-primary dark:disabled:hover:bg-slate-900"
        aria-label="Next category (loops to start)"
      >
        <span className="material-symbols-outlined text-2xl">chevron_right</span>
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-5 sm:gap-6 lg:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 sm:px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categoryCards.map((cat, idx) => (
          <Link
            key={cat.slug || cat.id || idx}
            data-carousel-card
            to={`/products/${cat.slug || 'uncategorized'}`}
            className="category-card group cursor-pointer block snap-center shrink-0 w-[82vw] max-w-[340px] sm:w-[300px] md:w-[320px]"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 shadow-xl ring-1 ring-slate-200/60 dark:ring-slate-700/60">
              <img
                src={typeof cat.image === 'string' ? (getImageSrc(cat.image) || cat.image) : cat.image}
                alt={displayCategoryLabel(cat.name)}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <span className={`overlay-badge overlay-badge-${overlayBadgeVariant(cat)}`}>
                {overlayBadgeLabel(cat)}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h4 className="font-serif text-2xl mb-1 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
              {displayCategoryLabel(cat.name)}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{cat.tagline}</p>
          </Link>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8" role="tablist" aria-label="Category slides">
        {categoryCards.map((cat, i) => (
          <button
            key={cat.slug || cat.id || `dot-${i}`}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`Show ${displayCategoryLabel(cat.name)}`}
            onClick={() => scrollToIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              active === i ? 'w-8 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
