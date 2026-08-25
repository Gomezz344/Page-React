import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/icons/logo.png';
import { useAuth } from '../../context/AuthContext.jsx';

export function Navbar() {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-sans tracking-wide transition-all duration-300
    ${
      isActive
        ? 'text-white after:w-full'
        : 'text-white/75 hover:text-white after:w-0 hover:after:w-full'
    }
    after:absolute after:left-0 after:-bottom-1 after:h-[1px]
    after:bg-white after:transition-all after:duration-300`;

  return (
    <nav className="absolute top-5 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] max-w-[1200px] flex items-center justify-between z-50">

      {/* LOGO */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="logo"
          className="w-44 h-auto object-contain"
        />
      </div>

      {/* NAVEGACIÓN */}
      <ul className="flex items-center gap-10 list-none m-0 p-0">

        <li>
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/explore" className={navLinkClass}>
            Explore
          </NavLink>
        </li>

        <li>
          <NavLink to="/wildlife" className={navLinkClass}>
            Wildlife
          </NavLink>
        </li>

        <li>
          <NavLink to="/about" className={navLinkClass}>
            Our Story
          </NavLink>
        </li>

        {/* USUARIO NO AUTENTICADO */}
        {!isAuthenticated ? (
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#9caf88] text-[#07100b]'
                    : 'border border-white/20 text-white/90 hover:bg-[#9caf88] hover:text-[#07100b] hover:border-[#9caf88]'
                }`
              }
            >
              Sign In
            </NavLink>
          </li>
        ) : (
          /* USUARIO AUTENTICADO */
          <li className="relative">

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-[#9caf88] hover:bg-[#9caf88]/10"
            >
              <span>
                {usuario?.nombre} {usuario?.apellido}
              </span>

              <span
                className={`text-xs transition-transform duration-300 ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {/* MENÚ */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0b160f]/95 shadow-2xl backdrop-blur-xl">

                {/* INFORMACIÓN DEL USUARIO */}
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-sm text-white">
                    {usuario?.nombre} {usuario?.apellido}
                  </p>

                  <p className="mt-1 truncate text-xs text-white/40">
                    {usuario?.correo}
                  </p>
                </div>

                {/* MI PERFIL */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="block w-full px-5 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-[#9caf88]"
                >
                  Mi perfil
                </button>

                {/* SOLO ADMIN */}
                {usuario?.rol_id === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="block w-full px-5 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-[#9caf88]"
                  >
                    Panel de administración
                  </button>
                )}

                {/* CERRAR SESIÓN */}
                <div className="border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-5 py-3 text-left text-sm text-red-300/70 transition hover:bg-red-400/5 hover:text-red-300"
                  >
                    Cerrar sesión
                  </button>
                </div>

              </div>
            )}
          </li>
        )}

      </ul>
    </nav>
  );
}