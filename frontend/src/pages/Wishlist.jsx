import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageSrc } from '../utils/imageUrl';

const API = '/api';

export default function Wishlist() {
  const { fetchWithAuth } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Out of scope for "move wishlist item to cart" scrum:
  // - Loading/initial fetch logic also supports remove and empty state display.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${API}/wishlist`);
      if (r.ok) {
        const data = await r.json();
        setItems(data.items || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { load(); }, [load]);

  // Out of scope for this scrum: standalone removal action (kept for page completeness)
  const remove = async (productId) => {
    setBusyId(productId);
    try {
      const r = await fetchWithAuth(`${API}/wishlist/items/${encodeURIComponent(productId)}`, { method: 'DELETE' });
      if (r.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  const moveToCart = async (productId) => {
    setBusyId(productId);
    try {
      const r = await fetchWithAuth(`${API}/wishlist/move-to-cart`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (r.ok) {
        // Success message per acceptance criteria for this scrum
        alert('Moved to cart.');
        await refreshCart();
        await load();
      } else {
        const err = await r.json().catch(() => ({}));
        alert(err.message || 'Could not move to cart');
      }
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="page-loading" style={{ minHeight: '50vh' }}>Loading wishlist…</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Wishlist</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Save items for later and move them to your bag when you are ready.</p>

      {items.length === 0 ? (
        // Empty state shown — supportive but not the core of this scrum
        <div style={{ textAlign: 'center', padding: '3rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#cbd5e1' }}>favorite</span>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>No saved items yet.</p>
          <Link to="/products" style={{ display: 'inline-block', marginTop: '1rem', fontWeight: 700, color: '#5F9EA0' }}>Browse products</Link>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((row) => {
            const p = row.product;
            const pid = row.productId;
            const busy = busyId === pid;
            if (!p) {
              return (
                <li key={pid} style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid #fecaca', background: '#fff' }}>
                  <p style={{ color: '#64748b' }}>Product no longer available.</p>
                  <button type="button" onClick={() => remove(pid)} style={{ marginTop: '0.5rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Remove
                  </button>
                </li>
              );
            }
            const img = p.image ? getImageSrc(p.image) : '';
            return (
              <li
                key={pid}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  background: '#fff'
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/product/${pid}`)}
                  style={{ width: 100, height: 100, borderRadius: '0.75rem', overflow: 'hidden', padding: 0, border: 'none', cursor: 'pointer', background: '#f1f5f9' }}
                >
                  {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>🎁</span>}
                </button>
                <div>
                  <Link to={`/product/${pid}`} style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>{p.name}</Link>
                  <p style={{ marginTop: '0.35rem', color: '#5F9EA0', fontWeight: 700 }}>LKR {Number(p.price).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => moveToCart(pid)}
                    className="btn-primary"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Move to cart
                  </button>
                  <button type="button" disabled={busy} onClick={() => remove(pid)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
