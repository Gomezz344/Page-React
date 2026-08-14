import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import tiger from '../../assets/images/tiger2.jpg';
import wolf from '../../assets/images/wolf.jpg';
import eagle from '../../assets/images/eagle.jpg';
import Tucan from '../../assets/images/tucan.jpg';

import natureImg from '../../assets/images/forest.png';
import Mountains from '../../assets/images/mountain.jpg';


const species = [
  {
    id: 'tiger',
    name: 'Tiger',
    scientific: 'Panthera tigris',
    image: tiger,
    habitat: 'Forest',
    diet: 'Carnivore',
    lifestyle: 'Solitary',
    status: 'Endangered',
    description:
      'Powerful, silent and elusive. The tiger is one of nature’s most remarkable predators.',
    quote: 'Strength does not always need to be seen.',
    color: '#172015',

    stats: {
      agility: 88,
      strength: 96,
      intelligence: 82,
      adaptability: 76,
    },

    habitats: ['Forest'],
  },

  {
    id: 'wolf',
    name: 'Wolf',
    scientific: 'Canis lupus',
    image: wolf,
    habitat: 'Forest',
    diet: 'Carnivore',
    lifestyle: 'Social',
    status: 'Least concern',
    description:
      'Born to roam. Wolves are highly social animals whose lives are built around cooperation and movement.',
    quote: 'The wild is not meant to be walked alone.',
    color: '#11191b',

    stats: {
      agility: 91,
      strength: 84,
      intelligence: 94,
      adaptability: 92,
    },

    habitats: ['Forest', 'Mountain'],
  },

  {
    id: 'eagle',
    name: 'Eagle',
    scientific: 'Aquila',
    image: eagle,
    habitat: 'Mountain',
    diet: 'Carnivore',
    lifestyle: 'Solitary',
    status: 'Varies by species',
    description:
      'A symbol of freedom and power, eagles rule the skies with extraordinary vision and precision.',
    quote: 'Freedom begins where the horizon ends.',
    color: '#10191d',

    stats: {
      agility: 95,
      strength: 87,
      intelligence: 89,
      adaptability: 78,
    },

    habitats: ['Mountain'],
  },

  {
    id: 'toucan',
    name: 'Toucan',
    scientific: 'Ramphastidae',
    image: Tucan,
    habitat: 'Forest',
    diet: 'Omnivore',
    lifestyle: 'Social',
    status: 'Varies by species',
    description:
      'A splash of color in the wild. Toucans are unmistakable birds found throughout tropical forests.',
    quote: 'Nature never runs out of color.',
    color: '#142016',

    stats: {
      agility: 83,
      strength: 48,
      intelligence: 79,
      adaptability: 86,
    },

    habitats: ['Forest'],
  },
];


const filters = [
  'All',
  'Forest',
  'Mountain',
  'Ocean',
];


