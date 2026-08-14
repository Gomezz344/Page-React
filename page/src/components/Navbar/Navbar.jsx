import { NavLink } from 'react-router-dom';
import React from 'react';
import logo from '../../assets/icons/logo.png';

export function Navbar() {
  return (
    <nav className="absolute top-5 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] max-w-[1200px] flex items-center justify-between z-50">
      <div className="flex items-center">
        <img
          src={logo}
          alt="logo"
          className="w-44 h-auto object-contain"
        />
      </div>
      
      <ul className="flex items-center gap-10 list-none m-0 p-0">

        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative py-2 text-sm font-sans tracking-wide transition-all duration-300
              ${isActive
                ? 'text-white after:w-full'
                : 'text-white/75 hover:text-white after:w-0 hover:after:w-full'
              }
              after:absolute after:left-0 after:-bottom-1 after:h-[1px]
              after:bg-white after:transition-all after:duration-300`
            }
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `relative py-2 text-sm font-sans tracking-wide transition-all duration-300
              ${isActive
                ? 'text-white after:w-full'
                : 'text-white/75 hover:text-white after:w-0 hover:after:w-full'
              }
              after:absolute after:left-0 after:-bottom-1 after:h-[1px]
              after:bg-white after:transition-all after:duration-300`
            }
          >
            Explore
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/wildlife"
            className={({ isActive }) =>
              `relative py-2 text-sm font-sans tracking-wide transition-all duration-300
              ${isActive
                ? 'text-white after:w-full'
                : 'text-white/75 hover:text-white after:w-0 hover:after:w-full'
              }
              after:absolute after:left-0 after:-bottom-1 after:h-[1px]
              after:bg-white after:transition-all after:duration-300`
            }
          >
            Wildlife
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `relative py-2 text-sm font-sans tracking-wide transition-all duration-300
              ${isActive
                ? 'text-white after:w-full'
                : 'text-white/75 hover:text-white after:w-0 hover:after:w-full'
              }
              after:absolute after:left-0 after:-bottom-1 after:h-[1px]
              after:bg-white after:transition-all after:duration-300`
            }
          >
            About
          </NavLink>
        </li>

      </ul>
    </nav>
  );
}