import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'giftmart_guest_cart';

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { items: [] };
    const p = JSON.parse(raw);
    return { items: Array.isArray(p.items) ? p.items : [] };
  } catch {
    return { items: [] };
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items }));
}

function guestTotals(items) {
  let subtotal = 0;
  let itemCount = 0;
  for (const line of items) {
    const price = line.snapshot?.price != null ? Number(line.snapshot.price) : 0;
    subtotal += price * line.quantity;
    itemCount += line.quantity;
  }
  return { subtotal, itemCount };
}

export function CartProvider({ children }) {
  const { user, fetchWithAuth } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const applyServerPayload = useCallback((data) => {
    if (!data) return;
    setItems(data.items || []);
    setSubtotal(Number(data.subtotal) || 0);
    setItemCount(Number(data.itemCount) || 0);
  }, []);

  const loadServerCart = useCallback(async () => {
    const r = await fetchWithAuth('/api/cart');
    if (r.ok) {
      const data = await r.json();
      applyServerPayload(data);
    }
  }, [fetchWithAuth, applyServerPayload]);

  const mergeGuestThenLoad = useCallback(async () => {
    const { items: guestItems } = readGuestCart();
    for (const line of guestItems) {
      if (!line.productId) continue;
      await fetchWithAuth('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: line.productId, quantity: line.quantity || 1 })
      });
    }
    localStorage.removeItem(GUEST_CART_KEY);
    await loadServerCart();
  }, [fetchWithAuth, loadServerCart]);

  const loadGuestDisplay = useCallback(() => {
    const { items: guestItems } = readGuestCart();
    const normalized = guestItems.map((line) => {
      const snap = line.snapshot || {};
      const price = snap.price != null ? Number(snap.price) : 0;
      return {
        productId: line.productId,
        quantity: line.quantity || 1,
        product: {
          _id: line.productId,
          name: snap.name || 'Product',
          price,
          image: snap.image || ''
        },
        lineTotal: price * (line.quantity || 1)
      };
    });
    const t = guestTotals(guestItems);
    setItems(normalized);
    setSubtotal(t.subtotal);
    setItemCount(t.itemCount);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (user) {
        await mergeGuestThenLoad();
      } else {
        loadGuestDisplay();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id, mergeGuestThenLoad, loadGuestDisplay]);

  const refreshCart = useCallback(async () => {
    if (user) await loadServerCart();
    else loadGuestDisplay();
  }, [user, loadServerCart, loadGuestDisplay]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const pid = product?._id || product?.id;
    if (!pid) return { ok: false, message: 'Invalid product' };
    const qty = Math.max(1, quantity);

    if (user) {
      const r = await fetchWithAuth('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: pid, quantity: qty })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: data.message || 'Could not add to cart' };
      applyServerPayload(data);
      return { ok: true };
    }

    const { items: guestItems } = readGuestCart();
    const snap = {
      name: product.name,
      price: product.price != null ? Number(product.price) : 0,
      image: product.image || ''
    };
    const idx = guestItems.findIndex((x) => x.productId === pid);
    if (idx >= 0) {
      guestItems[idx].quantity = (guestItems[idx].quantity || 1) + qty;
      guestItems[idx].snapshot = { ...guestItems[idx].snapshot, ...snap };
    } else {
      guestItems.push({ productId: pid, quantity: qty, snapshot: snap });
    }
    writeGuestCart(guestItems);
    loadGuestDisplay();
    return { ok: true };
  }, [user, fetchWithAuth, applyServerPayload, loadGuestDisplay]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const qty = Math.max(1, quantity);
    if (user) {
      const r = await fetchWithAuth(`/api/cart/items/${encodeURIComponent(productId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: qty })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: data.message || 'Could not update' };
      applyServerPayload(data);
      return { ok: true };
    }
    const { items: guestItems } = readGuestCart();
    const line = guestItems.find((x) => x.productId === productId);
    if (line) line.quantity = qty;
    writeGuestCart(guestItems);
    loadGuestDisplay();
    return { ok: true };
  }, [user, fetchWithAuth, applyServerPayload, loadGuestDisplay]);

  const removeItem = useCallback(async (productId) => {
    if (user) {
      const r = await fetchWithAuth(`/api/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: data.message || 'Could not remove' };
      applyServerPayload(data);
      return { ok: true };
    }
    const { items: guestItems } = readGuestCart();
    writeGuestCart(guestItems.filter((x) => x.productId !== productId));
    loadGuestDisplay();
    return { ok: true };
  }, [user, fetchWithAuth, applyServerPayload, loadGuestDisplay]);

  const value = {
    items,
    subtotal,
    itemCount,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
