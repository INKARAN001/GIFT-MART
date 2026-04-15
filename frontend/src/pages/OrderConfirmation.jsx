import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageSrc } from '../utils/imageUrl';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';

const API = getApiBaseUrl();

function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
}

const DELIVERY_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { fetchWithAuth } = useAuth();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchWithAuth(`${API}/orders/${encodeURIComponent(orderId)}`);
        const data = await jsonFromResponse(r, {});
        if (!r.ok) throw new Error(data?.message || 'Order not found');
        if (!cancelled) setOrder(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Could not load order.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId, fetchWithAuth]);

  if (loading) {
    return <div className="page-loading" style={{ minHeight: '40vh' }}>Loading your order…</div>;
  }

  if (err || !order) {
    return (
      <div style={{ maxWidth: 560, margin: '2rem auto', padding: '1rem' }}>
        <p style={{ color: '#b91c1c' }}>{err || 'Order not found.'}</p>
        <Link to="/products">Continue shopping</Link>
      </div>
    );
  }

  const oid = order._id || order.id;
  const lines = Array.isArray(order.items) ? order.items : [];
  const ship = order.shippingAddress || {};
  const dStatus = order.deliveryStatus || 'processing';
  const dLabel = DELIVERY_LABELS[dStatus] || dStatus;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1px solid #6ee7b7',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h1 className="page-title" style={{ margin: '0 0 0.35rem', fontSize: '1.35rem' }}>Thank you!</h1>
        <p style={{ margin: 0, color: '#065f46', fontSize: '0.95rem' }}>
          Your order <strong>#{String(oid).slice(0, 8)}</strong> is confirmed. A confirmation has been recorded in your account.
        </p>
      </div>

      <section
        style={{
          background: 'var(--card-bg, #fff)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Delivery</h2>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.9rem' }}>
          <strong>Status:</strong> {dLabel}
        </p>
        {order.trackingNumber && (
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.9rem' }}>
            <strong>Tracking:</strong> {order.trackingNumber}
          </p>
        )}
        <p style={{ margin: '0.75rem 0 0.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Ship to
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
          {[ship.street, ship.city, ship.district, ship.state, ship.zip, ship.country].filter(Boolean).join(', ') || '—'}
        </p>
      </section>

      <section
        style={{
          background: 'var(--card-bg, #fff)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Items</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {lines.map((line, idx) => (
            <li
              key={`${line.productId}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0',
                borderBottom: idx < lines.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9' }}>
                {line.image ? (
                  <img src={getImageSrc(line.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{line.productName}</p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {line.quantity} × {formatLkr(line.unitPrice)}
                </p>
              </div>
              <span style={{ fontWeight: 700 }}>{formatLkr(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
        {(order.subtotal != null && order.subtotal > 0) && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
              <span>Items</span>
              <span>{formatLkr(order.subtotal)}</span>
            </div>
            {order.merchandiseFee != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>Merchandise (2%)</span>
                <span>{formatLkr(order.merchandiseFee)}</span>
              </div>
            )}
            {order.shippingFee != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>Shipping{order.distanceKm != null ? ` (~${order.distanceKm} km)` : ''}</span>
                <span>{formatLkr(order.shippingFee)}</span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--gold-muted, #5F9EA0)' }}>{formatLkr(order.total)}</span>
        </div>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
          Payment: {(order.paymentMethod || 'card').toUpperCase()} · {order.paymentStatus || '—'}
        </p>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/profile" state={{ ordersTab: true }} className="btn-primary" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: 10, fontWeight: 700 }}>
          View my orders
        </Link>
        <Link to="/products" style={{ alignSelf: 'center', fontWeight: 600, color: '#64748b' }}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
