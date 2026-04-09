import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import flashCardsImg from '../Flash cards/1.jpeg';
import boquetImg from '../boquet/1.jpeg';
import framesImg from '../frames/1.jpeg';
import giftBoxImg from '../gift box/1.jpeg';
import CategoryCarousel from '../components/home/CategoryCarousel';

const FALLBACK_IMAGES = [flashCardsImg, boquetImg, framesImg, giftBoxImg];

/** Used only if /api/categories is empty or fails — slugs must match Category documents. */
const STATIC_CATEGORY_FALLBACK = [
  { name: 'Flash Cards', slug: 'flash-cards', tagline: 'Aesthetic', overlay: 'Trending' },
  { name: 'Bouquet', slug: 'bouquets', tagline: 'Hand-picked Elegance', overlay: 'New' },
  { name: 'Frames', slug: 'frames', tagline: 'Preserve Your Memories', overlay: 'Bestseller' },
  { name: 'Gift Box', slug: 'gift-boxes', tagline: 'Pre-curated Perfection', overlay: 'Popular' },
];

// Stricter format: local part + @ + domain with at least one dot, sensible length
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

// Common disposable/temporary email domains — blocks obvious fake signups
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org', '10minutemail.com',
  'throwaway.email', 'fakeinbox.com', 'trashmail.com', 'mailinator.com', 'yopmail.com',
  'getnada.com', 'mailnesia.com', 'sharklasers.com', 'guerrillamail.info', 'grr.la',
  'dispostable.com', 'maildrop.cc', 'tempinbox.com', 'mohmal.com', 'emailondeck.com',
  'mintemail.com', 'tempail.com', 'anonymbox.com', 'discard.email', 'tmpeml.com',
]);

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : true;
}

export default function Home() {
  const [shopCategories, setShopCategories] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/categories');
        if (!cancelled) setShopCategories(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setShopCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categoryCards = (shopCategories && shopCategories.length > 0)
    ? shopCategories.map((cat, idx) => ({
        ...cat,
        image: cat.image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
        tagline: cat.tagline || cat.description || STATIC_CATEGORY_FALLBACK[idx % STATIC_CATEGORY_FALLBACK.length]?.tagline || '',
        overlay: cat.overlay || 'Trending',
      }))
    : STATIC_CATEGORY_FALLBACK.map((cat, idx) => ({
        ...cat,
        image: FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
      }));

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [pendingEmail, setPendingEmail] = useState('');
  const [sentCode, setSentCode] = useState(''); // when API returns code (e.g. mail not sent), show on screen
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  async function handleSendCode(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    if (trimmed.length > MAX_EMAIL_LENGTH) {
      setStatus('error');
      setMessage('Email address is too long.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    if (isDisposableEmail(trimmed)) {
      setStatus('error');
      setMessage('Please use a permanent email address (e.g. Gmail, Outlook). Temporary email addresses are not allowed.');
      return;
    }
    setStatus('loading');
    setMessage('');
    setSentCode('');
    try {
      const res = await api.post('/newsletter/send-code', { email: trimmed });
      setPendingEmail(trimmed);
      setStep('code');
      setStatus('idle');
      setMessage('');
      setCode('');
      if (res.data?.code) setSentCode(res.data.code);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Could not send code. Please try again.');
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    const trimmedCode = code.trim().replace(/\s/g, '');
    if (!trimmedCode) {
      setStatus('error');
      setMessage('Please enter the code we sent to your email.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await api.post('/newsletter/verify', { email: pendingEmail, code: trimmedCode });
      setStatus('success');
      setMessage("You're subscribed! We'll be in touch.");
      setStep('email');
      setPendingEmail('');
      setSentCode('');
      setEmail('');
      setCode('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Invalid or expired code. Please try again or request a new code.');
    }
  }

  async function handleResendCode() {
    setStatus('loading');
    setMessage('');
    try {
      const res = await api.post('/newsletter/send-code', { email: pendingEmail });
      setStatus('idle');
      setMessage('We sent a new code to your email.');
      setCode('');
      if (res.data?.code) setSentCode(res.data.code);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Could not resend code. Please try again.');
    }
  }

  return (
    <>
      {/* Hero Section with Video Background */}
      <section className="relative w-full overflow-hidden bg-slate-900 md:h-[85vh] h-[70vh] min-h-[320px] flex items-center justify-center">
        <video
          className="w-full h-full object-contain md:object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/Beige Simple Welcome Video.mp4" type="video/mp4" />
        </video>
        {/* Trending overlay label — UI/UX focus */}
        <span className="overlay-hero-label">Trending Now</span>
        <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-8 z-10 text-center">
          <p className="text-white/95 text-sm md:text-base font-semibold uppercase tracking-[0.25em] drop-shadow-lg">Curated for You</p>
        </div>
      </section>

      {/* Shop Collection CTA below video */}
      <section className="flex justify-center py-10 bg-background-light dark:bg-background-dark">
        <Link
          to="/products"
          className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 transition-all inline-block"
        >
          Shop Collection
        </Link>
      </section>

      {/* Category carousel */}
      <main id="categories" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="section-label">Curated Categories</span>
            <h3 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">Gifts for every chapter of life</h3>
          </div>
          <Link to="/products" className="text-primary font-bold flex items-center gap-2 group">
            View All Collections
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        <CategoryCarousel categoryCards={categoryCards} />
      </main>

      {/* Call to Action */}
      <section className="bg-primary/5 dark:bg-primary/10 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="font-serif text-4xl md:text-5xl mb-6 text-slate-900 dark:text-white">Join the Art of Giving</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">
            {step === 'email'
              ? 'Subscribe for exclusive updates, gifting inspiration, and first access to seasonal collections. We\'ll send a verification code to confirm your email.'
              : `We sent a verification code to ${pendingEmail}. Enter it below to confirm your subscription.`}
          </p>

          {step === 'email' ? (
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSendCode}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary focus:border-primary px-6 py-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-60"
                aria-invalid={status === 'error'}
                aria-describedby={message ? 'newsletter-message' : undefined}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending code…' : 'Send code'}
              </button>
            </form>
          ) : (
            <>
              {sentCode && (
                <p className="mb-4 text-center text-slate-600 dark:text-slate-400 text-sm">
                  Couldn’t send email? Your code: <strong className="text-primary font-mono text-lg tracking-widest">{sentCode}</strong>
                </p>
              )}
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleVerify}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={status === 'loading'}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary focus:border-primary px-6 py-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-60 text-center text-xl tracking-[0.4em] font-mono"
                  maxLength={6}
                  aria-invalid={status === 'error'}
                  aria-describedby={message ? 'newsletter-message' : undefined}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Verifying…' : 'Confirm'}
                </button>
              </form>
            </>
          )}

          {step === 'code' && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={status === 'loading'}
                className="text-primary font-medium hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setPendingEmail(''); setCode(''); setSentCode(''); setStatus('idle'); setMessage(''); }}
                disabled={status === 'loading'}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-60"
              >
                Use a different email
              </button>
            </div>
          )}

          {message && (
            <p
              id="newsletter-message"
              role="alert"
              className={`mt-4 text-sm ${status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {message}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
