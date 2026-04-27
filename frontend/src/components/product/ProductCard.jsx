import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageSrc } from '../../utils/imageUrl';
import { displayCategoryLabel } from '../../utils/categoryLabel';
import StarRating from './StarRating';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, expanded, onProductClick, overlay }) {
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);
    const [cartHint, setCartHint] = useState('');

    const pid = product._id || product.id;
    const unavailable = product.active === false;

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!pid || adding || unavailable) return;
        setAdding(true);
        setCartHint('');
        const payload = {
            _id: pid,
            id: pid,
            name: product.name,
            price: product.price,
            image: product.image || product.imageUrl
        };
        const r = await addToCart(payload, 1);
        setAdding(false);
        if (r.ok) {
            setCartHint('Added to cart');
            window.setTimeout(() => setCartHint(''), 2200);
        } else {
            alert(r.message || 'Could not add to cart');
        }
    };

    const descriptionText = (product.shortDescription || product.description || '').trim();
    const descriptionDisplay =
        descriptionText ||
        'Premium gift-ready packaging. Open the full page for more photos and customer reviews.';

    return (
        <div
            className={`product-card${expanded ? ' product-card--expanded' : ''}`}
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            aria-label={expanded ? `${product.name}, details open. Press Enter to collapse.` : `${product.name}. Press Enter to show details.`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick?.(product);
                }
            }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--page-gold-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: expanded ? '2px solid var(--primary-color, #5F9EA0)' : '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
        >
            {overlay && (
                <span
                    className={`overlay-badge overlay-badge-${overlay.toLowerCase()}`}
                    style={{ top: '12px', left: '12px', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onProductClick?.(product); }}
                >
                    {overlay}
                </span>
            )}
            {product.customizable && (
                <div
                    className="product-card-badge"
                    style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'linear-gradient(135deg, #5F9EA0 0%, #4B8A8C 100%)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onProductClick?.(product); }}
                >
                    Customizable
                </div>
            )}
            
            <div
                style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', background: 'var(--page-gold-warm)' }}
                onClick={(e) => { e.stopPropagation(); onProductClick?.(product); }}
            >
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

            <div
                className="product-card-body"
                style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!expanded) onProductClick?.(product);
                }}
            >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {displayCategoryLabel(product.category)}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    {product.name}
                </h3>
                <StarRating averageRating={product.averageRating ?? product.rating} reviewCount={product.reviewCount} />
                <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--gold-muted, #5F9EA0)' }}>
                        LKR {product.price != null ? Number(product.price).toLocaleString() : '—'}
                    </span>
                    <button
                        type="button"
                        className="product-card-add-cart"
                        onClick={handleAddToCart}
                        disabled={adding || unavailable || !pid}
                        title={unavailable ? 'Currently unavailable' : 'Add one to cart'}
                        aria-label={`Add ${product.name || 'product'} to cart`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: unavailable ? '#94a3b8' : '#5F9EA0',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            cursor: unavailable || !pid ? 'not-allowed' : adding ? 'wait' : 'pointer',
                            opacity: unavailable ? 0.85 : 1,
                            width: '100%',
                            fontFamily: 'inherit'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden>shopping_cart</span>
                        {adding ? 'Adding…' : unavailable ? 'Unavailable' : 'Add to cart'}
                    </button>
                    {cartHint ? (
                        <span role="status" aria-live="polite" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                            {cartHint}
                        </span>
                    ) : null}
                </div>
            </div>

            {expanded && (
                <div className="product-card-expanded-panel" onClick={(e) => e.stopPropagation()}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
                        Rating &amp; details
                    </p>
                    <div style={{ marginBottom: '0.65rem' }}>
                        <StarRating averageRating={product.averageRating ?? product.rating} reviewCount={product.reviewCount} />
                    </div>
                    <p
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.55,
                            margin: '0 0 0.85rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 6,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {descriptionDisplay}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-muted, #5F9EA0)' }}>
                            LKR {product.price != null ? Number(product.price).toLocaleString() : '—'}
                        </span>
                    </div>
                    {pid ? (
                        <Link
                            to={`/product/${pid}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'var(--primary-color, #5F9EA0)',
                                textDecoration: 'none',
                            }}
                        >
                            Full page &amp; reviews
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }} aria-hidden>
                                arrow_forward
                            </span>
                        </Link>
                    ) : null}
                </div>
            )}
            
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
