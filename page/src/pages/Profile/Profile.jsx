import { useEffect, useState } from 'react';
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
        'http://localhost:3000/api/usuarios/me',
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
          'No se pudo obtener el perfil.'
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
        'Error al cargar perfil:',
        error
      );

      setError(
        'No pudimos cargar tu información.'
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
    }

  }, [token]);


  // ==========================================
  // CAMBIAR INPUT
  // ==========================================

  const manejarCambio = (e) => {

    const { name, value } = e.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
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
        'http://localhost:3000/api/usuarios/me',
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
          'No se pudo actualizar el perfil.'
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
        'Perfil actualizado correctamente.'
      );


      setEditando(false);


    } catch (error) {

      console.error(
        'Error al actualizar perfil:',
        error
      );

      setError(
        error.message ||
        'No pudimos actualizar tu perfil.'
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
              Cargando perfil...
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
              No pudimos cargar tu perfil
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {error}
            </p>

            <button
              type="button"
              onClick={cargarPerfil}
              className="mt-8 border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
            >
              Intentar nuevamente
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
                Mi perfil
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/40">
                Administra tu información personal y mantén
                tus datos actualizados.
              </p>

            </div>


            <Link
              to="/tours"
              className="inline-flex w-fit border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.25em] text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
            >
              Explorar experiencias
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
                    ? 'Administrador'
                    : Number(perfil?.rol_id) === 2
                    ? 'Empleado'
                    : 'Cliente'}

                </p>

              </div>

            </div>

          </div>


          {/* DATOS */}

          <div className="border border-white/10 bg-white/[0.02] p-7">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
                  Información personal
                </p>

                <h2 className="mt-3 text-xl font-light">
                  Tus datos
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
                  Editar
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
                    Nombre
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    required
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* APELLIDO */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Apellido
                  </label>

                  <input
                    type="text"
                    name="apellido"
                    value={formulario.apellido}
                    onChange={manejarCambio}
                    required
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* CORREO */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={manejarCambio}
                    required
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* TELÉFONO */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                    required
                    className="mt-2 w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  />

                </div>


                {/* DIRECCIÓN */}

                <div>

                  <label className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Dirección
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
                      ? 'Guardando...'
                      : 'Guardar cambios'}
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
                    Cancelar
                  </button>

                </div>

              </form>

            ) : (

              <div className="mt-8 space-y-6">


                {/* NOMBRE */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Nombre completo
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.nombre} {perfil?.apellido}
                  </p>

                </div>


                {/* CORREO */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Correo electrónico
                  </p>

                  <p className="mt-2 break-all text-sm text-white/70">
                    {perfil?.correo}
                  </p>

                </div>


                {/* TELÉFONO */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Teléfono
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.telefono || 'No registrado'}
                  </p>

                </div>


                {/* DIRECCIÓN */}

                <div className="border-b border-white/10 pb-5">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Dirección
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.direccion || 'No registrada'}
                  </p>

                </div>


                {/* DOCUMENTO */}

                <div className="grid gap-6 sm:grid-cols-2">

                  <div>

                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                      Tipo de documento
                    </p>

                    <p className="mt-2 text-sm text-white/70">
                      {perfil?.tipo_documento}
                    </p>

                  </div>


                  <div>

                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                      Número de documento
                    </p>

                    <p className="mt-2 text-sm text-white/70">
                      {perfil?.numero_documento}
                    </p>

                  </div>

                </div>


                {/* FECHA */}

                <div className="border-t border-white/10 pt-6">

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Miembro desde
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    {perfil?.fecha_registro
                      ? new Date(
                          perfil.fecha_registro
                        ).toLocaleDateString(
                          'es-CO',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )
                      : 'No disponible'}
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