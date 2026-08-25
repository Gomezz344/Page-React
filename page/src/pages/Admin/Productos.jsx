import { useEffect, useState } from 'react';

export function Productos() {
  const [productos, setProductos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    stock: '',
    estado: 1,
  });

  // ==============================
  // CARGAR PRODUCTOS
  // ==============================

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:3000/api/productos'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudieron cargar los productos.'
        );
      }

      setProductos(data);

    } catch (error) {
      console.error(
        'Error al cargar productos:',
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // CARGAR AL INICIAR
  // ==============================

  useEffect(() => {
    cargarProductos();
  }, []);

  // ==============================
  // CAMBIAR FORMULARIO
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // ==============================
  // LIMPIAR FORMULARIO
  // ==============================

  const limpiarFormulario = () => {
    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      stock: '',
      estado: 1,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ==============================
  // CREAR / EDITAR
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      const producto = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        imagen: form.imagen,
        stock: Number(form.stock),
        estado: Number(form.estado),
      };

      let response;

      // EDITAR
      if (editingId) {
        response = await fetch(
          `http://localhost:3000/api/productos/${editingId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto),
          }
        );
      }

      // CREAR
      else {
        response = await fetch(
          'http://localhost:3000/api/productos',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'No se pudo guardar el producto.'
        );
      }

      // Actualizar lista
      await cargarProductos();

      // Limpiar formulario
      limpiarFormulario();

    } catch (error) {
      console.error(
        'Error al guardar producto:',
        error
      );

      setError(error.message);
    }
  };

  // ==============================
  // EDITAR PRODUCTO
  // ==============================

  const handleEdit = (producto) => {
    setEditingId(producto.id);

    setForm({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || '',
      imagen: producto.imagen || '',
      stock: producto.stock || '',
      estado: producto.estado ?? 1,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ==============================
  // CANCELAR EDICIÓN
  // ==============================

  const handleCancel = () => {
    limpiarFormulario();
  };

  // ==============================
  // ELIMINAR PRODUCTO
  // ==============================

  const handleDelete = async (id) => {
    const confirmar = window.confirm(
      '¿Estás seguro de que quieres eliminar este producto?'
    );

    if (!confirmar) {
      return;
    }

    try {
      setError('');
      setDeletingId(id);

      const response = await fetch(
        `http://localhost:3000/api/productos/${id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'No se pudo eliminar el producto.'
        );
      }

      // Si estamos editando este producto,
      // cerramos el formulario.
      if (editingId === id) {
        handleCancel();
      }

      // Actualizar lista
      await cargarProductos();

    } catch (error) {
      console.error(
        'Error al eliminar producto:',
        error
      );

      setError(error.message);

    } finally {
      setDeletingId(null);
    }
  };

  // ==============================
  // RENDER
  // ==============================

  return (
    <main className="min-h-screen bg-[#07100b] px-6 py-32 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <h1 className="text-4xl font-light tracking-wide">
              Productos
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Gestiona los productos de Wildlife.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                limpiarFormulario();
              } else {
                setShowForm(true);
              }
            }}
            className="border border-[#9caf88]/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#9caf88] transition hover:bg-[#9caf88]/10"
          >
            {showForm
              ? 'Cancelar'
              : 'Nuevo producto'}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* FORMULARIO */}

        {showForm && (
          <section className="mb-12 border border-white/10 bg-white/[0.02] p-6 sm:p-8">

            <div className="mb-8">

              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#9caf88]">
                {editingId
                  ? 'Editar'
                  : 'Crear'}
              </p>

              <h2 className="text-2xl font-light">
                {editingId
                  ? 'Editar producto'
                  : 'Nuevo producto'}
              </h2>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* NOMBRE */}

              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                >
                  Nombre
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre del producto"
                  className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/60"
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div>
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Descripción del producto"
                  className="w-full resize-none border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/60"
                />
              </div>

              {/* PRECIO / STOCK */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="precio"
                    className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                  >
                    Precio
                  </label>

                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                  >
                    Stock
                  </label>

                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/60"
                  />
                </div>

              </div>

              {/* IMAGEN */}

              <div>
                <label
                  htmlFor="imagen"
                  className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                >
                  Imagen
                </label>

                <input
                  id="imagen"
                  name="imagen"
                  type="text"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="URL de la imagen"
                  className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/60"
                />
              </div>

              {/* ESTADO */}

              <div>
                <label
                  htmlFor="estado"
                  className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50"
                >
                  Estado
                </label>

                <select
                  id="estado"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full border border-white/10 bg-[#0b160f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9caf88]/60"
                >
                  <option value="1">
                    Activo
                  </option>

                  <option value="0">
                    Inactivo
                  </option>
                </select>
              </div>

              {/* BOTONES */}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">

                <button
                  type="submit"
                  className="flex-1 bg-[#9caf88] py-3.5 text-xs uppercase tracking-[0.25em] text-[#07100b] transition hover:bg-[#b7c7a5]"
                >
                  {editingId
                    ? 'Guardar cambios'
                    : 'Crear producto'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-white/10 px-6 py-3.5 text-xs uppercase tracking-[0.25em] text-white/50 transition hover:border-white/20 hover:text-white"
                >
                  Cancelar
                </button>

              </div>

            </form>
          </section>
        )}

        {/* LISTADO */}

        <section>

          <div className="mb-6 flex items-center justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                Inventario
              </p>

              <h2 className="mt-2 text-2xl font-light">
                Productos registrados
              </h2>
            </div>

            <span className="text-sm text-white/30">
              {productos.length} productos
            </span>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="border border-white/10 px-6 py-12 text-center text-sm text-white/30">
              Cargando productos...
            </div>
          ) : productos.length === 0 ? (

            /* SIN PRODUCTOS */

            <div className="border border-white/10 px-6 py-16 text-center">

              <p className="text-sm text-white/30">
                No hay productos registrados.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 text-xs uppercase tracking-[0.2em] text-[#9caf88] transition hover:text-[#b7c7a5]"
              >
                Crear el primer producto
              </button>

            </div>

          ) : (

            /* PRODUCTOS */

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {productos.map((producto) => (

                <article
                  key={producto.id}
                  className="overflow-hidden border border-white/10 bg-white/[0.02] transition hover:border-[#9caf88]/30"
                >

                  {/* IMAGEN */}

                  {producto.imagen ? (
                    <div className="h-48 overflow-hidden bg-black">

                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />

                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-white/[0.02]">

                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                        Sin imagen
                      </span>

                    </div>
                  )}

                  {/* INFORMACIÓN */}

                  <div className="p-5">

                    <div className="mb-4 flex items-start justify-between gap-4">

                      <h3 className="text-lg font-light">
                        {producto.nombre}
                      </h3>

                      <span
                        className={`shrink-0 text-[9px] uppercase tracking-wider ${
                          Number(producto.estado) === 1
                            ? 'text-[#9caf88]'
                            : 'text-red-300/60'
                        }`}
                      >
                        {Number(producto.estado) === 1
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>

                    </div>

                    <p className="mb-5 min-h-[40px] text-sm leading-6 text-white/40">
                      {producto.descripcion ||
                        'Sin descripción.'}
                    </p>

                    <div className="mb-5 flex items-center justify-between">

                      <span className="text-lg text-[#9caf88]">
                        $
                        {Number(
                          producto.precio
                        ).toLocaleString(
                          'es-CO'
                        )}
                      </span>

                      <span className="text-xs text-white/30">
                        Stock: {producto.stock}
                      </span>

                    </div>

                    {/* ACCIONES */}

                    <div className="flex gap-3 border-t border-white/10 pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(producto)
                        }
                        className="flex-1 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-white/50 transition hover:border-[#9caf88]/30 hover:text-[#9caf88]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(producto.id)
                        }
                        disabled={
                          deletingId === producto.id
                        }
                        className="flex-1 border border-red-400/10 px-3 py-2 text-[10px] uppercase tracking-wider text-red-300/60 transition hover:border-red-400/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {deletingId === producto.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}