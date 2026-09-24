import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(price || 0);

export function Reservations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const serviceId = searchParams.get('servicio_id');
  const initialQuantity = Math.max(1, Number(searchParams.get('cantidad') || 1));
  const [service, setService] = useState(null);
  const [form, setForm] = useState({ cantidadPersonas: initialQuantity, fechaInicio: '', fechaFin: '', notas: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const minimumDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!serviceId) {
      setError('Selecciona un tour desde la tienda para crear una reserva.');
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/servicios/${serviceId}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el tour.');
        setService(data.servicio);
        setForm((current) => ({ ...current, cantidadPersonas: Math.min(initialQuantity, Number(data.servicio.stock || 1)) }));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate, serviceId, initialQuantity]);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!service || !form.fechaInicio) {
      setError('Selecciona la fecha de inicio para continuar.');
      return;
    }
    if (form.fechaInicio < minimumDate) {
      setError('La fecha del tour debe ser al menos mañana.');
      return;
    }
    if (form.fechaFin && form.fechaFin < form.fechaInicio) {
      setError('La fecha final no puede ser anterior a la fecha inicial.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const reservationResponse = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          servicio_id: Number(service.id),
          cantidad_personas: Number(form.cantidadPersonas),
          fecha_inicio: form.fechaInicio,
          fecha_fin: form.fechaFin || null,
          notas: form.notas || null,
        }),
      });
      const reservationData = await reservationResponse.json();
      if (!reservationResponse.ok) throw new Error(reservationData.message || 'No se pudo crear la reserva.');

      const checkoutResponse = await fetch(`${API_URL}/pagos/crear-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reserva_id: reservationData.id,
          items: [{ tipo: 'servicio', item_id: Number(service.id), cantidad: Number(form.cantidadPersonas) }],
        }),
      });
      const checkoutData = await checkoutResponse.json();
      if (!checkoutResponse.ok) throw new Error(checkoutData.message || 'No se pudo iniciar el pago.');
      window.location.href = checkoutData.url;
    } catch (requestError) {
      setError(requestError.message || 'No se pudo completar la reserva.');
      setSubmitting(false);
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#07100b] text-sm text-white/40">Loading reservation...</main>;

  return (
    <main className="min-h-screen bg-[#07100b] px-6 pb-24 pt-36 text-white md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/shop" className="text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-[#9caf88]">← Back to shop</Link>
        <p className="mt-12 text-[10px] uppercase tracking-[0.45em] text-[#9caf88]">Reservation</p>
        <h1 className="mt-5 text-4xl font-light md:text-6xl">Plan your experience.</h1>
        {error && <p className="mt-8 border border-red-300/30 bg-red-500/5 p-4 text-sm text-red-200">{error}</p>}
        {service && (
          <form onSubmit={handleSubmit} className="mt-12 rounded-2xl border border-white/10 bg-[#08140d]/80 p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
              <div><p className="text-[10px] uppercase tracking-[0.25em] text-[#9caf88]">Selected tour</p><h2 className="mt-3 text-2xl font-light">{service.nombre}</h2></div>
              <p className="text-xl text-[#c9d5bd]">{formatPrice(service.precio)} / person</p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="text-sm text-white/60"><span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">Start date</span><input required min={minimumDate} type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none focus:border-[#9caf88]" /></label>
              <label className="text-sm text-white/60"><span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">End date</span><input min={form.fechaInicio || minimumDate} type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none focus:border-[#9caf88]" /></label>
              <label className="text-sm text-white/60"><span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">Guests</span><input required min="1" max={service.stock || 1} type="number" name="cantidadPersonas" value={form.cantidadPersonas} onChange={handleChange} className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none focus:border-[#9caf88]" /></label>
            </div>
            <label className="mt-5 block text-sm text-white/60"><span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">Notes</span><textarea name="notas" rows="4" value={form.notas} onChange={handleChange} className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none focus:border-[#9caf88]" /></label>
            <p className="mt-5 text-xs leading-6 text-white/40">You can cancel this reservation until one day before the tour date.</p>
            <button disabled={submitting} className="mt-6 w-full border border-[#9caf88] bg-[#9caf88] px-6 py-4 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:opacity-90 disabled:opacity-50">{submitting ? 'Processing...' : 'Reserve and continue to payment'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
