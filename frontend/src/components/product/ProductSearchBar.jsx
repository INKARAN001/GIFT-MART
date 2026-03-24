import React from 'react';

export default function ProductSearchBar({ searchTerm, onSearchChange }) {
    return (
        <div className="search-bar-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 0 2rem' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                search
            </span>
            <input
                type="text"
                className="form-control"
                placeholder="Search by name, category, or tags (e.g., 'rose', 'custom')"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ paddingLeft: '48px', height: '54px', borderRadius: 'var(--radius-xl)' }}
            />
            {searchTerm && (
                <button 
                    className="btn-ghost" 
                    onClick={() => onSearchChange('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '8px' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
            )}
        </div>
    );
}
