import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import fallbackImage from '../../assets/images/paisaje2.avif';

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(price || 0);

function ShopCard({ item, type, onAdd }) {
  const [image, setImage] = useState(item.imagen || fallbackImage);
  const available = Number(item.stock ?? 0);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-xl shadow-black/10 transition duration-500 hover:-translate-y-1 hover:border-[#9caf88]/50 hover:shadow-2xl hover:shadow-[#07100b]/80">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0a160e]">
        <img src={image} alt={item.nombre} onError={() => setImage(fallbackImage)} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07100b]/80 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#07100b]/75 px-3 py-2 text-[9px] uppercase tracking-[0.25em] text-[#c9d5bd] backdrop-blur-sm">
          {type}
        </span>
      </div>
      <div className="p-6 md:p-7">
        <h3 className="text-xl font-light text-white">{item.nombre}</h3>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-white/40">{item.descripcion || 'A responsible way to connect with Wildlife.'}</p>
        <div className="mt-5 flex items-end justify-between border-y border-white/10 py-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">Price</p>
            <p className="mt-2 text-sm text-[#c9d5bd]">{formatPrice(item.precio)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">Available</p>
            <p className={`mt-2 text-sm ${available > 0 ? 'text-white/65' : 'text-red-300/70'}`}>{available}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={available === 0}
          onClick={() => onAdd(item, type)}
          className="mt-5 flex w-full items-center justify-between rounded-lg border border-[#9caf88]/50 bg-[#9caf88]/5 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-[#c9d5bd] transition hover:bg-[#9caf88] hover:text-[#07100b] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/25"
        >
          {available === 0 ? 'Out of stock' : 'Add to cart'} <span className="text-base">+</span>
        </button>
      </div>
    </article>
  );
}

export function Shop() {
  const { items, count, total, addItem, syncStock, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [productsResponse, servicesResponse] = await Promise.all([
          fetch(`${API_URL}/productos`),
          fetch(`${API_URL}/servicios`),
        ]);
        const [productsData, servicesData] = await Promise.all([
          productsResponse.json(),
          servicesResponse.json(),
        ]);
        if (!productsResponse.ok || !servicesResponse.ok) throw new Error('Could not load the catalog.');
        setProducts(productsData.filter((item) => Number(item.estado) === 1));
        setServices(servicesData.filter((item) => Number(item.estado) === 1));
        syncStock(Object.fromEntries([
          ...productsData.map((item) => [`producto-${item.id}`, Number(item.stock ?? 0)]),
          ...servicesData.map((item) => [`servicio-${item.id}`, Number(item.stock ?? 0)]),
        ]));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const handleAdd = (item, type) => {
    const normalizedType = type === 'product' ? 'producto' : 'servicio';
    const result = addItem({ ...item, key: `${normalizedType}-${item.id}`, type: normalizedType });
    setNotice(result.message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/pagos/crear-sesion`, {
        method: 'POST',
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not start checkout.');
      window.location.href = data.url;
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#07100b] px-6 pb-24 pt-36 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-3xl border border-[#9caf88]/20 bg-gradient-to-br from-[#17311f] via-[#0c1d12] to-[#07100b] px-7 py-10 shadow-2xl shadow-black/20 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#9caf88]/15 blur-3xl" />
          <div className="relative max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#9caf88]">Wildlife shop</p>
          <h1 className="mt-5 text-5xl font-light leading-none tracking-tight md:text-7xl">Buy your next adventure.</h1>
          <p className="mt-7 max-w-xl text-sm leading-7 text-white/50">Equip your journey and book experiences that respect nature's rhythm.</p>
          <div className="mt-9 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-white/50"><span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Conscious selection</span><span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Secure checkout</span></div>
          </div>
        </header>

        {notice && <div className="fixed bottom-6 right-6 z-50 border border-[#9caf88]/40 bg-[#0b160f] px-5 py-4 text-xs text-[#c9d5bd] shadow-2xl">{notice}</div>}
        {error && <p className="mt-12 border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-200/70">{error}</p>}

        {loading ? <p className="mt-20 text-sm text-white/40">Loading catalog...</p> : (
          <>
            <section className="mt-20">
              <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5"><div><p className="text-[10px] uppercase tracking-[0.35em] text-white/30">Take with you</p><h2 className="mt-3 text-2xl font-light">Products</h2></div><span className="text-xs text-white/30">{products.length} items</span></div>
              {products.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{products.map((item) => <ShopCard key={item.id} item={item} type="product" onAdd={handleAdd} />)}</div> : <p className="border border-white/10 p-8 text-sm text-white/40">No products available.</p>}
            </section>
            <section className="mt-24">
              <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5"><div><p className="text-[10px] uppercase tracking-[0.35em] text-white/30">Live it</p><h2 className="mt-3 text-2xl font-light">Experiences</h2></div><span className="text-xs text-white/30">{services.length} experiences</span></div>
              {services.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{services.map((item) => <ShopCard key={item.id} item={item} type="service" onAdd={handleAdd} />)}</div> : <p className="border border-white/10 p-8 text-sm text-white/40">No experiences available.</p>}
            </section>
          </>
        )}

        <section className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 pt-8 shadow-xl shadow-black/10 md:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div><p className="text-[10px] uppercase tracking-[0.35em] text-[#9caf88]">Your selection</p><h2 className="mt-3 text-3xl font-light">Shopping cart <span className="text-white/30">({count})</span></h2></div>
            {items.length > 0 && <button type="button" onClick={clearCart} className="text-[10px] uppercase tracking-[0.25em] text-white/35 transition hover:text-red-300">Clear cart</button>}
          </div>
          <div className="mt-8 grid gap-3">
            {items.length === 0 ? <p className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-sm text-white/40">Your cart is empty. Add something to get started.</p> : items.map((item) => <div key={item.key} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#07100b]/45 p-5 transition hover:border-[#9caf88]/30 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] uppercase tracking-[0.25em] text-[#9caf88]">{item.type === 'producto' ? 'product' : item.type === 'servicio' ? 'service' : item.type}</p><p className="mt-2 text-base text-white/80">{item.nombre}</p><p className="mt-1 text-xs text-white/35">Maximum available: {item.stock}</p></div><div className="flex items-center gap-5"><div className="flex items-center rounded-lg border border-white/10"><button type="button" onClick={() => updateQuantity(item.key, item.cantidad - 1)} className="px-3 py-2 text-white/50 hover:text-white">-</button><span className="min-w-8 text-center text-sm">{item.cantidad}</span><button type="button" disabled={item.cantidad >= item.stock} onClick={() => updateQuantity(item.key, item.cantidad + 1)} className="px-3 py-2 text-white/50 hover:text-white disabled:cursor-not-allowed disabled:text-white/15">+</button></div><p className="min-w-28 text-right text-sm text-[#c9d5bd]">{formatPrice(Number(item.precio) * item.cantidad)}</p><button type="button" onClick={() => removeItem(item.key)} className="text-xs text-white/30 hover:text-red-300">Remove</button></div></div>)}
          </div>
          {items.length > 0 && <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center"><div><p className="text-[9px] uppercase tracking-[0.25em] text-white/30">Estimated total</p><p className="mt-2 text-3xl font-light text-[#c9d5bd]">{formatPrice(total)}</p></div><button type="button" onClick={handleCheckout} className="rounded-lg border border-[#9caf88] bg-[#9caf88] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:bg-transparent hover:text-[#9caf88]">Continue to checkout <span className="ml-2">→</span></button></div>}
        </section>
      </div>
    </main>
  );
}
