import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageSrc } from '../utils/imageUrl';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';

const API = getApiBaseUrl();

export default function Wishlist() {
  const { fetchWithAuth } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const successClearRef = useRef(null);

  useEffect(() => () => {
    if (successClearRef.current) window.clearTimeout(successClearRef.current);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${API}/wishlist`);
      if (r.ok) {
        const data = await jsonFromResponse(r, { items: [] });
        setItems(data?.items || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { load(); }, [load]);

  const remove = async (productId) => {
    setBusyId(productId);
    try {
      const r = await fetchWithAuth(`${API}/wishlist/items/${encodeURIComponent(productId)}`, { method: 'DELETE' });
      if (r.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  const moveToCart = async (productId, productName) => {
    setBusyId(productId);
    setSuccessMessage('');
    if (successClearRef.current) window.clearTimeout(successClearRef.current);
    try {
      const r = await fetchWithAuth(`${API}/wishlist/move-to-cart`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const data = await jsonFromResponse(r, {});
      if (r.ok) {
        await refreshCart();
        await load();
        const label = productName?.trim() ? `“${productName.trim()}”` : 'This item';
        setSuccessMessage(
          `${label} was added to your cart (quantity set to 1 or increased if it was already in your cart) and removed from your wishlist.`
        );
        successClearRef.current = window.setTimeout(() => setSuccessMessage(''), 6000);
      } else {
        alert(data.message || 'Could not move to cart');
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
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1.1rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, rgba(95, 158, 160, 0.12), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(95, 158, 160, 0.35)',
            color: '#0f766e',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }} aria-hidden>
              check_circle
            </span>
            {successMessage}
          </span>
          <button
            type="button"
            onClick={() => {
              setSuccessMessage('');
              if (successClearRef.current) window.clearTimeout(successClearRef.current);
            }}
            style={{
              flexShrink: 0,
              border: 'none',
              background: 'transparent',
              color: '#0f766e',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '0.15rem 0.35rem'
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Wishlist</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Save items for later and move them to your bag when you are ready.</p>

      {items.length === 0 ? (
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
                    onClick={() => moveToCart(pid, p.name)}
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
