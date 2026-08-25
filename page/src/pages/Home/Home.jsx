import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carrusel } from '../../components/Carrusel/Carrusel';
import { Footer } from '../../components/Footer/Footer';

import natureImg from '../../assets/images/forest.png';
import Ocean from '../../assets/images/ocean.jpg';
import Mountains from '../../assets/images/mountain.jpg';
import Paisaje from '../../assets/images/paisaje.jpg';

import Tucan from '../../assets/images/tucan.jpg';
import tiger from '../../assets/images/tigre.webp';
import wolf from '../../assets/images/wolf.jpg';
import eagle from '../../assets/images/eagle.jpg';


/* =================================
   HOME
================================= */

export function Home() {

  return (
    
    <main className="overflow-hidden bg-[#07100b] text-white">

      {/* =========================
          CARRUSEL
          NO TOCADO
      ========================== */}
      <Carrusel />


      {/* =========================
          A WORLD WITHOUT BORDERS
      ========================== */}
      <Reveal>

        <section className="relative overflow-hidden px-6 py-32 sm:py-40">

          <div className="mx-auto grid max-w-[1100px] items-center gap-16 md:grid-cols-2">

            {/* TEXTO */}
            <div>

              <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                Wild & Free
              </p>

              <h2 className="text-4xl font-light leading-tight tracking-wide sm:text-5xl">
                A world without
                <br />
                borders.
              </h2>

              <div className="mt-7 h-px w-12 bg-[#9caf88]/60" />

              <p className="mt-7 max-w-lg text-sm leading-8 text-white/50">
                Nature doesn't follow lines.
                Neither should we.
              </p>

              <p className="mt-4 max-w-lg text-sm leading-8 text-white/40">
                From the deepest oceans to the highest mountains,
                the natural world exists without borders. Wild & Free
                is an invitation to explore it.
              </p>

              <Link
                to="/explore"
                className="group mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/70 transition duration-300 hover:text-[#9caf88]"
              >
                Explore the wild

                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

            </div>


            {/* IMAGEN */}
            <div className="group relative overflow-hidden">

              <img
                src={natureImg}
                alt="Forest"
                className="h-[500px] w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                  Into the wild
                </span>
              </div>

            </div>

          </div>

        </section>

      </Reveal>


      {/* =========================
          DISCOVER THE WORLD
      ========================== */}
      <Reveal>

        <section className="relative px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[1200px]">

            {/* TÍTULO */}
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div>

                <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                  Discover
                </p>

                <h2 className="text-4xl font-light tracking-wide sm:text-5xl">
                  The world is waiting.
                </h2>

              </div>

              <p className="max-w-md text-sm leading-7 text-white/40 md:text-right">
                Every landscape has its own rhythm, its own story,
                and its own way of being wild.
              </p>

            </div>


            {/* PAISAJES */}
            <div className="grid gap-4 md:grid-cols-3">

              <Landscape
                image={natureImg}
                title="Forests"
                number="01"
              />

              <Landscape
                image={Ocean}
                title="Oceans"
                number="02"
              />

              <Landscape
                image={Mountains}
                title="Mountains"
                number="03"
              />

            </div>

          </div>

        </section>

      </Reveal>


      {/* =========================
          MEET THE WILD
      ========================== */}
      <Reveal>

        <section className="relative px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[1200px]">

            {/* TÍTULO */}
            <div className="mb-16">

              <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                Wildlife
              </p>

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

                <h2 className="text-4xl font-light tracking-wide sm:text-5xl">
                  Meet the wild.
                </h2>

                <p className="max-w-md text-sm leading-7 text-white/40 md:text-right">
                  Every creature has a story.
                  Discover some of the lives that make our planet extraordinary.
                </p>

              </div>

            </div>


            {/* ANIMALES */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Animal
                image={tiger}
                name="Tiger"
                scientific="Panthera tigris"
                description="The silent hunter."
                number="01"
              />

              <Animal
                image={wolf}
                name="Wolf"
                scientific="Canis lupus"
                description="Born to roam."
                number="02"
              />

              <Animal
                image={eagle}
                name="Eagle"
                scientific="Aquila"
                description="Freedom above the clouds."
                number="03"
              />

              <Animal
                image={Tucan}
                name="Toucan"
                scientific="Ramphastidae"
                description="A splash of color in the wild."
                number="04"
              />

            </div>


            {/* LINK */}
            <div className="mt-12 flex justify-end">

              <Link
                to="/wildlife"
                className="group inline-flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/60 transition duration-300 hover:text-[#9caf88]"
              >
                Discover wildlife

                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

            </div>

          </div>

        </section>

      </Reveal>


      {/* =========================
          CINEMATIC SECTION
      ========================== */}
      <section className="group relative flex min-h-screen items-center justify-center overflow-hidden">

        {/* IMAGEN */}
        <img
          src={Paisaje}
          alt="Wild nature"
          className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-100"
        />

        {/* OSCURECER */}
        <div className="absolute inset-0 bg-black/45" />

        {/* GRADIENTES */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07100b]/90 via-transparent to-[#07100b]" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />


        {/* CONTENIDO */}
        <div className="relative z-10 px-6 text-center">

          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-white/60">
            Wild & Free
          </p>

          <h2 className="text-5xl font-light leading-tight tracking-wide text-white sm:text-7xl lg:text-8xl">

            Wild is not
            <br />

            <span className="text-[#b7c7a5]">
              a place.
            </span>

          </h2>

          <div className="mx-auto my-10 h-px w-16 bg-white/50" />

          <p className="text-4xl font-light tracking-wide text-white/90 sm:text-6xl">
            Wild is freedom.
          </p>

        </div>


        {/* INDICADOR */}
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">

          <div className="flex flex-col items-center gap-3 text-white/40">

            <span className="text-[10px] uppercase tracking-[0.3em]">
              Keep exploring
            </span>

            <span className="animate-bounce text-lg">
              ↓
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          KEEP EXPLORING
      ========================== */}
      <Reveal>

        <section className="relative px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[800px] text-center">

            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#9caf88]">
              Keep exploring
            </p>

            <h2 className="text-4xl font-light sm:text-5xl">
              The wild is waiting.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/45">
              There is always another place to discover,
              another creature to meet and another story to tell.
            </p>

            <Link
              to="/explore"
              className="group mt-10 inline-flex items-center gap-4 border border-white/20 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/75 transition duration-500 hover:border-[#9caf88] hover:bg-[#9caf88] hover:text-[#07100b]"
            >
              Explore the world

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>

            </Link>

          </div>

        </section>

      </Reveal>


      {/* =========================
          FOOTER
      ========================== */}
      <Footer />

    </main>
  );
}


/* =================================
   REVEAL
   Animación al entrar en pantalla
================================= */

function Reveal({ children }) {

  const ref = useRef(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {

    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting) {

          setVisible(true);

          observer.unobserve(element);

        }

      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();

  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1000ms] ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-10 opacity-0'
      }`}
    >
      {children}
    </div>
  );
}


/* =================================
   LANDSCAPE
================================= */

function Landscape({ image, title, number }) {

  return (

    <Link
      to="/explore"
      className="group relative h-[500px] overflow-hidden"
    >

      {/* IMAGEN */}
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/25 transition duration-700 group-hover:bg-black/50" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />


      {/* NÚMERO */}
      <span className="absolute left-6 top-6 text-xs tracking-[0.2em] text-white/50">
        {number}
      </span>


      {/* CONTENIDO */}
      <div className="absolute inset-x-0 bottom-0 p-7">

        <div className="flex items-end justify-between gap-4">

          <div>

            <h3 className="text-3xl font-light tracking-wide">
              {title}
            </h3>

            <div className="mt-3 h-px w-8 bg-[#9caf88]/70 transition-all duration-500 group-hover:w-16" />

          </div>

          <span className="translate-x-2 text-xs uppercase tracking-[0.2em] text-[#b7c7a5] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
            Explore →
          </span>

        </div>

      </div>

    </Link>

  );
}


/* =================================
   ANIMAL
================================= */

function Animal({
  image,
  name,
  scientific,
  description,
  number
}) {

  return (

    <Link
      to="/wildlife"
      className="group relative h-[450px] overflow-hidden"
    >

      {/* IMAGEN */}
      <img
        src={image}
        alt={name}
        className="h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
      />


      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-black/10 transition duration-700 group-hover:bg-black/30" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />


      {/* NÚMERO */}
      <span className="absolute right-6 top-6 text-xs tracking-[0.2em] text-white/40">
        {number}
      </span>


      {/* CONTENIDO */}
      <div className="absolute inset-x-0 bottom-0 p-7">

        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#b7c7a5]/70">
          {scientific}
        </p>

        <h3 className="text-3xl font-light">
          {name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-3">

          <p className="text-sm text-white/50">
            {description}
          </p>

          <span className="translate-x-2 whitespace-nowrap text-xs uppercase tracking-[0.15em] text-[#b7c7a5] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
            Discover →
          </span>

        </div>

      </div>

    </Link>

  );
}