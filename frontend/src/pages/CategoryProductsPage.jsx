import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/product/Pagination';
import { displayCategoryLabel } from '../utils/categoryLabel';

const PAGE_SIZE = 12;

export default function CategoryProductsPage() {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(null);
  const [categoryTagline, setCategoryTagline] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedProductId, setExpandedProductId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [categorySlug]);

  useEffect(() => {
    setExpandedProductId(null);
  }, [categorySlug, page]);

  const handleProductCardClick = (product) => {
    const id = product._id || product.id;
    if (id == null) return;
    setExpandedProductId((prev) => (prev != null && String(prev) === String(id) ? null : id));
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const catRes = await api.get('/categories');
        const list = Array.isArray(catRes.data) ? catRes.data : [];
        const match = list.find((c) => (c.slug || '').toLowerCase() === (categorySlug || '').toLowerCase());
        if (cancelled) return;
        if (!match || !match.name) {
          setNotFound(true);
          setCategoryName(null);
          setProducts([]);
          setLoading(false);
          return;
        }
        setCategoryName(match.name);
        setCategoryTagline(match.tagline || match.description || '');

        const params = new URLSearchParams();
        params.append('categories', match.name);
        params.append('size', 100);
        const res = await api.get(`/products/search?${params.toString()}`);
        const raw = res.data.content || [];
        const fetched = raw.map((p) => ({
          ...p,
          id: p._id || p.id,
          shortDescription: p.description,
          image: p.image || p.imageUrl
        }));
        if (!cancelled) setProducts(fetched);
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [categorySlug]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(
    () => products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [products, currentPage]
  );

  if (loading) {
    return <div className="page-loading" style={{ minHeight: '50vh', padding: '3rem' }}>Loading…</div>;
  }

  if (notFound || !categoryName) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Category not found</h1>
        <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '1.5rem' }}>
          This collection does not exist or was removed.
        </p>
        <Link to="/products" style={{ color: 'var(--primary-color, #5F9EA0)', fontWeight: 700 }}>Browse all products</Link>
      </div>
    );
  }

  const title = displayCategoryLabel(categoryName);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 60px', minHeight: '100vh' }}>
      <Link to="/products" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '24px', fontWeight: '500' }}>
        &larr; Back to All Products
      </Link>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {title}
        </h1>
        {categoryTagline && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px' }}>
            {categoryTagline}
          </p>
        )}
      </header>

      {products.length > 0 ? (
        <>
          <ProductGrid
            products={paginatedProducts}
            expandedProductId={expandedProductId}
            onProductClick={handleProductCardClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={products.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>No products in this category yet.</div>
      )}
    </div>
  );
}
