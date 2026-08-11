import './Navbar.css';
import {NavLink} from 'react-router-dom';
import React from 'react';
import logo from '../../assets/icons/logo.png';
import {Home} from '../../pages/Home/Home';
import {About} from '../../pages/About/About';
import {Contact} from '../../pages/Contact/Contact';


export function Navbar() {
  return (

    <nav>
        <div className="logo">
            <img src={logo} alt="logo" />
        </div>

        <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>
    </nav>
  );
}