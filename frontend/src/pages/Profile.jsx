import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageSrc } from '../utils/imageUrl';
import { FEATURES } from '../config/features';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';
import SriLankaAddressFields from '../components/SriLankaAddressFields';

const API = getApiBaseUrl();

const DELIVERY_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

function deliveryBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return 'gm-order-badge gm-order-badge--delivered';
  if (s === 'shipped') return 'gm-order-badge gm-order-badge--shipped';
  if (s === 'out_for_delivery') return 'gm-order-badge gm-order-badge--out';
  if (s === 'processing') return 'gm-order-badge gm-order-badge--processing';
  return 'gm-order-badge gm-order-badge--default';
}

function OrdersSkeleton() {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-hidden>
      {[1, 2, 3].map((k) => (
        <li key={k} className="gm-card-surface" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
            <div className="gm-skeleton" style={{ height: 18, width: 120 }} />
            <div className="gm-skeleton" style={{ height: 22, width: 80 }} />
          </div>
          <div className="gm-skeleton" style={{ height: 14, width: '60%', marginBottom: '0.5rem' }} />
          <div className="gm-skeleton" style={{ height: 56, width: '100%', borderRadius: 10 }} />
        </li>
      ))}
    </ul>
  );
}

function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
}

export default function Profile() {
  const { fetchWithAuth, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'orders'
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    district: '',
    state: '',
    zip: '',
    country: 'Sri Lanka',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifyEventReminders, setNotifyEventReminders] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (location.state?.ordersTab) {
      setActiveTab('orders');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    fetchWithAuth(`${API}/users/profile`)
      .then(async (r) => jsonFromResponse(r, null))
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setName(data?.name || '');
        setPhone(data?.phone || '');
        const a = data?.address;
        setAddress({
          street: a?.street || '',
          city: a?.city || '',
          district: a?.district || '',
          state: a?.state || '',
          zip: a?.zip || '',
          country: a?.country || 'Sri Lanka',
        });
        setNotifyEventReminders(data?.notifyEventReminders !== false);
        setNotifyPromotions(data?.notifyPromotions !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError('');
    fetchWithAuth(`${API}/users/orders`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Could not load orders');
        return jsonFromResponse(r, []);
      })
      .then((data) => {
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setOrdersError('Failed to load your orders.');
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, fetchWithAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth(`${API}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        phone,
        address,
        notifyEventReminders,
        notifyPromotions,
      })
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/users/change-password`, {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await jsonFromResponse(res, {});
      if (res.ok) {
        setPasswordMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data?.message || 'Failed to change password.');
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading page-loading--spinner" style={{ minHeight: '40vh' }}>
        <span className="gm-spinner" aria-hidden />
        <span>Loading your account…</span>
      </div>
    );
  }
  if (!profile) return <p>Failed to load profile.</p>;

  return (
    <div style={{ maxWidth: activeTab === 'orders' ? '800px' : '600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>My Account</h1>
          <p style={{ color: 'var(--text-muted, #888)', margin: 0, fontSize: '0.9rem' }}>{profile.email}</p>
        </div>
        <button className="btn btn-danger" onClick={logout} style={{ flexShrink: 0 }}>Log Out</button>
      </div>

      {(user?.role || '').toLowerCase() === 'admin' && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.9rem 1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(95, 158, 160, 0.12), rgba(232, 67, 147, 0.08))',
            border: '1px solid rgba(95, 158, 160, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted, #555)', margin: 0 }}>
            You have admin access — manage orders, products, and reviews.
          </span>
          <Link to="/admin" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Open admin panel
          </Link>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        background: 'var(--card-bg, #f5f5f5)',
        padding: '0.35rem',
        borderRadius: '10px'
      }}>
        {[
          { id: 'profile', label: '👤 Profile' },
          { id: 'orders', label: '📦 My orders' },
          { id: 'password', label: '🔒 Change Password' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'var(--primary, #e84393)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted, #666)',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div style={{
          background: 'var(--card-bg, #fff)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
        }}>
          {saved && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>✅ Profile updated successfully.</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" value={profile.email || ''} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-control"
                value={name}
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                className="form-control"
                value={phone}
                placeholder="+94 77 123 4567"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.25rem 0 0.75rem', color: 'var(--text-muted, #555)' }}>
              📍 Delivery Address
            </h3>
            <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
              Province (9) and district (25) lists match Sri Lanka; city suggests major towns. Street field includes common road name hints.
            </p>
            <SriLankaAddressFields
              shipping={address}
              setShipping={setAddress}
              idPrefix="profile-addr"
              addressRequired={false}
              labels={{ province: 'Province', district: 'District', street: 'Street / address', zip: 'Postal code' }}
            />

            {(FEATURES.REMINDERS || FEATURES.PROMOS) && (
              <>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.25rem 0 0.75rem', color: 'var(--text-muted, #555)' }}>
                  Email &amp; notifications
                </h3>
                {FEATURES.REMINDERS && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.85rem', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1.45 }}>
                    <input
                      type="checkbox"
                      checked={notifyEventReminders}
                      onChange={(e) => setNotifyEventReminders(e.target.checked)}
                      style={{ marginTop: '0.2rem' }}
                      aria-checked={notifyEventReminders}
                    />
                    <span>
                      <strong>Event reminder emails</strong>
                      <br />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #888)' }}>Email the day before dates you save under Reminders.</span>
                    </span>
                  </label>
                )}
                {FEATURES.PROMOS && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1.45 }}>
                    <input
                      type="checkbox"
                      checked={notifyPromotions}
                      onChange={(e) => setNotifyPromotions(e.target.checked)}
                      style={{ marginTop: '0.2rem' }}
                      aria-checked={notifyPromotions}
                    />
                    <span>
                      <strong>Promotional emails</strong>
                      <br />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #888)' }}>Offers and product news (you can unsubscribe anytime).</span>
                    </span>
                  </label>
                )}
                {profile?.unsubscribeToken && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #888)', margin: '0 0 0.5rem', lineHeight: 1.45 }}>
                    One-click unsubscribe from emails:{' '}
                    <Link to={`/unsubscribe?t=${encodeURIComponent(profile.unsubscribeToken)}&channel=all`}>
                      all emails
                    </Link>
                    {FEATURES.REMINDERS && (
                      <>
                        {' · '}
                        <Link to={`/unsubscribe?t=${encodeURIComponent(profile.unsubscribeToken)}&channel=reminders`}>
                          reminders only
                        </Link>
                      </>
                    )}
                    {FEATURES.PROMOS && (
                      <>
                        {' · '}
                        <Link to={`/unsubscribe?t=${encodeURIComponent(profile.unsubscribeToken)}&channel=promotions`}>
                          promotions only
                        </Link>
                      </>
                    )}
                  </p>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              💾 Save Profile
            </button>
          </form>
        </div>
      )}

      {/* ── My orders Tab ── */}
      {activeTab === 'orders' && (
        <div style={{
          background: 'var(--card-bg, #fff)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 0, marginBottom: '0.75rem' }}>Order history</h2>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Products from orders you have placed appear here.
          </p>
          {ordersLoading && (
            <div aria-busy="true" aria-live="polite">
              <p style={{ color: 'var(--text-muted, #888)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="gm-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} aria-hidden />
                Loading your orders…
              </p>
              <OrdersSkeleton />
            </div>
          )}
          {ordersError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{ordersError}</div>}
          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="gm-card-surface" style={{ textAlign: 'center', padding: '2.25rem 1.25rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                No orders yet
              </p>
              <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted, #64748b)', fontSize: '0.92rem' }}>
                Completed purchases appear here with status and any tracking details.
              </p>
              <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Browse products</Link>
            </div>
          )}
          {!ordersLoading && orders.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => {
                const oid = order._id || order.id || '';
                const shortId = oid.length > 8 ? `${oid.slice(0, 8)}…` : oid;
                const created = order.createdAt ? new Date(order.createdAt) : null;
                const dateStr = created && !Number.isNaN(created.getTime()) ? created.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
                const method = (order.paymentMethod || 'card').toUpperCase();
                const payStatus = order.paymentStatus || 'pending';
                const lines = Array.isArray(order.items) ? order.items : [];
                return (
                  <li
                    key={oid || Math.random()}
                    className="gm-card-surface"
                    style={{
                      overflow: 'hidden',
                      padding: 0,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '1rem 1.15rem',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderBottom: '1px solid var(--border-color, #e2e8f0)'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary, #0f172a)' }}>
                          Order #{shortId}
                        </p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>{dateStr}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--gold-muted, #5F9EA0)' }}>{formatLkr(order.total)}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                          {method} · {payStatus}
                        </p>
                        <p style={{ margin: '0.45rem 0 0' }}>
                          <span className={deliveryBadgeClass(order.deliveryStatus)}>
                            {DELIVERY_LABELS[order.deliveryStatus] || order.deliveryStatus || 'Status'}
                          </span>
                        </p>
                        {order.trackingNumber && (
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem 0' }}>
                      {lines.map((line, idx) => {
                        const pid = line.productId;
                        const src = getImageSrc(line.image || '');
                        return (
                          <li
                            key={`${oid}-${pid}-${idx}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.65rem 1.15rem',
                              borderBottom: idx < lines.length - 1 ? '1px solid #f1f5f9' : 'none'
                            }}
                          >
                            <div style={{ width: 56, height: 56, borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                              {src ? (
                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : null}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Link
                                to={`/product/${encodeURIComponent(pid)}`}
                                style={{ fontWeight: 700, color: 'var(--primary, #5F9EA0)', textDecoration: 'none', fontSize: '0.95rem' }}
                              >
                                {line.productName || 'Product'}
                              </Link>
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                {line.quantity} × {formatLkr(line.unitPrice)}
                              </p>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{formatLkr(line.lineTotal)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Change Password Tab ── */}
      {activeTab === 'password' && (
        <div style={{
          background: 'var(--card-bg, #fff)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: 0 }}>🔒 Change Password</h2>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Enter your current password and choose a new one.
          </p>

          {passwordMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✅ {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              ❌ {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                id="current-password"
                type="password"
                className="form-control"
                placeholder="Your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Updating...' : '🔐 Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
