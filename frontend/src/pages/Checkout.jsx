import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';
import { getImageSrc } from '../utils/imageUrl';
import SriLankaAddressFields from '../components/SriLankaAddressFields';
import { applyReverseGeocodeShipping } from '../data/sriLankaLocations';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const API = getApiBaseUrl();

/** Stored for `POST /orders/recover` if the client reloads before the order is persisted. */
const CHECKOUT_PAYLOAD_KEY = 'checkout_payload';
const LEGACY_CHECKOUT_RECOVER_KEY = 'giftmart_checkout_recover';

const MAP_STYLE = { width: '100%', height: '280px', borderRadius: 12 };

function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
}

/** Matches backend `CheckoutPricing.merchandiseFee` for instant line display before `/shipping/quote` returns. */
function merchandiseFeePreviewLkr(productSubtotalLkr) {
  const n = Math.round(Number(productSubtotalLkr) || 0);
  if (n <= 0) return 0;
  return Math.round(n * 0.02);
}

function PriceBreakdownCard({ hub, quote, quoteError, quoteBusy, subtotalRounded, intentLoading, checkoutStep }) {
  const merchLocal = merchandiseFeePreviewLkr(subtotalRounded);
  const hasQuote = !!(quote && !quoteError);
  const itemsLine = hasQuote ? quote.subtotal : subtotalRounded;
  const merchLine = hasQuote ? quote.merchandiseFee : merchLocal;
  const showShippingPending = !hasQuote && !quoteError && !quoteBusy;
  const showFirstFetchLoading = quoteBusy && !hasQuote && !quoteError;
  const showRefetchHint = quoteBusy && hasQuote && !quoteError;

  return (
    <section className="gm-card-surface">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Price breakdown</h2>
      {showFirstFetchLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0 0.75rem' }} aria-live="polite">
          <span className="gm-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} aria-hidden />
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Calculating shipping and total…</span>
        </div>
      )}
      {showRefetchHint && (
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className="gm-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden />
          Updating totals…
        </p>
      )}
      {quoteError && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{quoteError}</div>}
      {quote?.fallback && !quoteError && (
        <div
          role="status"
          style={{
            marginBottom: '0.75rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 8,
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.45)',
            fontSize: '0.85rem',
            color: '#854d0e',
          }}
        >
          Estimated shipping applied — live driving route was unavailable; distance may use a fallback method.
        </div>
      )}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '0.95rem' }}>
        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
          <span>Items</span>
          <span>{formatLkr(itemsLine)}</span>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
          <span>Merchandise fee (2%)</span>
          <span>{formatLkr(merchLine)}</span>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', alignItems: 'center' }}>
          <span>
            {hasQuote ? `Shipping (~${quote.distanceKm} km from ${hub.label})` : 'Shipping'}
          </span>
          <span style={{ textAlign: 'right' }}>
            {hasQuote && formatLkr(quote.shippingFee)}
            {showShippingPending && (
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 500 }}>Pin or full address</span>
            )}
          </span>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 0 0', marginTop: '0.5rem', borderTop: '2px solid #e2e8f0', fontWeight: 800, fontSize: '1.1rem' }}>
          <span>Total</span>
          <span>
            {hasQuote ? formatLkr(quote.grandTotalLkr) : <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>—</span>}
          </span>
        </li>
      </ul>
      {checkoutStep === 3 && intentLoading && quote && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="gm-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden />
          Syncing payment amount…
        </p>
      )}
      <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
        Shipping bands: under 15 km free; 15–100 km LKR 150; 100–200 LKR 300; 200–300 LKR 450; over 300 km LKR 550.
      </p>
    </section>
  );
}

function buildPayload(shipping, deliveryCoord) {
  const shippingAddress = {
    street: shipping.street?.trim() || '',
    city: shipping.city?.trim() || '',
    district: shipping.district?.trim() || '',
    state: shipping.state?.trim() || '',
    province: shipping.state?.trim() || '',
    zip: shipping.zip?.trim() || '',
    country: shipping.country?.trim() || 'Sri Lanka',
  };
  const body = { shippingAddress };
  if (deliveryCoord) {
    body.deliveryLat = deliveryCoord.lat;
    body.deliveryLng = deliveryCoord.lng;
  }
  return body;
}

