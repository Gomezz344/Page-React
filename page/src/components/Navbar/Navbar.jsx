import {NavLink} from 'react-router-dom';
import React from 'react';
import logo from '../../assets/icons/logo.png';

export function Navbar() {
  return (
    <nav className="absolute top-5 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] max-w-[1200px] h-14 flex items-center justify-between px-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[18px] shadow-lg z-50">
      
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="w-11 h-11 object-contain" />
      </div>

      <ul className="flex items-center gap-8 list-none m-0 p-0">
        <li>
          <NavLink
            to="/"
            className={({isActive}) =>
              `px-4 py-2 rounded-md text-sm font-sans transition ${isActive ? 'text-[#ff8a3d] bg-[rgba(255,138,61,0.12)]' : 'text-white/90 hover:text-white hover:bg-white/12'}`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({isActive}) =>
              `px-4 py-2 rounded-md text-sm font-sans transition ${isActive ? 'text-[#ff8a3d] bg-[rgba(255,138,61,0.12)]' : 'text-white/90 hover:text-white hover:bg-white/12'}`
            }
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className={({isActive}) =>
              `px-4 py-2 rounded-md text-sm font-sans transition ${isActive ? 'text-[#ff8a3d] bg-[rgba(255,138,61,0.12)]' : 'text-white/90 hover:text-white hover:bg-white/12'}`
            }
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}