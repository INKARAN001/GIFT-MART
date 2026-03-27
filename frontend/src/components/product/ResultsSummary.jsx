import React from 'react';

export default function ResultsSummary({ totalResults, searchTerm }) {
    if (totalResults === 0) return null;
    
    return (
        <div style={{ padding: '0 0 24px', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Showing {totalResults} {totalResults === 1 ? 'product' : 'products'}</span>
            {searchTerm && (
                <span> for <strong style={{ color: 'var(--text-primary)' }}>"{searchTerm}"</strong></span>
            )}
        </div>
    );
}
