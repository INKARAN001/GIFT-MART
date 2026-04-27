import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getApiBaseUrl } from '../utils/apiBase';
import { jsonFromResponse } from '../utils/jsonResponse';
import SriLankaAddressFields from '../components/SriLankaAddressFields';
import { applyReverseGeocodeShipping } from '../data/sriLankaLocations';

const API = getApiBaseUrl();

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_STYLE = { width: '100%', height: '280px', borderRadius: 12 };

function formatLkr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `LKR ${n.toLocaleString()}`;
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

export default function AmountCalculator() {
  const { user, fetchWithAuth } = useAuth();
  const { items, subtotal } = useCart();
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
  const [quote, setQuote] = useState(null);
  const [err, setErr] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);
  const debounceRef = useRef(null);
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
    if (!user) return;
    fetchWithAuth(`${API}/users/profile`)
      .then(async (r) => jsonFromResponse(r, null))
      .then((p) => {
        if (!p) return;
        const a = p?.address;
        if (!a) return;
        setShipping((s) => ({
          ...s,
          street: a.street || s.street,
          city: a.city || s.city,
          district: a.district || s.district,
          state: a.state || s.state,
          zip: a.zip || s.zip,
          country: a.country || s.country,
        }));
      })
      .catch(() => {});
  }, [user, fetchWithAuth]);

  useEffect(() => {
    if (!user || items.length === 0) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const addrOk = shipping.street?.trim() && shipping.city?.trim() && shipping.district?.trim() && shipping.state?.trim();
      if (!addrOk && !deliveryCoord) {
        setQuote(null);
        setErr('Enter street/city/district/province or use map/live location.');
        return;
      }
      setErr('');
      const r = await fetchWithAuth(`${API}/shipping/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(shipping, deliveryCoord)),
      });
      const data = await jsonFromResponse(r, {});
      if (!r.ok) {
        setQuote(null);
        setErr(data?.error || 'Could not calculate quote.');
        return;
      }
      setQuote(data);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, items.length, shipping.street, shipping.city, shipping.district, shipping.state, shipping.zip, shipping.country, deliveryCoord?.lat, deliveryCoord?.lng, fetchWithAuth]);

  useEffect(() => {
    if (!user || !deliveryCoord) return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      const r = await fetchWithAuth(`${API}/shipping/reverse-geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: deliveryCoord.lat, lng: deliveryCoord.lng }),
      });
      const data = await jsonFromResponse(r, {});
      if (cancelled || !r.ok) return;
      const pick = (v, prev) => (v != null && String(v).trim() !== '' ? String(v).trim() : prev);
      setShipping((s) => applyReverseGeocodeShipping(s, data, pick));
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, deliveryCoord?.lat, deliveryCoord?.lng, fetchWithAuth]);

  const useLiveLocation = () => {
    if (!navigator.geolocation) {
      setErr('Geolocation is not supported in this browser.');
      return;
    }
    setGeoBusy(true);
    setErr('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeliveryCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoBusy(false);
      },
      () => {
        setErr('Could not fetch live location. Allow permission or use map pin.');
        setGeoBusy(false);
      },
      { enableHighAccuracy: true, timeout: 22000, maximumAge: 0 },
    );
  };

  const subtotalRounded = Math.round(Number(subtotal) || 0);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <h1 className="page-title" style={{ marginBottom: '0.4rem' }}>Amount Calculator</h1>
      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#64748b' }}>
        Calculate total from <strong>{hub.label}</strong> using distance + 2% merchandise fee before checkout.
      </p>

      <section style={{ background: 'var(--card-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Delivery location</h2>
        {GOOGLE_MAPS_KEY ? (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
            <GoogleMap mapContainerStyle={MAP_STYLE} center={mapCenter} zoom={7} onClick={(e) => e.latLng && setDeliveryCoord({ lat: e.latLng.lat(), lng: e.latLng.lng() })}>
              <Marker position={{ lat: hub.lat, lng: hub.lng }} label="H" title={`Hub: ${hub.label}`} />
              {deliveryCoord && <Marker position={deliveryCoord} draggable onDragEnd={(e) => e.latLng && setDeliveryCoord({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
            </GoogleMap>
          </LoadScript>
        ) : (
          <p style={{ margin: '0 0 0.75rem', color: '#92400e', background: '#fffbeb', borderRadius: 8, padding: '0.75rem' }}>
            Add `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env` to enable map pin.
          </p>
        )}
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: 10, border: 'none' }} onClick={useLiveLocation} disabled={geoBusy}>
            {geoBusy ? 'Locating...' : 'Use my live location'}
          </button>
          {deliveryCoord && (
            <button type="button" style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }} onClick={() => setDeliveryCoord(null)}>
              Clear pin
            </button>
          )}
        </div>
      </section>

      <section style={{ background: 'var(--card-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Address</h2>
        <SriLankaAddressFields shipping={shipping} setShipping={setShipping} idPrefix="calc-addr" />
      </section>

      <section style={{ background: 'var(--card-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Order summary</h2>
        {err && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{err}</div>}
        {quote?.fallback && !err && (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#854d0e', background: 'rgba(234, 179, 8, 0.12)', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid rgba(234, 179, 8, 0.35)' }}>
            Estimated shipping — live driving route was unavailable; a fallback distance method was used.
          </p>
        )}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '0.95rem' }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}><span>Items subtotal</span><span>{formatLkr(quote?.subtotal ?? subtotalRounded)}</span></li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}><span>Merchandise fee (2%)</span><span>{formatLkr(quote?.merchandiseFee ?? 0)}</span></li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}><span>Shipping ({quote?.distanceKm != null ? `~${quote.distanceKm} km` : 'distance pending'} from {hub.label})</span><span>{formatLkr(quote?.shippingFee ?? 0)}</span></li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontWeight: 800, fontSize: '1.08rem' }}><span>Total</span><span>{formatLkr(quote?.grandTotalLkr ?? subtotalRounded)}</span></li>
        </ul>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
          Shipping bands: under 15 km free; 15-100 km LKR 150; 100-200 km LKR 300; 200-300 km LKR 450; over 300 km LKR 550.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <Link to="/checkout" className="btn-primary" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: 10, fontWeight: 700 }}>Proceed to checkout</Link>
          <Link to="/cart" style={{ alignSelf: 'center', color: '#64748b', fontWeight: 600 }}>Back to cart</Link>
        </div>
      </section>
    </div>
  );
}
