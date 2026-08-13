import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import aboutVideo from '../../assets/videos/215695_small.mp4'

export function About() {
    return (
        <div className="w-full min-h-screen bg-[#050509] text-white">

            <Navbar />

            <main>

                <section className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden bg-[#050509]">

                  <video
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      src={aboutVideo}
                      autoPlay
                      muted
                      loop
                      playsInline
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 to-[#050509]/60 z-10" />

                  <div className="relative z-20 max-w-[800px] px-6 text-center">

                      <h1 className="m-0 text-[clamp(3rem,7vw,7rem)] font-extrabold leading-none tracking-[-2px] drop-shadow-[0_5px_25px_rgba(0,0,0,0.7)]">Explore the Universe</h1>

                      <p className="mt-6 max-w-[650px] mx-auto text-white/80 text-lg leading-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                          El universo es mucho más grande de lo que podemos imaginar.
                      </p>

                  </div>

              </section>

                <section className="max-w-[900px] mx-auto px-6 py-20">
                    <h2 className="text-2xl mb-4">¿Qué es Galaxy Page?</h2>

                    <p className="text-white/80 leading-7">
                        Galaxy Page es un espacio dedicado a explorar la inmensidad del universo, sus misterios y los fenómenos que hacen del cosmos un lugar fascinante.
                    </p>
                </section>

            </main>

            <Footer />

        </div>
    );
}