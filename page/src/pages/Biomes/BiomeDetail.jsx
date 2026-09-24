import { Link, useParams } from 'react-router-dom';
import forestImage from '../../assets/images/forest.png';
import oceanImage from '../../assets/images/ocean.jpg';
import mountainImage from '../../assets/images/mountain.jpg';

const BIOMES = {
  forests: {
    eyebrow: 'Living green worlds',
    title: 'Forests',
    subtitle: 'The planet’s breathing architecture.',
    image: forestImage,
    accent: '#9caf88',
    intro: 'Forests are more than collections of trees. They are layered societies of fungi, roots, insects, birds and mammals, connected by water, soil and time.',
    facts: [
      ['Canopy layers', 'From the dark forest floor to the sunlit crown, every level shelters different forms of life.'],
      ['Carbon keepers', 'Forests store carbon in living wood, roots and soils while helping regulate rainfall and temperature.'],
      ['Human stories', 'More than a billion people depend directly on forests for food, medicine, shelter or livelihoods.'],
    ],
    regions: [
      ['Amazonia · South America', 'The world’s largest tropical rainforest crosses Brazil, Peru, Colombia, Bolivia, Ecuador, Venezuela, Guyana, Suriname and French Guiana. Its rivers and floodplains create entire worlds within the forest.'],
      ['Congo Basin · Africa', 'The second-largest tropical forest on Earth is home to forest elephants, gorillas, bonobos and thousands of plant species.'],
      ['Boreal belt · Europe, Asia and North America', 'Taiga forests circle the northern hemisphere, storing huge amounts of carbon and offering habitat to wolves, lynx, moose and migratory birds.'],
    ],
    culture: [
      ['South America', 'Indigenous peoples of the Amazon hold detailed knowledge of medicinal plants, seasonal rivers and forest stewardship.'],
      ['Africa', 'Forest communities across the Congo Basin pass ecological knowledge through oral histories, music, craft and ceremony.'],
      ['Asia', 'Sacred groves in India, Japan and Southeast Asia show how spiritual traditions can protect patches of old-growth habitat.'],
      ['North America', 'Many First Nations understand forests through reciprocal relationships: harvest is balanced with gratitude, care and renewal.'],
    ],
    quote: 'A forest is a community, not a crowd of trees.',
  },
  oceans: {
    eyebrow: 'The blue planet',
    title: 'Oceans',
    subtitle: 'One connected body of water, many worlds within it.',
    image: oceanImage,
    accent: '#8db8c7',
    intro: 'Oceans cover most of Earth’s surface and connect climates, cultures and continents. Their currents move heat around the planet, while reefs, kelp forests and deep-sea ecosystems support extraordinary life.',
    facts: [
      ['The five oceans', 'Pacific, Atlantic, Indian, Southern and Arctic are commonly recognised as the planet’s five ocean basins.'],
      ['A vertical world', 'Sunlit reefs, twilight waters, midnight depths and trenches each have their own food webs and survival strategies.'],
      ['Blue connections', 'Whales, currents and migrating fish connect distant shores; what happens in one sea can affect ecosystems thousands of kilometres away.'],
    ],
    regions: [
      ['Pacific Ocean', 'The largest and deepest ocean, stretching from Asia and Oceania to the Americas. It includes the Coral Sea, Philippine Sea, Bering Sea and the Mariana Trench.'],
      ['Atlantic Ocean', 'A busy basin between the Americas, Europe and Africa. The Caribbean Sea, Mediterranean Sea, North Sea and Baltic Sea are among its connected marginal seas.'],
      ['Indian Ocean', 'Warm waters link Africa, South Asia and Australia. Its major seas include the Arabian Sea, Bay of Bengal, Red Sea and Andaman Sea.'],
      ['Southern and Arctic Oceans', 'The Southern Ocean circles Antarctica and drives powerful global currents. The Arctic Ocean is the smallest and shallowest, surrounded by ice, islands and marginal seas such as the Barents, Beaufort and Chukchi Seas.'],
    ],
    culture: [
      ['Oceania', 'Polynesian navigators crossed enormous distances using stars, swells, winds, birds and the behaviour of the sea.'],
      ['Africa', 'Coastal communities along the Swahili Coast developed trading cultures shaped by monsoon winds and the Indian Ocean.'],
      ['Europe and Asia', 'The Mediterranean has connected languages, cuisines, religions and cities for thousands of years; the sea is a cultural crossroads.'],
      ['The Americas', 'Caribbean cultures grew from Indigenous, African, European and Asian encounters, all carried by the sea.'],
    ],
    quote: 'The sea, once it casts its spell, holds one in its net of wonder forever.',
  },
  mountains: {
    eyebrow: 'Above the tree line',
    title: 'Mountains',
    subtitle: 'The world’s oldest landscapes still rising.',
    image: mountainImage,
    accent: '#c9c1a5',
    intro: 'Mountains are climate-makers, water towers and islands of biodiversity. A short journey uphill can cross several climates, from forests to alpine meadows, snow and bare rock.',
    facts: [
      ['Water towers', 'Snowfields, glaciers and highland wetlands release freshwater gradually to valleys and millions of people downstream.'],
      ['Life in gradients', 'Altitude changes temperature, oxygen and vegetation quickly, creating specialised habitats on a single slope.'],
      ['Famous summits', 'Everest, K2, Aconcagua, Denali, Kilimanjaro, Mont Blanc, the Matterhorn and Fuji are among the world’s best-known peaks.'],
    ],
    regions: [
      ['Himalaya · Asia', 'Home to Mount Everest and K2, the Himalaya span several countries and shape the climate and rivers of South and Central Asia.'],
      ['Andes · South America', 'The longest continental mountain range runs along the western edge of the continent, from Venezuela to southern Chile and Argentina.'],
      ['Rockies and Alps · North America and Europe', 'The Rockies cross western North America; the Alps connect eight European countries and have shaped travel, farming and architecture.'],
      ['East African mountains', 'Kilimanjaro and the Rwenzori rise above tropical landscapes, creating unusual alpine habitats near the equator.'],
    ],
    culture: [
      ['Asia', 'The Himalaya are woven into Hindu, Buddhist, Jain and local traditions, where peaks may be revered as living or sacred presences.'],
      ['South America', 'Andean cultures developed terraces, high-altitude agriculture and sophisticated ways of reading mountain water and weather.'],
      ['Europe', 'Alpine villages, pastoral routes and mountain festivals preserve relationships between communities, seasonal movement and the highlands.'],
      ['Africa', 'Kilimanjaro is a landmark for Chagga communities whose farming systems use the mountain’s forests, springs and fertile slopes.'],
    ],
    quote: 'The mountains are calling and I must go.',
  },
};