export function Wildlife() {

  const [selectedSpecies, setSelectedSpecies] = useState(species[0]);

  const [activeFilter, setActiveFilter] = useState('All');

  const [showDetails, setShowDetails] = useState(false);

  const [isChanging, setIsChanging] = useState(false);

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const imageRef = useRef(null);


  /* =========================
     FILTER
  ========================== */

  const filteredSpecies =
    activeFilter === 'All'
      ? species
      : species.filter((animal) =>
          animal.habitats.includes(activeFilter)
        );


  /* =========================
     CHANGE SPECIES
  ========================== */

  const changeSpecies = (animal) => {

    if (animal.id === selectedSpecies.id) return;

    setIsChanging(true);

    setShowDetails(false);

    setTimeout(() => {

      setSelectedSpecies(animal);

      setMousePosition({
        x: 0,
        y: 0,
      });

      setIsChanging(false);

    }, 350);

  };


  /* =========================
     RANDOM SPECIES
  ========================== */

  const discoverRandomSpecies = () => {

    const available =
      filteredSpecies.length > 0
        ? filteredSpecies
        : species;

    let random =
      available[
        Math.floor(Math.random() * available.length)
      ];


    if (available.length > 1) {

      while (random.id === selectedSpecies.id) {

        random =
          available[
            Math.floor(Math.random() * available.length)
          ];

      }

    }

    changeSpecies(random);

  };


  /* =========================
     MOUSE PARALLAX
  ========================== */

  const handleMouseMove = (event) => {

    if (!imageRef.current) return;

    const rect =
      imageRef.current.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width - 0.5) * 12;

    const y =
      ((event.clientY - rect.top) / rect.height - 0.5) * 12;

    setMousePosition({
      x,
      y,
    });

  };


  const resetMouse = () => {

    setMousePosition({
      x: 0,
      y: 0,
    });

  };


  /* =========================
     KEYBOARD
  ========================== */

  useEffect(() => {

    const handleKeyDown = (event) => {

      const currentIndex =
        species.findIndex(
          (animal) =>
            animal.id === selectedSpecies.id
        );


      if (event.key === 'ArrowRight') {

        const next =
          species[
            (currentIndex + 1) % species.length
          ];

        changeSpecies(next);

      }


      if (event.key === 'ArrowLeft') {

        const previous =
          species[
            (currentIndex - 1 + species.length) %
              species.length
          ];

        changeSpecies(previous);

      }

    };


    window.addEventListener(
      'keydown',
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

    };

  }, [selectedSpecies]);


  return (

    <main
      className="min-h-screen overflow-hidden text-white transition-colors duration-1000"
      style={{
        backgroundColor: selectedSpecies.color,
      }}
    >


      {/* =========================
          HERO
      ========================== */}

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

        <div
          ref={imageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetMouse}
          className="absolute inset-0 overflow-hidden"
        >

          <img
            key={selectedSpecies.id}
            src={selectedSpecies.image}
            alt={selectedSpecies.name}
            className={`h-full w-full object-cover transition-all duration-700 ease-out ${
              isChanging
                ? 'scale-110 opacity-0'
                : 'scale-100 opacity-100'
            }`}
            style={{
              transform: `
                scale(${isChanging ? 1.1 : 1.08})
                translate(${mousePosition.x}px, ${mousePosition.y}px)
              `,
            }}
          />

        </div>


        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />


        <div
          key={`content-${selectedSpecies.id}`}
          className={`relative z-10 px-6 text-center transition-all duration-700 ${
            isChanging
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >

          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-[#b7c7a5]">
            Wildlife
          </p>

          <h1 className="text-6xl font-light tracking-wide sm:text-8xl lg:text-9xl">
            {selectedSpecies.name}
          </h1>

          <p className="mt-5 text-sm italic tracking-wide text-white/60">
            {selectedSpecies.scientific}
          </p>

          <div className="mx-auto my-8 h-px w-16 bg-white/50" />

          <p className="mx-auto max-w-xl text-sm leading-8 text-white/60">
            {selectedSpecies.description}
          </p>

        </div>


        {/* NUMBER */}

        <div className="absolute bottom-10 left-6 z-10 text-xs tracking-[0.25em] text-white/40 sm:left-10">

          {String(
            species.findIndex(
              (animal) =>
                animal.id === selectedSpecies.id
            ) + 1
          ).padStart(2, '0')}

          {' / '}

          {String(species.length).padStart(2, '0')}

        </div>


        {/* RANDOM */}

        <button
          onClick={discoverRandomSpecies}
          className="group absolute bottom-8 right-6 z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:text-[#b7c7a5] sm:right-10"
        >

          <span>
            Discover a species
          </span>

          <span className="text-lg transition-transform duration-500 group-hover:rotate-[180deg]">
            ✦
          </span>

        </button>

      </section>



      {/* =========================
          SELECTOR
      ========================== */}

      <section className="border-y border-white/10 bg-black/10 px-6 py-8">

        <div className="mx-auto max-w-[1200px]">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">


            <div className="flex flex-wrap gap-2">

              {species.map((animal, index) => (

                <button
                  key={animal.id}
                  onClick={() =>
                    changeSpecies(animal)
                  }
                  className={`group flex items-center gap-3 px-4 py-2 text-xs uppercase tracking-[0.15em] transition duration-300 ${
                    selectedSpecies.id === animal.id
                      ? 'bg-[#b7c7a5] text-[#07100b]'
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >

                  <span className="text-[9px] opacity-50">
                    0{index + 1}
                  </span>

                  {animal.name}

                </button>

              ))}

            </div>


            <div className="flex flex-wrap gap-4">

              {filters.map((filter) => (

                <button
                  key={filter}
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                  className={`text-[10px] uppercase tracking-[0.2em] transition ${
                    activeFilter === filter
                      ? 'text-[#b7c7a5]'
                      : 'text-white/30 hover:text-white/70'
                  }`}
                >

                  {filter}

                </button>

              ))}

            </div>

          </div>

        </div>

      </section>



      {/* =========================
          SPECIES INFORMATION
      ========================== */}

      <Reveal key={selectedSpecies.id}>

        <section className="px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[1200px]">

            <div className="grid gap-16 md:grid-cols-2">


              {/* LEFT */}

              <div>

                <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                  Species profile
                </p>

                <h2 className="text-4xl font-light sm:text-6xl">
                  {selectedSpecies.name}
                </h2>

                <p className="mt-3 text-sm italic text-white/30">
                  {selectedSpecies.scientific}
                </p>

                <div className="mt-8 h-px w-12 bg-[#9caf88]/60" />

                <p className="mt-8 max-w-lg text-sm leading-8 text-white/50">
                  {selectedSpecies.description}
                </p>


                {/* DETAILS */}

                <div className="mt-10">

                  <button
                    onClick={() =>
                      setShowDetails(!showDetails)
                    }
                    className="flex w-full items-center justify-between border-y border-white/10 py-5 text-left text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-[#b7c7a5]"
                  >

                    <span>
                      Species information
                    </span>

                    <span
                      className={`text-lg transition-transform duration-300 ${
                        showDetails
                          ? 'rotate-45'
                          : ''
                      }`}
                    >
                      +
                    </span>

                  </button>


                  <div
                    className={`grid transition-all duration-500 ${
                      showDetails
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >

                    <div className="overflow-hidden">

                      <div className="grid grid-cols-2 gap-8 py-8">

                        <Info
                          label="Habitat"
                          value={selectedSpecies.habitat}
                        />

                        <Info
                          label="Diet"
                          value={selectedSpecies.diet}
                        />

                        <Info
                          label="Lifestyle"
                          value={selectedSpecies.lifestyle}
                        />

                        <Info
                          label="Status"
                          value={selectedSpecies.status}
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* RIGHT IMAGE */}

              <div className="group relative min-h-[500px] overflow-hidden">

                <img
                  src={selectedSpecies.image}
                  alt={selectedSpecies.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-[1500ms] group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute bottom-8 left-8 right-8">

                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#b7c7a5]">
                    In the wild
                  </span>

                  <p className="mt-3 max-w-md text-2xl font-light leading-tight">
                    {selectedSpecies.quote}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </Reveal>



      {/* =========================
          STATS
      ========================== */}

      <Reveal key={`stats-${selectedSpecies.id}`}>

        <section className="border-y border-white/10 bg-black/10 px-6 py-24">

          <div className="mx-auto max-w-[1000px]">

            <div className="mb-14 text-center">

              <p className="text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                Characteristics
              </p>

              <h2 className="mt-5 text-3xl font-light sm:text-4xl">
                Built for the wild.
              </h2>

            </div>


            <div className="grid gap-8 sm:grid-cols-2">


              <StatBar
                label="Agility"
                value={selectedSpecies.stats.agility}
              />

              <StatBar
                label="Strength"
                value={selectedSpecies.stats.strength}
              />

              <StatBar
                label="Intelligence"
                value={selectedSpecies.stats.intelligence}
              />

              <StatBar
                label="Adaptability"
                value={selectedSpecies.stats.adaptability}
              />


            </div>

          </div>

        </section>

      </Reveal>



      {/* =========================
          COLLECTION
      ========================== */}

      <Reveal>

        <section className="px-6 py-32 sm:py-40">

          <div className="mx-auto max-w-[1200px]">

            <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div>

                <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                  Collection
                </p>

                <h2 className="text-4xl font-light sm:text-5xl">
                  Find another story.
                </h2>

              </div>

              <span className="text-xs uppercase tracking-[0.2em] text-white/30">
                {filteredSpecies.length} species
              </span>

            </div>


            {filteredSpecies.length > 0 ? (

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {filteredSpecies.map((animal) => (

                  <button
                    key={animal.id}
                    onClick={() =>
                      changeSpecies(animal)
                    }
                    className="group relative h-[430px] overflow-hidden text-left"
                  >

                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="h-full w-full object-cover transition duration-[1200ms] group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />


                    <div className="absolute bottom-0 left-0 right-0 p-6">

                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#b7c7a5]/70">
                        {animal.scientific}
                      </p>

                      <h3 className="mt-2 text-3xl font-light">
                        {animal.name}
                      </h3>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-xs text-white/40">
                          {animal.habitat}
                        </span>

                        <span className="translate-x-2 text-xs uppercase tracking-[0.15em] text-[#b7c7a5] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                          View →
                        </span>

                      </div>

                    </div>

                  </button>

                ))}

              </div>

            ) : (

              <div className="border border-white/10 py-20 text-center">

                <p className="text-sm text-white/40">
                  No species found in this habitat.
                </p>

              </div>

            )}

          </div>

        </section>

      </Reveal>



      {/* =========================
          HABITAT
      ========================== */}

      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden">

        <img
          src={natureImg}
          alt="Forest habitat"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />


        <div className="relative z-10 max-w-[900px] px-6 text-center">

          <p className="text-4xl font-light leading-tight sm:text-6xl">

            Different worlds.
            <br />

            <span className="text-[#b7c7a5]">
              One home.
            </span>

          </p>

          <div className="mx-auto my-10 h-px w-16 bg-white/40" />

          <p className="mx-auto max-w-xl text-sm leading-8 text-white/50">
            Protecting wildlife means protecting
            the places they call home.
          </p>

          <Link
            to="/explore"
            className="mt-10 inline-flex border border-white/20 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/70 transition duration-500 hover:border-[#9caf88] hover:bg-[#9caf88] hover:text-[#07100b]"
          >
            Explore habitats
          </Link>

        </div>

      </section>



      {/* =========================
          FINAL
      ========================== */}

      <Reveal>

        <section className="px-6 py-32 text-center sm:py-40">

          <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
            Keep discovering
          </p>

          <h2 className="text-4xl font-light sm:text-6xl">
            The wild is waiting.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40">
            There are always more species,
            more stories and more places to discover.
          </p>

          <Link
            to="/explore"
            className="group mt-10 inline-flex items-center gap-4 border border-white/20 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white/70 transition duration-500 hover:border-[#9caf88] hover:bg-[#9caf88] hover:text-[#07100b]"
          >
            Continue exploring

            <span className="transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>

          </Link>

        </section>

      </Reveal>


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
   INFO
================================= */

function Info({ label, value }) {

  return (

    <div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-sm text-white/70">
        {value}
      </p>

    </div>

  );
}


/* =================================
   STAT BAR
================================= */

function StatBar({ label, value }) {

  return (

    <div>

      <div className="mb-3 flex items-center justify-between">

        <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">
          {label}
        </span>

        <span className="text-xs text-[#b7c7a5]">
          {value}
        </span>

      </div>


      <div className="h-px w-full bg-white/10">

        <div
          className="h-px bg-[#b7c7a5] transition-all duration-[1200ms] ease-out"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>

  );
}