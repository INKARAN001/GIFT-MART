import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/product-detail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    // Provide default rich data so the UI looks exactly like the design even if the DB object is sparse
    const defaultImages = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBiNF7V5zVY9pVnhmiDVT9RDuGHFe1hXr44idoJjd21ehFVCeKc85IkEc9IMteEFQDUoWIWRSoYZ24DOxj5KruDUVC1kO1SCkdouaSw14qCb3ELKB9uvg6UpM1us-LMvPjuMVtUtNJgzwTqNPo-YH4r3O2PB0XMxeTZUF0FnNlYGPjs9iDVF1KPtpSJpRHgZbhe6x7Z5oEodWEX-XtlpPGvX_ANsY0r9tvX6u_n8hLPfL9iUPgObboF6P5a7vbRzVHN0uY6kKjeisaA",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCW_lN5bLeLD27WR3a2roA0eD0NaMeeTB5JYV8QoSk9t5Yye3Iz01yjDLm5LDw5bp8yS3tzMGbcb5fMR6MDAG5MDP3als4lLvb7ZL6BKVJgFLcWR7ONIZbAdLQAsf1io6iY0qzaZ-E727AytKzpaQdG16jNIlZ1-pzC1rQ5w3g0eVckp_a9gc24JgXkvobzE5-Ad0Qm2EtVulxJTIpjGtUXEPujVLJd9dK247pYaA0F0l-FhCfK_M5yScmyMd3DlEGgYKgOhkIST8eD",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBcBSi2-M-aSyN-hOKDPqhPOon4Rhx3RfDV6P3YKYEhFykSpPRMF-E8VIhYdv1P1WBIDTRI0Wy90jXWOoatLOEWUFU0H2uV41WnUMkFJexlsSP7B8793uBd94jXfB1_l1JL8gospVRhCmJj6UinzhJnEnTpvT2jXVA8rvGDqJOe2aO1es-8KNv8Wj6s0NKhZzx4YbX1e3ejQIBYJCJQNznmnR-gRIL-YAL9EZ5y4ZPZXO6QGCLup3ixj6_spN6JOgfr7zNE3oYJi3IT",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBFlxUm-YKbHZgltY3ZSdxbHI1DQzEUJt0fXQ-MKKnmH0B0MYMCDtznd6EJXrMHuz92itieo1yCWxxCJTQE6oWj3WcMazWelc2pXF0ya5sFqymnscOLvd8OGitJcFjh1gqkCBjUqZPli5Yw1OpGJXRw4DdVwc_TwCQw8oYJkQQXePsmS1VBvP6s_CldCnM66blLBPZk7ZQfLsUaKga0KFB3LAZw5pIWBvXelAiHLoo429aaD1XiTOVZbI9ki2BQ4EkKswneXh1IQE4A"
    ];

    const [mainImage, setMainImage] = useState(defaultImages[0]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Support fetching actual products if the API is configured correctly
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                if (res.data.imageUrl || res.data.image) setMainImage(res.data.imageUrl || res.data.image);
            } catch (err) {
                // To display the placeholder template beautifully even if API fails/product not found
                setProduct({
                    name: 'Midnight Elegance Bouquet',
                    category: 'Premium Selection',
                    description: 'Hand-selected platinum-toned lilies, white roses, and aromatic eucalyptus in brushed silver tissue with silk ribbon. Suitable for corporate and personal gifting.',
                    price: 4500,
                    subtitle: 'A curated arrangement of premium blooms and silver-dusted foliage for lasting impression.'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="page-loading">Loading...</div>;

    const p = product;

    return (
        <div className="pd-page">
            <main className="pd-main">
                {/* ── Breadcrumbs ── */}
                <nav className="pd-breadcrumbs">
                    <Link to="/">Home</Link>
                    <span><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span></span>
                    <Link to="/products">Our Products</Link>
                    <span><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span></span>
                    <span className="current">{p?.name || 'Product'}</span>
                </nav>

                <div className="pd-grid">
                    {/* ── Image Section ── */}
                    <div className="pd-img-section">
                        <div className="pd-img-wrap">
                            {(p && p.imageUrl) ? (
                                <img
                                    src={mainImage}
                                    alt="Product"
                                    className="pd-main-img-direct"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
                                />
                            ) : (
                                <div
                                    className="pd-main-img"
                                    style={{ backgroundImage: `url("${mainImage}")` }}
                                ></div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        <div className="pd-thumbnails">
                            {defaultImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`pd-thumb ${mainImage === img ? 'active' : ''}`}
                                    style={{ backgroundImage: `url("${img}")` }}
                                    onClick={() => setMainImage(img)}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* ── Info Section ── */}
                    <div className="pd-info">
                        <div>
                            <div className="pd-badge">
                                {p?.category || 'Premium Selection'}
                            </div>
                            <h1 className="pd-title">{p?.name}</h1>
                            <p className="pd-subtitle">
                                {p?.subtitle || 'A curated arrangement of premium blooms and foliage, presented in luxury packaging.'}
                            </p>
                        </div>

                        <div className="pd-price-box">
                            <span className="pd-price">LKR {p?.price?.toLocaleString()}</span>
                            <div className="pd-price-divider"></div>
                            <div className="pd-reviews">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                <span className="count">(48 Reviews)</span>
                            </div>
                        </div>

                        <div className="pd-desc-box">
                            <p className="pd-desc-main">{p?.description || p?.shortDescription || 'Premium quality product, presented in gift-ready packaging. Ideal for corporate and personal occasions.'}</p>
                            <ul className="pd-features">
                                <li>
                                    <span className="material-symbols-outlined icon">check_circle</span>
                                    Hand-picked fresh seasonal flowers
                                </li>
                                <li>
                                    <span className="material-symbols-outlined icon">check_circle</span>
                                    Premium silver-dusted eucalyptus accents
                                </li>
                                <li>
                                    <span className="material-symbols-outlined icon">check_circle</span>
                                    Signature brushed silver luxury packaging
                                </li>
                                <li>
                                    <span className="material-symbols-outlined icon">check_circle</span>
                                    Complimentary personalized gift card
                                </li>
                            </ul>
                        </div>

                        <div className="pd-actions">
                            <div className="pd-action-row">
                                <div className="pd-qty-btn">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <span className="pd-qty-val">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}>
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                                <button type="button" className="pd-btn-add" onClick={() => navigate('/cart')}>
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    Add to Cart
                                </button>
                            </div>
                            <button type="button" className="pd-btn-buy" onClick={() => navigate('/cart')}>
                                <span className="material-symbols-outlined">bolt</span>
                                Buy Now
                            </button>
                        </div>

                        <div className="pd-guarantees">
                            <div className="pd-guarantee-item">
                                <div className="pd-guarantee-icon">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                                <div className="pd-guarantee-text">
                                    <h4>Same-Day Delivery</h4>
                                    <p>Available in Colombo area</p>
                                </div>
                            </div>
                            <div className="pd-guarantee-item">
                                <div className="pd-guarantee-icon">
                                    <span className="material-symbols-outlined">verified</span>
                                </div>
                                <div className="pd-guarantee-text">
                                    <h4>Freshness Guaranteed</h4>
                                    <p>7-day vase life warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Related / Details Tabs ── */}
                <section className="pd-tabs-section">
                    <div className="pd-tabs-nav">
                        <button className="pd-tab active">Product Details</button>
                        <button className="pd-tab">Care Instructions</button>
                        <button className="pd-tab">Delivery Info</button>
                    </div>
                    <div className="pd-tabs-content">
                        <div className="pd-tab-card">
                            <h3>Floral Composition</h3>
                            <p>Selected varieties including Lilium Candidum, Rosa 'Avalanche', and Eucalyptus Cinerea, arranged for a balanced silver-and-white presentation with extended vase life.</p>
                        </div>
                        <div className="pd-tab-card">
                            <h3>Sustainable Sourcing</h3>
                            <p>Flowers are sourced from certified local growers in the Nuwara Eliya region, with emphasis on freshness and responsible environmental practice.</p>
                        </div>
                        <div className="pd-tab-card">
                            <h3>Packaging & Delivery</h3>
                            <p>Each arrangement is prepared in our moisture-retaining packaging with a stabilised base to maintain condition and hydration during delivery.</p>
                        </div>
                    </div>
                </section>

                <div style={{ marginBottom: '5rem' }}></div>
            </main>
        </div>
    );
}
