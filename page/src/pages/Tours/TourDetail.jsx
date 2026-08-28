import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export function TourDetail() {

  const { id } = useParams();

  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarServicio = async () => {

    try {

      setCargando(true);
      setError('');

      const response = await fetch(
        `http://localhost:3000/api/servicios/${id}`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          'No se pudo obtener la experiencia.'
        );

      }

      setServicio(data.servicio);

    } catch (error) {

      console.error(
        'Error al cargar experiencia:',
        error
      );

      setError(
        'No pudimos cargar esta experiencia.'
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
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }
    ).format(precio);

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
              Cargando experiencia...
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
              Experiencia no encontrada
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {error || 'Esta experiencia no existe.'}
            </p>

            <Link
              to="/tours"
              className="mt-8 inline-flex border border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
            >
              ← Volver a experiencias
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
            ← Todas las experiencias
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
                Duración
              </p>

              <p className="mt-2 text-sm text-white/70">
                {servicio.duracion || 'Por definir'}
              </p>

            </div>

            <div>

              <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                Desde
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
          Sobre esta experiencia
        </p>

        <h2 className="mt-5 text-3xl font-light">
          Descubre algo diferente.
        </h2>

        <p className="mt-8 text-base leading-8 text-white/50">
          {servicio.descripcion || 'No hay una descripción disponible para esta experiencia.'}
        </p>

      </section>

    </main>
  );
}