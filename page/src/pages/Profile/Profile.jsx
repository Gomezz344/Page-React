import { useEffect, useState } from 'react';
import { API_URL } from '../../api/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function Profile() {

  const {
    usuario,
    token,
    actualizarUsuario,
  } = useAuth();


  // ==========================================
  // ESTADOS
  // ==========================================

  const [perfil, setPerfil] = useState(null);

  const [editando, setEditando] = useState(false);

  const [cargando, setCargando] = useState(true);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState('');

  const [mensaje, setMensaje] = useState('');

  const [reservas, setReservas] = useState([]);

  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [facturas, setFacturas] = useState([]);


  // ==========================================
  // FORMULARIO
  // ==========================================

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    correo: '',
  });


  // ==========================================
  // OBTENER PERFIL
  // ==========================================

  const cargarPerfil = async () => {

    try {

      setCargando(true);
      setError('');

      const response = await fetch(
        `${API_URL}/usuarios/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Could not load the profile.'
        );

      }


      setPerfil(data.usuario);


      setFormulario({
        nombre: data.usuario.nombre || '',
        apellido: data.usuario.apellido || '',
        direccion: data.usuario.direccion || '',
        telefono: data.usuario.telefono || '',
        correo: data.usuario.correo || '',
      });


    } catch (error) {

      console.error(
        'Error loading profile:',
        error
      );

      setError(
        'We could not load your information.'
      );

    } finally {

      setCargando(false);

    }

  };


  // ==========================================
  // CARGAR AL ENTRAR
  // ==========================================

  useEffect(() => {

    if (token) {
      cargarPerfil();
      cargarReservas();
      cargarFacturas();
    }

  }, [token]);

  const cargarReservas = async () => {

    if (!token) {
      setReservas([]);
      return;
    }

    try {

      setCargandoReservas(true);

      const response = await fetch(
        `${API_URL}/reservas/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Could not load your reservations.'
        );
      }

      setReservas(data.reservas || []);

    } catch (error) {

      console.error(
        'Error loading reservations:',
        error
      );

      setReservas([]);

    } finally {

      setCargandoReservas(false);

    }

  };

  const cargarFacturas = async () => {
    try {
      const response = await fetch(`${API_URL}/facturas/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (response.ok) setFacturas(data.facturas || []);
    } catch (requestError) {
      console.error('Error loading invoices:', requestError);
    }
  };

  const cancelarReserva = async (reserva) => {
    if (!window.confirm('¿Quieres cancelar esta reserva?')) return;
    try {
      const response = await fetch(`${API_URL}/reservas/${reserva.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not cancel the reservation.');
      setMensaje(data.message || 'Reservation canceled.');
      cargarReservas();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const descargarFactura = async (factura) => {
    const response = await fetch(`${API_URL}/facturas/${factura.id}/download`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${factura.numero}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };


  // ==========================================
  // CAMBIAR INPUT
  // ==========================================

  const manejarCambio = (e) => {

    const { name, value } = e.target;
    const nextValue = name === 'telefono'
      ? value.replace(/\D/g, '').slice(0, 10)
      : value;

    setFormulario((actual) => ({
      ...actual,
      [name]: nextValue,
    }));

  };


  // ==========================================
  // GUARDAR CAMBIOS
  // ==========================================

  const guardarCambios = async (e) => {

    e.preventDefault();

    try {

      setGuardando(true);
      setError('');
      setMensaje('');


      const response = await fetch(
        `${API_URL}/usuarios/me`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formulario),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Could not update the profile.'
        );

      }


      // ==========================================
      // ACTUALIZAR ESTADO LOCAL
      // ==========================================

      setPerfil(data.usuario);


      // ==========================================
      // ACTUALIZAR AUTH CONTEXT
      // ==========================================

      actualizarUsuario(data.usuario);


      setMensaje(
        'Profile updated successfully.'
      );


      setEditando(false);


    } catch (error) {

      console.error(
        'Error updating profile:',
        error
      );

      setError(
        error.message ||
        'We could not update your profile.'
      );

    } finally {

      setGuardando(false);

    }

  };


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {

    return (

      <main className="min-h-screen bg-[#07100b] text-white">

        <section className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <p className="mt-4 text-sm text-white/40">
              Loading profile...
            </p>

          </div>

        </section>

      </main>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error && !perfil) {

    return (

      <main className="min-h-screen bg-[#07100b] text-white">

        <section className="flex min-h-screen items-center justify-center px-6">

          <div className="max-w-md text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <h1 className="mt-5 text-3xl font-light">
              We could not load your profile
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {error}
            </p>

            <button
              type="button"
              onClick={cargarPerfil}
              className="mt-8 border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
            >
              Try again
            </button>

          </div>

        </section>

      </main>

    );

  }


  // ==========================================
  // PERFIL
  // ==========================================

  return (

    <main className="min-h-screen bg-[#07100b] text-white">

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36 md:px-10">


        {/* ======================================
            CABECERA
        ====================================== */}

        <div className="border-b border-white/10 pb-10">

          <p className="text-[10px] uppercase tracking-[0.45em] text-[#9caf88]">
            Wildlife
          </p>

          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-light tracking-tight md:text-5xl">
                My profile
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/40">
                Manage your personal information and keep
                your details up to date.
              </p>

            </div>


            <Link
              to="/tours"
              className="inline-flex w-fit border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.25em] text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
            >
              Explore experiences
            </Link>

          </div>

        </div>


        {/* ======================================
            MENSAJES
        ====================================== */}

        {mensaje && (

          <div className="mt-8 border border-[#9caf88]/20 bg-[#9caf88]/5 px-5 py-4">

            <p className="text-xs text-[#b7c7a5]">
              {mensaje}
            </p>

          </div>

        )}


        {error && perfil && (

          <div className="mt-8 border border-red-300/10 bg-red-300/5 px-5 py-4">

            <p className="text-xs text-red-200/70">
              {error}
            </p>

          </div>

        )}


        {/* ======================================
            INFORMACIÓN
        ====================================== */}

        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1.5fr]">


          {/* IDENTIDAD */}

          <div className="border border-white/10 bg-white/[0.02] p-7">

            <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
              Cuenta
            </p>

            <div className="mt-8">

              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9caf88]/30 bg-[#9caf88]/5">

                <span className="text-xl font-light text-[#b7c7a5]">
                  {perfil?.nombre?.charAt(0)}
                  {perfil?.apellido?.charAt(0)}
                </span>

              </div>


              <h2 className="mt-6 text-2xl font-light">
                {perfil?.nombre} {perfil?.apellido}
              </h2>


              <p className="mt-2 text-sm text-white/30">
                {perfil?.correo}
              </p>


              <div className="mt-8 border-t border-white/10 pt-6">

                <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                  Tipo de cuenta
                </p>

                <p className="mt-2 text-sm text-white/60">

                  {Number(perfil?.rol_id) === 1
                    ? 'Administrator'
                    : Number(perfil?.rol_id) === 2
                    ? 'Employee'
                    : 'Customer'}

                </p>

              </div>

            </div>

          </div>


          {/* RESERVAS */}

          <div className="border border-white/10 bg-white/[0.02] p-7 md:col-span-2">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
                  Reservations
                </p>

                <h2 className="mt-3 text-xl font-light">
                  My bookings
                </h2>

              </div>

              <Link
                to="/tours"
                className="inline-flex border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
              >
                Book more
              </Link>

            </div>

            {cargandoReservas ? (
              <p className="mt-6 text-sm text-white/40">Loading reservations...</p>
            ) : reservas.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-[#07100b]/60 p-6 text-sm text-white/45">
                No reservations yet. Explore the experiences and live something unforgettable.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {reservas.map((reserva) => (
                  <article key={reserva.id} className="rounded-2xl border border-white/10 bg-[#08140d]/80 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-[#9caf88]">Booking #{reserva.id}</p>
                      <span className="rounded-full border border-[#9caf88]/40 bg-[#9caf88]/10 px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-[#cfe2c7]">
                        {reserva.estado}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-white/70">
                      <p><span className="text-white/35">Tour:</span> {reserva.servicio_nombre || `#${reserva.servicio_id}`}</p>
                      <p><span className="text-white/35">Guests:</span> {reserva.cantidad_personas}</p>
                      <p><span className="text-white/35">Dates:</span> {reserva.fecha_inicio} {reserva.fecha_fin ? `- ${reserva.fecha_fin}` : ''}</p>
                      <p><span className="text-white/35">Total:</span> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(reserva.monto_total || 0)}</p>
                    </div>
                    {!["cancelada", "cancelado"].includes(reserva.estado) && (
                      <button type="button" onClick={() => cancelarReserva(reserva)} className="mt-5 border border-red-300/30 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-red-200/70 transition hover:bg-red-400/10">Cancel reservation</button>
                    )}
                  </article>
                ))}
              </div>
            )}

          </div>

          <div className="border border-[#9caf88]/20 bg-gradient-to-br from-[#17311f]/70 to-white/[0.02] p-7 md:col-span-2">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[0.35em] text-[#9caf88]">Billing</p><h2 className="mt-3 text-xl font-light">My invoices</h2></div><span className="text-xs text-white/30">{facturas.length} available</span></div>
            {facturas.length === 0 ? <p className="mt-6 rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/40">Invoices will appear here after a payment is confirmed.</p> : <div className="mt-6 grid gap-3">{facturas.map((factura) => <div key={factura.id} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#07100b]/50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-[#dfead3]">{factura.numero}</p><p className="mt-1 text-xs text-white/40">{new Date(factura.fecha_emision).toLocaleDateString()} · Order #{factura.pedido_id}</p></div><div className="flex items-center gap-4"><p className="text-sm text-white/70">{new Intl.NumberFormat('en-US', { style: 'currency', currency: factura.moneda || 'COP', maximumFractionDigits: 0 }).format(factura.total || 0)}</p><button type="button" onClick={() => descargarFactura(factura)} className="border border-[#9caf88]/40 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-[#c9d5bd] transition hover:bg-[#9caf88]/10">Download</button></div></div>)}</div>}
          </div>


          {/* DATOS */}

          <div className="border border-white/10 bg-white/[0.02] p-7">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
                  Personal information
                </p>

                <h2 className="mt-3 text-xl font-light">
                  Your details
                </h2>

              </div>


              {!editando && (

                <button
                  type="button"
                  onClick={() => {
                    setMensaje('');
                    setError('');
                    setEditando(true);
                  }}
                  className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
                >
                  Edit
                </button>

              )}

            </div>


            {editando ? (

              <form
                onSubmit={guardarCambios}
                className="mt-8 space-y-5"
              >

                {/* NOMBRE */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    First name
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    required
                    maxLength={20}
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* APELLIDO */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Last name
                  </label>

                  <input
                    type="text"
                    name="apellido"
                    value={formulario.apellido}
                    onChange={manejarCambio}
                    required
                    maxLength={20}
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* CORREO */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Email address
                  </label>

                  <input
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={manejarCambio}
                    required
                    maxLength={100}
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* TELÉFONO */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                    required
                    maxLength={10}
                    inputMode="numeric"
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* DIRECCIÓN */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Address
                  </label>

                  <input
                    type="text"
                    name="direccion"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                    required
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* BOTONES */}

                <div className="flex flex-wrap gap-3 pt-3">

                  <button
                    type="submit"
                    disabled={guardando}
                    className="border border-[#9caf88]/30 bg-[#9caf88]/5 px-5 py-3 text-[9px] uppercase tracking-[0.25em] text-[#b7c7a5] transition hover:bg-[#9caf88]/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {guardando
                      ? 'Saving...'
                      : 'Save changes'}
                  </button>


                  <button
                    type="button"
                    onClick={() => {

                      setFormulario({
                        nombre: perfil.nombre || '',
                        apellido: perfil.apellido || '',
                        direccion: perfil.direccion || '',
                        telefono: perfil.telefono || '',
                        correo: perfil.correo || '',
                      });

                      setEditando(false);
                      setError('');
                      setMensaje('');

                    }}
                    className="border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.25em] text-white/40 transition hover:border-white/20 hover:text-white/60"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            ) : (

              <div className="mt-8 space-y-6">


                {/* NOMBRE */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Full name
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.nombre} {perfil?.apellido}
                  </p>

                </div>


                {/* CORREO */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Email address
                  </p>

                  <p className="mt-2 break-all text-sm text-white/70">
                    {perfil?.correo}
                  </p>

                </div>


                {/* TELÉFONO */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Phone
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.telefono || 'Not provided'}
                  </p>

                </div>


                {/* DIRECCIÓN */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Address
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.direccion || 'Not provided'}
                  </p>

                </div>


                {/* DOCUMENTO */}

                <div className="grid gap-6 sm:grid-cols-2">

                  <div>

                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                      Document type
                    </p>

                    <p className="mt-2 text-sm text-white/70">
                      {perfil?.tipo_documento}
                    </p>

                  </div>


                  <div>

                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                      Document number
                    </p>

                    <p className="mt-2 text-sm text-white/70">
                      {perfil?.numero_documento}
                    </p>

                  </div>

                </div>


                {/* FECHA */}

                <div className="border-t border-white/10 pt-6">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Member since
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.fecha_registro
                      ? new Date(
                          perfil.fecha_registro
                        ).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )
                      : 'Not available'}
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>

    </main>

  );

}
