import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ProductSearchBar from '../components/product/ProductSearchBar';
import ProductFilterPanel from '../components/product/ProductFilterPanel';
import ProductGrid from '../components/product/ProductGrid';
import ProductModal from '../components/product/ProductModal';
import EmptyResultsState from '../components/product/EmptyResultsState';
import ResultsSummary from '../components/product/ResultsSummary';
import Pagination from '../components/product/Pagination';
import { mockProducts } from '../data/mockProducts';
import { filterMockProducts } from '../utils/productFilters';

const PAGE_SIZE = 12;

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const ALL_MOCK_SHUFFLED = shuffleArray(mockProducts);

export default function Products() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState(ALL_MOCK_SHUFFLED);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        categories: [],
        customizableOnly: false,
        maxPrice: 10000
    });

    const handleSearchChange = (term) => setSearchTerm(term);
    
    const handleFilterChange = (newFilters) => setFilters(newFilters);
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({ categories: [], customizableOnly: false, maxPrice: 10000 });
    };

    const handleBuyClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            alert('Added to cart / Proceeding to checkout');
        }
    };

    // Live backend connection using the dynamic MongoDB filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                
                if (searchTerm.trim()) {
                    params.append('keyword', searchTerm.trim());
                }
                
                if (filters.categories.length > 0) {
                    filters.categories.forEach(cat => {
                        // Map internal schema spelling
                        params.append('categories', cat === 'Bouquets' ? 'Boquet' : cat);
                    });
                }
                
                if (filters.customizableOnly) {
                    params.append('customizable', true);
                }
                
                if (filters.maxPrice != null) {
                    params.append('maxPrice', filters.maxPrice);
                }
                
                params.append('size', 100); // Set high limit for single flat page query 
                
                const res = await api.get(`/products/search?${params.toString()}`);
                const raw = res.data.content || [];
                const fetched = raw.map(p => ({
                    ...p,
                    id: p._id || p.id,
                    shortDescription: p.description,
                    image: p.image || p.imageUrl
                }));
                if (fetched.length > 0 && fetched.every(p => p.image || p.imageUrl)) {
                    setProducts(fetched);
                } else {
                    setProducts(filterMockProducts(ALL_MOCK_SHUFFLED, searchTerm, filters));
                }
            } catch (error) {
                console.error('Failed to fetch filtered products from database', error);
                setProducts(filterMockProducts(ALL_MOCK_SHUFFLED, searchTerm, filters));
            } finally {
                setLoading(false);
            }
        };

        // Network debounce
        const timerId = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchTerm, filters]);

    const totalResults = products.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedProducts = useMemo(
        () => products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [products, currentPage]
    );

    useEffect(() => setPage(1), [searchTerm, filters]);

    return (
        <div style={{ minHeight: '100vh' }}>
            <div className="relative">
                <img
                    src="/product-banner.png"
                    alt="Our Premium Collection"
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        verticalAlign: 'top',
                    }}
                />
                <span className="overlay-hero-label" style={{ top: '1.5rem', left: '1.5rem' }}>Trending Gifts</span>
                <p className="absolute bottom-4 left-0 right-0 text-center text-white font-semibold text-sm uppercase tracking-[0.2em] drop-shadow-md z-10">Premium Collection</p>
            </div>
            <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '40px 0 60px' }}>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <span className="section-label">Handpicked for You</span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    Our Premium Collection
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px' }}>
                    Discover the perfect gift from our handpicked selection of luxury boxes, exquisite bouquets, and classic frames.
                </p>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '16px', 
                    marginBottom: '32px', 
                    flexWrap: 'wrap' 
                }}>
                    <Link to="/products/flash-cards" className="category-link-btn">Flash Cards</Link>
                    <Link to="/products/bouquets" className="category-link-btn">Bouquets</Link>
                    <Link to="/products/frames" className="category-link-btn">Frames</Link>
                    <Link to="/products/gift-boxes" className="category-link-btn">Gift Boxes</Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ProductSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </div>
            </header>

            <div style={{ display: 'flex', gap: '32px', flexDirection: 'column' }} className="products-layout-wrapper">
                <style>{`
                    @media (min-width: 768px) {
                        .products-layout-wrapper {
                            flex-direction: row !important;
                        }
                    }
                    .category-link-btn {
                        padding: 10px 24px;
                        border-radius: 30px;
                        background: var(--surface-light);
                        border: 1px solid var(--border-color);
                        color: var(--text-primary);
                        text-decoration: none;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    .category-link-btn:hover {
                        background: var(--primary-color);
                        color: white;
                        border-color: var(--primary-color);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                `}</style>
                
                <div style={{ flex: '0 0 auto' }}>
                    <ProductFilterPanel 
                        filters={filters} 
                        onFilterChange={handleFilterChange} 
                        onClearFilters={handleClearFilters} 
                    />
                </div>

                <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                    <ResultsSummary totalResults={totalResults} searchTerm={searchTerm} />
                    
                    {products.length > 0 ? (
                        <>
                            <ProductGrid products={paginatedProducts} onProductClick={setSelectedProduct} />
                            {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalResults={totalResults}
                                pageSize={PAGE_SIZE}
                                onPageChange={setPage}
                            />
                        </>
                    ) : loading ? (
                        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>Searching...</div>
                    ) : (
                        <EmptyResultsState onClearFilters={handleClearFilters} searchTerm={searchTerm} />
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}
