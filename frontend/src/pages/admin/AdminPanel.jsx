import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import InventorySection from './InventorySection';
import '../../styles/admin-panel.css';
import { FEATURES } from '../../config/features';
import { getApiBaseUrl } from '../../utils/apiBase';
import { jsonFromResponse } from '../../utils/jsonResponse';

/** Admin scope: list reviews, approve/reject, basic counts — defer charts/analytics until P0 commerce is stable. */
const API = getApiBaseUrl();

const DELIVERY_OPTIONS = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
];

function formatOrderDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({ stats, onOpenOrders }) {
    return (
        <>
            <div className="hero-card mb-2">
                <div className="hero-content">
                    <h2 className="hero-title">
                        Welcome back, <span className="text-accent-blue">Admin!</span>
                    </h2>
                    <p className="hero-text">
                        Here's an overview of your store's performance. Keep track of users, products, and reviews all from one centralized hub. Let's keep the momentum going!
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => window.location.reload()}>Refresh Data</button>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfuo5dTaDK9357EKNJ1vz9okeihrkVQ-4UIgtEEOqGV-0mE-xhEyQx1wv2KvhcpWxCyfN6_5dPH1r9i-_4IFMAcja0u0vetlFbhE4ulnsjaOosjAYiEjVoUWKYrFNi7TB9P20G6x9KWxut4yEtmogwWc1AJzpB0FPj6-RISVXlz9xktgdTyBzNZlEKfwtA9Qgz2nxnDOqsDOzg6pnbzJAv3cjjD-ir_sE0E_hyAm2D7uUOPYQkXeKcv7DKFR_4y4u_9xSdawFGC48" alt="Admin Illustration" />
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <p className="stat-label">Total Users</p>
                            <h3 className="stat-value">{stats.users ?? '—'}</h3>
                        </div>
                        <div className="stat-icon blue">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <p className="stat-label">Total Products</p>
                            <h3 className="stat-value">{stats.products ?? '—'}</h3>
                        </div>
                        <div className="stat-icon green">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <p className="stat-label">Categories</p>
                            <h3 className="stat-value">{stats.categories ?? '—'}</h3>
                        </div>
                        <div className="stat-icon pink">
                            <span className="material-symbols-outlined">category</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <p className="stat-label">Total Reviews</p>
                            <h3 className="stat-value">{stats.reviews ?? '—'}</h3>
                        </div>
                        <div className="stat-icon orange">
                            <span className="material-symbols-outlined">reviews</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="stat-card"
                    onClick={onOpenOrders}
                    title="View all orders"
                    style={{ cursor: 'pointer', textAlign: 'left', border: 'none', font: 'inherit', color: 'inherit' }}
                >
                    <div className="stat-card-top">
                        <div>
                            <p className="stat-label">Orders</p>
                            <h3 className="stat-value">{stats.orders ?? '—'}</h3>
                        </div>
                        <div className="stat-icon green">
                            <span className="material-symbols-outlined">local_shipping</span>
                        </div>
                    </div>
                </button>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <p className="stat-label">Revenue (LKR)</p>
                            <h3 className="stat-value">{stats.revenue != null ? Number(stats.revenue).toLocaleString() : '—'}</h3>
                        </div>
                        <div className="stat-icon blue">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── ORDERS ────────────────────────────────────────────────── */
function AdminOrders({ fetchWithAuth, onOrdersChanged }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailPayload, setDetailPayload] = useState(null);
    const [saveMsg, setSaveMsg] = useState('');
    const [form, setForm] = useState({
        deliveryStatus: 'processing',
        trackingNumber: '',
        paymentStatus: '',
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetchWithAuth(`${API}/admin/orders`);
            if (r.ok) setRows(await jsonFromResponse(r, []));
        } catch { /* ignore */ }
        setLoading(false);
    }, [fetchWithAuth]);

    useEffect(() => {
        load();
    }, [load]);

    const openDetail = async (id) => {
        setDetailId(id);
        setDetailPayload(null);
        setSaveMsg('');
        setDetailLoading(true);
        try {
            const r = await fetchWithAuth(`${API}/admin/orders/${encodeURIComponent(id)}`);
            const data = await jsonFromResponse(r, null);
            if (r.ok && data?.order) {
                setDetailPayload(data);
                const o = data.order;
                setForm({
                    deliveryStatus: o.deliveryStatus || 'processing',
                    trackingNumber: o.trackingNumber || '',
                    paymentStatus: o.paymentStatus || '',
                });
            } else {
                setDetailPayload({ error: data?.message || 'Could not load order' });
            }
        } catch {
            setDetailPayload({ error: 'Network error' });
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setDetailId(null);
        setDetailPayload(null);
    };

    const saveDetail = async () => {
        if (!detailId) return;
        setSaveMsg('');
        const r = await fetchWithAuth(`${API}/admin/orders/${encodeURIComponent(detailId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deliveryStatus: form.deliveryStatus,
                trackingNumber: form.trackingNumber.trim() || null,
                paymentStatus: form.paymentStatus.trim() || undefined,
            }),
        });
        const data = await jsonFromResponse(r, {});
        if (r.ok) {
            setSaveMsg('Saved.');
            load();
            onOrdersChanged?.();
            setDetailPayload((prev) => (prev && prev.order ? { ...prev, order: data } : prev));
            setForm({
                deliveryStatus: data.deliveryStatus || 'processing',
                trackingNumber: data.trackingNumber || '',
                paymentStatus: data.paymentStatus || '',
            });
        } else {
            setSaveMsg(data?.message || data?.error || 'Save failed');
        }
    };

    const fmtLkr = (n) => `LKR ${Math.round(Number(n) || 0).toLocaleString()}`;

    return (
        <div style={{ width: '100%' }}>
            <h2 className="section-title">
                <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>receipt_long</span> Orders
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                View every order, update delivery stage and tracking. Customer details are read-only.
            </p>

            <div className="table-container" style={{ marginTop: '1.25rem' }}>
                <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3>All orders</h3>
                    <button type="button" className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => load()}>
                        Refresh
                    </button>
                </div>
                {loading ? (
                    <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>Loading orders…</p>
                ) : rows.length === 0 ? (
                    <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>No orders yet.</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Delivery</th>
                                <th>Payment</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const id = row._id;
                                return (
                                    <tr key={id}>
                                        <td style={{ color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatOrderDate(row.createdAt)}</td>
                                        <td>
                                            <div>
                                                <span className="item-text">{row.customerName || '—'}</span>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.customerEmail || row.userId || '—'}</div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{fmtLkr(row.total)}</td>
                                        <td>
                                            <span className="item-badge badge-blue">{row.deliveryStatus || '—'}</span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{row.paymentStatus || '—'}</td>
                                        <td>
                                            <button type="button" className="btn-action edit" onClick={() => openDetail(id)} title="Manage">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {detailId && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="admin-order-detail-title"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        background: 'rgba(15, 23, 42, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                    onClick={closeDetail}
                >
                    <div
                        className="gm-card-surface"
                        style={{
                            maxWidth: 560,
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '1rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                            <h3 id="admin-order-detail-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                                Order {detailId}
                            </h3>
                            <button type="button" className="btn-action delete" onClick={closeDetail} aria-label="Close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {detailLoading && <p style={{ color: '#94a3b8' }}>Loading…</p>}
                        {!detailLoading && detailPayload?.error && (
                            <p style={{ color: '#f87171' }}>{detailPayload.error}</p>
                        )}
                        {!detailLoading && detailPayload?.order && (
                            <>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                    <strong>{detailPayload.customerName || 'Customer'}</strong>{' '}
                                    <span style={{ color: '#94a3b8' }}>{detailPayload.customerEmail}</span>
                                </p>
                                <ul style={{ listStyle: 'none', margin: '0 0 1rem', padding: 0, fontSize: '0.9rem' }}>
                                    {(detailPayload.order.items || []).map((line, i) => (
                                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                            <span>{line.productName || line.productId} × {line.quantity}</span>
                                            <span>{fmtLkr(line.lineTotal)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ fontSize: '0.88rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                    <div><strong>Subtotal</strong> {fmtLkr(detailPayload.order.subtotal)}</div>
                                    <div><strong>Shipping</strong> {fmtLkr(detailPayload.order.shippingFee)}</div>
                                    <div style={{ fontWeight: 800, marginTop: '0.35rem' }}>Total {fmtLkr(detailPayload.order.total)}</div>
                                </div>
                                {detailPayload.order.shippingAddress && (
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
                                        <strong style={{ color: '#334155' }}>Ship to</strong>
                                        <br />
                                        {[
                                            detailPayload.order.shippingAddress.street,
                                            detailPayload.order.shippingAddress.city,
                                            detailPayload.order.shippingAddress.district,
                                            detailPayload.order.shippingAddress.state,
                                            detailPayload.order.shippingAddress.zip,
                                            detailPayload.order.shippingAddress.country,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="admin-label">Delivery status</label>
                                    <select
                                        className="admin-select"
                                        value={form.deliveryStatus}
                                        onChange={(e) => setForm((f) => ({ ...f, deliveryStatus: e.target.value }))}
                                        style={{ width: '100%' }}
                                    >
                                        {DELIVERY_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="admin-label">Tracking number</label>
                                    <input
                                        className="admin-input"
                                        value={form.trackingNumber}
                                        onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="admin-label">Payment status</label>
                                    <input
                                        className="admin-input"
                                        value={form.paymentStatus}
                                        onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                                        placeholder="e.g. paid"
                                    />
                                </div>
                                {saveMsg && (
                                    <p style={{ fontSize: '0.85rem', color: saveMsg.startsWith('Saved') ? '#22c55e' : '#f87171', marginBottom: '0.75rem' }}>{saveMsg}</p>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button type="button" className="btn-primary" onClick={saveDetail}>
                                        Save changes
                                    </button>
                                    <button type="button" className="btn-outline" onClick={closeDetail}>
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── USERS ─────────────────────────────────────────────────── */
function Users({ fetchWithAuth }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetchWithAuth(`${API}/admin/users`);
            if (r.ok) setUsers(await jsonFromResponse(r, []));
        } catch { /* ignore */ }
        setLoading(false);
    }, [fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const promote = async (id, newRole) => {
        const r = await fetchWithAuth(`${API}/admin/users/${id}/role`, {
            method: 'PUT', body: JSON.stringify({ role: newRole })
        });
        if (r.ok) { load(); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        const r = await fetchWithAuth(`${API}/admin/users/${id}`, { method: 'DELETE' });
        if (r.ok) { load(); }
    };

    return (
        <div style={{ width: '100%' }}>
            <h2 className="section-title">
                <span className="material-symbols-outlined" style={{ color: '#00d2ff' }}>group</span> User Directory
            </h2>

            <div className="table-container">
                <div className="table-header">
                    <h3>All Users</h3>
                </div>
                {loading ? <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>Loading users…</p> : users.length === 0 ? (
                    <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>No users found.</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div className="item-flex">
                                            <div className="item-image" style={{ backgroundColor: u.role === 'admin' ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: u.role === 'admin' ? '#00d2ff' : '#94a3b8' }}>
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                            <div>
                                                <p className="item-text">{u.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{u.email}</td>
                                    <td>
                                        <span className={`item-badge ${u.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {u.role !== 'admin' && <button title="Make Admin" onClick={() => promote(u._id, 'admin')} className="btn-action edit"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>admin_panel_settings</span></button>}
                                            {u.role === 'admin' && <button title="Demote" onClick={() => promote(u._id, 'user')} className="btn-action edit" style={{ color: '#ff007f', backgroundColor: 'rgba(255, 0, 127, 0.1)' }}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>person_remove</span></button>}
                                            <button title="Delete User" onClick={() => deleteUser(u._id)} className="btn-action delete"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/* ─── CATEGORIES ────────────────────────────────────────────── */
function Categories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '', description: '', slug: '', image: '', tagline: '', overlay: '', sortOrder: 0
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [categoryError, setCategoryError] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { load(); }, [load]);

    const resetForm = () => {
        setForm({ name: '', description: '', slug: '', image: '', tagline: '', overlay: '', sortOrder: 0 });
        setEditingId(null);
        setShowForm(false);
        setCategoryError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCategoryError('');
        try {
            const payload = {
                ...form,
                sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder)
            };
            if (editingId) {
                await api.put(`/admin/categories/${editingId}`, payload);
            } else {
                await api.post('/admin/categories', payload);
            }
            resetForm();
            load();
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save category';
            setCategoryError(message);
        }
    };

    const handleEdit = (cat) => {
        setForm({
            name: cat.name || '',
            description: cat.description || '',
            slug: cat.slug || '',
            image: cat.image || '',
            tagline: cat.tagline || '',
            overlay: cat.overlay || '',
            sortOrder: cat.sortOrder != null ? cat.sortOrder : 0
        });
        setEditingId(cat.id || cat._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category? Products linked to it must be reassigned first.')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            load();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Delete failed';
            alert(msg);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: '#ff007f' }}>category</span> Categories
                </h2>
                <button onClick={() => { resetForm(); setShowForm(s => !s); }} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    {showForm ? 'Cancel' : '+ Add Category'}
                </button>
            </div>

            {showForm && (
                <form className="admin-form" onSubmit={handleSubmit}>
                    {categoryError && (
                        <div role="alert" style={{ padding: '10px 14px', marginBottom: '1rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '0.875rem' }}>
                            {categoryError}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="admin-label">Category name *</label>
                        <input className="admin-input" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setCategoryError(''); }} required placeholder="e.g. Floral" />
                    </div>
                    <div className="form-group">
                        <label className="admin-label">Description</label>
                        <textarea className="admin-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description…" />
                    </div>
                    <div className="form-group">
                        <label className="admin-label">URL slug *</label>
                        <input className="admin-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. flash-cards (auto from name if blank on create)" />
                    </div>
                    <div className="form-group">
                        <label className="admin-label">Hero image URL</label>
                        <input className="admin-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://… (optional — home page uses default if empty)" />
                    </div>
                    <div className="form-group">
                        <label className="admin-label">Tagline</label>
                        <input className="admin-input" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Shown on home & category page" />
                    </div>
                    <div className="form-group">
                        <label className="admin-label">Badge overlay</label>
                        <input className="admin-input" value={form.overlay} onChange={e => setForm(f => ({ ...f, overlay: e.target.value }))} placeholder="e.g. Trending, New" />
                    </div>
                    <div className="form-group">
                        <label className="admin-label">Sort order</label>
                        <input className="admin-input" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))} placeholder="0 = first" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>{editingId ? 'Update Category' : 'Create Category'}</button>
                </form>
            )}

            <div className="table-container">
                <div className="table-header">
                    <h3>All categories</h3>
                </div>
                {categories.length === 0 ? <p style={{ color: '#94a3b8', padding: '1.5rem 2rem' }}>No categories yet.</p> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id || cat._id}>
                                    <td><span className="item-badge badge-pink">{cat.name}</span></td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{cat.slug || '—'}</td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{cat.description || '—'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(cat)} className="btn-action edit"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span></button>
                                            <button onClick={() => handleDelete(cat.id || cat._id)} className="btn-action delete"><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/* ─── REVIEWS ───────────────────────────────────────────────── */
function Reviews({ fetchWithAuth }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetchWithAuth(`${API}/admin/reviews`);
            if (r.ok) setReviews(await jsonFromResponse(r, []));
        } catch { /* ignore */ }
        setLoading(false);
    }, [fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const del = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        const r = await fetchWithAuth(`${API}/admin/reviews/${id}`, { method: 'DELETE' });
        if (r.ok) { load(); }
    };

    const moderate = async (id, status) => {
        const r = await fetchWithAuth(`${API}/admin/reviews/${id}/moderation`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (r.ok) load();
    };

    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    const statusBadge = (s) => {
        const v = (s || 'approved').toLowerCase();
        const colors = { pending: '#ca8a04', approved: '#16a34a', rejected: '#dc2626' };
        return (
            <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                background: `${colors[v] || '#64748b'}22`,
                color: colors[v] || '#94a3b8',
            }}>{v}</span>
        );
    };

    return (
        <div style={{ width: '100%' }}>
            <h2 className="section-title">
                <span className="material-symbols-outlined" style={{ color: '#5F9EA0' }}>reviews</span> Reviews
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Approve to show on product pages. Reject to hide without deleting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                {loading ? <p style={{ color: '#94a3b8', padding: '1rem' }}>Loading reviews…</p> : reviews.length === 0 ? (
                    <p style={{ color: '#94a3b8', padding: '1.5rem', textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '1.5rem' }}>No reviews yet.</p>
                ) : reviews.map((rev) => {
                    const id = rev._id || rev.id;
                    const st = rev.moderationStatus || 'approved';
                    return (
                        <div key={id} className="review-item" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div className="review-content" style={{ flex: '1 1 220px', minWidth: 0 }}>
                                <div className="review-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <span className="review-stars">{stars(rev.rating || 0)}</span>
                                    <span className="review-user">{rev.userName || rev.userEmail || 'Anonymous'}</span>
                                    {statusBadge(st)}
                                    {rev.productName && (
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>· {rev.productName}</span>
                                    )}
                                </div>
                                <p style={{ marginTop: '0.5rem' }}>{rev.comment || '(no comment)'}</p>
                                <div className="review-actions">
                                    {st !== 'approved' && (
                                        <button
                                            type="button"
                                            className="review-moderate-btn review-moderate-btn--approve"
                                            onClick={() => moderate(id, 'approved')}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden>
                                                check_circle
                                            </span>
                                            Approve
                                        </button>
                                    )}
                                    {st !== 'rejected' && (
                                        <button
                                            type="button"
                                            className="review-moderate-btn review-moderate-btn--reject"
                                            onClick={() => moderate(id, 'rejected')}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden>
                                                block
                                            </span>
                                            Reject
                                        </button>
                                    )}
                                    {st !== 'pending' && (
                                        <button
                                            type="button"
                                            className="review-moderate-btn review-moderate-btn--pending"
                                            onClick={() => moderate(id, 'pending')}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden>
                                                schedule
                                            </span>
                                            Mark pending
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button className="btn-action delete" type="button" onClick={() => del(id)} title="Delete">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── FEEDBACK (public form → admin) ─────────────────────────── */
function AdminFeedback({ fetchWithAuth }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetchWithAuth(`${API}/admin/feedback`);
            if (r.ok) setRows(await jsonFromResponse(r, []));
        } catch { /* ignore */ }
        setLoading(false);
    }, [fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const formatDate = (d) => {
        if (!d) return '—';
        try {
            return new Date(d).toLocaleString();
        } catch {
            return String(d);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <h2 className="section-title">
                <span className="material-symbols-outlined" style={{ color: '#5F9EA0' }}>mark_unread_chat_alt</span> Customer feedback
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Messages sent from the Feedback page on the storefront.
            </p>
            {loading ? (
                <p style={{ color: '#94a3b8', padding: '1rem' }}>Loading…</p>
            ) : rows.length === 0 ? (
                <p style={{ color: '#94a3b8', padding: '1.5rem', textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '1.5rem', marginTop: '1rem' }}>
                    No messages yet.
                </p>
            ) : (
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>From</th>
                                <th>Name</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((f) => {
                                const id = f._id || f.id;
                                return (
                                    <tr key={id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(f.createdAt)}</td>
                                        <td>{f.email || '—'}</td>
                                        <td>{f.name || '—'}</td>
                                        <td style={{ maxWidth: '28rem', wordBreak: 'break-word' }}>{f.message || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ─── MAIN PANEL ────────────────────────────────────────────── */
export default function AdminPanel() {
    const { user, logout, fetchWithAuth } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifWrapRef = useRef(null);

    const loadLowStockProducts = useCallback(async () => {
        try {
            const r = await fetchWithAuth(`${API}/admin/products`);
            if (!r.ok) return;
            const all = await jsonFromResponse(r, []);
            const list = Array.isArray(all) ? all : [];
            const low = list
                .filter((p) => (p.stock ?? 0) < 10)
                .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
            setLowStockProducts(low);
        } catch { /* ignore */ }
    }, [fetchWithAuth]);

    const refreshDashboardStats = useCallback(async () => {
        try {
            const statsFetch = FEATURES.ADMIN_STATS
                ? fetchWithAuth(`${API}/admin/stats`).then(async (res) => (res.ok ? jsonFromResponse(res, {}) : {}))
                : Promise.resolve({});
            const [u, p, cats, r, s] = await Promise.all([
                fetchWithAuth(`${API}/admin/users`).then(async (res) => (res.ok ? jsonFromResponse(res, []) : [])),
                fetch(`${API}/products?limit=1`).then(async (res) => (res.ok ? jsonFromResponse(res, {}) : {})),
                fetch(`${API}/admin/categories`).then(async (res) => (res.ok ? jsonFromResponse(res, []) : [])),
                fetchWithAuth(`${API}/admin/reviews`).then(async (res) => (res.ok ? jsonFromResponse(res, []) : [])),
                statsFetch,
            ]);
            setStats({
                users: Array.isArray(u) ? u.length : 0,
                products: p.total ?? p.products?.length ?? 0,
                categories: Array.isArray(cats) ? cats.length : 0,
                reviews: Array.isArray(r) ? r.length : 0,
                orders: FEATURES.ADMIN_STATS ? (s.orderCount ?? '—') : '—',
                revenue: FEATURES.ADMIN_STATS ? (s.revenueTotal ?? '—') : '—',
            });
        } catch { /* ignore */ }
    }, [fetchWithAuth]);

    useEffect(() => {
        loadLowStockProducts();
    }, [loadLowStockProducts]);

    useEffect(() => {
        if (tab === 'products') loadLowStockProducts();
    }, [tab, loadLowStockProducts]);

    useEffect(() => {
        if (!notifOpen) return;
        const close = (e) => {
            if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [notifOpen]);

    useEffect(() => {
        refreshDashboardStats();
    }, [refreshDashboardStats]);

    const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'orders', label: 'Orders', icon: 'receipt_long' },
        { id: 'users', label: 'Users', icon: 'group' },
        { id: 'products', label: 'Products', icon: 'inventory_2' },
        { id: 'categories', label: 'Categories', icon: 'category' },
        { id: 'reviews', label: 'Reviews', icon: 'reviews' },
        { id: 'feedback', label: 'Feedback', icon: 'mark_unread_chat_alt' }
    ];

    return (
        <div className="admin-container">
            {/* Sidebar Desktop */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="material-symbols-outlined">redeem</span>
                    </div>
                    <div className="sidebar-title">
                        <h1>Gift Mart</h1>
                        <p>Admin Panel</p>
                    </div>
                </div>

                <nav className="sidebar-nav custom-scrollbar">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${tab === item.id ? 'active' : ''}`}
                            onClick={() => setTab(item.id)}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    <div className="sidebar-nav-tools">
                        <p style={{ padding: '0 1rem', fontSize: '0.625rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.5rem' }}>Internal Tools</p>
                        <button className="nav-item" onClick={() => alert('Reports Under Construction')}>
                            <span className="material-symbols-outlined">analytics</span> Reports
                        </button>
                        <button className="nav-item" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined">rocket_launch</span> Back to Store
                        </button>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-box">
                        <div className="user-avatar" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkzu6sMdzpdwK_Dh8EIdCuE2oXz60DHnTm--07ybRtpLc8l9VBnsaSOD2Q4CiwuOk_KBHkm8cX3s1lAEJrAkShLl_GrHWzmz3NI5hdl5ZnSKWQ3PLeg13YaW508VGajSdIar9k7ZjyqCsU43haxSktaNytuQmFJE8DAOR9a2vwcd1wrNWXYp52NziyWzIRtSa6badr_Qj7meC47gnCXTNlKmPXM071Ubt1EpX2Tu7BPABlFs66LEJGNDI-LKDkXD9xXZCp0sy6l3M')" }}></div>
                        <div className="user-info">
                            <p className="user-name">{user?.name || 'Admin User'}</p>
                            <p className="user-role">Super Admin</p>
                        </div>
                        <button className="logout-icon" onClick={handleLogout} title="Logout">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="main-header">
                    <div className="search-box">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input type="text" className="search-input" placeholder="Search analytics, users, or products..." />
                    </div>
                    <div className="header-actions">
                        <div className="admin-notif-wrap" ref={notifWrapRef}>
                            <button
                                type="button"
                                className="header-btn"
                                aria-expanded={notifOpen}
                                aria-haspopup="true"
                                aria-label="Low stock alerts"
                                title="Products with stock under 10"
                                onClick={() => setNotifOpen((o) => !o)}
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {lowStockProducts.length > 0 && (
                                    <span className="header-notif-badge" aria-hidden>
                                        {lowStockProducts.length > 99 ? '99+' : lowStockProducts.length}
                                    </span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="admin-notif-dropdown" role="dialog" aria-label="Low stock products">
                                    <div className="admin-notif-dropdown-head">
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: '#5F9EA0' }}>warning</span>
                                        <span>Stock under 10</span>
                                    </div>
                                    {lowStockProducts.length === 0 ? (
                                        <p className="admin-notif-empty">No products below 10 units in stock.</p>
                                    ) : (
                                        <ul className="admin-notif-list">
                                            {lowStockProducts.map((p) => {
                                                const id = p._id || p.id;
                                                const st = p.stock ?? 0;
                                                return (
                                                    <li key={id}>
                                                        <button
                                                            type="button"
                                                            className="admin-notif-row"
                                                            onClick={() => {
                                                                setTab('products');
                                                                setNotifOpen(false);
                                                            }}
                                                        >
                                                            <span className="admin-notif-name">{p.name || '—'}</span>
                                                            <span className="admin-notif-meta">
                                                                {p.category && <span className="admin-notif-cat">{p.category}</span>}
                                                                <span className={`admin-notif-stock ${st === 0 ? 'is-zero' : ''}`}>{st} left</span>
                                                            </span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                    <button
                                        type="button"
                                        className="admin-notif-footer-btn"
                                        onClick={() => {
                                            setTab('products');
                                            setNotifOpen(false);
                                        }}
                                    >
                                        Open Products
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="main-scroll custom-scrollbar">
                    {tab === 'dashboard' && <Dashboard stats={stats} onOpenOrders={() => setTab('orders')} />}
                    {tab === 'orders' && (
                        <AdminOrders fetchWithAuth={fetchWithAuth} onOrdersChanged={refreshDashboardStats} />
                    )}
                    {tab === 'users' && <Users fetchWithAuth={fetchWithAuth} />}
                    {tab === 'categories' && <Categories />}
                    {tab === 'products' && <InventorySection fetchWithAuth={fetchWithAuth} />}
                    {tab === 'reviews' && <Reviews fetchWithAuth={fetchWithAuth} />}
                    {tab === 'feedback' && <AdminFeedback fetchWithAuth={fetchWithAuth} />}
                </div>
            </main>
        </div>
    );
}

