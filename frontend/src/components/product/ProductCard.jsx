import React from 'react';
import { getImageSrc } from '../../utils/imageUrl';
import StarRating from './StarRating';

export default function ProductCard({ product, onProductClick, overlay }) {
    return (
        <div
            className="product-card"
            role="button"
            tabIndex={0}
            onClick={() => onProductClick?.(product)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onProductClick?.(product); } }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--page-gold-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
        >
            {overlay && (
                <span className={`overlay-badge overlay-badge-${overlay.toLowerCase()}`} style={{ top: '12px', left: '12px' }}>
                    {overlay}
                </span>
            )}
            {product.customizable && (
                <div className="product-card-badge" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'linear-gradient(135deg, #5F9EA0 0%, #4B8A8C 100%)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Customizable
                </div>
            )}
            
            <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', background: 'var(--page-gold-warm)' }}>
                {product.image ? (
                    <img 
                        src={getImageSrc(product.image)} 
                        alt={product.name} 
                        className="product-img"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('show'); }}
                    />
                ) : null}
                <div className="product-img-placeholder" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: product.image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'var(--page-gold-warm)' }}>
                    🎁
                </div>
            </div>

            <div className="product-card-body" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {product.category === 'Boquet' ? 'Bouquets' : product.category}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    {product.name}
                </h3>
                <StarRating averageRating={product.averageRating ?? product.rating} reviewCount={product.reviewCount} />
            </div>
            
            {/* Adding hover zoom effect with embedded CSS to ensure functionality without extra files */}
            <style>{`
                .product-card:hover .product-img {
                    transform: scale(1.08);
                }
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                }
                .product-img-placeholder.show {
                    display: flex !important;
                }
            `}</style>
        </div>
    );
}
