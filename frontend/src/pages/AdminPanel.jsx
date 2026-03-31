import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import InventorySection from './InventorySection';
import '../../styles/admin-panel.css'; // importing luxury styles

const API = '/api';

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({ stats }) {
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
            </div>
        </>
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
            if (r.ok) setUsers(await r.json());
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
            if (r.ok) setReviews(await r.json());
        } catch { /* ignore */ }
        setLoading(false);
    }, [fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const del = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        const r = await fetchWithAuth(`${API}/admin/reviews/${id}`, { method: 'DELETE' });
        if (r.ok) { load(); }
    };

    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    return (
        <div style={{ width: '100%' }}>
            <h2 className="section-title">
                <span className="material-symbols-outlined" style={{ color: '#5F9EA0' }}>reviews</span> Reviews
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                {loading ? <p style={{ color: '#94a3b8', padding: '1rem' }}>Loading reviews…</p> : reviews.length === 0 ? (
                    <p style={{ color: '#94a3b8', padding: '1.5rem', textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '1.5rem' }}>No reviews yet.</p>
                ) : reviews.map(r => (
                    <div key={r._id || r.id} className="review-item">
                        <div className="review-content" style={{ flex: 1 }}>
                            <div className="review-header">
                                <span className="review-stars">{stars(r.rating || 0)}</span>
                                <span className="review-user">{r.userName || r.userEmail || 'Anonymous'}</span>
                            </div>
                            <p>{r.comment || '(no comment)'}</p>
                        </div>
                        <button className="btn-action delete" onClick={() => del(r._id || r.id)}>
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                ))}
            </div>
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
            const all = await r.json();
            const list = Array.isArray(all) ? all : [];
            const low = list
                .filter((p) => (p.stock ?? 0) < 10)
                .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
            setLowStockProducts(low);
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

    /* load summary stats for dashboard */
    useEffect(() => {
        const loadStats = async () => {
            try {
                const [u, p, cats, r] = await Promise.all([
                    fetchWithAuth(`${API}/admin/users`).then(res => res.ok ? res.json() : []),
                    fetch(`${API}/products?limit=1`).then(res => res.ok ? res.json() : {}),
                    fetch(`${API}/admin/categories`).then(res => res.ok ? res.json() : []),
                    fetchWithAuth(`${API}/admin/reviews`).then(res => res.ok ? res.json() : []),
                ]);
                setStats({
                    users: Array.isArray(u) ? u.length : 0,
                    products: p.total ?? p.products?.length ?? 0,
                    categories: Array.isArray(cats) ? cats.length : 0,
                    reviews: Array.isArray(r) ? r.length : 0,
                });
            } catch { /* ignore */ }
        };
        loadStats();
    }, [fetchWithAuth]);

    const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'users', label: 'Users', icon: 'group' },
        { id: 'products', label: 'Products', icon: 'inventory_2' },
        { id: 'categories', label: 'Categories', icon: 'category' },
        { id: 'reviews', label: 'Reviews', icon: 'reviews' }
    ];

    return (
        <div className="admin-container">
            {/* Sidebar Desktop */}
            <aside className="admin-sidebar hidden lg:flex">
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

                    <div style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
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
                    {tab === 'dashboard' && <Dashboard stats={stats} />}
                    {tab === 'users' && <Users fetchWithAuth={fetchWithAuth} />}
                    {tab === 'categories' && <Categories />}
                    {tab === 'products' && <InventorySection fetchWithAuth={fetchWithAuth} />}
                    {tab === 'reviews' && <Reviews fetchWithAuth={fetchWithAuth} />}
                </div>
            </main>
        </div>
    );
}

