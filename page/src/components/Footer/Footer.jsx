import { Link } from 'react-router-dom';
import logo from '../../assets/icons/logo.png';

export function Footer() {
    return (
        <footer className="relative w-full bg-[#050509] text-white overflow-hidden py-16">

            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute -top-16 -left-40 w-80 h-80 rounded-full" style={{background: 'radial-gradient(circle at 20% 20%, rgba(120,60,180,0.15), transparent 35%)'}} />
                <div className="absolute -bottom-16 -right-40 w-72 h-72 rounded-full" style={{background: 'radial-gradient(circle at 80% 60%, rgba(255,100,40,0.08), transparent 35%)'}} />
            </div>

            <div className="relative max-w-[1200px] mx-auto grid md:grid-cols-3 gap-20 px-8 pb-12">

                <div className="md:col-span-1 flex flex-col items-start">
                    <img src={logo} alt="Galaxy Page" className="w-16 h-16 object-contain mb-4" />
                    <p className="max-w-[350px] text-white/70 text-sm leading-7">
                        Explora la inmensidad del universo y descubre lo que se encuentra más allá.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-[#ff8a3d] text-base font-semibold mb-4">Navegación</h3>
                    <Link to="/" className="text-white/70 text-sm hover:text-[#ff8a3d] transition transform hover:translate-x-1">Home</Link>
                    <Link to="/about" className="text-white/70 text-sm hover:text-[#ff8a3d] transition transform hover:translate-x-1">About</Link>
                    <Link to="/contact" className="text-white/70 text-sm hover:text-[#ff8a3d] transition transform hover:translate-x-1">Contact</Link>
                </div>

                <div>
                    <h3 className="text-[#ff8a3d] text-base font-semibold mb-4">Galaxy Page</h3>
                    <p className="max-w-[300px] text-white/70 text-sm leading-7">
                        Una página inspirada en la inmensidad de la galaxia.
                    </p>
                </div>

            </div>

            <div className="relative max-w-[1200px] mx-auto px-8 border-t border-white/12 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <p className="text-white/50 text-xs">© 2026 Galaxy Page. Todos los derechos reservados.</p>
                <span className="text-[#ff8a3d] text-xs">Made among the stars ✦</span>
            </div>

        </footer>
    );
}