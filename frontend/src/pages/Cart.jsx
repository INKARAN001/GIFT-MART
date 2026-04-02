import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageSrc } from '../utils/imageUrl';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, subtotal, itemCount, loading, updateQuantity, removeItem } = useCart();

  if (loading) {
    return <div className="page-loading" style={{ minHeight: '50vh' }}>Loading cart…</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary, #0f172a)' }}>
        Shopping bag
      </h1>
      <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '2rem' }}>
        {itemCount === 0 ? 'Your cart is empty.' : `${itemCount} item${itemCount === 1 ? '' : 's'}`}
      </p>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #e2e8f0)',
            background: 'var(--surface-light, #f8fafc)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#94a3b8' }}>shopping_bag</span>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Browse the shop and add gifts you love.</p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1.25rem', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700 }}>
            Continue shopping
          </Link>
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
              const img = p?.image ? getImageSrc(p.image) : '';
              const lineQty = row.quantity || 1;

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
                    <p style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.9rem' }}>LKR {price.toLocaleString()} each</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={unavailable}
                        onClick={() => {
                          if (lineQty <= 1) removeItem(pid);
                          else updateQuantity(pid, lineQty - 1);
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          cursor: unavailable ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>remove</span>
                      </button>
                      <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{lineQty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={unavailable}
                        onClick={() => updateQuantity(pid, lineQty + 1)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          cursor: unavailable ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(pid)}
                        style={{ marginLeft: '0.5rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--gold-muted, #5F9EA0)' }}>
                    LKR {(row.lineTotal != null ? row.lineTotal : price * lineQty).toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            style={{
              marginTop: '0.5rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.25rem' }}>Subtotal</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>LKR {subtotal.toLocaleString()}</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>Shipping and taxes calculated at checkout.</p>
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              onClick={() => {
                if (!user) navigate('/login');
                else navigate('/products');
              }}
            >
              {user ? 'Continue shopping' : 'Sign in to checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
