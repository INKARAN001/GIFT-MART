import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import ProductGrid from '../components/product/ProductGrid';
import ProductModal from '../components/product/ProductModal';
import Pagination from '../components/product/Pagination';
import { Link } from 'react-router-dom';
import { mockProducts } from '../data/mockProducts';

const MOCK_FRAMES = mockProducts.filter(p => p.category === 'Frames');
const PAGE_SIZE = 12;

export default function Frames() {
    const [products, setProducts] = useState(MOCK_FRAMES);
    const [page, setPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedProducts = useMemo(() => products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [products, currentPage]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = new URLSearchParams();
                params.append('categories', 'Frames');
                params.append('size', 100);
                const res = await api.get(`/products/search?${params.toString()}`);
                const raw = res.data.content || [];
                const fetched = raw.map(p => ({
                    ...p,
                    id: p._id || p.id,
                    shortDescription: p.description,
                    image: p.image || p.imageUrl
                }));
                // Only replace mock with API data when every product has an image (so pics don’t disappear)
                if (fetched.length > 0 && fetched.every(p => p.image || p.imageUrl)) {
                    setProducts(fetched);
                }
            } catch (error) {
                console.error('Failed to fetch Frames', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 60px', minHeight: '100vh' }}>
            <Link to="/products" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '24px', fontWeight: '500' }}>
                &larr; Back to All Products
            </Link>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    Classic Frames
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px' }}>
                    Preserve your cherished memories with our elegant framing collection.
                </p>
            </header>
            
            {products.length > 0 ? (
                <>
                    <ProductGrid products={paginatedProducts} onProductClick={setSelectedProduct} />
                    {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalResults={products.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </>
            ) : (
                <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>No products found in this category.</div>
            )}
        </div>
    );
}
