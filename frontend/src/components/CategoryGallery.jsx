import { useEffect, useCallback } from 'react';
import '../styles/gift-box-gallery.css';

/**
 * Generic full-screen photo gallery / lightbox.
 *
 * Props:
 *   images      – string[]  array of imported image URLs
 *   title       – string    heading shown in the header  e.g. "🎁 Gift Box Collection"
 *   shopLabel   – string    CTA button text              e.g. "🛍️ Shop Gift Boxes"
 *   shopLink    – string    react-router path            e.g. "/products?category=Gift+Box"
 *   activeIndex – number    currently visible image index
 *   onSelect    – (i) => void   called when user picks an image
 *   onClose     – () => void    called to close the gallery
 */
export default function CategoryGallery({
    images,
    title,
    activeIndex,
    onSelect,
    onClose,
}) {
    const total = images.length;

    const goPrev = useCallback(() => {
        onSelect((activeIndex - 1 + total) % total);
    }, [activeIndex, total, onSelect]);

    const goNext = useCallback(() => {
        onSelect((activeIndex + 1) % total);
    }, [activeIndex, total, onSelect]);

    // ── Keyboard navigation ────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goPrev, goNext, onClose]);

    // ── Prevent body scroll while open ────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // ── Backdrop click closes gallery ──────────────────────────────────────
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="gb-overlay"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="gb-header">
                <div className="gb-title">
                    {title}
                    <span className="gb-counter">{activeIndex + 1} / {total}</span>
                </div>
                <button
                    className="gb-close"
                    onClick={onClose}
                    aria-label="Close gallery"
                    title="Close (Esc)"
                >
                    ✕
                </button>
            </div>

            {/* ── Main image + prev/next arrows ─────────────────────────── */}
            <div className="gb-main">
                <button className="gb-arrow" onClick={goPrev} aria-label="Previous image" title="Previous (←)">
                    ‹
                </button>

                <div className="gb-img-wrap">
                    <img
                        key={activeIndex}        /* re-mount triggers fade-in animation */
                        src={images[activeIndex]}
                        alt={`${title} photo ${activeIndex + 1}`}
                        className="gb-img"
                        draggable={false}
                    />
                </div>

                <button className="gb-arrow" onClick={goNext} aria-label="Next image" title="Next (→)">
                    ›
                </button>
            </div>

            {/* ── Thumbnail strip ────────────────────────────────────────── */}
            <div className="gb-thumbs" role="list">
                {images.map((src, i) => (
                    <div
                        key={i}
                        className={`gb-thumb ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => onSelect(i)}
                        role="listitem"
                        aria-label={`Photo ${i + 1}`}
                        title={`Photo ${i + 1}`}
                    >
                        <img src={src} alt={`${title} thumbnail ${i + 1}`} />
                    </div>
                ))}
            </div>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <div className="gb-footer">
                <span className="gb-hint">← → to navigate · Esc to close</span>
            </div>
        </div>
    );
}
