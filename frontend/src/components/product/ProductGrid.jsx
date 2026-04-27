import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, expandedProductId, onProductClick }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', width: '100%', marginBottom: '4rem' }}>
            {products.map((product, index) => {
                const pid = product._id || product.id;
                const expanded = expandedProductId != null && String(expandedProductId) === String(pid);
                return (
                    <ProductCard
                        key={pid || index}
                        product={product}
                        expanded={expanded}
                        onProductClick={onProductClick}
                        overlay={['Trending', 'New', 'Bestseller'][index % 3]}
                    />
                );
            })}
        </div>
    );
}
