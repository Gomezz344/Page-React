import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroImg from '../../assets/images/tours.jpg'

export function Tours() {

  // ==========================================
  // ESTADOS
  // ==========================================

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');


  // ==========================================
  // OBTENER TOURS
  // ==========================================

  const cargarTours = async () => {

    try {

      setCargando(true);
      setError('');

      const response = await fetch(
        'http://localhost:3000/api/servicios'
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          'No se pudieron obtener los tours.'
        );

      }

      /*
       * El backend devuelve directamente:
       *
       * [
       *   {...},
       *   {...}
       * ]
       */

      setServicios(data || []);

    } catch (error) {

      console.error(
        'Error al cargar tours:',
        error
      );

      setError(
        'No pudimos cargar las experiencias en este momento.'
      );

    } finally {

      setCargando(false);

    }

  };


  // ==========================================
  // CARGAR AL ENTRAR
  // ==========================================

  useEffect(() => {

    cargarTours();

  }, []);


  // ==========================================
  // FORMATEAR PRECIO
  // ==========================================

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


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {

    return (

      <main className="min-h-screen bg-[#07100b] text-white">

        <section className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <p className="mt-4 text-sm text-white/40">
              Descubriendo experiencias...
            </p>

          </div>

        </section>

      </main>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <main className="min-h-screen bg-[#07100b] text-white">

        <section className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="max-w-md text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Wildlife
            </p>

            <h1 className="mt-5 text-3xl font-light">
              Algo salió mal
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {error}
            </p>

            <button
              onClick={cargarTours}
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
  // TOURS
  // ==========================================

  return (

    <main className="min-h-screen bg-[#07100b] text-white">


      {/* ======================================
          HERO
      ====================================== */}

      <section className="relative flex min-h-[75vh] items-end overflow-hidden">

        {/* Imagen de fondo */}

        <div className="absolute inset-0">

          <img
            src= {HeroImg}
            alt="Experiencia Wildlife"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#07100b] via-[#07100b]/30 to-transparent" />

        </div>


        {/* Contenido */}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">

          <p className="mb-5 text-[10px] uppercase tracking-[0.45em] text-[#b7c7a5]">
            Wildlife experiences
          </p>

          <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">

            La naturaleza
            <br />

            <span className="text-white/50">
              espera ser descubierta.
            </span>

          </h1>

          <p className="mt-7 max-w-xl text-sm leading-7 text-white/60 md:text-base">

            Explora la vida salvaje desde una perspectiva
            diferente. Viaja, observa y descubre sin dejar
            de respetar el mundo que nos rodea.

          </p>

        </div>

      </section>


      {/* ======================================
          INTRODUCCIÓN
      ====================================== */}

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">

        <div className="grid gap-12 md:grid-cols-[1fr_1.5fr]">

          <div>

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
              Nuestras experiencias
            </p>

            <h2 className="mt-5 text-3xl font-light leading-tight md:text-4xl">

              Más que un tour,
              <br />

              <span className="text-white/40">
                una conexión.
              </span>

            </h2>

          </div>


          <div className="max-w-2xl">

            <p className="text-base leading-8 text-white/50">

              Cada experiencia Wildlife está pensada para
              acercarte a la naturaleza de una manera
              responsable.

            </p>

            <p className="mt-5 text-base leading-8 text-white/50">

              No se trata solamente de llegar a un destino.
              Se trata de detenerse, observar y comprender
              la vida que existe alrededor de nosotros.

            </p>

          </div>

        </div>

      </section>


      {/* ======================================
          LISTADO DE TOURS
      ====================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-32 md:px-10">

        <div className="mb-12 flex items-end justify-between border-b border-white/10 pb-6">

          <div>

            <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
              Experiencias disponibles
            </p>

            <h2 className="mt-3 text-2xl font-light">
              Explora nuestros tours
            </h2>

          </div>

          <span className="hidden text-xs text-white/25 md:block">
            {servicios.length}{' '}
            {servicios.length === 1
              ? 'experiencia'
              : 'experiencias'}
          </span>

        </div>


        {servicios.length === 0 ? (

          <div className="border border-white/10 bg-white/[0.02] px-6 py-20 text-center">

            <p className="text-sm text-white/30">
              Actualmente no hay experiencias disponibles.
            </p>

          </div>

        ) : (

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {servicios
              .filter(
                (servicio) =>
                  Number(servicio.estado) === 1
              )
              .map((servicio) => (

                <article
                  key={servicio.id}
                  className="group overflow-hidden border border-white/10 bg-white/[0.02] transition duration-500 hover:border-[#9caf88]/30"
                >

                  {/* IMAGEN */}

                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0a160e]">

                    {servicio.imagen ? (

                      <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center">

                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">
                          Wildlife
                        </span>

                      </div>

                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07100b]/70 via-transparent to-transparent" />

                  </div>


                  {/* CONTENIDO */}

                  <div className="p-7">

                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#9caf88]">
                      Wildlife experience
                    </p>


                    <h3 className="mt-3 text-xl font-light">
                      {servicio.nombre}
                    </h3>


                    {servicio.descripcion && (

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/40">
                        {servicio.descripcion}
                      </p>

                    )}


                    {/* INFORMACIÓN */}

                    <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-5">

                      <div>

                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                          Duración
                        </p>

                        <p className="mt-2 text-sm text-white/60">
                          {servicio.duracion || 'Por definir'}
                        </p>

                      </div>


                      <div>

                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                          Desde
                        </p>

                        <p className="mt-2 text-sm text-white/60">
                          {formatearPrecio(servicio.precio)}
                        </p>

                      </div>

                    </div>


                    {/* ACCIÓN */}

                    <Link
                      to={`/tours/${servicio.id}`}
                      className="mt-6 flex items-center justify-between border border-white/10 px-5 py-3 transition duration-300 hover:border-[#9caf88]/40 hover:bg-[#9caf88]/5"
                    >

                      <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 transition group-hover:text-[#9caf88]">
                        Descubrir experiencia
                      </span>

                      <span className="text-white/30 transition group-hover:translate-x-1 group-hover:text-[#9caf88]">
                        →
                      </span>

                    </Link>

                  </div>

                </article>

              ))}

          </div>

        )}

      </section>


      {/* ======================================
          CTA
      ====================================== */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">

          <div className="grid items-end gap-10 md:grid-cols-2">

            <div>

              <p className="text-[10px] uppercase tracking-[0.4em] text-[#9caf88]">
                Wild & Free
              </p>

              <h2 className="mt-5 max-w-xl text-4xl font-light leading-tight md:text-5xl">

                Conocer la naturaleza
                <br />

                <span className="text-white/40">
                  también es protegerla.
                </span>

              </h2>

            </div>


            <div className="md:text-right">

              <p className="mx-auto max-w-md text-sm leading-7 text-white/40 md:ml-auto">

                Descubre nuevas especies, nuevos paisajes
                y nuevas formas de entender el mundo natural.

              </p>

              <Link
                to="/wildlife"
                className="mt-7 inline-flex border border-white/10 px-6 py-3 text-[9px] uppercase tracking-[0.25em] text-white/50 transition hover:border-[#9caf88]/40 hover:text-[#9caf88]"
              >
                Conocer Wildlife
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}