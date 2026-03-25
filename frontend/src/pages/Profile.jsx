import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = '/api';

export default function Profile() {
  const { fetchWithAuth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
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
