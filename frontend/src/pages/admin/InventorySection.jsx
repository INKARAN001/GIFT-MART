import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/api';
import { getImageSrc } from '../../utils/imageUrl';
import { exportInventoryPdf } from './exportInventoryPdf';

import { getApiBaseUrl } from '../../utils/apiBase';
import { jsonFromResponse } from '../../utils/jsonResponse';

const API = getApiBaseUrl();

function enrichRow(p) {
  const sold = p.unitsSold ?? 0;
  const price = Number(p.price) || 0;
  const revenue = price * sold;
  const rating =
    p.averageRating != null && !Number.isNaN(Number(p.averageRating))
      ? Number(p.averageRating).toFixed(1)
      : '—';
  const active = p.active !== false;
  let statusLabel = 'Active';
  if (!active) statusLabel = 'Inactive';
  else if ((p.stock ?? 0) < 10) statusLabel = 'Low stock';
  return { ...p, _sold: sold, _revenue: revenue, _rating: rating, _status: statusLabel };
}

function computeLiveMetrics(products) {
  let totalUnitsSold = 0;
  let totalRevenue = 0;
  products.forEach((p) => {
    const u = p.unitsSold ?? 0;
    totalUnitsSold += u;
    totalRevenue += (Number(p.price) || 0) * u;
  });
  return {
    totalProducts: products.length,
    totalUnitsSold,
    totalRevenue,
    averageMonthlySales: totalRevenue / 12
  };
}

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  unitsSold: '',
  image: ''
};