function CheckoutStepper({ step }) {
  const labels = ['Cart summary', 'Address & shipping', 'Payment'];
  return (
    <div className="gm-stepper" role="navigation" aria-label="Checkout progress">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`gm-stepper__item ${step === n ? 'gm-stepper__item--active' : ''} ${step > n ? 'gm-stepper__item--done' : ''}`}
        >
          <div className="gm-stepper__circle" aria-current={step === n ? 'step' : undefined}>
            {step > n ? '✓' : n}
          </div>
          <span className="gm-stepper__label">{labels[n - 1]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, fetchWithAuth } = useAuth();
  const { items, subtotal, loading, refreshCart } = useCart();
  const idempotencyKeyRef = useRef(null);
  if (idempotencyKeyRef.current === null) {
    idempotencyKeyRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  const [checkoutStep, setCheckoutStep] = useState(1);

  const [hub, setHub] = useState({ lat: 9.6615, lng: 80.0255, label: 'Jaffna' });
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    district: '',
    state: '',
    zip: '',
    country: 'Sri Lanka',
  });
  const [deliveryCoord, setDeliveryCoord] = useState(null);
  const [geoBusy, setGeoBusy] = useState(false);

  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoteBusy, setQuoteBusy] = useState(false);

  const [clientSecret, setClientSecret] = useState(null);
  const [chargeInfo, setChargeInfo] = useState({ currency: '', amountMinor: 0, totalLkr: null });
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const submitLockRef = useRef(false);
  const debounceRef = useRef(null);

  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const paymentMountRef = useRef(null);
  const payElementRef = useRef(null);

  const mapCenter = useMemo(() => ({ lat: 8.2, lng: 80.6 }), []);

  useEffect(() => {
    fetch(`${API}/public/shipping/hub`)
      .then(async (r) => jsonFromResponse(r, {}))
      .then((d) => {
        if (d?.lat != null && d?.lng != null) {
          setHub({ lat: Number(d.lat), lng: Number(d.lng), label: d.label || 'Jaffna' });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    (async () => {
      const raw =
        sessionStorage.getItem(CHECKOUT_PAYLOAD_KEY) ||
        sessionStorage.getItem(LEGACY_CHECKOUT_RECOVER_KEY);
      if (!raw) return;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem(CHECKOUT_PAYLOAD_KEY);
        sessionStorage.removeItem(LEGACY_CHECKOUT_RECOVER_KEY);
        return;
      }
      const maxAge = 24 * 60 * 60 * 1000;
      if (!parsed.ts || Date.now() - parsed.ts > maxAge) {
        sessionStorage.removeItem(CHECKOUT_PAYLOAD_KEY);
        sessionStorage.removeItem(LEGACY_CHECKOUT_RECOVER_KEY);
        return;
      }
      const { payload } = parsed;
      if (!payload?.stripePaymentIntentId) {
        sessionStorage.removeItem(CHECKOUT_PAYLOAD_KEY);
        sessionStorage.removeItem(LEGACY_CHECKOUT_RECOVER_KEY);
        return;
      }
      try {
        const r = await fetchWithAuth(`${API}/orders/recover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await jsonFromResponse(r, {});
        if (cancelled) return;
        if (r.ok) {
          sessionStorage.removeItem(CHECKOUT_PAYLOAD_KEY);
          sessionStorage.removeItem(LEGACY_CHECKOUT_RECOVER_KEY);
          await refreshCart();
          const oid = data?._id || data?.id;
          if (oid) {
            navigate(`/order-confirmation/${encodeURIComponent(oid)}`, { replace: true });
          }
        }
      } catch {
        /* keep storage; user can refresh again */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, fetchWithAuth, navigate, refreshCart]);

  useEffect(() => {
    if (!user) return;
    fetchWithAuth(`${API}/users/profile`)
      .then(async (r) => jsonFromResponse(r, null))
      .then((p) => {
        if (!p) return;
        const a = p?.address;
        if (a) {
          setShipping((s) => ({
            ...s,
            street: a.street || '',
            city: a.city || '',
            district: a.district || '',
            state: a.state || '',
            zip: a.zip || '',
            country: a.country || s.country,
          }));
        }
      })
      .catch(() => {});
  }, [user, fetchWithAuth]);

  const fetchShippingQuote = useCallback(async () => {
    if (!user || items.length === 0) return;
    const addrOk = shipping.street?.trim() && shipping.city?.trim() && shipping.district?.trim() && shipping.state?.trim();
    if (!addrOk && !deliveryCoord) {
      setQuote(null);
      setQuoteError('');
      setQuoteBusy(false);
      return;
    }
    const body = buildPayload(shipping, deliveryCoord);
    setQuoteError('');
    setQuoteBusy(true);
    try {
      const qr = await fetchWithAuth(`${API}/shipping/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const qd = await jsonFromResponse(qr, {});
      if (!qr.ok) {
        setQuote(null);
        setQuoteError(qd?.error || 'Could not calculate delivery.');
        return;
      }
      setQuote(qd);
    } catch {
      setQuote(null);
      setQuoteError('Network error.');
    } finally {
      setQuoteBusy(false);
    }
  }, [
    user,
    items.length,
    shipping.street,
    shipping.city,
    shipping.district,
    shipping.state,
    shipping.zip,
    shipping.country,
    deliveryCoord?.lat,
    deliveryCoord?.lng,
    fetchWithAuth,
  ]);

  const fetchPaymentIntent = useCallback(async () => {
    if (!user || items.length === 0 || !quote) return;
    const addrOk = shipping.street?.trim() && shipping.city?.trim() && shipping.district?.trim() && shipping.state?.trim();
    if (!addrOk && !deliveryCoord) return;
    const body = buildPayload(shipping, deliveryCoord);
    setIntentError('');
    setIntentLoading(true);
    try {
      const pr = await fetchWithAuth(`${API}/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const pd = await jsonFromResponse(pr, {});
      if (!pr.ok) {
        setIntentError(pd?.error || 'Could not start payment.');
        setClientSecret(null);
        return;
      }
      if (pd.clientSecret) {
        setClientSecret(pd.clientSecret);
        setChargeInfo({
          currency: (pd.currency || '').toLowerCase(),
          amountMinor: Number(pd.amountMinor) || 0,
          totalLkr: pd.totalLkr != null ? Number(pd.totalLkr) : null,
        });
      }
    } catch {
      setIntentError('Could not reach server.');
      setClientSecret(null);
    } finally {
      setIntentLoading(false);
    }
  }, [
    user,
    items.length,
    quote,
    shipping.street,
    shipping.city,
    shipping.district,
    shipping.state,
    shipping.zip,
    shipping.country,
    deliveryCoord?.lat,
    deliveryCoord?.lng,
    fetchWithAuth,
  ]);

  /** Shipping totals: step 2+ as soon as address or map pin can be priced. */
  useEffect(() => {
    if (!user || items.length === 0) return undefined;
    if (checkoutStep < 2) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchShippingQuote();
    }, 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    user,
    items.length,
    checkoutStep,
    shipping.street,
    shipping.city,
    shipping.district,
    shipping.state,
    shipping.zip,
    shipping.country,
    deliveryCoord?.lat,
    deliveryCoord?.lng,
    fetchShippingQuote,
  ]);

  /** PaymentIntent only on payment step — avoids creating intents on every address keystroke. */
  useEffect(() => {
    if (checkoutStep !== 3 || !quote || quoteError) return undefined;
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) fetchPaymentIntent();
    }, 80);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [checkoutStep, quote, quoteError, fetchPaymentIntent]);

  /** Drop stale Stripe client when leaving payment step so amount always matches latest quote. */
  useEffect(() => {
    if (checkoutStep >= 3) return undefined;
    setClientSecret(null);
    setChargeInfo({ currency: '', amountMinor: 0, totalLkr: null });
    setIntentError('');
    return undefined;
  }, [checkoutStep]);

  useLayoutEffect(() => {
    if (!clientSecret || !STRIPE_PK || checkoutStep !== 3) {
      try {
        payElementRef.current?.destroy?.();
      } catch { /* ignore */ }
      payElementRef.current = null;
      stripeRef.current = null;
      elementsRef.current = null;
      return undefined;
    }
    const mountEl = paymentMountRef.current;
    if (!mountEl) return undefined;

    let destroyed = false;
    (async () => {
      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(STRIPE_PK);
        if (destroyed || !stripe) return;
        const elements = stripe.elements({
          clientSecret,
          appearance: { theme: 'stripe' },
        });
        const paymentElement = elements.create('payment', {
          layout: 'accordion',
          wallets: { applePay: 'never', googlePay: 'never' },
        });
        paymentElement.mount(mountEl);
        stripeRef.current = stripe;
        elementsRef.current = elements;
        payElementRef.current = paymentElement;
      } catch (e) {
        setErr('Failed to load Stripe. Set VITE_STRIPE_PUBLISHABLE_KEY in .env');
      }
    })();

    return () => {
      destroyed = true;
      try {
        payElementRef.current?.destroy?.();
      } catch { /* ignore */ }
      payElementRef.current = null;
      stripeRef.current = null;
      elementsRef.current = null;
    };
  }, [clientSecret, checkoutStep]);

  const useLiveLocation = () => {
    if (!navigator.geolocation) {
      setErr('Geolocation is not supported in this browser.');
      return;
    }
    const host = window.location.hostname;
    const localHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    if (!window.isSecureContext && !localHost) {
      setErr(
        'Browsers only allow location on secure pages. Open the site as https://… or use http://localhost (not an IP like http://192.168.x.x unless it is HTTPS).',
      );
      return;
    }

    setGeoBusy(true);
    setErr('');

    const readPosition = (highAccuracy) =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 28000 : 22000,
          maximumAge: 0,
        });
      });

    (async () => {
      try {
        if (navigator.permissions?.query) {
          try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            if (perm.state === 'denied') {
              setErr(
                'Location is blocked for this site. Click the lock or “site information” icon in the address bar → Permissions → Location → Allow, then try again.',
              );
              return;
            }
          } catch {
            /* Permissions API missing in some browsers */
          }
        }

        let pos;
        try {
          pos = await readPosition(true);
        } catch (e1) {
          if (e1?.code === 1) throw e1;
          if (e1?.code === 2 || e1?.code === 3) {
            pos = await readPosition(false);
          } else {
            throw e1;
          }
        }

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
          setErr('Got an invalid position from the browser. Try again or use the map.');
          return;
        }
        setDeliveryCoord({ lat, lng });
      } catch (error) {
        const code = error?.code;
        if (code === 1) {
          setErr(
            'Location permission denied. Choose “Allow” when the browser asks, or enable Location for this site in site settings, then try again.',
          );
        } else if (code === 2) {
          setErr(
            'Could not determine your position. On a phone, turn on GPS/location services. On a PC, Wi‑Fi location is approximate — try the map pin or type your address.',
          );
        } else if (code === 3) {
          setErr(
            'Location request timed out. Try again outdoors or with GPS on; or place the pin on the map / enter your address manually.',
          );
        } else {
          setErr(error?.message || 'Could not read your location. Use the map or type your address.');
        }
      } finally {
        setGeoBusy(false);
      }
    })();
  };

  useEffect(() => {
    if (!user || !deliveryCoord) return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await fetchWithAuth(`${API}/shipping/reverse-geocode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: deliveryCoord.lat, lng: deliveryCoord.lng }),
        });
        const data = await jsonFromResponse(r, {});
        if (cancelled || !r.ok) return;
        const pick = (v, prev) => (v != null && String(v).trim() !== '' ? String(v).trim() : prev);
        setShipping((s) => applyReverseGeocodeShipping(s, data, pick));
      } catch {
        /* ignore */
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, deliveryCoord?.lat, deliveryCoord?.lng, fetchWithAuth]);

  const placeOrderRequest = async (stripePaymentIntentId) => {
    const body = {
      paymentMethod: 'card',
      idempotencyKey: idempotencyKeyRef.current,
      ...buildPayload(shipping, deliveryCoord),
      stripePaymentIntentId,
    };
    const r = await fetchWithAuth(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await jsonFromResponse(r, {});
    if (!r.ok) {
      throw new Error(data?.message || 'Could not place order.');
    }
    try {
      sessionStorage.removeItem(CHECKOUT_PAYLOAD_KEY);
      sessionStorage.removeItem(LEGACY_CHECKOUT_RECOVER_KEY);
    } catch {
      /* ignore */
    }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (checkoutStep !== 3) return;
    if (!shipping.street?.trim() || !shipping.city?.trim() || !shipping.district?.trim() || !shipping.state?.trim()) {
      setErr('Please enter street, city, district, and province.');
      return;
    }
    if (!STRIPE_PK) {
      setErr('Missing VITE_STRIPE_PUBLISHABLE_KEY in frontend .env');
      return;
    }
    if (!clientSecret || !stripeRef.current || !elementsRef.current) {
      setErr('Payment is not ready. Wait for fees to calculate or fix errors above.');
      return;
    }
    if (submitLockRef.current || submitting) return;
    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/profile`,
        },
      });
      if (error) {
        setErr(error.message || 'Payment failed.');
        return;
      }
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        setErr('Payment was not completed.');
        return;
      }

      const recoverPayload = {
        paymentMethod: 'card',
        idempotencyKey: idempotencyKeyRef.current,
        ...buildPayload(shipping, deliveryCoord),
        stripePaymentIntentId: paymentIntent.id,
      };
      try {
        sessionStorage.setItem(CHECKOUT_PAYLOAD_KEY, JSON.stringify({ ts: Date.now(), payload: recoverPayload }));
      } catch {
        /* ignore quota / private mode */
      }

      const order = await placeOrderRequest(paymentIntent.id);
      await refreshCart();
      const oid = order._id || order.id;
      navigate(`/order-confirmation/${encodeURIComponent(oid)}`, { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Something went wrong.');
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const addressComplete = !!(shipping.street?.trim() && shipping.city?.trim() && shipping.district?.trim() && shipping.state?.trim());
  const paymentBlocked = intentLoading || !clientSecret || !STRIPE_PK || !!intentError || !addressComplete || !quote;

  const goToStep2 = () => setCheckoutStep(2);
  const goToStep3 = () => {
    setErr('');
    if (!addressComplete) {
      setErr('Please fill street, city, district, and province before continuing.');
      return;
    }
    setCheckoutStep(3);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 560, margin: '2rem auto', padding: '1rem', textAlign: 'center' }}>
        <p>Please sign in to checkout.</p>
        <Link to="/login">Sign in</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-loading page-loading--spinner" style={{ minHeight: '40vh' }}>
        <span className="gm-spinner" aria-hidden />
        <span>Loading your cart…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="gm-card-surface" style={{ maxWidth: 560, margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Your cart is empty.</p>
        <Link to="/cart" className="btn btn-primary">Back to cart</Link>
      </div>
    );
  }

  const subtotalRounded = Math.round(Number(subtotal) || 0);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem 4rem', position: 'relative' }}>
      {submitting && (
        <div className="gm-checkout-processing" role="alertdialog" aria-live="assertive" aria-busy="true">
          <span className="gm-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} aria-hidden />
          <span>Processing payment…</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.9 }}>Keep this window open until confirmation.</span>
        </div>
      )}

      <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Checkout</h1>
      <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        Step {checkoutStep} of 3 — Dispatch hub: <strong>{hub.label}</strong>. Merchandise fee is 2% of items; shipping is distance-based.
        {chargeInfo.currency === 'usd' && chargeInfo.amountMinor > 0 && checkoutStep === 3 && (
          <>
            {' '}Card charge: <strong>USD {(chargeInfo.amountMinor / 100).toFixed(2)}</strong>.
          </>
        )}
      </p>

      <CheckoutStepper step={checkoutStep} />

      {/* —— Step 1: Cart summary —— */}
      {checkoutStep === 1 && (
        <section className="gm-card-surface" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Order items</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((row) => {
              const p = row.product;
              const pid = row.productId;
              const name = p?.name || 'Product';
              const price = p?.price != null ? Number(p.price) : 0;
              const rawImg = p?.image || p?.imageUrl;
              const img = rawImg ? getImageSrc(rawImg) : '';
              const lineQty = Math.max(1, row.quantity || 1);
              const lineSubtotal = row.lineTotal != null ? row.lineTotal : price * lineQty;
              return (
                <li
                  key={pid}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9' }}>
                    {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f1f5f9', color: '#94a3b8', fontSize: '0.75rem' }}>No image</div>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{name}</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      {formatLkr(price)} × {lineQty}
                    </p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatLkr(lineSubtotal)}</span>
                </li>
              );
            })}
          </ul>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '2px solid #e2e8f0',
              fontSize: '1.05rem',
              fontWeight: 800,
            }}
          >
            <span>Items subtotal</span>
            <span>{formatLkr(subtotalRounded)}</span>
          </div>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            On the next step, totals update as you set your location or complete the address (items + 2% fee show right away; shipping when the server can compute distance).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={goToStep2}>
              Continue to address
            </button>
            <Link to="/cart" style={{ color: '#64748b', fontWeight: 600 }}>Edit cart</Link>
          </div>
        </section>
      )}

      {/* —— Step 2: Address & shipping —— */}
      {checkoutStep === 2 && (
        <>
          <section className="gm-card-surface" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Delivery location</h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              {GOOGLE_MAPS_KEY ? (
                <>
                  <strong>H</strong> is our hub in <strong>{hub.label}</strong>. Tap the map, drag the pin, or use <strong>Use my live location</strong>.
                </>
              ) : (
                <>
                  We ship from <strong>{hub.label}</strong>. Use live location or type your address. Add <code style={{ fontSize: '0.8rem' }}>VITE_GOOGLE_MAPS_API_KEY</code> for the map.
                </>
              )}
            </p>
            {GOOGLE_MAPS_KEY ? (
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
                <GoogleMap
                  mapContainerStyle={MAP_STYLE}
                  center={mapCenter}
                  zoom={7}
                  onClick={(e) => {
                    if (e.latLng) setDeliveryCoord({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }}
                >
                  <Marker position={{ lat: hub.lat, lng: hub.lng }} label="H" title={`Hub: ${hub.label}`} />
                  {deliveryCoord && (
                    <Marker
                      position={deliveryCoord}
                      draggable
                      onDragEnd={(e) => {
                        if (e.latLng) setDeliveryCoord({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                      }}
                      title="Delivery location"
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            ) : null}
            <div style={{ marginTop: GOOGLE_MAPS_KEY ? '0.75rem' : '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onClick={useLiveLocation}
                disabled={geoBusy}
              >
                {geoBusy ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="gm-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden />
                    Locating…
                  </span>
                ) : (
                  'Use my live location'
                )}
              </button>
              {deliveryCoord && (
                <button
                  type="button"
                  style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
                  onClick={() => setDeliveryCoord(null)}
                >
                  Clear location pin
                </button>
              )}
            </div>
          </section>

          <section className="gm-card-surface" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Delivery address</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
              Choose province (9) and district (25), then city — suggestions list major towns. Street uses common road name hints; you can type any address.
            </p>
            <SriLankaAddressFields shipping={shipping} setShipping={setShipping} idPrefix="checkout-addr" />
          </section>

          <PriceBreakdownCard
            hub={hub}
            quote={quote}
            quoteError={quoteError}
            quoteBusy={quoteBusy}
            subtotalRounded={subtotalRounded}
            intentLoading={intentLoading}
            checkoutStep={2}
          />

          {err && checkoutStep === 2 && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{err}</div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setErr(''); setCheckoutStep(1); }}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={goToStep3}>
              Continue to payment
            </button>
          </div>
        </>
      )}

      {/* —— Step 3: Summary + payment —— */}
      {checkoutStep === 3 && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PriceBreakdownCard
            hub={hub}
            quote={quote}
            quoteError={quoteError}
            quoteBusy={quoteBusy}
            subtotalRounded={subtotalRounded}
            intentLoading={intentLoading}
            checkoutStep={3}
          />

          <section className="gm-card-surface">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Payment</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Card only. Total includes items, 2% merchandise fee, and distance-based shipping.
            </p>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Need help estimating amounts?{' '}
              <Link to="/amount-calculator" style={{ fontWeight: 600, color: 'var(--primary, #e84393)' }}>
                Open amount calculator
              </Link>
            </p>

            {intentError && (
              <div className="alert alert-danger" style={{ margin: '0.5rem 0' }}>{intentError}</div>
            )}
            {!STRIPE_PK && (
              <p style={{ color: '#b45309', fontSize: '0.85rem' }}>
                Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in <code>frontend/.env</code>.
              </p>
            )}
            {clientSecret && STRIPE_PK && (
              <div style={{ marginTop: '1rem', minHeight: intentLoading ? 120 : undefined }}>
                <div ref={paymentMountRef} id="payment-element" />
              </div>
            )}
          </section>

          {err && (
            <div className="alert alert-danger" style={{ margin: 0 }}>{err}</div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={submitting}
              onClick={() => { setErr(''); setCheckoutStep(2); }}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || paymentBlocked}
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: submitting || paymentBlocked ? 'not-allowed' : 'pointer',
                opacity: paymentBlocked ? 0.65 : 1,
                pointerEvents: submitting ? 'none' : 'auto',
              }}
              aria-busy={submitting}
            >
              {submitting ? 'Processing payment…' : 'Pay & place order'}
            </button>
            <Link to="/cart" style={{ color: '#64748b', fontWeight: 600 }}>Edit cart</Link>
          </div>
        </form>
      )}
    </div>
  );
}
