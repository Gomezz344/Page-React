import { Routes, Route } from 'react-router-dom';

import { AdminSidebar } from '../../components/Admin/AdminSideBar';
import { AdminHeader } from '../../components/Admin/AdminHeader';

export function Admin() {
  return (
    <div className="min-h-screen bg-[#07100b] text-white">

      {/* SIDEBAR */}

      <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}

      <div className="ml-64">

        <AdminHeader />

        <main className="min-h-screen px-8 pb-16 pt-32">

          <Routes>

            {/* DASHBOARD */}

            <Route
              path="/"
              element={
                <div>

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

                    <div className="border border-white/10 bg-white/[0.02] p-6">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Usuarios
                      </p>

                      <p className="mt-4 text-4xl font-light">
                        0
                      </p>

                      <p className="mt-2 text-xs text-white/20">
                        Registrados
                      </p>

                    </div>

                    <div className="border border-white/10 bg-white/[0.02] p-6">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Productos
                      </p>

                      <p className="mt-4 text-4xl font-light">
                        0
                      </p>

                      <p className="mt-2 text-xs text-white/20">
                        En inventario
                      </p>

                    </div>

                    <div className="border border-white/10 bg-white/[0.02] p-6">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Servicios
                      </p>

                      <p className="mt-4 text-4xl font-light">
                        0
                      </p>

                      <p className="mt-2 text-xs text-white/20">
                        Disponibles
                      </p>

                    </div>

                  </div>

                </div>
              }
            />

            {/* PRODUCTOS */}

            <Route
              path="/productos"
              element={
                <div>
                  <h2 className="text-3xl font-light">
                    Productos
                  </h2>

                  <p className="mt-3 text-sm text-white/40">
                    Gestión de productos.
                  </p>
                </div>
              }
            />

            {/* SERVICIOS */}

            <Route
              path="/servicios"
              element={
                <div>
                  <h2 className="text-3xl font-light">
                    Servicios
                  </h2>

                  <p className="mt-3 text-sm text-white/40">
                    Gestión de servicios.
                  </p>
                </div>
              }
            />

            {/* USUARIOS */}

            <Route
              path="/usuarios"
              element={
                <div>
                  <h2 className="text-3xl font-light">
                    Usuarios
                  </h2>

                  <p className="mt-3 text-sm text-white/40">
                    Gestión de usuarios.
                  </p>
                </div>
              }
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}