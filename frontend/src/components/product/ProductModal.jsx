import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageSrc } from '../../utils/imageUrl';
import StarRating from './StarRating';

export default function ProductModal({ product, onClose }) {
    const navigate = useNavigate();

    useEffect(() => {
        const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!product) return null;

    return (
        <div
            className="product-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '24px'
            }}
        >
            <div
                className="product-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--page-gold-light)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '480px',
                    width: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh'
                }}
            >
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: 'var(--page-gold-warm)' }}>
                    {product.image ? (
                        <img
                            src={getImageSrc(product.image)}
                            alt={product.name}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🎁</div>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
                    </button>
                </div>
                <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {product.category === 'Boquet' ? 'Bouquets' : product.category}
                    </span>
                    <h2 id="product-modal-title" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: '8px 0 8px', lineHeight: '1.3' }}>
                        {product.name}
                    </h2>
                    <div style={{ marginBottom: '16px' }}>
                        <StarRating averageRating={product.averageRating ?? product.rating} reviewCount={product.reviewCount} />
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                        {product.shortDescription || product.description || 'Premium product with gift-ready packaging. Details available on the product page.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gold-muted)' }}>
                            LKR {product.price != null ? Number(product.price).toLocaleString() : '—'}
                        </span>
                        <button
                            type="button"
                            className="btn-primary product-add-to-cart-btn"
                            onClick={() => navigate('/cart')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: '#5F9EA0',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(95, 158, 160, 0.35)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#4B8A8C';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(95, 158, 160, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#5F9EA0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(95, 158, 160, 0.35)';
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_cart</span>
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
