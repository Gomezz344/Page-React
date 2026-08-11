import React from 'react';
import {Carrusel} from '../../components/Carrusel/Carrusel';
import { Navbar } from '../../components/Navbar/Navbar'
import { Footer } from '../../components/Footer/Footer'
import './Home.css'

export function Home() {
  return (
  <>
    <main className='home'>
      <Navbar />
      <Carrusel />
    </main>

    <Footer />
  </>
  );
}