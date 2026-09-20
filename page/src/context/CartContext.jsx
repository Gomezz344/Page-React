import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_STORAGE_KEY = 'wildlife-cart-guest';

function readGuestCart() {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadedCartRef = useRef(null);

  useEffect(() => {
    const cartOwner = token || 'guest';
    let cancelled = false;

    const loadCart = async () => {
      setLoading(true);

      if (!token) {
        setItems(readGuestCart());
        loadedCartRef.current = cartOwner;
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/carrito`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load the cart.');
        if (!cancelled) setItems(data.items || []);
      } catch (error) {
        console.error('Error loading cart:', error);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) {
          loadedCartRef.current = cartOwner;
          setLoading(false);
        }
      }
    };

    loadCart();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (loadedCartRef.current !== (token || 'guest')) return;

    if (!token) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
      return;
    }

    const saveCart = async () => {
      try {
        const response = await fetch(`${API_URL}/carrito`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              tipo: item.type === 'product' ? 'producto' : item.type === 'service' ? 'servicio' : item.type,
              item_id: item.id,
              cantidad: item.cantidad,
            })),
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Could not save the cart.');
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    saveCart();
  }, [items, token]);

  const addItem = (item) => {
    const normalizedType = item.type === 'product' ? 'producto' : item.type === 'service' ? 'servicio' : item.type;
    const stock = Math.max(0, Number(item.stock ?? 0));
    if (stock === 0) return { ok: false, message: 'This item is out of stock.' };

    const existing = items.find((current) => current.key === item.key);
    if (existing && existing.cantidad >= stock) {
      return { ok: false, message: 'You reached the available stock limit.' };
    }

    setItems((currentItems) => existing
      ? currentItems.map((current) => current.key === item.key
        ? { ...current, tipo: normalizedType, type: normalizedType, cantidad: Math.min(current.cantidad + 1, stock), stock }
        : current)
      : [...currentItems, { ...item, tipo: normalizedType, type: normalizedType, stock, cantidad: 1 }]);

    return { ok: true, message: 'Added to your cart.' };
  };

  const syncStock = (stockByKey) => {
    setItems((currentItems) => currentItems.flatMap((item) => {
      const stock = Math.max(0, Number(stockByKey[item.key] ?? item.stock));
      const cantidad = Math.min(item.cantidad, stock);
      return cantidad > 0 ? [{ ...item, stock, cantidad }] : [];
    }));
  };

  const updateQuantity = (key, quantity) => {
    setItems((currentItems) => currentItems.flatMap((item) => {
      if (item.key !== key) return [item];
      const nextQuantity = Math.min(Math.max(0, Number(quantity)), item.stock);
      return nextQuantity === 0 ? [] : [{ ...item, cantidad: nextQuantity }];
    }));
  };

  const removeItem = (key) => setItems((currentItems) => currentItems.filter((item) => item.key !== key));
  const clearCart = () => setItems([]);

  const summary = useMemo(() => ({
    count: items.reduce((total, item) => total + item.cantidad, 0),
    total: items.reduce((total, item) => total + Number(item.precio) * item.cantidad, 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, loading, addItem, syncStock, updateQuantity, removeItem, clearCart, ...summary }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
