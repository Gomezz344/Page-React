import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'wildlife-cart';

function readCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    const stock = Math.max(0, Number(item.stock ?? 0));
    if (stock === 0) return { ok: false, message: 'Este artículo no tiene unidades disponibles.' };

    const existing = items.find((current) => current.key === item.key);
    if (existing && existing.cantidad >= stock) {
      return { ok: false, message: 'Alcanzaste el stock disponible.' };
    }

    setItems((currentItems) => existing
      ? currentItems.map((current) => current.key === item.key
        ? { ...current, cantidad: Math.min(current.cantidad + 1, stock), stock }
        : current)
      : [...currentItems, { ...item, stock, cantidad: 1 }]);

    return { ok: true, message: 'Añadido a tu cesta.' };
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
    <CartContext.Provider value={{ items, addItem, syncStock, updateQuantity, removeItem, clearCart, ...summary }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
