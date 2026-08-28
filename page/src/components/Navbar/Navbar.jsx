import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/icons/logo.png';
import { useAuth } from '../../context/AuthContext.jsx';

export function Navbar() {

  const {
    usuario,
    isAuthenticated,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    logout();

    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    navigate('/');

  };


  // ==========================================
  // CERRAR MENÚS
  // ==========================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };


  // ==========================================
  // ESTILO LINKS
  // ==========================================

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-sans tracking-wide transition-all duration-300 ${
      isActive
        ? 'text-white after:w-full'
        : 'text-white/75 hover:text-white after:w-0 hover:after:w-full'
    } after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:bg-white after:transition-all after:duration-300`;


  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  const navegarMobile = (ruta) => {

    closeMobileMenu();

    navigate(ruta);

  };


  return (

    <nav
      className="
        absolute
        top-5
        left-1/2
        z-50
        w-[calc(100%-32px)]
        -translate-x-1/2
        sm:w-[calc(100%-48px)]
        lg:w-[calc(100%-80px)]
        max-w-[1200px]
      "
    >

      {/* ======================================
          NAVBAR PRINCIPAL
      ====================================== */}

      <div className="flex items-center justify-between">


        {/* ======================================
            LOGO
        ====================================== */}

        <div className="flex items-center">

          <img
            src={logo}
            alt="Wildlife"
            className="
              h-auto
              w-32
              object-contain
              sm:w-36
              lg:w-44
            "
          />

        </div>


        {/* ======================================
            NAVEGACIÓN DESKTOP
        ====================================== */}

        <ul
          className="
            hidden
            list-none
            items-center
            gap-10
            m-0
            p-0
            lg:flex
          "
        >

          {/* HOME */}

          <li>
            <NavLink
              to="/"
              className={navLinkClass}
            >
              Home
            </NavLink>
          </li>


          {/* EXPLORE */}

          <li>
            <NavLink
              to="/explore"
              className={navLinkClass}
            >
              Explore
            </NavLink>
          </li>


          {/* WILDLIFE */}

          <li>
            <NavLink
              to="/wildlife"
              className={navLinkClass}
            >
              Wildlife
            </NavLink>
          </li>


          {/* TOURS */}

          <li>
            <NavLink
              to="/tours"
              className={navLinkClass}
            >
              Tours
            </NavLink>
          </li>


          {/* OUR STORY */}

          <li>
            <NavLink
              to="/about"
              className={navLinkClass}
            >
              Our Story
            </NavLink>
          </li>


          {/* ====================================
              USUARIO
          ==================================== */}

          {!isAuthenticated ? (

            <li>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#9caf88] text-[#07100b]'
                      : 'border border-white/20 text-white/90 hover:border-[#9caf88] hover:bg-[#9caf88] hover:text-[#07100b]'
                  }`
                }
              >
                Sign In
              </NavLink>

            </li>

          ) : (

            <li className="relative">

              <button
                type="button"
                onClick={() =>
                  setUserMenuOpen(!userMenuOpen)
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-white/20
                  px-4
                  py-2
                  text-sm
                  text-white/90
                  transition
                  hover:border-[#9caf88]
                  hover:bg-[#9caf88]/10
                "
              >

                <span>
                  {usuario?.nombre} {usuario?.apellido}
                </span>

                <span
                  className={`
                    text-xs
                    transition-transform
                    duration-300
                    ${userMenuOpen ? 'rotate-180' : ''}
                  `}
                >
                  ▼
                </span>

              </button>


              {/* MENÚ USUARIO */}

              {userMenuOpen && (

                <div
                  className="
                    absolute
                    right-0
                    top-full
                    mt-3
                    w-64
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0b160f]/95
                    shadow-2xl
                    backdrop-blur-xl
                  "
                >

                  {/* INFORMACIÓN */}

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

                      closeUserMenu();
                      navigate('/profile');

                    }}
                    className="
                      block
                      w-full
                      px-5
                      py-3
                      text-left
                      text-sm
                      text-white/60
                      transition
                      hover:bg-white/5
                      hover:text-[#9caf88]
                    "
                  >
                    Mi perfil
                  </button>


                  {/* ADMIN */}

                  {Number(usuario?.rol_id) === 1 && (

                    <button
                      type="button"
                      onClick={() => {

                        closeUserMenu();
                        navigate('/admin');

                      }}
                      className="
                        block
                        w-full
                        px-5
                        py-3
                        text-left
                        text-sm
                        text-white/60
                        transition
                        hover:bg-white/5
                        hover:text-[#9caf88]
                      "
                    >
                      Panel de administración
                    </button>

                  )}


                  {/* LOGOUT */}

                  <div className="border-t border-white/10">

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        block
                        w-full
                        px-5
                        py-3
                        text-left
                        text-sm
                        text-red-300/70
                        transition
                        hover:bg-red-400/5
                        hover:text-red-300
                      "
                    >
                      Cerrar sesión
                    </button>

                  </div>

                </div>

              )}

            </li>

          )}

        </ul>


        {/* ======================================
            BOTÓN HAMBURGUESA
        ====================================== */}

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          aria-label={
            mobileMenuOpen
              ? 'Cerrar menú'
              : 'Abrir menú'
          }
          aria-expanded={mobileMenuOpen}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-white/15
            bg-[#07100b]/40
            backdrop-blur-md
            transition
            hover:border-[#9caf88]/50
            hover:bg-[#9caf88]/10
            lg:hidden
          "
        >

          <div className="relative h-4 w-5">

            {/* LÍNEA 1 */}

            <span
              className={`
                absolute
                left-0
                h-px
                w-5
                bg-white
                transition-all
                duration-300
                ${
                  mobileMenuOpen
                    ? 'top-2 rotate-45'
                    : 'top-0'
                }
              `}
            />


            {/* LÍNEA 2 */}

            <span
              className={`
                absolute
                left-0
                top-2
                h-px
                w-5
                bg-white
                transition-all
                duration-300
                ${
                  mobileMenuOpen
                    ? 'opacity-0'
                    : 'opacity-100'
                }
              `}
            />


            {/* LÍNEA 3 */}

            <span
              className={`
                absolute
                left-0
                h-px
                w-5
                bg-white
                transition-all
                duration-300
                ${
                  mobileMenuOpen
                    ? 'top-2 -rotate-45'
                    : 'top-4'
                }
              `}
            />

          </div>

        </button>

      </div>


      {/* ======================================
          MENÚ MOBILE
      ====================================== */}

      {mobileMenuOpen && (

        <div
          className="
            mt-4
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#07100b]/95
            shadow-2xl
            backdrop-blur-xl
            lg:hidden
          "
        >

          <div className="p-5">


            {/* ==================================
                LINKS
            ================================== */}

            <div className="flex flex-col">


              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Home
              </NavLink>


              <NavLink
                to="/explore"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Explore
              </NavLink>


              <NavLink
                to="/wildlife"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Wildlife
              </NavLink>


              <NavLink
                to="/tours"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Tours
              </NavLink>


              <NavLink
                to="/about"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Our Story
              </NavLink>

            </div>


            {/* ==================================
                USUARIO MOBILE
            ================================== */}

            <div className="mt-5 border-t border-white/10 pt-5">


              {!isAuthenticated ? (

                <NavLink
                  to="/login"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[#9caf88]
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-[#07100b]
                    transition
                    hover:bg-[#b7c7a5]
                  "
                >
                  Sign In
                </NavLink>

              ) : (

                <div>


                  {/* INFORMACIÓN USUARIO */}

                  <div className="px-2 pb-3">

                    <p className="text-sm text-white">
                      {usuario?.nombre} {usuario?.apellido}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/35">
                      {usuario?.correo}
                    </p>

                  </div>


                  {/* PERFIL */}

                  <button
                    type="button"
                    onClick={() =>
                      navegarMobile('/profile')
                    }
                    className="
                      block
                      w-full
                      rounded-lg
                      px-3
                      py-3
                      text-left
                      text-sm
                      text-white/60
                      transition
                      hover:bg-white/5
                      hover:text-[#9caf88]
                    "
                  >
                    Mi perfil
                  </button>


                  {/* ADMIN */}

                  {Number(usuario?.rol_id) === 1 && (

                    <button
                      type="button"
                      onClick={() =>
                        navegarMobile('/admin')
                      }
                      className="
                        block
                        w-full
                        rounded-lg
                        px-3
                        py-3
                        text-left
                        text-sm
                        text-white/60
                        transition
                        hover:bg-white/5
                        hover:text-[#9caf88]
                      "
                    >
                      Panel de administración
                    </button>

                  )}


                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      mt-2
                      w-full
                      border-t
                      border-white/10
                      px-3
                      py-4
                      text-left
                      text-sm
                      text-red-300/70
                      transition
                      hover:text-red-300
                    "
                  >
                    Cerrar sesión
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </nav>

  );

}