export function BiomeDetail() {
  const { slug } = useParams();
  const biome = BIOMES[slug] || BIOMES.forests;

  return (
    <main className="min-h-screen bg-[#07100b] text-white">
      <section className="relative flex min-h-[82vh] items-end overflow-hidden">
        <img src={biome.image} alt={biome.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07100b] via-[#07100b]/25 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">
          <Link to="/" className="mb-16 inline-flex text-[10px] uppercase tracking-[0.3em] text-white/55 transition hover:text-white">← Back home</Link>
          <p className="text-xs uppercase tracking-[0.45em]" style={{ color: biome.accent }}>{biome.eyebrow}</p>
          <h1 className="mt-6 text-6xl font-light tracking-tight md:text-9xl">{biome.title}</h1>
          <p className="mt-6 max-w-2xl text-xl font-light leading-8 text-white/70 md:text-2xl">{biome.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-[0.8fr_1.2fr] md:px-10 md:py-36">
        <div><p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: biome.accent }}>A living system</p><h2 className="mt-5 text-4xl font-light leading-tight md:text-5xl">Look closer.<br /><span className="text-white/35">There is more here.</span></h2></div>
        <p className="max-w-3xl text-lg leading-9 text-white/55">{biome.intro}</p>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
          <div className="mb-12 flex items-end justify-between gap-6"><div><p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: biome.accent }}>Field notes</p><h2 className="mt-4 text-3xl font-light">Three ways to understand {biome.title.toLowerCase()}.</h2></div><span className="hidden text-xs text-white/25 md:block">01 — 03</span></div>
          <div className="grid gap-5 md:grid-cols-3">{biome.facts.map(([title, text], index) => <article key={title} className="border border-white/10 bg-[#07100b]/60 p-7"><span className="text-xs" style={{ color: biome.accent }}>0{index + 1}</span><h3 className="mt-12 text-xl font-light">{title}</h3><p className="mt-4 text-sm leading-7 text-white/45">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
        <div className="mb-14 max-w-2xl"><p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: biome.accent }}>A world without borders</p><h2 className="mt-5 text-4xl font-light md:text-5xl">Landscapes across continents.</h2><p className="mt-6 text-sm leading-8 text-white/45">The same biome changes character with latitude, altitude, currents and the people who have lived alongside it.</p></div>
        <div className="grid gap-5 md:grid-cols-2">{biome.regions.map(([title, text]) => <article key={title} className="border-l border-white/15 py-2 pl-6"><h3 className="text-xl font-light">{title}</h3><p className="mt-3 text-sm leading-7 text-white/45">{text}</p></article>)}</div>
      </section>

      <section className="bg-[#102217]">
        <div className="mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36"><div className="grid gap-16 md:grid-cols-[0.7fr_1.3fr]"><div><p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: biome.accent }}>People & place</p><h2 className="mt-5 text-4xl font-light">Culture shaped by {biome.title.toLowerCase()}.</h2></div><div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">{biome.culture.map(([continent, text]) => <article key={continent}><h3 className="text-[10px] uppercase tracking-[0.25em]" style={{ color: biome.accent }}>{continent}</h3><p className="mt-4 text-sm leading-7 text-white/55">{text}</p></article>)}</div></div></div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-28 text-center md:py-36"><span className="text-4xl text-white/25">“</span><blockquote className="mt-5 text-3xl font-light leading-relaxed text-white/75 md:text-5xl">{biome.quote}</blockquote><div className="mx-auto mt-10 h-px w-12" style={{ backgroundColor: biome.accent }} /><Link to="/explore" className="mt-10 inline-flex border border-white/15 px-7 py-3 text-[10px] uppercase tracking-[0.25em] text-white/65 transition hover:border-[#9caf88] hover:text-[#9caf88]">Keep exploring →</Link></section>
    </main>
  );
}
