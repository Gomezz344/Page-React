import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { AdminSidebar } from '../../components/Admin/AdminSideBar';
import { AdminHeader } from '../../components/Admin/AdminHeader';

import { Productos } from './Productos/Productos';
import { Servicios } from './Servicios/Servicios';
import { Usuarios } from './Usuarios/Usuarios';

export function Admin() {

  const location = useLocation();

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const [estadisticas, setEstadisticas] = useState({
    usuarios: 0,
    productos: 0,
    servicios: 0,
  });

  const [cargandoEstadisticas, setCargandoEstadisticas] =
    useState(true);


  // ==========================================
  // OBTENER ESTADÍSTICAS
  // ==========================================

  const cargarEstadisticas = async () => {

    try {

      setCargandoEstadisticas(true);

      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');


      const response = await fetch(
        'http://localhost:3000/api/admin/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'No se pudieron obtener las estadísticas.'
        );

      }


      setEstadisticas({
        usuarios: data.usuarios ?? 0,
        productos: data.productos ?? 0,
        servicios: data.servicios ?? 0,
      });

    } catch (error) {

      console.error(
        'Error al cargar estadísticas:',
        error
      );

    } finally {

      setCargandoEstadisticas(false);

    }

  };


  // ==========================================
  // ACTUALIZAR ESTADÍSTICAS
  // AL CAMBIAR DE SECCIÓN
  // ==========================================

  useEffect(() => {

    cargarEstadisticas();

  }, [location.pathname]);


  return (

    <div className="min-h-screen bg-[#07100b] text-white">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <AdminSidebar />


      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

      <div className="ml-64">

        <AdminHeader />


        <main className="min-h-screen px-8 pb-16 pt-32">

          <Routes>


            {/* ==========================================
                DASHBOARD
            ========================================== */}

            <Route
              path="/"
              element={

                <div>

                  {/* ENCABEZADO */}

                  <div className="mb-10">

                    <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#9caf88]">
                      Overview
                    </p>

                    <h2 className="text-4xl font-light tracking-wide">
                      Dashboard
                    </h2>

                    <p className="mt-3 text-sm text-white/40">
                      Bienvenido al panel de administración de Wildlife.
                    </p>

                  </div>


                  {/* ESTADÍSTICAS */}

                  <div className="grid gap-5 md:grid-cols-3">


                    {/* ==================================
                        USUARIOS
                    ================================== */}

                    <div className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#9caf88]/30">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Usuarios
                      </p>


                      <p className="mt-4 text-4xl font-light">

                        {cargandoEstadisticas
                          ? '...'
                          : estadisticas.usuarios}

                      </p>


                      <p className="mt-2 text-xs text-white/20">
                        Registrados
                      </p>

                    </div>


                    {/* ==================================
                        PRODUCTOS
                    ================================== */}

                    <div className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#9caf88]/30">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Productos
                      </p>


                      <p className="mt-4 text-4xl font-light">

                        {cargandoEstadisticas
                          ? '...'
                          : estadisticas.productos}

                      </p>


                      <p className="mt-2 text-xs text-white/20">
                        En inventario
                      </p>

                    </div>


                    {/* ==================================
                        SERVICIOS
                    ================================== */}

                    <div className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#9caf88]/30">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Servicios
                      </p>


                      <p className="mt-4 text-4xl font-light">

                        {cargandoEstadisticas
                          ? '...'
                          : estadisticas.servicios}

                      </p>


                      <p className="mt-2 text-xs text-white/20">
                        Disponibles
                      </p>

                    </div>

                  </div>

                </div>

              }
            />


            {/* ==========================================
                PRODUCTOS
            ========================================== */}

            <Route
              path="/productos"
              element={<Productos />}
            />


            {/* ==========================================
                SERVICIOS
            ========================================== */}

            <Route
              path="/servicios"
              element={<Servicios />}
            />


            {/* ==========================================
                USUARIOS
            ========================================== */}

            <Route
              path="/usuarios"
              element={<Usuarios/>}
            />

          </Routes>

        </main>

      </div>

    </div>

  );
}