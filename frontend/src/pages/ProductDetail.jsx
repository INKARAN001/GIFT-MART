import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageSrc } from '../utils/imageUrl';
import { FEATURES } from '../config/features';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';
import '../styles/product-detail.css';

const API = getApiBaseUrl();

/** One image per product (listing + detail). When missing, use this placeholder — no extra stock gallery. */
const PLACEHOLDER_IMAGE = '/placeholder-gift.svg';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, fetchWithAuth } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartAddedMsg, setCartAddedMsg] = useState('');
    const [myReview, setMyReview] = useState(null);
    /** False until /reviews/me/product/:id returns (logged-in users only). */
    const [reviewMeLoaded, setReviewMeLoaded] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewBusy, setReviewBusy] = useState(false);
    const [reviewFeedback, setReviewFeedback] = useState('');

    const [mainImage, setMainImage] = useState(PLACEHOLDER_IMAGE);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                const hero = res.data.image || res.data.imageUrl;
                setMainImage(hero || PLACEHOLDER_IMAGE);
            } catch {
                setMainImage(PLACEHOLDER_IMAGE);
                setProduct({
                    name: 'Midnight Elegance Bouquet',
                    category: 'Premium Selection',
                    description: 'Hand-selected platinum-toned lilies, white roses, and aromatic eucalyptus in brushed silver tissue with silk ribbon. Suitable for corporate and personal gifting.',
                    price: 4890,
                    subtitle: 'A curated arrangement of premium blooms and silver-dusted foliage for lasting impression.'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const productId = product?._id || product?.id || id;

    useEffect(() => {
        if (!FEATURES.REVIEWS || !productId) return undefined;
        let cancelled = false;
        api.get(`/reviews/product/${encodeURIComponent(productId)}`)
            .then((res) => {
                if (!cancelled && Array.isArray(res.data)) setReviews(res.data);
            })
            .catch(() => {
                if (!cancelled) setReviews([]);
            });
        return () => { cancelled = true; };
    }, [FEATURES.REVIEWS, productId]);

    useEffect(() => {
        if (!FEATURES.REVIEWS) {
            setMyReview(null);
            setReviewMeLoaded(true);
            return undefined;
        }
        if (!user || !productId) {
            setMyReview(null);
            setReviewMeLoaded(true);
            return undefined;
        }
        let cancelled = false;
        setReviewMeLoaded(false);
        fetchWithAuth(`${API}/reviews/me/product/${encodeURIComponent(productId)}`)
            .then(async (r) => jsonFromResponse(r, null))
            .then((data) => {
                if (!cancelled && data) setMyReview(data);
            })
            .catch(() => {
                if (!cancelled) setMyReview({ hasReview: false, canReview: false });
            })
            .finally(() => {
                if (!cancelled) setReviewMeLoaded(true);
            });
        return () => { cancelled = true; };
    }, [FEATURES.REVIEWS, user, productId, fetchWithAuth]);

    if (loading) {
        return (
            <div className="page-loading page-loading--spinner" style={{ minHeight: '50vh' }}>
                <span className="gm-spinner" aria-hidden />
                <span>Loading product…</span>
            </div>
        );
    }

    const p = product;
    const productImageField = p?.image || p?.imageUrl;
    /** Same URL as grid/card: one hero, no fake extra gallery shots. */
    const thumbList = productImageField ? [productImageField] : [PLACEHOLDER_IMAGE];

    const buildCartPayload = () => ({
        _id: productId,
        id: productId,
        name: p?.name,
        price: p?.price,
        image: p?.image || p?.imageUrl
    });

    const handleAddToCart = async () => {
        if (!p || !productId) return;
        setCartAddedMsg('');
        const r = await addToCart(buildCartPayload(), quantity);
        if (r.ok) {
            setCartAddedMsg(
                quantity > 1
                    ? `Added ${quantity} items to your cart.`
                    : 'Added to your cart.'
            );
            window.setTimeout(() => setCartAddedMsg(''), 5000);
        } else alert(r.message || 'Could not add to cart');
    };

    const handleBuyNow = async () => {
        if (!p || !productId) return;
        const r = await addToCart(buildCartPayload(), quantity);
        if (r.ok) navigate('/cart');
        else alert(r.message || 'Could not add to cart');
    };

    const handleWishlist = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!productId) return;
        const r = await fetchWithAuth(`${API}/wishlist/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        const data = await jsonFromResponse(r, {});
        if (r.ok) alert('Saved to your wishlist.');
        else alert(data?.message || 'Could not save');
    };

    const displayReviews = reviews;
    const computedAvgFromList =
        displayReviews.length > 0
            ? displayReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / displayReviews.length
            : null;
    const avgRating =
        typeof p?.averageRating === 'number' && p.averageRating > 0
            ? p.averageRating
            : computedAvgFromList != null && computedAvgFromList > 0
              ? computedAvgFromList
              : null;
    const reviewCount = typeof p?.reviewCount === 'number' ? p.reviewCount : displayReviews.length;

    const submitReview = async (e) => {
        e.preventDefault();
        if (!FEATURES.REVIEWS || !user || !productId) return;
        setReviewFeedback('');
        setReviewBusy(true);
        try {
            const r = await fetchWithAuth(`${API}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                }),
            });
            const data = await jsonFromResponse(r, {});
            if (!r.ok) {
                setReviewFeedback(data?.message || 'Could not submit review.');
                return;
            }
            setReviewFeedback('Thank you. Your review will appear after moderation.');
            setMyReview({ hasReview: true, canReview: false, moderationStatus: 'pending' });
            setReviewComment('');
            api.get(`/reviews/product/${encodeURIComponent(productId)}`).then((res) => {
                if (Array.isArray(res.data)) setReviews(res.data);
            }).catch(() => {});
        } catch {
            setReviewFeedback('Something went wrong.');
        } finally {
            setReviewBusy(false);
        }
    };

    const formatReviewDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="pd-page pd-page--figma">
            <div className="pd-figma-gradient" aria-hidden />
            <main className="pd-main pd-main--figma">
                <div className="pd-figma-grid">
                    <div className="pd-figma-col pd-figma-col--media">
                        <Link to="/products" className="pd-back-link">
                            <span className="pd-back-link__arrow" aria-hidden>←</span>
                            <span>Back to products</span>
                        </Link>

                        <div className="pd-gallery-figma">
                            <div className="pd-gallery-figma__hero">
                                <img
                                    src={getImageSrc(mainImage) || mainImage}
                                    alt={p?.name || 'Product'}
                                    className="pd-gallery-figma__img"
                                />
                            </div>
                            {thumbList.length > 1 ? (
                                <div className="pd-thumbs-figma">
                                    {thumbList.map((img, idx) => (
                                        <button
                                            key={`${img}-${idx}`}
                                            type="button"
                                            className={`pd-thumbs-figma__btn ${mainImage === img ? 'is-active' : ''}`}
                                            style={{ backgroundImage: `url("${getImageSrc(img) || img}")` }}
                                            onClick={() => setMainImage(img)}
                                            aria-label={`View image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="pd-figma-col pd-figma-col--detail">
                        <section className="pd-section-meta">
                            <h1 className="pd-title-figma">{p?.name}</h1>
                            <p className="pd-price-figma">
                                LKR {Number(p?.price ?? 0).toLocaleString()}
                            </p>
                            {FEATURES.REVIEWS && (
                                <div className="pd-rating-inline" aria-label={avgRating != null ? `${avgRating.toFixed(1)} average` : 'No ratings yet'}>
                                    {avgRating != null && avgRating > 0 ? (
                                        <>
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span
                                                    key={i}
                                                    className={`material-symbols-outlined pd-star ${i < Math.round(avgRating) ? 'filled' : ''}`}
                                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                                >
                                                    star
                                                </span>
                                            ))}
                                            <span className="pd-rating-inline__count">
                                                {avgRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="pd-rating-inline__count" style={{ fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                                            No ratings yet
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="pd-desc-border">
                                <p className="pd-desc-figma">
                                    {p?.description || p?.subtitle || p?.shortDescription || 'Premium quality product in gift-ready packaging.'}
                                </p>
                            </div>
                        </section>

                        <section className="pd-section-actions">
                            {cartAddedMsg ? (
                                <div role="status" aria-live="polite" className="pd-cart-toast pd-cart-toast--figma">
                                    {cartAddedMsg}
                                </div>
                            ) : null}

                            <div className="pd-qty-row-figma">
                                <span className="pd-qty-label">Quantity</span>
                                <div className="pd-qty-controls">
                                    <button type="button" className="pd-qty-hit" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                                        <span className="pd-qty-icon">−</span>
                                    </button>
                                    <span className="pd-qty-num">{quantity}</span>
                                    <button type="button" className="pd-qty-hit" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                                        <span className="pd-qty-icon">+</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pd-buttons-figma">
                                <button type="button" className="pd-btn-figma pd-btn-figma--primary" onClick={handleAddToCart}>
                                    Add to cart
                                </button>
                                <button type="button" className="pd-btn-figma pd-btn-figma--secondary" onClick={handleWishlist}>
                                    Wishlist
                                </button>
                                <button type="button" className="pd-btn-figma-link" onClick={handleBuyNow}>
                                    Buy now
                                </button>
                            </div>
                        </section>

                        {FEATURES.REVIEWS ? (<section className="pd-section-reviews">
                            <h2 className="pd-reviews-heading">Reviews</h2>
                            {user && myReview?.hasReview && (
                                <p className="pd-desc-figma" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    {myReview.moderationStatus === 'pending'
                                        ? 'Your review is pending moderation and will appear here once approved.'
                                        : myReview.moderationStatus === 'rejected'
                                            ? 'Your review was not approved. Contact support if you have questions.'
                                            : 'Thanks for your feedback!'}
                                </p>
                            )}
                            {user && reviewMeLoaded && !myReview?.hasReview && myReview?.canReview === false && (
                                <p className="pd-desc-figma" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)' }}>
                                    Only customers who have purchased this product (completed paid order) can leave a star rating and review.
                                </p>
                            )}
                            {user && reviewMeLoaded && !myReview?.hasReview && myReview?.canReview && (
                                <form onSubmit={submitReview} className="pd-review-form" style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.6)' }}>
                                    <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>Write a review</p>
                                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }} role="group" aria-label="Rating (1 to 5 stars)">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setReviewRating(n)}
                                                className="material-symbols-outlined gm-star-rating__btn"
                                                style={{
                                                    fontVariationSettings: '"FILL" 1',
                                                    fontSize: '1.75rem',
                                                    border: 'none',
                                                    background: 'none',
                                                    cursor: 'pointer',
                                                    color: n <= reviewRating ? '#ca8a04' : '#cbd5e1',
                                                    padding: '0.15rem',
                                                }}
                                                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                                                aria-pressed={n <= reviewRating}
                                            >
                                                star
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="Share your experience (min. 3 characters)"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        required
                                        minLength={3}
                                        maxLength={2000}
                                        style={{ width: '100%', marginBottom: '0.75rem', borderRadius: '8px', padding: '0.5rem' }}
                                    />
                                    {reviewFeedback && (
                                        <p
                                            role="status"
                                            style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                color: reviewFeedback.includes('Thank you') || reviewFeedback.includes('moderation') || reviewFeedback.includes('pending') ? '#15803d' : '#b91c1c',
                                                marginBottom: '0.5rem',
                                                padding: '0.5rem 0.65rem',
                                                borderRadius: 8,
                                                background: reviewFeedback.includes('Thank you') ? 'rgba(22, 163, 74, 0.08)' : 'transparent',
                                            }}
                                        >
                                            {reviewFeedback}
                                        </p>
                                    )}
                                    <button type="submit" className="pd-btn-figma pd-btn-figma--primary" disabled={reviewBusy} style={{ fontSize: '0.875rem' }}>
                                        {reviewBusy ? 'Submitting…' : 'Submit review'}
                                    </button>
                                </form>
                            )}
                            {!user && (
                                <p className="pd-desc-figma" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <Link to="/login">Sign in</Link> to see if you can leave a review (purchase required).
                                </p>
                            )}
                            {user && !reviewMeLoaded && FEATURES.REVIEWS && (
                                <p className="pd-desc-figma" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>Checking review eligibility…</p>
                            )}
                            <ul className="pd-reviews-list">
                                {displayReviews.length === 0 ? (
                                    <li className="pd-review-card" style={{ opacity: 0.85 }}>No reviews yet.</li>
                                ) : (
                                    displayReviews.map((rev) => (
                                        <li key={rev._id || rev.id} className="pd-review-card">
                                            <div className="pd-review-card__head">
                                                <div>
                                                    <p className="pd-review-card__name">{(rev.userName || 'Customer').toUpperCase()}</p>
                                                    <p className="pd-review-card__date">{formatReviewDate(rev.createdAt)}</p>
                                                </div>
                                                <div className="pd-review-stars" aria-hidden>
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`material-symbols-outlined ${i < (rev.rating || 0) ? 'filled' : ''}`}
                                                            style={{ fontVariationSettings: '"FILL" 1', fontSize: '12px' }}
                                                        >
                                                            star
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="pd-review-card__text">{rev.comment || '—'}</p>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>) : null}

                        <details className="pd-details-more">
                            <summary>More details</summary>
                            <div className="pd-tabs-content pd-tabs-content--inline">
                                <div className="pd-tab-card">
                                    <h3>Composition</h3>
                                    <p>Selected varieties arranged for balance, freshness, and vase life.</p>
                                </div>
                                <div className="pd-tab-card">
                                    <h3>Packaging</h3>
                                    <p>Moisture-retaining packaging with a stabilised base for safe delivery.</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </main>
        </div>
    );
}
