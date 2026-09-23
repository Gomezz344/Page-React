import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../api/client';

export function Usuarios() {

  const { usuario: usuarioActual } = useAuth();

  // ==========================================
  // ESTADOS
  // ==========================================

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editando, setEditando] = useState(null);

  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: '',
    numero_documento: '',
    direccion: '',
    telefono: '',
    correo: '',
    password: '',
    rol_id: 3,
    estado: 1,
  });


  // ==========================================
  // SABER SI ESTAMOS EDITANDO AL USUARIO ACTUAL
  // ==========================================

  const esUsuarioActual =
    Number(usuarioActual?.id) === Number(editando);


  // ==========================================
  // OBTENER USUARIOS
  // ==========================================

  const cargarUsuarios = async () => {

    try {

      setCargando(true);
      setError('');

      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/usuarios`,
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
          'Could not load the users.'
        );

      }

      setUsuarios(data.usuarios || []);

    } catch (error) {

      console.error(
        'Error loading users:',
        error
      );

      setError(error.message);

    } finally {

      setCargando(false);

    }

  };


  // ==========================================
  // CARGAR AL INICIAR
  // ==========================================

  useEffect(() => {

    cargarUsuarios();

  }, []);


  // ==========================================
  // CAMBIAR CAMPOS
  // ==========================================

  const handleChange = (e) => {

    const { name, value } = e.target;
    const nextValue = ['numero_documento', 'telefono'].includes(name)
      ? value.replace(/\D/g, '').slice(0, 10)
      : value;

    setForm({
      ...form,
      [name]: nextValue,
    });

  };


  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================

  const limpiarFormulario = () => {

    setForm({
      nombre: '',
      apellido: '',
      tipo_documento: '',
      numero_documento: '',
      direccion: '',
      telefono: '',
      correo: '',
      password: '',
      rol_id: 3,
      estado: 1,
    });

    setEditando(null);

  };


  // ==========================================
  // ABRIR EDITAR
  // ==========================================

  const abrirEditar = (usuario) => {

    setEditando(usuario.id);

    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      tipo_documento: usuario.tipo_documento || '',
      numero_documento: usuario.numero_documento || '',
      direccion: usuario.direccion || '',
      telefono: usuario.telefono || '',
      correo: usuario.correo || '',
      password: '',
      rol_id: usuario.rol_id ?? 3,
      estado: usuario.estado ?? 1,
    });

    setError('');
    setMostrarFormulario(true);

  };


  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================

  const cerrarFormulario = () => {

    if (guardando) return;

    setMostrarFormulario(false);
    limpiarFormulario();

  };


  // ==========================================
  // ACTUALIZAR USUARIO
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!editando) return;

    try {

      setGuardando(true);
      setError('');

      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');


      /*
       * Si estamos editando al usuario actual,
       * mantenemos obligatoriamente su rol y estado.
       *
       * Esto evita que la interfaz permita accidentalmente
       * cambiar estas propiedades.
       */

      const rolFinal = esUsuarioActual
        ? Number(usuarioActual?.rol_id)
        : Number(form.rol_id);

      const estadoFinal = esUsuarioActual
        ? Number(usuarioActual?.estado ?? 1)
        : Number(form.estado);


      const usuario = {

        nombre: form.nombre,
        apellido: form.apellido,
        tipo_documento: form.tipo_documento,
        numero_documento: form.numero_documento,
        direccion: form.direccion,
        telefono: form.telefono,
        correo: form.correo,
        rol_id: rolFinal,
        estado: estadoFinal,

      };

      if (form.password.trim()) {
        usuario.password = form.password;
      }


      const response = await fetch(
        `${API_URL}/usuarios/${editando}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(usuario),

        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Could not update the user.'
        );

      }


      // ==========================================
      // ACTUALIZAR INFORMACIÓN LOCAL
      // ==========================================

      if (esUsuarioActual) {

        const usuarioActualizado = {
          ...usuarioActual,
          nombre: form.nombre,
          apellido: form.apellido,
          tipo_documento: form.tipo_documento,
          numero_documento: form.numero_documento,
          direccion: form.direccion,
          telefono: form.telefono,
          correo: form.correo,
          rol_id: rolFinal,
          estado: estadoFinal,
        };

        /*
         * Actualizamos el usuario almacenado
         * en localStorage/sessionStorage.
         */

        const storage =
          localStorage.getItem('token')
            ? localStorage
            : sessionStorage;

        storage.setItem(
          'usuario',
          JSON.stringify(usuarioActualizado)
        );

      }


      // Cerrar modal

      setMostrarFormulario(false);

      limpiarFormulario();


      // Actualizar tabla

      await cargarUsuarios();

    } catch (error) {

      console.error(
        'Error al actualizar usuario:',
        error
      );

      setError(error.message);

    } finally {

      setGuardando(false);

    }

  };


  // ==========================================
  // NOMBRE DEL ROL
  // ==========================================

  const obtenerNombreRol = (rolId) => {

    switch (Number(rolId)) {

      case 1:
        return 'Administrator';

      case 2:
        return 'Employee';

      case 3:
        return 'Customer';

      default:
        return 'Unknown';

    }

  };


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {

    return (

      <div>

        <div className="mb-10">

          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
            Management
          </p>

          <h2 className="text-3xl font-light tracking-wide">
            Users
          </h2>

        </div>


        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">

          <p className="text-sm text-white/40">
            Loading users...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div>

      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div className="mb-10">

        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
          Management
        </p>

        <h2 className="text-3xl font-light tracking-wide">
          Users
        </h2>

        <p className="mt-3 text-sm text-white/40">
          Manage registered Wildlife users.
        </p>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="mb-6 border border-red-400/20 bg-red-400/5 px-5 py-4">

          <p className="text-sm text-red-300">
            {error}
          </p>

        </div>

      )}


      {/* ==========================================
          TABLA
      ========================================== */}

      <div className="overflow-hidden border border-white/10 bg-white/[0.02]">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="border-b border-white/10">

              <tr className="text-left">

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  User
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Document
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Contact
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Role
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Status
                </th>

                <th className="px-6 py-5 text-right text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {usuarios.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center"
                  >

                    <p className="text-sm text-white/30">
                      No registered users.
                    </p>

                  </td>

                </tr>

              ) : (

                usuarios.map((usuario) => {

                  const esActual =
                    Number(usuarioActual?.id) ===
                    Number(usuario.id);

                  return (

                    <tr
                      key={usuario.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >

                      {/* USUARIO */}

                      <td className="px-6 py-5">

                        <div>

                          <div className="flex items-center gap-3">

                            <p className="text-sm text-white">
                              {usuario.nombre}{' '}
                              {usuario.apellido}
                            </p>

                            {esActual && (

                              <span className="border border-[#9caf88]/20 bg-[#9caf88]/5 px-2 py-1 text-[8px] uppercase tracking-wider text-[#9caf88]">
                                You
                              </span>

                            )}

                          </div>

                          <p className="mt-1 text-xs text-white/30">
                            ID #{usuario.id}
                          </p>

                        </div>

                      </td>


                      {/* DOCUMENTO */}

                      <td className="px-6 py-5">

                        <p className="text-sm text-white/70">
                          {usuario.tipo_documento}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {usuario.numero_documento}
                        </p>

                      </td>


                      {/* CONTACTO */}

                      <td className="px-6 py-5">

                        <p className="text-sm text-white/70">
                          {usuario.correo}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {usuario.telefono}
                        </p>

                      </td>


                      {/* ROL */}

                      <td className="px-6 py-5">

                        <span className="border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-wider text-white/50">

                          {obtenerNombreRol(
                            usuario.rol_id
                          )}

                        </span>

                      </td>


                      {/* ESTADO */}

                      <td className="px-6 py-5">

                        {Number(usuario.estado) === 1 ? (

                          <span className="border border-[#9caf88]/20 bg-[#9caf88]/5 px-3 py-1 text-[9px] uppercase tracking-wider text-[#9caf88]">
                            Active
                          </span>

                        ) : (

                          <span className="border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-wider text-white/30">
                            Inactive
                          </span>

                        )}

                      </td>


                      {/* ACCIONES */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end">

                          <button
                            onClick={() =>
                              abrirEditar(usuario)
                            }
                            className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-wider text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
                          >
                            Editar
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ==========================================
          MODAL EDITAR USUARIO
      ========================================== */}

      {mostrarFormulario && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 py-10 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/10 bg-[#0a160e] shadow-2xl">


            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">

              <div>

                <p className="text-[9px] uppercase tracking-[0.3em] text-[#9caf88]">
                  {esUsuarioActual
                    ? 'Your account'
                    : 'Edit user'}
                </p>

                <h3 className="mt-2 text-2xl font-light">
                  {esUsuarioActual
                    ? 'Edit my account'
                    : 'Edit user'}
                </h3>

              </div>


              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                className="text-xl text-white/30 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ×
              </button>

            </div>


            {/* AVISO PARA EL ADMINISTRADOR */}

            {esUsuarioActual && (

              <div className="mx-8 mt-6 border border-[#9caf88]/20 bg-[#9caf88]/5 px-5 py-4">

                <p className="text-xs leading-6 text-[#b7c7a5]">
                  You are editing your own account.
                  Por seguridad, tu rol y estado no pueden
                  cannot be changed here.
                </p>

              </div>

            )}


            {/* FORMULARIO */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-8"
            >


              {/* NOMBRE + APELLIDO */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    First name
                  </label>

                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="First name"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Last name
                  </label>

                  <input
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="Last name"
                  />

                </div>

              </div>


              {/* DOCUMENTO */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Tipo de documento
                  </label>

                  <select
                    name="tipo_documento"
                    value={form.tipo_documento}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/10 bg-[#0a160e] px-4 py-3 text-sm text-white outline-none focus:border-[#9caf88]/50"
                  >

                    <option value="">
                      Seleccionar
                    </option>

                    <option value="CC">
                      National ID
                    </option>

                    <option value="TI">
                      Tarjeta de identidad
                    </option>

                    <option value="CE">
                      Foreign ID
                    </option>

                    <option value="Pasaporte">
                      Pasaporte
                    </option>

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Document number
                  </label>

                  <input
                    name="numero_documento"
                    value={form.numero_documento}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="Document number"
                  />

                </div>

              </div>


              {/* DIRECCIÓN */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                  Dirección
                </label>

                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                  className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  placeholder="Dirección"
                />

              </div>


              {/* TELÉFONO + CORREO */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Teléfono
                  </label>

                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="Teléfono"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Correo electrónico
                  </label>

                  <input
                    name="correo"
                    type="email"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="correo@ejemplo.com"
                  />

                </div>

              </div>


              {/* CONTRASEÑA */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                  Nueva contraseña
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength="6"
                  className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  placeholder="Dejar vacío para conservar la actual"
                />

                <p className="mt-2 text-[10px] text-white/25">
                  Solo completa este campo si deseas cambiar la contraseña.
                </p>

              </div>


              {/* ROL + ESTADO */}

              <div className="grid gap-6 md:grid-cols-2">


                {/* ROL */}

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Rol
                  </label>

                  <select
                    name="rol_id"
                    value={form.rol_id}
                    onChange={handleChange}
                    disabled={esUsuarioActual}
                    required
                    className="w-full border border-white/10 bg-[#0a160e] px-4 py-3 text-sm text-white outline-none focus:border-[#9caf88]/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <option value="1">
                      Administrador
                    </option>

                    <option value="2">
                      Empleado
                    </option>

                    <option value="3">
                      Cliente
                    </option>

                  </select>

                  {esUsuarioActual && (

                    <p className="mt-2 text-[10px] text-white/25">
                      Tu rol no puede modificarse.
                    </p>

                  )}

                </div>


                {/* ESTADO */}

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Estado
                  </label>

                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    disabled={esUsuarioActual}
                    required
                    className="w-full border border-white/10 bg-[#0a160e] px-4 py-3 text-sm text-white outline-none focus:border-[#9caf88]/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <option value="1">
                      Activo
                    </option>

                    <option value="0">
                      Inactivo
                    </option>

                  </select>

                  {esUsuarioActual && (

                    <p className="mt-2 text-[10px] text-white/25">
                      Tu estado no puede modificarse.
                    </p>

                  )}

                </div>

              </div>


              {/* BOTONES */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-6">

                <button
                  type="button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  className="border border-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/50 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-[#9caf88] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#07100b] transition hover:bg-[#b7c7a5] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {guardando
                    ? 'Guardando...'
                    : 'Guardar cambios'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}
