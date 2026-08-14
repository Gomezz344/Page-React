import { Link } from 'react-router-dom';

import forest from '../../assets/images/img2.jpg';
import nature from '../../assets/images/img3.jpg';

export function About() {
  return (
    <main className="min-h-screen bg-[#07100b] text-white">

      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

        <img
          src={forest}
          alt="Wild forest"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#07100b]" />

        <div className="relative z-10 px-6 text-center">

          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/60">
            Wild & Free
          </p>

          <h1 className="text-5xl font-light tracking-[0.15em] sm:text-7xl">
            Our Story
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg font-light leading-relaxed text-white/70 sm:text-xl">
            We believe the wild should remain wild.
          </p>

        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/40">
          ↓
        </div>

      </section>


      {/* INTRODUCTION */}
      <section className="mx-auto max-w-[900px] px-6 py-32 text-center">

        <p className="text-2xl font-light leading-relaxed text-white/80 sm:text-4xl">
          Nature doesn't need to be improved.
          <span className="text-[#9caf88]">
            {' '}It needs to be understood.
          </span>
        </p>

        <div className="mx-auto mt-10 h-px w-12 bg-[#9caf88]/60" />

        <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/45">
          Wild & Free was created to celebrate the beauty of the natural
          world and the creatures that call it home.
        </p>

      </section>


      {/* IMAGE + TEXT */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 py-20 md:grid-cols-2">

        <div className="overflow-hidden">

          <img
            src={nature}
            alt="Nature"
            className="h-[550px] w-full object-cover transition duration-700 hover:scale-105"
          />

        </div>

        <div>

          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#9caf88]">
            Why Wild & Free
          </p>

          <h2 className="text-3xl font-light leading-tight sm:text-4xl">
            A world worth
            <br />
            discovering.
          </h2>

          <p className="mt-7 text-sm leading-8 text-white/50">
            From the silence of ancient forests to the movement of
            oceans and the freedom of a bird in flight, nature has a
            story to tell.
          </p>

          <p className="mt-5 text-sm leading-8 text-white/50">
            Wild & Free is a space created to inspire curiosity,
            appreciation and respect for the world around us.
          </p>

        </div>

      </section>


      {/* PHILOSOPHY */}
      <section className="px-6 py-32">

        <div className="mx-auto max-w-[1100px]">

          <div className="mb-20 text-center">

            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#9caf88]">
              Our philosophy
            </p>

            <h2 className="text-3xl font-light sm:text-4xl">
              What we believe
            </h2>

          </div>


          <div className="grid gap-12 md:grid-cols-3">

            <Philosophy
              number="01"
              title="Discover"
              text="The first step is curiosity. Explore the places and creatures that make our planet extraordinary."
            />

            <Philosophy
              number="02"
              title="Respect"
              text="Every creature has a place in the world. Understanding nature begins with respecting it."
            />

            <Philosophy
              number="03"
              title="Protect"
              text="What we learn to appreciate, we learn to protect. The wild deserves space to remain free."
            />

          </div>

        </div>

      </section>


      {/* FINAL STATEMENT */}
      <section className="relative overflow-hidden border-y border-white/10 px-6 py-40">

        <div className="absolute inset-0 bg-[#0b160f]" />

        <div className="relative mx-auto max-w-[1000px] text-center">

          <p className="text-4xl font-light leading-tight tracking-wide text-white/90 sm:text-6xl">
            Wild is not a place.
          </p>

          <p className="mt-4 text-4xl font-light leading-tight tracking-wide text-[#9caf88] sm:text-6xl">
            Wild is freedom.
          </p>

          <div className="mx-auto mt-10 h-px w-16 bg-[#9caf88]/60" />

        </div>

      </section>


      {/* CTA */}
      <section className="px-6 py-32">

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
            className="mt-10 inline-block border border-white/25 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/75 transition duration-300 hover:border-[#9caf88] hover:bg-[#9caf88] hover:text-[#07100b]"
          >
            Explore the world →
          </Link>

        </div>

      </section>

    </main>
  );
}


/* PHILOSOPHY */

function Philosophy({ number, title, text }) {
  return (
    <div className="border-t border-white/10 pt-7">

      <p className="text-xs tracking-[0.25em] text-[#9caf88]">
        {number}
      </p>

      <h3 className="mt-5 text-2xl font-light">
        {title}
      </h3>

      <p className="mt-5 text-sm leading-7 text-white/45">
        {text}
      </p>

    </div>
  );
}