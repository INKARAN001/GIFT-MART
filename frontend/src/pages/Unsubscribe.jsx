import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';

const API = getApiBaseUrl();

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const t = params.get('t') || '';
  const channel = params.get('channel') || 'all';
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!t) {
      setErr('This link is invalid.');
      return;
    }
    const q = new URLSearchParams({ t, channel });
    fetch(`${API}/public/unsubscribe?${q.toString()}`)
      .then(async (r) => jsonFromResponse(r, {}))
      .then((data) => {
        if (data?.message) setMsg(data.message);
        else setErr('Something went wrong.');
        setDone(true);
      })
      .catch(() => setErr('Could not update preferences.'));
  }, [t, channel]);

  return (
    <div style={{ maxWidth: 520, margin: '3rem auto', padding: '1.5rem', textAlign: 'center' }}>
      <h1 className="page-title" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Email preferences</h1>
      {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
      {!done && !err && (
        <div className="page-loading--spinner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', minHeight: 120 }}>
          <span className="gm-spinner" aria-hidden />
          <span style={{ color: '#64748b' }}>Updating your preferences…</span>
        </div>
      )}
      {done && !err && (
        <div className="gm-card-surface" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#065f46', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
            You have been unsubscribed successfully.
          </p>
          {msg && (
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5 }}>{msg}</p>
          )}
        </div>
      )}
      <p style={{ marginTop: '1.75rem' }}>
        <Link to="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>Back to Gift Mart</Link>
      </p>
    </div>
  );
}
