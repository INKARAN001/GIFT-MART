import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageSrc } from '../utils/imageUrl';
import '../styles/product-detail.css';

const FIGMA_SAMPLE_REVIEWS = [
    {
        _id: 'sample-1',
        userName: 'Amaya Fernando',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        rating: 5,
        comment: 'The wrap quality is exceptional and the lilies smelled divine.'
    },
    {
        _id: 'sample-2',
        userName: 'Rohan Silva',
        createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        rating: 4,
        comment: 'Beautifully arranged, though some blooms were slightly smaller than expected.'
    }
];

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

    const defaultImages = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBiNF7V5zVY9pVnhmiDVT9RDuGHFe1hXr44idoJjd21ehFVCeKc85IkEc9IMteEFQDUoWIWRSoYZ24DOxj5KruDUVC1kO1SCkdouaSw14qCb3ELKB9uvg6UpM1us-LMvPjuMVtUtNJgzwTqNPo-YH4r3O2PB0XMxeTZUF0FnNlYGPjs9iDVF1KPtpSJpRHgZbhe6x7Z5oEodWEX-XtlpPGvX_ANsY0r9tvX6u_n8hLPfL9iUPgObboF6P5a7vbRzVHN0uY6kKjeisaA',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCW_lN5bLeLD27WR3a2roA0eD0NaMeeTB5JYV8QoSk9t5Yye3Iz01yjDLm5LDw5bp8yS3tzMGbcb5fMR6MDAG5MDP3als4lLvb7ZL6BKVJgFLcWR7ONIZbAdLQAsf1io6iY0qzaZ-E727AytKzpaQdG16jNIlZ1-pzC1rQ5w3g0eVckp_a9gc24JgXkvobzE5-Ad0Qm2EtVulxJTIpjGtUXEPujVLJd9dK247pYaA0F0l-FhCfK_M5yScmyMd3DlEGwYKgOhkIST8eD',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBcBSi2-M-aSyN-hOKDPqhPOon4Rhx3RfDV6P3YKYEhFykSpPRMF-E8VIhYdv1P1WBIDTRI0Wy90jXWOoatLOEWUFU0H2uV41WnUMkFJexlsSP7B8793uBd94jXfB1_l1JL8gospVRhCmJj6UinzhJnEnTpvT2jXVA8rvGDqJOe2aO1es-8KNv8Wj6s0NKhZzx4YbX1e3ejQIBYJCJQNznmnR-gRIL-YAL9EZ5y4ZPZXO6QGCLup3ixj6_spN6JOgfr7zNE3oYJi3IT',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBFlxUm-YKbHZgltY3ZSdxbHI1DQzEUJt0fXQ-MKKnmH0B0MYMCDtznd6EJXrMHuz92itieo1yCWxxCJTQE6oWj3WcMazWelc2pXF0ya5sFqymnscOLvd8OGitJcFjh1gqkCBjUqZPli5Yw1OpGJXRw4DdVwc_TwCQw8oYJkQQXePsmS1VBvP6s_CldCnM66blLBPZk7ZQfLsUaKga0KFB3LAZw5pIWBvXelAiHLoo429aaD1XiTOVZbI9ki2BQ4EkKswneXh1IQE4A'
    ];

    const [mainImage, setMainImage] = useState(defaultImages[0]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                const hero = res.data.image || res.data.imageUrl;
                if (hero) setMainImage(hero);
            } catch {
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
        if (!productId) return;
        let cancelled = false;
        api.get(`/reviews/product/${encodeURIComponent(productId)}`)
            .then((res) => {
                if (!cancelled && Array.isArray(res.data)) setReviews(res.data);
            })
            .catch(() => {
                if (!cancelled) setReviews([]);
            });
        return () => { cancelled = true; };
    }, [productId]);

    if (loading) return <div className="page-loading">Loading...</div>;

    const p = product;
    const productImageField = p?.image || p?.imageUrl;
    const thumbList = productImageField
        ? [productImageField, ...defaultImages.filter((u) => u !== productImageField).slice(0, 3)]
        : defaultImages;

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
        const r = await fetchWithAuth('/api/wishlist/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok) alert('Saved to your wishlist.');
        else alert(data.message || 'Could not save');
    };

    const displayReviews = reviews.length > 0 ? reviews : FIGMA_SAMPLE_REVIEWS;
    const avgRating = typeof p?.averageRating === 'number' ? p.averageRating : null;
    const reviewCount = typeof p?.reviewCount === 'number' ? p.reviewCount : displayReviews.length;

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
                        </div>
                    </div>

                    <div className="pd-figma-col pd-figma-col--detail">
                        <section className="pd-section-meta">
                            <h1 className="pd-title-figma">{p?.name}</h1>
                            <p className="pd-price-figma">
                                LKR {Number(p?.price ?? 0).toLocaleString()}
                            </p>
                            {(avgRating != null && avgRating > 0) && (
                                <div className="pd-rating-inline" aria-label={`${avgRating.toFixed(1)} stars`}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span
                                            key={i}
                                            className={`material-symbols-outlined pd-star ${i < Math.round(avgRating) ? 'filled' : ''}`}
                                            style={{ fontVariationSettings: '"FILL" 1' }}
                                        >
                                            star
                                        </span>
                                    ))}
                                    <span className="pd-rating-inline__count">({reviewCount} reviews)</span>
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

                        <section className="pd-section-reviews">
                            <h2 className="pd-reviews-heading">Reviews</h2>
                            <ul className="pd-reviews-list">
                                {displayReviews.map((rev) => (
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
                                ))}
                            </ul>
                        </section>

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
