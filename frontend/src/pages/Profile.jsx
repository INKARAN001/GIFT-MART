import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageSrc } from '../utils/imageUrl';

const API = '/api';

function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
}

export default function Profile() {
  const { fetchWithAuth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'orders'
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data?.name || '');
        setPhone(data?.phone || '');
        setAddress(data?.address || { street: '', city: '', state: '', zip: '', country: '' });
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
      .then((r) => {
        if (!r.ok) throw new Error('Could not load orders');
        return r.json();
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
      body: JSON.stringify({ name, phone, address })
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
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Failed to change password.');
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
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
                placeholder="+91 9876543210"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.25rem 0 0.75rem', color: 'var(--text-muted, #555)' }}>
              📍 Delivery Address
            </h3>
            <div className="form-group">
              <label>Street</label>
              <input
                className="form-control"
                value={address.street || ''}
                placeholder="123 Main St"
                onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  className="form-control"
                  value={address.city || ''}
                  placeholder="Mumbai"
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  className="form-control"
                  value={address.state || ''}
                  placeholder="Maharashtra"
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  className="form-control"
                  value={address.zip || ''}
                  placeholder="400001"
                  onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  className="form-control"
                  value={address.country || ''}
                  placeholder="India"
                  onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                />
              </div>
            </div>
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
          {ordersLoading && <p style={{ color: 'var(--text-muted, #888)' }}>Loading orders…</p>}
          {ordersError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{ordersError}</div>}
          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--surface-light, #f8fafc)' }}>
              <p style={{ margin: '0 0 1rem', color: 'var(--text-muted, #64748b)' }}>You haven&apos;t placed any orders yet.</p>
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
                const method = (order.paymentMethod || 'cod').toUpperCase();
                const payStatus = order.paymentStatus || 'pending';
                const lines = Array.isArray(order.items) ? order.items : [];
                return (
                  <li
                    key={oid || Math.random()}
                    style={{
                      border: '1px solid var(--border-color, #e2e8f0)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: 'var(--card-bg, #fff)'
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
