import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = '/api';

/* ─── small helpers ─────────────────────────────────────────── */
function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: '#1e1e2e', borderRadius: 14, padding: '1.4rem 1.6rem',
            borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '1.2rem'
        }}>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff' }}>{value}</div>
                <div style={{ fontSize: '0.82rem', color: '#aaa', marginTop: 2 }}>{label}</div>
            </div>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e084c0', marginBottom: '1rem', letterSpacing: 0.5 }}>
            {children}
        </h2>
    );
}

function Pill({ children, color = '#e084c0' }) {
    return (
        <span style={{
            background: color + '22', color, border: `1px solid ${color}55`,
            borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600
        }}>{children}</span>
    );
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({ stats }) {
    return (
        <div>
            <SectionTitle>📊 Dashboard Overview</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard icon="👥" label="Total Users" value={stats.users ?? '—'} color="#e084c0" />
                <StatCard icon="🛍️" label="Total Products" value={stats.products ?? '—'} color="#7c6af7" />
                <StatCard icon="📦" label="Total Orders" value={stats.orders ?? '—'} color="#4bc8a8" />
                <StatCard icon="⭐" label="Reviews" value={stats.reviews ?? '—'} color="#f4a261" />
            </div>
            <div style={{ background: '#1e1e2e', borderRadius: 14, padding: '1.4rem', color: '#aaa', fontSize: '0.9rem', lineHeight: 1.8 }}>
                <p style={{ color: '#e084c0', fontWeight: 700, marginBottom: '0.5rem' }}>👋 Welcome to the Gift Mart Admin Panel</p>
                <p>Use the sidebar to manage <strong style={{ color: '#fff' }}>Users</strong>, <strong style={{ color: '#fff' }}>Products</strong>, and <strong style={{ color: '#fff' }}>Reviews</strong>.</p>
                <p style={{ marginTop: '0.5rem' }}>You are signed in as <strong style={{ color: '#e084c0' }}>Administrator</strong>.</p>
            </div>
        </div>
    );
}

/* ─── USERS ─────────────────────────────────────────────────── */
function Users({ fetchWithAuth }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

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
        if (r.ok) { setMsg(`Role updated to ${newRole}.`); load(); }
        setTimeout(() => setMsg(''), 3000);
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        const r = await fetchWithAuth(`${API}/admin/users/${id}`, { method: 'DELETE' });
        if (r.ok) { setMsg('User deleted.'); load(); }
        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <div>
            <SectionTitle>👥 User Management</SectionTitle>
            {msg && <div style={{ background: '#4bc8a822', color: '#4bc8a8', border: '1px solid #4bc8a8', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>✅ {msg}</div>}
            {loading ? <p style={{ color: '#aaa' }}>Loading users…</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #333' }}>
                                {['Name', 'Email', 'Phone', 'Role', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: '#aaa', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '0.7rem 0.8rem', color: '#fff' }}>{u.name}</td>
                                    <td style={{ padding: '0.7rem 0.8rem', color: '#ccc' }}>{u.email}</td>
                                    <td style={{ padding: '0.7rem 0.8rem', color: '#ccc' }}>{u.phone || '—'}</td>
                                    <td style={{ padding: '0.7rem 0.8rem' }}>
                                        <Pill color={u.role === 'admin' ? '#e084c0' : '#7c6af7'}>{u.role}</Pill>
                                    </td>
                                    <td style={{ padding: '0.7rem 0.8rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            {u.role !== 'admin' && (
                                                <button onClick={() => promote(u.id, 'admin')} style={btnStyle('#e084c0')}>Make Admin</button>
                                            )}
                                            {u.role === 'admin' && (
                                                <button onClick={() => promote(u.id, 'user')} style={btnStyle('#7c6af7')}>Demote</button>
                                            )}
                                            <button onClick={() => deleteUser(u.id)} style={btnStyle('#ef4444')}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!users.length && (
                                <tr><td colSpan={5} style={{ padding: '1rem', color: '#555', textAlign: 'center' }}>No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ─── PRODUCTS ──────────────────────────────────────────────── */
const emptyProduct = { name: '', description: '', category: 'Bouquet', price: '', stock: '' };
const CATEGORIES = ['Bouquet', 'Flash Cards', 'Frames', 'Gift Box'];

function Products({ fetchWithAuth }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyProduct);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/products?limit=100`);
            if (r.ok) { const d = await r.json(); setProducts(d.products || []); }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const flash = (ok, text) => {
        if (ok) setMsg(text); else setError(text);
        setTimeout(() => { setMsg(''); setError(''); }, 3000);
    };

    const save = async (e) => {
        e.preventDefault();
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `${API}/admin/products/${editId}` : `${API}/admin/products`;
        const r = await fetchWithAuth(url, { method, body: JSON.stringify({ ...form, price: +form.price, stock: +form.stock }) });
        if (r.ok) { flash(true, editId ? 'Product updated.' : 'Product added.'); setShowForm(false); setEditId(null); setForm(emptyProduct); load(); }
        else { const d = await r.json(); flash(false, d.message || 'Failed.'); }
    };

    const startEdit = (p) => { setForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, stock: p.stock }); setEditId(p._id || p.id); setShowForm(true); };

    const del = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        const r = await fetchWithAuth(`${API}/admin/products/${id}`, { method: 'DELETE' });
        if (r.ok) { flash(true, 'Product deleted.'); load(); } else flash(false, 'Delete failed.');
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <SectionTitle>🛍️ Products</SectionTitle>
                <button onClick={() => { setForm(emptyProduct); setEditId(null); setShowForm(s => !s); }} style={btnStyle('#e084c0')}>
                    {showForm ? '✕ Cancel' : '+ Add Product'}
                </button>
            </div>

            {msg && <div style={alertStyle('#4bc8a8')}>✅ {msg}</div>}
            {error && <div style={alertStyle('#ef4444')}>❌ {error}</div>}

            {showForm && (
                <form onSubmit={save} style={{ background: '#1e1e2e', borderRadius: 12, padding: '1.2rem', marginBottom: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={labelStyle}>Product Name</label>
                        <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Rose Bouquet" />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description…" />
                    </div>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Price (₹)</label>
                        <input style={inputStyle} type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="3500" />
                    </div>
                    <div>
                        <label style={labelStyle}>Stock</label>
                        <input style={inputStyle} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required placeholder="50" />
                    </div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.6rem' }}>
                        <button type="submit" style={{ ...btnStyle('#e084c0'), flex: 1, padding: '0.6rem' }}>{editId ? '💾 Update' : '➕ Add Product'}</button>
                    </div>
                </form>
            )}

            {loading ? <p style={{ color: '#aaa' }}>Loading products…</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #333' }}>
                                {['Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: '#aaa', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '0.7rem 0.8rem', color: '#fff' }}>{p.name}</td>
                                    <td style={{ padding: '0.7rem 0.8rem' }}><Pill color="#7c6af7">{p.category}</Pill></td>
                                    <td style={{ padding: '0.7rem 0.8rem', color: '#4bc8a8' }}>₹{p.price?.toLocaleString()}</td>
                                    <td style={{ padding: '0.7rem 0.8rem', color: p.stock < 10 ? '#ef4444' : '#ccc' }}>{p.stock}</td>
                                    <td style={{ padding: '0.7rem 0.8rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button onClick={() => startEdit(p)} style={btnStyle('#7c6af7')}>Edit</button>
                                            <button onClick={() => del(p._id)} style={btnStyle('#ef4444')}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!products.length && (
                                <tr><td colSpan={5} style={{ padding: '1rem', color: '#555', textAlign: 'center' }}>No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ─── REVIEWS ───────────────────────────────────────────────── */
function Reviews({ fetchWithAuth }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

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
        if (r.ok) { setMsg('Review deleted.'); load(); }
        setTimeout(() => setMsg(''), 3000);
    };

    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    return (
        <div>
            <SectionTitle>⭐ Reviews & Feedback</SectionTitle>
            {msg && <div style={alertStyle('#4bc8a8')}>✅ {msg}</div>}
            {loading ? <p style={{ color: '#aaa' }}>Loading reviews…</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {reviews.map(r => (
                        <div key={r._id || r.id} style={{ background: '#1e1e2e', borderRadius: 10, padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                                    <span style={{ color: '#f4a261', fontSize: '1rem' }}>{stars(r.rating || 0)}</span>
                                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{r.userName || r.userEmail || 'Anonymous'}</span>
                                </div>
                                <p style={{ color: '#ccc', margin: 0, fontSize: '0.88rem' }}>{r.comment || '(no comment)'}</p>
                            </div>
                            <button onClick={() => del(r._id || r.id)} style={btnStyle('#ef4444')}>Delete</button>
                        </div>
                    ))}
                    {!reviews.length && <p style={{ color: '#555', textAlign: 'center' }}>No reviews yet.</p>}
                </div>
            )}
        </div>
    );
}

/* ─── STYLE HELPERS ─────────────────────────────────────────── */
const btnStyle = (color) => ({
    background: color + '22', color, border: `1px solid ${color}55`,
    borderRadius: 7, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 600, transition: 'background 0.15s',
});
const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: '#12121f', color: '#fff',
    border: '1px solid #333', borderRadius: 8, padding: '0.5rem 0.75rem',
    fontSize: '0.88rem', outline: 'none',
};
const labelStyle = { display: 'block', color: '#aaa', fontSize: '0.78rem', marginBottom: 4, fontWeight: 600 };
const alertStyle = (c) => ({
    background: c + '18', color: c, border: `1px solid ${c}44`, borderRadius: 8,
    padding: '0.6rem 1rem', marginBottom: '0.8rem', fontSize: '0.88rem',
});

/* ─── SIDEBAR NAV ITEMS ─────────────────────────────────────── */
const NAV = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'products', icon: '🛍️', label: 'Products' },
    { id: 'reviews', icon: '⭐', label: 'Reviews' },
];

/* ─── MAIN PANEL ────────────────────────────────────────────── */
export default function AdminPanel() {
    const { user, logout, fetchWithAuth } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({});

    /* load summary stats for dashboard */
    useEffect(() => {
        const load = async () => {
            try {
                const [u, p, o, r] = await Promise.all([
                    fetchWithAuth(`${API}/admin/users`).then(r => r.ok ? r.json() : []),
                    fetch(`${API}/products?limit=1`).then(r => r.ok ? r.json() : {}),
                    fetchWithAuth(`${API}/admin/orders`).then(r => r.ok ? r.json() : []),
                    fetchWithAuth(`${API}/admin/reviews`).then(r => r.ok ? r.json() : []),
                ]);
                setStats({ users: u.length, products: p.total ?? p.products?.length ?? 0, orders: Array.isArray(o) ? o.length : 0, reviews: Array.isArray(r) ? r.length : 0 });
            } catch { /* ignore */ }
        };
        load();
    }, [fetchWithAuth]);

    const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#12121f', fontFamily: "'Inter', sans-serif", color: '#fff' }}>

            {/* ── SIDEBAR ── */}
            <aside style={{
                width: 220, background: '#16162a', borderRight: '1px solid #252545',
                display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0
            }}>
                {/* Brand */}
                <div style={{ padding: '0 1.2rem 1.5rem', borderBottom: '1px solid #252545' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e084c0', letterSpacing: 0.5 }}>🎁 Gift Mart</div>
                    <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 2 }}>Admin Panel</div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '1rem 0' }}>
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.7rem',
                                width: '100%', padding: '0.7rem 1.2rem', border: 'none', cursor: 'pointer',
                                background: tab === item.id ? '#e084c011' : 'transparent',
                                borderLeft: tab === item.id ? '3px solid #e084c0' : '3px solid transparent',
                                color: tab === item.id ? '#e084c0' : '#888',
                                fontWeight: tab === item.id ? 700 : 500, fontSize: '0.9rem',
                                textAlign: 'left', transition: 'all 0.15s',
                            }}
                        >
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </nav>

                {/* User + Logout */}
                <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid #252545' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>
                        Signed in as<br />
                        <strong style={{ color: '#e084c0' }}>{user?.name || 'Admin'}</strong>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '0.5rem', background: '#ef444418',
                            color: '#ef4444', border: '1px solid #ef444433', borderRadius: 8,
                            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {tab === 'dashboard' && <Dashboard stats={stats} />}
                {tab === 'users' && <Users fetchWithAuth={fetchWithAuth} />}
                {tab === 'products' && <Products fetchWithAuth={fetchWithAuth} />}
                {tab === 'reviews' && <Reviews fetchWithAuth={fetchWithAuth} />}
            </main>
        </div>
    );
}
