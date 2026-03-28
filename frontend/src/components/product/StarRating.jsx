import React from 'react';

/**
 * Shows 1–5 star rating and optional review count.
 * averageRating: 0–5 (can be decimal), reviewCount: number
 */
export default function StarRating({ averageRating, reviewCount }) {
    const value = Math.min(5, Math.max(0, Number(averageRating) || 0));
    const count = Math.max(0, parseInt(reviewCount, 10) || 0);

    return (
        <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-label={`Rating: ${value} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className="material-symbols-outlined"
                        style={{
                            fontSize: '1.1rem',
                            color: star <= value ? 'var(--gold-muted)' : 'var(--page-gold-warm)',
                            fontVariationSettings: star <= value ? '"FILL" 1' : '"FILL" 0'
                        }}
                    >
                        star
                    </span>
                ))}
            </span>
            {count > 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({count} {count === 1 ? 'review' : 'reviews'})
                </span>
            ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No reviews</span>
            )}
        </div>
    );
}
