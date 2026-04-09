import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  readGuestCart,
  writeGuestCart,
  clearGuestCart,
  guestCartTotals,
} from '../utils/guestCartStorage';

const CartContext = createContext(null);

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
      const pid = line.productId != null ? String(line.productId).trim() : '';
      if (!pid) continue;
      await fetchWithAuth('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: pid, quantity: line.quantity || 1 })
      });
    }
    clearGuestCart();
    await loadServerCart();
  }, [fetchWithAuth, loadServerCart]);

  const loadGuestDisplay = useCallback(() => {
    const { items: guestItems } = readGuestCart();
    const normalized = guestItems.map((line) => {
      const snap = line.snapshot || {};
      const price = snap.price != null ? Number(snap.price) : 0;
      const img = snap.image || snap.imageUrl || '';
      return {
        productId: line.productId,
        quantity: line.quantity || 1,
        product: {
          _id: line.productId,
          name: snap.name || 'Product',
          price,
          image: img,
          imageUrl: snap.imageUrl || snap.image || '',
        },
        lineTotal: price * (line.quantity || 1)
      };
    });
    const t = guestCartTotals(guestItems);
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
    const rawId = product?._id ?? product?.id;
    const pid = rawId != null ? String(rawId).trim() : '';
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
      image: product.image || product.imageUrl || '',
      imageUrl: product.imageUrl || product.image || '',
    };
    const idx = guestItems.findIndex((x) => String(x.productId || '') === pid);
    if (idx >= 0) {
      guestItems[idx].quantity = (guestItems[idx].quantity || 1) + qty;
      guestItems[idx].snapshot = { ...guestItems[idx].snapshot, ...snap };
      guestItems[idx].productId = pid;
    } else {
      guestItems.push({ productId: pid, quantity: qty, snapshot: snap });
    }
    writeGuestCart(guestItems);
    loadGuestDisplay();
    return { ok: true };
  }, [user, fetchWithAuth, applyServerPayload, loadGuestDisplay]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const pid = productId != null ? String(productId).trim() : '';
    if (!pid) return { ok: false, message: 'Invalid product' };
    const qty = Math.max(1, quantity);
    if (user) {
      const r = await fetchWithAuth(`/api/cart/items/${encodeURIComponent(pid)}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: qty })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: data.message || 'Could not update' };
      applyServerPayload(data);
      return { ok: true };
    }
    const { items: guestItems } = readGuestCart();
    const line = guestItems.find((x) => String(x.productId || '') === pid);
    if (line) line.quantity = qty;
    writeGuestCart(guestItems);
    loadGuestDisplay();
    return { ok: true };
  }, [user, fetchWithAuth, applyServerPayload, loadGuestDisplay]);

  const removeItem = useCallback(async (productId) => {
    const pid = productId != null ? String(productId).trim() : '';
    if (!pid) return { ok: false, message: 'Invalid product' };
    if (user) {
      const r = await fetchWithAuth(`/api/cart/items/${encodeURIComponent(pid)}`, { method: 'DELETE' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: data.message || 'Could not remove' };
      applyServerPayload(data);
      return { ok: true };
    }
    const { items: guestItems } = readGuestCart();
    writeGuestCart(guestItems.filter((x) => String(x.productId || '') !== pid));
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
