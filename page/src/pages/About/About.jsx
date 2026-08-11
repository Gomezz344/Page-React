import './About.css';

import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import aboutVideo from '../../assets/videos/215695_small.mp4'

export function About() {
    return (
        <div className="about-page">

            <Navbar />

            <main>

                
                <section className="about-hero">

                  <video
                      className="about-hero-video"
                      src={aboutVideo}
                      autoPlay
                      muted
                      loop
                      playsInline
                  />

                  <div className="about-hero-overlay"></div>

                  <div className="about-hero-content">

                      <h1>Explore the Universe</h1>

                      <p>
                          El universo es mucho más grande
                          de lo que podemos imaginar.
                      </p>

                  </div>

              </section>


              
                <section className="about-introduction">
                    <h2>¿Qué es Galaxy Page?</h2>

                    <p>
                        Galaxy Page es un espacio dedicado
                        a explorar la inmensidad del universo,
                        sus misterios y los fenómenos que
                        hacen del cosmos un lugar fascinante.
                    </p>
                </section>


               

            </main>

            <Footer />

        </div>
    );
}