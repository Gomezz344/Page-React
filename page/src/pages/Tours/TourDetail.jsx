import { useEffect, useState } from 'react';
import { API_URL } from '../../api/client';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function TourDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated, token } = useAuth();

  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reservaForm, setReservaForm] = useState({
    cantidadPersonas: 1,
    fechaInicio: '',
    fechaFin: '',
    notas: '',
  });

  const cargarServicio = async () => {

    try {

      setCargando(true);
      setError('');

      const response = await fetch(
        `${API_URL}/servicios/${id}`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          'Could not load the experience.'
        );

      }

      setServicio(data.servicio);

    } catch (error) {

      console.error(
        'Error loading experience:',
        error
      );

      setError(
        'We could not load this experience.'
      );

    } finally {

      setCargando(false);

    }

  };

  useEffect(() => {

    cargarServicio();

  }, [id]);


  const formatearPrecio = (precio) => {

    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }
    ).format(precio);

  };

  const handleAddToCart = () => {
    const resultado = addItem({
      ...servicio,
      key: `servicio-${servicio.id}`,
      type: 'servicio',
    });

    if (!resultado.ok) {
      alert(resultado.message);
      return;
    }

    navigate('/shop');
  };

  const handleReservaChange = (event) => {
    const { name, value } = event.target;
    setReservaForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const handleReserve = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    if (!reservaForm.fechaInicio) {
      setBookingError('Selecciona la fecha de inicio para continuar.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');
      setBookingSuccess('');

      const reservaResponse = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          servicio_id: Number(servicio.id),
          cantidad_personas: Number(reservaForm.cantidadPersonas),
          fecha_inicio: reservaForm.fechaInicio,
          fecha_fin: reservaForm.fechaFin || null,
          notas: reservaForm.notas || null,
        }),
      });

      const reservaData = await reservaResponse.json().catch(() => ({}));
      if (!reservaResponse.ok) {
        const backendMessage =
          reservaData?.message ||
          reservaData?.detail ||
          (Array.isArray(reservaData?.detail) ? reservaData.detail.map((item) => item.msg || item).join(', ') : null) ||
          'No se pudo crear la reserva.';
        throw new Error(backendMessage);
      }

      const checkoutResponse = await fetch(`${API_URL}/pagos/crear-sesion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{
            tipo: 'servicio',
            item_id: Number(servicio.id),
            cantidad: Number(reservaForm.cantidadPersonas),
          }],
          reserva_id: reservaData.id,
        }),
      });

      const checkoutData = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.message || 'No se pudo iniciar el pago.');
      }

      setBookingSuccess('Reserva creada. Redirigiendo a Stripe...');
      window.location.href = checkoutData.url;
    } catch (requestError) {
      console.error('Error creando reserva:', requestError);
      setBookingError(requestError.message || 'No se pudo completar la reserva.');
    } finally {
      setBookingLoading(false);
    }
  };


  if (cargando) {

    return (
      <main className="min-h-screen bg-[#07100b] text-white">

        <section className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <p className="mt-4 text-sm text-white/40">
              Loading experience...
            </p>

          </div>

        </section>

      </main>
    );

  }


  if (error || !servicio) {

    return (
      <main className="min-h-screen bg-[#07100b] text-white">

        <section className="flex min-h-screen items-center justify-center px-6">

          <div className="max-w-md text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <h1 className="mt-5 text-3xl font-light">
              Experience not found
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {error || 'This experience does not exist.'}
            </p>

            <Link
              to="/tours"
              className="mt-8 inline-flex border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
            >
              ← Back to experiences
            </Link>

          </div>

        </section>

      </main>
    );

  }


  return (
    <main className="min-h-screen bg-[#07100b] text-white">

      <section className="relative flex min-h-screen items-end overflow-hidden">

        {servicio.imagen && (

          <img
            src={servicio.imagen}
            alt={servicio.nombre}
            className="absolute inset-0 h-full w-full object-cover"
          />

        )}

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07100b] via-[#07100b]/40 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">

          <Link
            to="/tours"
            className="mb-10 inline-flex text-[10px] uppercase tracking-[0.3em] text-white/50 transition hover:text-[#9caf88]"
          >
            ← All experiences
          </Link>

          <p className="text-[10px] uppercase tracking-[0.45em] text-[#b7c7a5]">
            Wildlife experience
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            {servicio.nombre}
          </h1>

          <div className="mt-8 flex flex-wrap gap-8">

            <div>

              <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                Duration
              </p>

              <p className="mt-2 text-sm text-white/70">
                {servicio.duracion || 'To be determined'}
              </p>

            </div>

            <div>

              <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                From
              </p>

              <p className="mt-2 text-sm text-white/70">
                {formatearPrecio(servicio.precio)}
              </p>

            </div>

          </div>

        </div>

      </section>


      <section className="mx-auto max-w-4xl px-6 py-24 md:px-10">

        <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
          About this experience
        </p>

        <h2 className="mt-5 text-3xl font-light">
          Discover something different.
        </h2>

        <p className="mt-8 text-base leading-8 text-white/50">
          {servicio.descripcion || 'No description is available for this experience.'}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="border border-[#9caf88] bg-[#9caf88] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:opacity-90"
          >
            Add to cart
          </button>
          <Link
            to="/shop"
            className="border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
          >
            Go to cart
          </Link>
        </div>

        <form onSubmit={handleReserve} className="mt-14 max-w-xl rounded-2xl border border-white/10 bg-[#08140d]/80 p-6 backdrop-blur-sm">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#9caf88]">Reserve now</p>
            <h3 className="mt-3 text-2xl font-light text-white">Book this experience</h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-white/60">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">Start date</span>
              <input
                type="date"
                name="fechaInicio"
                value={reservaForm.fechaInicio}
                onChange={handleReservaChange}
                className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none transition focus:border-[#9caf88]"
              />
            </label>

            <label className="block text-sm text-white/60">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">End date</span>
              <input
                type="date"
                name="fechaFin"
                value={reservaForm.fechaFin}
                onChange={handleReservaChange}
                className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none transition focus:border-[#9caf88]"
              />
            </label>

            <label className="block text-sm text-white/60">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">Guests</span>
              <input
                type="number"
                name="cantidadPersonas"
                min="1"
                max={servicio.stock || 10}
                value={reservaForm.cantidadPersonas}
                onChange={handleReservaChange}
                className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none transition focus:border-[#9caf88]"
              />
            </label>

            <div className="rounded-xl border border-[#9caf88]/20 bg-[#9caf88]/5 p-4 text-sm text-[#dfead3]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#9caf88]">Price</p>
              <p className="mt-2 text-2xl font-light">{formatearPrecio(servicio.precio)}</p>
              <p className="mt-1 text-xs text-white/50">per person</p>
            </div>
          </div>

          <label className="mt-5 block text-sm text-white/60">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/35">Notes</span>
            <textarea
              name="notas"
              rows="4"
              value={reservaForm.notas}
              onChange={handleReservaChange}
              placeholder="Any detail we should know before your arrival..."
              className="w-full border border-white/10 bg-transparent px-3 py-3 text-white outline-none transition placeholder:text-white/20 focus:border-[#9caf88]"
            />
          </label>

          {bookingError && <p className="mt-4 border border-red-300/30 bg-red-500/5 p-3 text-sm text-red-200">{bookingError}</p>}
          {bookingSuccess && <p className="mt-4 border border-[#9caf88]/30 bg-[#9caf88]/5 p-3 text-sm text-[#dfead3]">{bookingSuccess}</p>}

          <button
            type="submit"
            disabled={bookingLoading}
            className="mt-6 w-full border border-[#9caf88] bg-[#9caf88] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#07100b] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bookingLoading ? 'Processing...' : 'Reserve and pay'}
          </button>
        </form>

      </section>

    </main>
  );
}
