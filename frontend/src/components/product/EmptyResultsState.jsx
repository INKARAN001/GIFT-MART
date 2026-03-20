import React from 'react';

export default function EmptyResultsState({ onClearFilters, searchTerm }) {
    return (
        <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--page-gold-light)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--gold-muted)', marginBottom: '16px', opacity: 0.5 }}>
                search_off
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No products found
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '24px' }}>
                {searchTerm 
                    ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search term or filters.` 
                    : "No products match your selected filters. Try broadening your selection."}
            </p>
            <button 
                className="btn-primary" 
                onClick={onClearFilters}
                style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--gold-muted) 100%)', color: 'var(--charcoal)', padding: '12px 24px', borderRadius: 'var(--radius)', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <span className="material-symbols-outlined">restart_alt</span>
                Reset Filters
            </button>
        </div>
    );
}
