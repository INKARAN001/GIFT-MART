import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageSrc } from '../utils/imageUrl';

/** Sri Lankan Rupees — whole units, consistent with the rest of the store */
function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
}

export default function Cart() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const { items, subtotal, itemCount, loading, updateQuantity, removeItem, refreshCart } = useCart();
  const [busyPid, setBusyPid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderErr, setOrderErr] = useState('');

  if (loading) {
    return <div className="page-loading" style={{ minHeight: '50vh' }}>Loading cart…</div>;
  }

  const isEmpty = items.length === 0;
  const subtotalRounded = Math.round(Number(subtotal) || 0);
  const grandTotal = subtotalRounded;

  const runLineAction = async (productId, fn) => {
    setBusyPid(productId);
    try {
      const res = await fn();
      if (res && res.ok === false && res.message) {
        alert(res.message);
      }
    } finally {
      setBusyPid(null);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary, #0f172a)' }}>
        Shopping bag
      </h1>
      {!isEmpty && (
        <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '2rem' }}>
          {itemCount} item{itemCount === 1 ? '' : 's'} in your bag
        </p>
      )}

      {isEmpty ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #e2e8f0)',
            background: 'var(--surface-light, #f8fafc)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#94a3b8' }} aria-hidden>
            shopping_bag
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '1rem', marginBottom: '0.5rem' }}>
            Your cart is empty
          </h2>
          <p style={{ margin: 0, color: '#64748b', maxWidth: '22rem', marginLeft: 'auto', marginRight: 'auto' }}>
            When you add products, they will show up here. You can change quantities or remove items anytime.
          </p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1.25rem', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700 }}>
            Continue shopping
          </Link>
          <div
            role="region"
            aria-label="Order totals"
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              maxWidth: '20rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.35rem' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatLkr(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
              <span>Grand total</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatLkr(0)}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Totals update as you add items.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((row) => {
              const p = row.product;
              const pid = row.productId;
              const unavailable = row.unavailable || !p;
              const name = p?.name || 'Unavailable product';
              const price = p?.price != null ? Number(p.price) : 0;
              const rawImg = p?.image || p?.imageUrl;
              const img = rawImg ? getImageSrc(rawImg) : '';
              const lineQty = Math.max(1, row.quantity || 1);
              const lineSubtotal = row.lineTotal != null ? row.lineTotal : price * lineQty;
              const busy = busyPid === pid;

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
                    border: '1px solid var(--border-color, #e2e8f0)',
                    background: '#fff'
                  }}
                >
                  <div style={{ width: 100, height: 100, borderRadius: '0.75rem', overflow: 'hidden', background: '#f1f5f9' }}>
                    {img ? (
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎁</div>
                    )}
                  </div>
                  <div>
                    <Link to={unavailable ? '#' : `/product/${pid}`} style={{ fontWeight: 700, color: unavailable ? '#94a3b8' : 'var(--text-primary)', textDecoration: 'none' }}>
                      {name}
                    </Link>
                    {unavailable && (
                      <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>This item is no longer available — remove it to continue.</p>
                    )}
                    <p style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.9rem' }}>{formatLkr(price)} each</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        title={lineQty <= 1 ? 'Minimum quantity is 1 — use Remove to delete this line' : 'Decrease quantity'}
                        disabled={unavailable || busy || lineQty <= 1}
                        onClick={() =>
                          runLineAction(pid, () => updateQuantity(pid, lineQty - 1))
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          cursor: unavailable || lineQty <= 1 ? 'not-allowed' : busy ? 'wait' : 'pointer',
                          opacity: lineQty <= 1 ? 0.45 : 1
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>remove</span>
                      </button>
                      <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }} aria-live="polite">
                        {lineQty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={unavailable || busy}
                        onClick={() =>
                          runLineAction(pid, () => updateQuantity(pid, lineQty + 1))
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          cursor: unavailable ? 'not-allowed' : busy ? 'wait' : 'pointer'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>add</span>
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runLineAction(pid, () => removeItem(pid))}
                        style={{
                          marginLeft: '0.5rem',
                          color: '#dc2626',
                          background: 'none',
                          border: 'none',
                          cursor: busy ? 'wait' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 600 }}>
                      Line subtotal
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 800, fontSize: '1.1rem', color: 'var(--gold-muted, #5F9EA0)' }}>
                      {formatLkr(lineSubtotal)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            role="region"
            aria-label="Order totals"
            aria-live="polite"
            style={{
              marginTop: '0.5rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'stretch',
              justifyContent: 'space-between',
              gap: '1.25rem'
            }}
          >
            <div style={{ flex: '1 1 14rem', minWidth: 0 }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.75rem', fontWeight: 700 }}>
                Summary
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatLkr(subtotalRounded)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '0.65rem', fontSize: '0.9375rem' }}>
                <span style={{ color: '#64748b' }}>Shipping</span>
                <span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.875rem' }}>At checkout</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '1rem',
                  paddingTop: '0.65rem',
                  marginTop: '0.15rem',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Grand total</span>
                <span style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--gold-muted, #5F9EA0)' }}>{formatLkr(grandTotal)}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.65rem', marginBottom: 0, lineHeight: 1.45 }}>
                Subtotal and grand total reflect your bag now. Final amount may include delivery and taxes when you checkout.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', minWidth: 'min(100%, 14rem)' }}>
              {orderErr && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>{orderErr}</p>
              )}
              {user && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <span style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', color: '#475569' }}>Payment</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    Cash on delivery
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    Card (demo)
                  </label>
                </div>
              )}
              {user ? (
                <>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, border: 'none', cursor: placingOrder ? 'wait' : 'pointer', alignSelf: 'stretch', opacity: placingOrder ? 0.85 : 1 }}
                    disabled={placingOrder}
                    onClick={async () => {
                      setOrderErr('');
                      setPlacingOrder(true);
                      try {
                        const r = await fetchWithAuth('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ paymentMethod })
                        });
                        const data = await r.json().catch(() => ({}));
                        if (!r.ok) {
                          setOrderErr(data.message || 'Could not place order.');
                          return;
                        }
                        await refreshCart();
                        navigate('/profile', { state: { ordersTab: true } });
                      } catch {
                        setOrderErr('Something went wrong. Please try again.');
                      } finally {
                        setPlacingOrder(false);
                      }
                    }}
                  >
                    {placingOrder ? 'Placing order…' : 'Place order'}
                  </button>
                  <button
                    type="button"
                    style={{ padding: '0.65rem 1rem', borderRadius: '0.75rem', fontWeight: 600, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}
                    onClick={() => navigate('/products')}
                  >
                    Continue shopping
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', alignSelf: 'center' }}
                  onClick={() => navigate('/login')}
                >
                  Sign in to checkout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
