import React from 'react';

export default function Pagination({ currentPage, totalPages, totalResults, pageSize, onPageChange }) {
    if (totalPages <= 1) return null;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalResults);

    return (
        <nav className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2rem', padding: '1rem 0' }} aria-label="Pagination">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '8px' }}>
                Showing {start}–{end} of {totalResults}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="pagination-btn"
                    style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-color)',
                        background: currentPage <= 1 ? 'var(--page-gold-soft)' : 'var(--surface-light)',
                        color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === '…' ? (
                            <span key={`ellip-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                style={{
                                    minWidth: '40px',
                                    padding: '8px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border-color)',
                                    background: p === currentPage ? 'var(--primary-color)' : 'var(--surface-light)',
                                    color: p === currentPage ? 'white' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: p === currentPage ? '600' : '500'
                                }}
                            >
                                {p}
                            </button>
                        )
                    )}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="pagination-btn"
                    style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-color)',
                        background: currentPage >= totalPages ? 'var(--page-gold-soft)' : 'var(--surface-light)',
                        color: currentPage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Next
                </button>
            </div>
        </nav>
    );
}
