import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = '/api';

function formatWhen(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(d);
  }
}

function toDatetimeLocalValue(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Reminders() {
  const { fetchWithAuth } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${API}/reminders`);
      if (r.ok) setList(await r.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setRemindAt('');
    setEditing(null);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!remindAt) {
      setError('Choose a date and time.');
      return;
    }
    const body = {
      title: title.trim(),
      message: message.trim() || undefined,
      remindAt: new Date(remindAt).toISOString()
    };
    try {
      const url = editing ? `${API}/reminders/${editing}` : `${API}/reminders`;
      const method = editing ? 'PUT' : 'POST';
      const r = await fetchWithAuth(url, { method, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.message || 'Could not save');
        return;
      }
      resetForm();
      load();
    } catch {
      setError('Network error');
    }
  };

  const startEdit = (r) => {
    setEditing(r._id || r.id);
    setTitle(r.title || '');
    setMessage(r.message || '');
    setRemindAt(toDatetimeLocalValue(r.remindAt));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    const r = await fetchWithAuth(`${API}/reminders/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (r.ok) load();
  };

  if (loading) {
    return <div className="page-loading" style={{ minHeight: '50vh' }}>Loading reminders…</div>;
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Reminders</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Never miss a birthday or special date — we will help you track what matters. The day before your event, we email you at your account address so you get a heads-up.
      </p>

      <form onSubmit={submit} style={{ marginBottom: '2.5rem', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#fff' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>{editing ? 'Edit reminder' : 'New reminder'}</h2>
        {error && <p role="alert" style={{ color: '#dc2626', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginBottom: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
          placeholder="e.g. Mom’s birthday"
        />
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Note (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginBottom: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', resize: 'vertical' }}
        />
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Remind me at</label>
        <input
          type="datetime-local"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
          style={{ width: '100%', maxWidth: '360px', marginBottom: '1rem', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            {editing ? 'Save changes' : 'Create reminder'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your reminders</h2>
      {list.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No reminders yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {list.map((r) => {
            const id = r._id || r.id;
            return (
              <li
                key={id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, color: '#0f172a' }}>{r.title}</p>
                  {r.message && <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{r.message}</p>}
                  <p style={{ color: '#5F9EA0', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>{formatWhen(r.remindAt)}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => startEdit(r)} style={{ padding: '0.35rem 0.65rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => del(id)} style={{ padding: '0.35rem 0.65rem', borderRadius: '0.4rem', border: 'none', background: 'rgba(220,38,38,0.1)', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    Delete
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
