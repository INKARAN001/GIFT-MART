import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onProductClick }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', width: '100%', marginBottom: '4rem' }}>
            {products.map((product, index) => (
                <ProductCard
                    key={product.id || index}
                    product={product}
                    onProductClick={onProductClick}
                    overlay={['Trending', 'New', 'Bestseller'][index % 3]}
                />
            ))}
        </div>
    );
}
