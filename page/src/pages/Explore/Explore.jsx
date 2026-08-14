import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import natureImg from '../../assets/images/forest.png';
import Ocean from '../../assets/images/ocean.jpg';
import Mountains from '../../assets/images/mountain.jpg';
import Paisaje from '../../assets/images/paisaje2.avif';

import Tucan from '../../assets/images/tucan.jpg';
import tiger from '../../assets/images/tigre.webp';
import wolf from '../../assets/images/wolf.jpg';
import eagle from '../../assets/images/eagle.jpg';


export function Explore() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07100b] text-white">


      {/* =========================
          HERO
      ========================== */}

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

        <img
          src={Paisaje}
          alt="Wild landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#07100b]/80 via-transparent to-[#07100b]" />


        <div className="relative z-10 max-w-[900px] px-6 text-center">

          <p className="mb-7 text-xs uppercase tracking-[0.5em] text-[#b7c7a5]">
            Explore
          </p>

          <h1 className="text-5xl font-light leading-tight tracking-wide sm:text-7xl lg:text-8xl">
            There is more
            <br />
            <span className="text-[#b7c7a5]">
              to discover.
            </span>
          </h1>

          <div className="mx-auto mt-10 h-px w-16 bg-white/50" />

          <p className="mx-auto mt-8 max-w-xl text-sm leading-8 text-white/60">
            From quiet forests to endless oceans,
            the wild has no limits.
          </p>

        </div>


        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">

          <div className="flex flex-col items-center gap-3 text-white/40">

            <span className="text-[10px] uppercase tracking-[0.3em]">
              Explore
            </span>

            <span className="animate-bounce">
              ↓
            </span>

          </div>

        </div>

      </section>



      {/* =========================
          INTRO
      ========================== */}

      <Reveal>

        <section className="px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[1000px]">

            <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
              The world is waiting
            </p>

            <div className="grid gap-10 md:grid-cols-2">

              <h2 className="text-4xl font-light leading-tight tracking-wide sm:text-5xl">
                Every place has
                <br />
                a story.
              </h2>

              <div>

                <p className="text-sm leading-8 text-white/50">
                  There are places where the world feels untouched.
                  Landscapes shaped by time, weather and life.
                </p>

                <p className="mt-5 text-sm leading-8 text-white/40">
                  Explore different environments and discover
                  the beauty hidden within them.
                </p>

              </div>

            </div>

          </div>

        </section>

      </Reveal>



      {/* =========================
          ENVIRONMENTS
      ========================== */}

      <Reveal>

        <section className="px-6 pb-32 sm:pb-40">

          <div className="mx-auto max-w-[1200px]">

            <div className="mb-16">

              <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                Environments
              </p>

              <h2 className="text-4xl font-light tracking-wide sm:text-5xl">
                Find your wild.
              </h2>

            </div>


            <div className="grid gap-4 md:grid-cols-3">

              <EnvironmentCard
                image={natureImg}
                number="01"
                title="Forests"
                description="Discover the silence."
              />

              <EnvironmentCard
                image={Ocean}
                number="02"
                title="Oceans"
                description="Explore the unknown."
              />

              <EnvironmentCard
                image={Mountains}
                number="03"
                title="Mountains"
                description="Reach beyond the horizon."
              />

            </div>

          </div>

        </section>

      </Reveal>



      {/* =========================
          FEATURED LANDSCAPE
      ========================== */}

      <Reveal>

        <section className="px-6 py-32 sm:py-40">

          <div className="mx-auto grid max-w-[1200px] items-center gap-14 md:grid-cols-2">

            <div className="relative overflow-hidden">

              <img
                src={natureImg}
                alt="Forest"
                className="h-[600px] w-full object-cover transition duration-[1500ms] hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <span className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.3em] text-white/60">
                Forest
              </span>

            </div>


            <div>

              <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                01 / Forests
              </p>

              <h2 className="text-4xl font-light leading-tight sm:text-5xl">
                Where the world
                <br />
                breathes.
              </h2>

              <div className="mt-8 h-px w-12 bg-[#9caf88]/60" />

              <p className="mt-8 text-sm leading-8 text-white/50">
                Forests are among the most complex ecosystems
                on Earth. Every sound, movement and ray of light
                becomes part of a much larger story.
              </p>

              <Link
                to="/wildlife"
                className="group mt-8 inline-flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/60 transition hover:text-[#9caf88]"
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
          WILDLIFE PREVIEW
      ========================== */}

      <Reveal>

        <section className="px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[1200px]">

            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div>

                <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                  Wildlife
                </p>

                <h2 className="text-4xl font-light tracking-wide sm:text-5xl">
                  Life everywhere.
                </h2>

              </div>

              <Link
                to="/wildlife"
                className="group inline-flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/60 transition hover:text-[#9caf88]"
              >
                View all wildlife

                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <WildlifeCard
                image={tiger}
                name="Tiger"
              />

              <WildlifeCard
                image={wolf}
                name="Wolf"
              />

              <WildlifeCard
                image={eagle}
                name="Eagle"
              />

              <WildlifeCard
                image={Tucan}
                name="Toucan"
              />

            </div>

          </div>

        </section>

      </Reveal>



      {/* =========================
          FINAL STATEMENT
      ========================== */}

      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">

        <img
          src={Mountains}
          alt="Mountains"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#07100b] via-transparent to-[#07100b]" />


        <div className="relative z-10 px-6 text-center">

          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-[#b7c7a5]">
            Keep looking
          </p>

          <h2 className="text-4xl font-light leading-tight sm:text-6xl">
            The world is
            <br />
            <span className="text-[#b7c7a5]">
              bigger than you think.
            </span>
          </h2>

          <Link
            to="/wildlife"
            className="mt-10 inline-flex border border-white/25 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/80 transition duration-500 hover:border-[#9caf88] hover:bg-[#9caf88] hover:text-[#07100b]"
          >
            Meet the wild
          </Link>

        </div>

      </section>


    </main>
  );
}



/* =================================
   REVEAL
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
   ENVIRONMENT CARD
================================= */

function EnvironmentCard({
  image,
  number,
  title,
  description
}) {

  return (

    <Link
      to="/explore"
      className="group relative h-[550px] overflow-hidden"
    >

      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-black/20 transition duration-700 group-hover:bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />


      <span className="absolute left-6 top-6 text-xs tracking-[0.2em] text-white/50">
        {number}
      </span>


      <div className="absolute bottom-0 left-0 right-0 p-8">

        <h3 className="text-3xl font-light">
          {title}
        </h3>

        <p className="mt-3 text-sm text-white/50">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#b7c7a5]">

          <span>
            Explore
          </span>

          <span className="transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>

        </div>

      </div>

    </Link>

  );
}



/* =================================
   WILDLIFE CARD
================================= */

function WildlifeCard({ image, name }) {

  return (

    <Link
      to="/wildlife"
      className="group relative h-[420px] overflow-hidden"
    >

      <img
        src={image}
        alt={name}
        className="h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-black/20 transition duration-700 group-hover:bg-black/40" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />


      <div className="absolute bottom-0 left-0 right-0 p-7">

        <h3 className="text-3xl font-light">
          {name}
        </h3>

        <div className="mt-3 h-px w-8 bg-[#9caf88] transition-all duration-500 group-hover:w-16" />

      </div>

    </Link>

  );
}