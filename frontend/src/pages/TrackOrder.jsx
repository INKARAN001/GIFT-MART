import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';

const API = getApiBaseUrl();

const DELIVERY_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
}

export default function TrackOrder() {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  useEffect(() => {
    if (!user) return;
    setEmail((prev) => prev || user.email || '');
  }, [user]);

  const submitTrack = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);
    const oid = orderId.trim();
    const em = email.trim();
    if (!oid || !em) {
      setTrackError('Enter your order ID and the email used when you placed the order.');
      return;
    }
    setTrackLoading(true);
    try {
      const res = await fetch(`${API}/public/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: oid, email: em }),
      });
      const data = await jsonFromResponse(res, {});
      if (!res.ok) {
        setTrackError(data?.message || 'Order not found. Check the ID and email, or sign in and view My orders.');
        return;
      }
      setTrackResult(data);
    } catch {
      setTrackError('Could not reach the server. Try again.');
    } finally {
      setTrackLoading(false);
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
        <span className="text-slate-700 dark:text-slate-300">Track order</span>
      </nav>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">Track your order</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
        Enter the order ID from your confirmation email and the email address on your account. If you’re signed in, you
        can also view orders under{' '}
        <Link to="/profile" className="text-primary font-semibold hover:underline">
          My account → My orders
        </Link>
        .
      </p>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 sm:p-8 shadow-sm">
        <form onSubmit={submitTrack} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Order ID</label>
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 674a… (from confirmation email)"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Same email you used when ordering"
            />
          </div>
          {trackError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700 px-4 py-3 text-sm text-red-800 dark:text-red-200">
              {trackError}
            </div>
          )}
          <button
            type="submit"
            disabled={trackLoading}
            className="rounded-full bg-primary text-white font-bold px-8 py-3 hover:brightness-105 disabled:opacity-60"
          >
            {trackLoading ? 'Looking up…' : 'Track order'}
          </button>
        </form>

        {trackResult && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Order status</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Order</dt>
                <dd className="font-mono text-slate-900 dark:text-white break-all">{trackResult._id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Total</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{formatLkr(trackResult.total)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="text-slate-900 dark:text-white">
                  {DELIVERY_LABELS[trackResult.deliveryStatus] || trackResult.deliveryStatus || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Tracking #</dt>
                <dd className="font-mono text-slate-900 dark:text-white">{trackResult.trackingNumber || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Payment</dt>
                <dd className="text-slate-900 dark:text-white">{trackResult.paymentStatus || '—'}</dd>
              </div>
              {(trackResult.shipToCity || trackResult.shipToDistrict) && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Ship to</dt>
                  <dd className="text-slate-900 dark:text-white text-right">
                    {[trackResult.shipToDistrict, trackResult.shipToCity].filter(Boolean).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </section>

      <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
        Want to send a message to our team?{' '}
        <Link to="/feedback" className="text-primary font-semibold hover:underline">
          Send feedback
        </Link>
      </p>
    </div>
  );
}
