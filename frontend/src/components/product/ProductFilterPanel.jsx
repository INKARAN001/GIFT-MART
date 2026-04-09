import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { displayCategoryLabel } from '../../utils/categoryLabel';

const MAX_PRICE = 10000;

export default function ProductFilterPanel({ filters, onFilterChange, onClearFilters }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/categories');
        if (!cancelled && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCategoryChange = (catName) => {
    let newCats = [...filters.categories];
    if (newCats.includes(catName)) {
      newCats = newCats.filter((c) => c !== catName);
    } else {
      newCats.push(catName);
    }
    onFilterChange({ ...filters, categories: newCats });
  };

  return (
    <aside className="filter-panel" style={{ padding: '24px', background: 'var(--page-gold-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', minWidth: '260px', alignSelf: 'start', position: 'sticky', top: '100px' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', m: 0 }}>Filters</h3>
        {(filters.categories.length > 0 || filters.customizableOnly || filters.maxPrice < MAX_PRICE) && (
          <button className="btn-ghost" onClick={onClearFilters} style={{ fontSize: '0.85rem', padding: '4px 8px' }}>
            Clear all
          </button>
        )}
      </div>

      <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Category</h4>
        {categories.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading categories…</p>
        ) : (
          categories.map((cat) => {
            const name = cat.name;
            return (
              <label key={cat.id || cat._id || name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(name)}
                  onChange={() => handleCategoryChange(name)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                {displayCategoryLabel(name)}
              </label>
            );
          })
        )}
      </div>

      <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Options</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
          <input
            type="checkbox"
            checked={filters.customizableOnly}
            onChange={(e) => onFilterChange({ ...filters, customizableOnly: e.target.checked })}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
          Customizable only
        </label>
      </div>

      <div className="filter-group">
        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '1rem', margin: 0, fontWeight: '500', color: 'var(--text-secondary)' }}>Max Price</h4>
          <span style={{ fontSize: '0.9rem', color: 'var(--gold-muted)', fontWeight: '600' }}>
            LKR {filters.maxPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max={MAX_PRICE}
          step="500"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>LKR 1,000</span>
          <span>LKR {MAX_PRICE.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  );
}
