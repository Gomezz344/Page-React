import React from 'react';
import {Carrusel} from '../../components/Carrusel/Carrusel';
import { Navbar } from '../../components/Navbar/Navbar'
import { Footer } from '../../components/Footer/Footer'
export function Home() {
  return (
  <>
    <main className='w-full min-h-screen bg-[#050509]'>
      <Navbar />
      <Carrusel />
    </main>

    <Footer />
  </>
  );
}