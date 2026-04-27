import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';

const API = getApiBaseUrl();

export default function Feedback() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setEmail((prev) => prev || user.email || '');
    setName((prev) => prev || user.name || '');
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');
    const em = email.trim();
    const msg = message.trim();
    if (!em || !em.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (msg.length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/public/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: em,
          name: name.trim(),
          message: msg,
        }),
      });
      const data = await jsonFromResponse(res, {});
      if (!res.ok) {
        setError(data?.message || 'Could not send feedback.');
        return;
      }
      setSuccessMsg(data?.message || 'Thanks — we received your message.');
      setMessage('');
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-16">
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-slate-700 dark:text-slate-300">Feedback</span>
      </nav>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">Send feedback to Gift Mart</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
        Questions, compliments, or issues — our team reads every message.
      </p>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 sm:p-8 shadow-sm">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Your name (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="We may reply to this address"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea
              required
              rows={5}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 resize-y min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what’s on your mind (at least 10 characters)"
              minLength={10}
              maxLength={4000}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700 px-4 py-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              {successMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-3 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      </section>

      <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
        Need to check an order?{' '}
        <Link to="/track-order" className="text-primary font-semibold hover:underline">
          Track your order
        </Link>
      </p>
    </div>
  );
}
