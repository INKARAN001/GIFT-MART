/**
 * Guest shopping cart in localStorage — versioned payload so we can migrate safely.
 * Key: giftmart_guest_cart
 */

export const GUEST_CART_KEY = 'giftmart_guest_cart';

/** Bump when the stored shape changes (migration runs on read). */
export const GUEST_CART_VERSION = 2;

/**
 * @typedef {Object} GuestCartLine
 * @property {string} productId
 * @property {number} quantity
 * @property {{ name?: string, price?: number, image?: string, imageUrl?: string }} snapshot
 */

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

/** Normalize a single line; returns null if unusable. */
export function normalizeGuestLine(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const productId = raw.productId != null ? String(raw.productId).trim() : '';
  if (!productId) return null;

  let qty = parseInt(raw.quantity, 10);
  if (!Number.isFinite(qty) || qty < 1) qty = 1;

  const snap = raw.snapshot && typeof raw.snapshot === 'object' ? raw.snapshot : {};
  const name = typeof snap.name === 'string' ? snap.name : 'Product';
  const price = safeNumber(snap.price, 0);
  const image = typeof snap.image === 'string' ? snap.image : '';
  const imageUrl = typeof snap.imageUrl === 'string' ? snap.imageUrl : '';

  return {
    productId,
    quantity: qty,
    snapshot: {
      name,
      price,
      image: image || imageUrl,
      imageUrl: imageUrl || image,
    },
  };
}

/**
 * Read cart from localStorage. Invalid JSON → empty cart.
 * Migrates older shapes to current version and re-writes storage when needed.
 */
export function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw || raw.trim() === '') {
      return { items: [], version: GUEST_CART_VERSION, migrated: false };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      localStorage.removeItem(GUEST_CART_KEY);
      return { items: [], version: GUEST_CART_VERSION, migrated: true };
    }

    let items = [];
    let version = GUEST_CART_VERSION;
    let migrated = false;

    if (Array.isArray(parsed)) {
      items = parsed;
      migrated = true;
      version = 1;
    } else if (parsed && typeof parsed === 'object') {
      version = typeof parsed.v === 'number' ? parsed.v : 1;
      items = Array.isArray(parsed.items) ? parsed.items : [];
    }

    const normalized = [];
    for (const line of items) {
      const n = normalizeGuestLine(line);
      if (n) normalized.push(n);
      else migrated = true;
    }

    if (version < GUEST_CART_VERSION || migrated) {
      writeGuestCartInternal(normalized);
      migrated = true;
    }

    return { items: normalized, version: GUEST_CART_VERSION, migrated };
  } catch {
    return { items: [], version: GUEST_CART_VERSION, migrated: false };
  }
}

function writeGuestCartInternal(items) {
  const payload = {
    v: GUEST_CART_VERSION,
    updatedAt: new Date().toISOString(),
    items: items.map((line) => normalizeGuestLine(line)).filter(Boolean),
  };
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[guestCart] localStorage write failed:', e?.message || e);
  }
}

/** Persist guest cart lines (each line should already be normalized). */
export function writeGuestCart(items) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((line) => normalizeGuestLine(line))
    .filter(Boolean);
  writeGuestCartInternal(normalized);
}

export function clearGuestCart() {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    /* ignore */
  }
}

/** Subtotal and piece count from guest lines. */
export function guestCartTotals(items) {
  let subtotal = 0;
  let itemCount = 0;
  for (const line of items) {
    const q = Math.max(1, parseInt(line.quantity, 10) || 1);
    const price = line.snapshot?.price != null ? safeNumber(line.snapshot.price, 0) : 0;
    subtotal += price * q;
    itemCount += q;
  }
  return { subtotal, itemCount };
}
