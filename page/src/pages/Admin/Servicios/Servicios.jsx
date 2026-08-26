import { useEffect, useState } from 'react';

export function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    imagen: '',
    estado: 1,
  });


  // ==========================================
  // OBTENER SERVICIOS
  // ==========================================

  const cargarServicios = async () => {

    try {

      setCargando(true);
      setError('');

      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');

      const response = await fetch(
        'http://localhost:3000/api/servicios',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Error al obtener los servicios.'
        );
      }

      setServicios(data);

    } catch (error) {

      console.error(
        'Error al cargar servicios:',
        error
      );

      setError(error.message);

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {
    cargarServicios();
  }, []);


  // ==========================================
  // CAMBIAR CAMPOS DEL FORMULARIO
  // ==========================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

  };


  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================

  const limpiarFormulario = () => {

    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      imagen: '',
      estado: 1,
    });

    setEditando(null);

  };


  // ==========================================
  // ABRIR CREAR
  // ==========================================

  const abrirCrear = () => {

    limpiarFormulario();

    setMostrarFormulario(true);

  };


  // ==========================================
  // ABRIR EDITAR
  // ==========================================

  const abrirEditar = (servicio) => {

    setEditando(servicio.id);

    setForm({
      nombre: servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      precio: servicio.precio ?? '',
      duracion: servicio.duracion || '',
      imagen: servicio.imagen || '',
      estado: servicio.estado ?? 1,
    });

    setMostrarFormulario(true);

  };


  // ==========================================
  // GUARDAR SERVICIO
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setError('');

      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');

      const servicio = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        duracion: form.duracion,
        imagen: form.imagen,
        estado: Number(form.estado),
      };


      const url = editando
        ? `http://localhost:3000/api/servicios/${editando}`
        : 'http://localhost:3000/api/servicios';

      const method = editando
        ? 'PUT'
        : 'POST';


      const response = await fetch(url, {

        method,

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(servicio),

      });


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'No se pudo guardar el servicio.'
        );

      }


      setMostrarFormulario(false);

      limpiarFormulario();

      await cargarServicios();

    } catch (error) {

      console.error(
        'Error al guardar servicio:',
        error
      );

      setError(error.message);

    }

  };


  // ==========================================
  // ELIMINAR SERVICIO
  // ==========================================

  const eliminarServicio = async (id) => {

    const confirmar = window.confirm(
      '¿Seguro que quieres eliminar este servicio?'
    );

    if (!confirmar) return;


    try {

      setError('');

      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');


      const response = await fetch(
        `http://localhost:3000/api/servicios/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'No se pudo eliminar el servicio.'
        );

      }


      await cargarServicios();

    } catch (error) {

      console.error(
        'Error al eliminar servicio:',
        error
      );

      setError(error.message);

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

          <h2 className="text-3xl font-light">
            Servicios
          </h2>

        </div>


        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">

          <p className="text-sm text-white/40">
            Cargando servicios...
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

      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
            Management
          </p>

          <h2 className="text-3xl font-light tracking-wide">
            Servicios
          </h2>

          <p className="mt-3 text-sm text-white/40">
            Gestiona los servicios disponibles en Wildlife.
          </p>

        </div>


        <button
          onClick={abrirCrear}
          className="border border-[#9caf88]/40 bg-[#9caf88] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#07100b] transition hover:bg-[#b7c7a5]"
        >
          + Nuevo servicio
        </button>

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

          <table className="w-full min-w-[1000px]">

            <thead className="border-b border-white/10">

              <tr className="text-left">

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Servicio
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Precio
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Duración
                </th>

                <th className="px-6 py-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Estado
                </th>

                <th className="px-6 py-5 text-right text-[9px] uppercase tracking-[0.25em] text-white/30">
                  Acciones
                </th>

              </tr>

            </thead>


            <tbody>

              {servicios.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-16 text-center"
                  >

                    <p className="text-sm text-white/30">
                      No hay servicios registrados.
                    </p>


                    <button
                      onClick={abrirCrear}
                      className="mt-4 text-xs uppercase tracking-[0.2em] text-[#9caf88] hover:text-[#b7c7a5]"
                    >
                      Crear el primero
                    </button>

                  </td>

                </tr>

              ) : (

                servicios.map((servicio) => (

                  <tr
                    key={servicio.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >

                    {/* SERVICIO */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="h-14 w-14 overflow-hidden border border-white/10 bg-white/5">

                          {servicio.imagen ? (

                            <img
                              src={servicio.imagen}
                              alt={servicio.nombre}
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-wider text-white/20">
                              No image
                            </div>

                          )}

                        </div>


                        <div>

                          <p className="text-sm text-white">
                            {servicio.nombre}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-white/30">
                            {servicio.descripcion || 'Sin descripción'}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* PRECIO */}

                    <td className="px-6 py-5">

                      <p className="text-sm text-white/80">
                        $
                        {Number(
                          servicio.precio
                        ).toLocaleString('es-CO')}
                      </p>

                    </td>


                    {/* DURACIÓN */}

                    <td className="px-6 py-5">

                      <p className="text-sm text-white/60">
                        {servicio.duracion || 'No especificada'}
                      </p>

                    </td>


                    {/* ESTADO */}

                    <td className="px-6 py-5">

                      {servicio.estado === 1 ? (

                        <span className="border border-[#9caf88]/20 bg-[#9caf88]/5 px-3 py-1 text-[9px] uppercase tracking-wider text-[#9caf88]">
                          Activo
                        </span>

                      ) : (

                        <span className="border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-wider text-white/30">
                          Inactivo
                        </span>

                      )}

                    </td>


                    {/* ACCIONES */}

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            abrirEditar(servicio)
                          }
                          className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-wider text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
                        >
                          Editar
                        </button>


                        <button
                          onClick={() =>
                            eliminarServicio(servicio.id)
                          }
                          className="border border-red-400/10 px-4 py-2 text-[9px] uppercase tracking-wider text-red-300/50 transition hover:border-red-400/30 hover:text-red-300"
                        >
                          Eliminar
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ==========================================
          MODAL CREAR / EDITAR
      ========================================== */}

      {mostrarFormulario && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 py-10 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-[#0a160e] shadow-2xl">


            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">

              <div>

                <p className="text-[9px] uppercase tracking-[0.3em] text-[#9caf88]">

                  {editando
                    ? 'Edit service'
                    : 'New service'}

                </p>


                <h3 className="mt-2 text-2xl font-light">

                  {editando
                    ? 'Editar servicio'
                    : 'Crear servicio'}

                </h3>

              </div>


              <button
                onClick={() => {

                  setMostrarFormulario(false);

                  limpiarFormulario();

                }}
                className="text-xl text-white/30 transition hover:text-white"
              >
                ×
              </button>

            </div>


            {/* FORMULARIO */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-8"
            >


              {/* NOMBRE */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                  Nombre
                </label>

                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  placeholder="Nombre del servicio"
                />

              </div>


              {/* DESCRIPCIÓN */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full resize-none border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  placeholder="Descripción del servicio"
                />

              </div>


              {/* PRECIO + DURACIÓN */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Precio
                  </label>

                  <input
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="0.00"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Duración
                  </label>

                  <input
                    name="duracion"
                    value={form.duracion}
                    onChange={handleChange}
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                    placeholder="Ej: 3 horas"
                  />

                </div>

              </div>


              {/* IMAGEN */}

              <div>

                <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                  URL de imagen
                </label>

                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/50"
                  placeholder="https://..."
                />

              </div>


              {/* ESTADO */}

              {editando && (

                <div>

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-white/40">
                    Estado
                  </label>

                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full border border-white/10 bg-[#0a160e] px-4 py-3 text-sm text-white outline-none focus:border-[#9caf88]/50"
                  >

                    <option value="1">
                      Activo
                    </option>

                    <option value="0">
                      Inactivo
                    </option>

                  </select>

                </div>

              )}


              {/* BOTONES */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-6">

                <button
                  type="button"
                  onClick={() => {

                    setMostrarFormulario(false);

                    limpiarFormulario();

                  }}
                  className="border border-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/50 transition hover:text-white"
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="bg-[#9caf88] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#07100b] transition hover:bg-[#b7c7a5]"
                >

                  {editando
                    ? 'Guardar cambios'
                    : 'Crear servicio'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}