export default function InventorySection({ fetchWithAuth }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProduct);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
      if (res.data?.length > 0) {
        setForm((f) => ({ ...f, category: f.category || res.data[0].name }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${API}/admin/products`);
      if (r.ok) setProducts(await jsonFromResponse(r, []));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => {
    load();
    loadCategories();
  }, [load, loadCategories]);

  const liveMetrics = useMemo(() => computeLiveMetrics(products), [products]);

  const enrichedFiltered = useMemo(() => {
    let list = products.map(enrichRow);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'all') {
      list = list.filter((p) => p.category === filterCategory);
    }
    if (filterStatus === 'active') {
      list = list.filter((p) => p.active !== false && (p.stock ?? 0) >= 10);
    } else if (filterStatus === 'inactive') {
      list = list.filter((p) => p.active === false);
    } else if (filterStatus === 'low') {
      list = list.filter((p) => p.active !== false && (p.stock ?? 0) < 10);
    }
    return list;
  }, [products, searchQuery, filterCategory, filterStatus]);

  const save = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/admin/products/${editId}` : `${API}/admin/products`;
    const payload = {
      ...form,
      price: +form.price,
      stock: +form.stock,
      unitsSold: Math.max(0, parseInt(form.unitsSold, 10) || 0)
    };
    const r = await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
    if (r.ok) {
      setShowForm(false);
      setEditId(null);
      setForm(emptyProduct);
      load();
    } else {
      alert('Failed.');
    }
  };

  const startEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      price: p.price,
      stock: p.stock,
      unitsSold: p.unitsSold ?? 0,
      image: p.image || ''
    });
    setEditId(p._id || p.id);
    setShowForm(true);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const r = await fetchWithAuth(`${API}/admin/products/${id}`, { method: 'DELETE' });
    if (r.ok) load();
    else alert('Delete failed.');
  };

  const handleExportPdf = () => {
    const rows = enrichedFiltered.map((r) => ({
      name: r.name,
      category: r.category,
      price: r.price,
      unitsSold: r._sold,
      revenue: r._revenue,
      stock: r.stock,
      statusLabel: r._status,
      ratingLabel: r._rating
    }));
    exportInventoryPdf({
      title: 'Gift Mart — Products report',
      rows,
      summary: liveMetrics
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <span className="material-symbols-outlined" style={{ color: '#39ff14' }}>inventory_2</span> Products
        </h2>
        <button
          type="button"
          onClick={() => {
            setForm(emptyProduct);
            setEditId(null);
            setShowForm((s) => !s);
          }}
          className="btn-primary"
          style={{ padding: '0.5rem 1rem' }}
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* KPI cards */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p className="stat-label">Total products</p>
              <h3 className="stat-value">{liveMetrics.totalProducts}</h3>
            </div>
            <div className="stat-icon blue">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p className="stat-label">Product revenue (LKR)</p>
              <h3 className="stat-value">{Math.round(liveMetrics.totalRevenue).toLocaleString()}</h3>
            </div>
            <div className="stat-icon green">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p className="stat-label">Units sold</p>
              <h3 className="stat-value">{liveMetrics.totalUnitsSold}</h3>
            </div>
            <div className="stat-icon pink">
              <span className="material-symbols-outlined">sell</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p className="stat-label">Monthly sales</p>
              <h3 className="stat-value">{Math.round(liveMetrics.averageMonthlySales).toLocaleString()}</h3>
            </div>
            <div className="stat-icon orange">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(15, 23, 42, 0.04)',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0'
        }}
      >
        <input
          type="search"
          className="admin-input"
          placeholder="Search product or category…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ minWidth: '200px', flex: '1 1 180px' }}
        />
        <select className="admin-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ minWidth: '140px' }}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id || c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="admin-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ minWidth: '140px' }}>
          <option value="all">All statuses</option>
          <option value="active">Active (ok stock)</option>
          <option value="low">Low stock</option>
          <option value="inactive">Inactive</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>View</span>
          <button
            type="button"
            className={`btn-action edit ${viewMode === 'table' ? '' : 'opacity-50'}`}
            onClick={() => setViewMode('table')}
            title="Table"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>table_rows</span>
          </button>
          <button
            type="button"
            className={`btn-action edit ${viewMode === 'grid' ? '' : 'opacity-50'}`}
            onClick={() => setViewMode('grid')}
            title="Grid"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>grid_view</span>
          </button>
        </div>
        <button type="button" className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} onClick={handleExportPdf}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>picture_as_pdf</span>
          Export PDF report
        </button>
      </div>

      {showForm && (
        <form className="admin-form" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }} onSubmit={save}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Product Name *</label>
            <input className="admin-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Product Image</label>
            <input
              className="admin-input"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append('file', file);
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`${API}/admin/upload`, {
                    method: 'POST',
                    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
                    body: fd
                  });
                  if (res.ok) {
                    const data = await jsonFromResponse(res, {});
                    setForm((f) => ({ ...f, image: data?.url }));
                  } else {
                    alert('Image upload failed.');
                    e.target.value = null;
                  }
                } catch {
                  alert('Upload error.');
                  e.target.value = null;
                }
              }}
            />
            {form.image && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={getImageSrc(form.image) || form.image} alt="preview" style={{ maxHeight: '60px', borderRadius: '4px' }} />
                <button type="button" onClick={() => setForm((f) => ({ ...f, image: '' }))} className="btn-action delete" style={{ padding: '0.2rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                </button>
              </div>
            )}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">Description</label>
            <textarea className="admin-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="admin-label">Category *</label>
            <select className="admin-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="admin-label">Price (LKR) *</label>
            <input className="admin-input" type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="admin-label">Stock *</label>
            <input className="admin-input" type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="admin-label">Units sold (reporting)</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              value={form.unitsSold}
              onChange={(e) => setForm((f) => ({ ...f, unitsSold: e.target.value }))}
              placeholder="0"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', width: 'fit-content' }}>
            {editId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>Loading products…</p>
      ) : enrichedFiltered.length === 0 ? (
        <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>No products match filters.</p>
      ) : viewMode === 'table' ? (
        <div className="table-container">
          <div className="table-header">
            <h3>All products ({enrichedFiltered.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Sales (units)</th>
                  <th>Revenue</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedFiltered.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>
                      <div className="item-flex">
                        <div className="item-image" style={{ overflow: 'hidden' }}>
                          {p.image ? (
                            <img src={getImageSrc(p.image) || p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined">image</span>
                          )}
                        </div>
                        <p className="item-text">{p.name}</p>
                      </div>
                    </td>
                    <td>
                      <span className="item-badge badge-blue">{p.category}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>LKR {Number(p.price).toLocaleString()}</td>
                    <td>{p._sold}</td>
                    <td style={{ color: '#5F9EA0', fontWeight: 600 }}>LKR {Math.round(p._revenue).toLocaleString()}</td>
                    <td>
                      <span className={`item-badge ${(p.stock ?? 0) < 10 ? 'badge-pink' : 'badge-green'}`}>{p.stock}</span>
                    </td>
                    <td>
                      <span
                        className={`item-badge ${p._status === 'Inactive' ? 'badge-pink' : p._status === 'Low stock' ? 'badge-orange' : 'badge-green'}`}
                      >
                        {p._status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>{p._rating} {p.reviewCount != null ? `(${p.reviewCount})` : ''}</td>
                    <td>
                      <div className="action-buttons">
                        <button type="button" onClick={() => startEdit(p)} className="btn-action edit" title="Edit">
                          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                        </button>
                        <button type="button" onClick={() => del(p._id || p.id)} className="btn-action delete" title="Delete">
                          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem'
          }}
        >
          {enrichedFiltered.map((p) => (
            <div
              key={p._id || p.id}
              style={{
                background: '#fff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '140px', background: '#f1f5f9', position: 'relative' }}>
                {p.image ? (
                  <img src={getImageSrc(p.image) || p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>image</span>
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff'
                  }}
                >
                  {p._status}
                </span>
              </div>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>{p.name}</p>
                <span className="item-badge badge-blue" style={{ width: 'fit-content' }}>
                  {p.category}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  <span>Price</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>LKR {Number(p.price).toLocaleString()}</span>
                  <span>Sold</span>
                  <span style={{ fontWeight: 600 }}>{p._sold}</span>
                  <span>Revenue</span>
                  <span style={{ fontWeight: 600, color: '#5F9EA0' }}>LKR {Math.round(p._revenue).toLocaleString()}</span>
                  <span>Stock</span>
                  <span style={{ fontWeight: 600 }}>{p.stock}</span>
                  <span>Rating</span>
                  <span style={{ fontWeight: 600 }}>{p._rating}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="button" className="btn-action edit" onClick={() => startEdit(p)} style={{ flex: 1 }}>
                    Edit
                  </button>
                  <button type="button" className="btn-action delete" onClick={() => del(p._id || p.id)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
