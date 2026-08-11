import './Footer.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/icons/logo.png';

export function Footer() {
    return (
        <footer className="footer">

            <div className="footer-content">

                {/* Logo y descripción */}
                <div className="footer-brand">
                    <img src={logo} alt="Galaxy Page" />

                    <p>
                        Explora la inmensidad del universo
                        y descubre lo que se encuentra más allá.
                    </p>
                </div>


                {/* Navegación */}
                <div className="footer-navigation">

                    <h3>Navegación</h3>

                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>

                </div>


                {/* Información */}
                <div className="footer-info">

                    <h3>Galaxy Page</h3>

                    <p>
                        Una página inspirada en la
                        inmensidad de la galaxia.
                    </p>

                </div>

            </div>


            {/* Línea inferior */}
            <div className="footer-bottom">

                <p>
                    © 2026 Galaxy Page. Todos los derechos reservados.
                </p>

                <span>
                    Made among the stars ✦
                </span>

            </div>

        </footer>
    );
}