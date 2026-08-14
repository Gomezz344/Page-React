import { Link } from 'react-router-dom';
import logo from '../../assets/icons/logo.png';

export function Footer() {
    return (
        <footer className="relative w-full bg-[#0a0d09] text-white overflow-hidden">

            {/* Contenido principal */}
            <div className="relative max-w-[1200px] mx-auto px-8 py-16">

                <div className="grid md:grid-cols-3 gap-16">

                    {/* Logo + descripción */}
                    <div className="flex flex-col items-start">
                        <img
                            src={logo}
                            alt="Wild & Free"
                            className="w-48 h-auto object-contain mb-6"
                        />

                        <p className="max-w-[360px] text-white/60 text-sm leading-7">
                            Discover the beauty of nature and the incredible
                            creatures that call our planet home.
                        </p>
                    </div>


                    {/* Navegación */}
                    <div className="flex flex-col">
                        <h3 className="text-white text-sm font-medium tracking-widest uppercase mb-6">
                            Explore
                        </h3>

                        <div className="flex flex-col gap-4">
                            <Link
                                to="/"
                                className="text-white/60 text-sm hover:text-white transition-colors duration-300"
                            >
                                Home
                            </Link>

                            <Link
                                to="/explore"
                                className="text-white/60 text-sm hover:text-white transition-colors duration-300"
                            >
                                Explore
                            </Link>

                            <Link
                                to="/wildlife"
                                className="text-white/60 text-sm hover:text-white transition-colors duration-300"
                            >
                                Wildlife
                            </Link>

                            <Link
                                to="/about"
                                className="text-white/60 text-sm hover:text-white transition-colors duration-300"
                            >
                                About
                            </Link>
                        </div>
                    </div>


                    {/* Frase */}
                    <div className="flex flex-col">
                        <h3 className="text-white text-sm font-medium tracking-widest uppercase mb-6">
                            Wild & Free
                        </h3>

                        <p className="max-w-[320px] text-white/60 text-sm leading-7">
                            A place to appreciate the freedom, beauty and
                            diversity of life in the wild.
                        </p>

                        <p className="mt-6 text-[#9aaa72] text-sm italic">
                            "Where life runs free."
                        </p>
                    </div>

                </div>


                {/* Línea inferior */}
                <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">

                    <p className="text-white/40 text-xs">
                        © 2026 Wild & Free. All rights reserved.
                    </p>

                    <p className="text-white/40 text-xs">
                        Made for the love of nature.
                    </p>

                </div>

            </div>

        </footer>
    );
}