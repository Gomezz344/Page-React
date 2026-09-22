import { useEffect, useState } from 'react';
import { API_URL } from '../../api/client';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { AdminSidebar } from '../../components/Admin/AdminSideBar';
import { AdminHeader } from '../../components/Admin/AdminHeader';

import { Productos } from './Productos/Productos';
import { Servicios } from './Servicios/Servicios';
import { Usuarios } from './Usuarios/Usuarios';

const money = (value) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(value || 0);

function SalesDashboard() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ fecha_inicio: '', fecha_fin: '', producto_id: '', servicio_id: '', estado: '', cliente_id: '', agrupacion: 'dia' });
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [data, setData] = useState({ indicadores: { ventas: 0, unidades: 0, total: 0, promedio: 0 }, serie: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch(`${API_URL}/productos`), fetch(`${API_URL}/servicios`)]).then(async ([productResponse, serviceResponse]) => {
      setProducts(await productResponse.json());
      setServices(await serviceResponse.json());
    }).catch(() => setError('No se pudo cargar el catálogo para los filtros.'));
  }, []);

  const loadAnalytics = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
    try {
      const response = await fetch(`${API_URL}/admin/sales-analytics?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || result.message) throw new Error(result.message || 'No se pudo cargar el análisis de ventas.');
      setData(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, [token]);

  const maxTotal = Math.max(...data.serie.map((item) => item.total), 1);
  const maxSales = Math.max(...data.serie.map((item) => item.ventas), 1);
  const points = data.serie.map((item, index) => {
    const x = data.serie.length === 1 ? 50 : (index / (data.serie.length - 1)) * 100;
    const y = 100 - ((item.ventas / maxSales) * 86);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#9caf88]">Sales intelligence</p>
        <h2 className="text-4xl font-light tracking-wide">Sales dashboard</h2>
        <p className="mt-3 text-sm text-white/40">Analyze sales by day, week or month.</p>
      </div>

      <form onSubmit={loadAnalytics} className="mb-8 grid gap-3 border border-white/10 bg-white/[0.02] p-5 md:grid-cols-3 lg:grid-cols-7">
        {['fecha_inicio', 'fecha_fin'].map((name) => <label key={name} className="text-[9px] uppercase tracking-[0.2em] text-white/40">{name === 'fecha_inicio' ? 'From' : 'To'}<input type="date" value={filters[name]} onChange={(event) => setFilters({ ...filters, [name]: event.target.value })} className="mt-2 w-full border border-white/10 bg-transparent px-2 py-2 text-xs text-white" /></label>)}
        <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Product<select value={filters.producto_id} onChange={(event) => setFilters({ ...filters, producto_id: event.target.value })} className="mt-2 w-full border border-white/10 bg-[#07100b] px-2 py-2 text-xs text-white"><option value="">All</option>{products.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Service<select value={filters.servicio_id} onChange={(event) => setFilters({ ...filters, servicio_id: event.target.value })} className="mt-2 w-full border border-white/10 bg-[#07100b] px-2 py-2 text-xs text-white"><option value="">All</option>{services.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Status<select value={filters.estado} onChange={(event) => setFilters({ ...filters, estado: event.target.value })} className="mt-2 w-full border border-white/10 bg-[#07100b] px-2 py-2 text-xs text-white"><option value="">All</option>{['pagado', 'pendiente', 'cancelado', 'fallido'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Client ID<input type="number" min="1" value={filters.cliente_id} onChange={(event) => setFilters({ ...filters, cliente_id: event.target.value })} className="mt-2 w-full border border-white/10 bg-transparent px-2 py-2 text-xs text-white" placeholder="Optional" /></label>
        <label className="text-[9px] uppercase tracking-[0.2em] text-white/40">Group<select value={filters.agrupacion} onChange={(event) => setFilters({ ...filters, agrupacion: event.target.value })} className="mt-2 w-full border border-white/10 bg-[#07100b] px-2 py-2 text-xs text-white"><option value="dia">Day</option><option value="semana">Week</option><option value="mes">Month</option></select></label>
        <button type="submit" className="self-end bg-[#9caf88] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#07100b]">{loading ? 'Loading...' : 'Apply filters'}</button>
      </form>

      {error && <p className="mb-6 border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200">{error}</p>}
      <div className="grid gap-5 md:grid-cols-4">
        {[['Sales', data.indicadores.ventas], ['Units', data.indicadores.unidades], ['Revenue', money(data.indicadores.total)], ['Average sale', money(data.indicadores.promedio)]].map(([label, value]) => <div key={label} className="border border-white/10 bg-white/[0.02] p-6"><p className="text-[9px] uppercase tracking-[0.25em] text-white/30">{label}</p><p className="mt-4 text-3xl font-light">{loading ? '...' : value}</p></div>)}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="border border-white/10 bg-white/[0.02] p-6"><div className="mb-6 flex items-end justify-between"><div><p className="text-[9px] uppercase tracking-[0.25em] text-[#9caf88]">Revenue</p><h3 className="mt-2 text-xl font-light">Sales by period</h3></div><span className="text-[10px] text-white/30">COP</span></div><div className="flex h-64 items-end gap-2 border-b border-l border-white/10 px-3 pb-0">{data.serie.length ? data.serie.map((item) => <div key={item.periodo} className="group flex h-full flex-1 items-end"><div title={`${item.periodo}: ${money(item.total)}`} className="w-full bg-[#9caf88]/70 transition hover:bg-[#c9d5bd]" style={{ height: `${Math.max((item.total / maxTotal) * 100, 3)}%` }} /></div>) : <p className="m-auto text-sm text-white/30">No sales for this filter.</p>}</div><div className="mt-3 flex justify-between text-[9px] text-white/30"><span>{data.serie[0]?.periodo || ''}</span><span>{data.serie.at(-1)?.periodo || ''}</span></div></div>
        <div className="border border-white/10 bg-white/[0.02] p-6"><div className="mb-6"><p className="text-[9px] uppercase tracking-[0.25em] text-[#9caf88]">Volume</p><h3 className="mt-2 text-xl font-light">Number of sales</h3></div><div className="h-64 border-b border-l border-white/10 p-3"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible"><polyline fill="none" stroke="#9caf88" strokeWidth="1.5" points={points} />{data.serie.map((item, index) => { const x = data.serie.length === 1 ? 50 : (index / (data.serie.length - 1)) * 100; const y = 100 - ((item.ventas / maxSales) * 86); return <circle key={item.periodo} cx={x} cy={y} r="1.8" fill="#c9d5bd"><title>{`${item.periodo}: ${item.ventas} sales`}</title></circle>; })}</svg></div><div className="mt-3 flex justify-between text-[9px] text-white/30"><span>{data.serie[0]?.periodo || ''}</span><span>{data.serie.at(-1)?.periodo || ''}</span></div></div>
      </div>
    </div>
  );
}

export function Admin() {

  const location = useLocation();
  const { usuario } = useAuth();
  const isAdmin = Number(usuario?.rol_id) === 1;

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
        `${API_URL}/admin/stats`,
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
          'Could not load the statistics.'
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
              element={<SalesDashboard />}
            />

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
                      Welcome to the Wildlife management panel.
                    </p>

                  </div>


                  {/* ESTADÍSTICAS */}

                  <div className="grid gap-5 md:grid-cols-3">


                    {/* ==================================
                        USUARIOS
                    ================================== */}

                    <div className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#9caf88]/30">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Users
                      </p>


                      <p className="mt-4 text-4xl font-light">

                        {cargandoEstadisticas
                          ? '...'
                          : estadisticas.usuarios}

                      </p>


                      <p className="mt-2 text-xs text-white/20">
                        Registered
                      </p>

                    </div>


                    {/* ==================================
                        PRODUCTOS
                    ================================== */}

                    <div className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#9caf88]/30">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Products
                      </p>


                      <p className="mt-4 text-4xl font-light">

                        {cargandoEstadisticas
                          ? '...'
                          : estadisticas.productos}

                      </p>


                      <p className="mt-2 text-xs text-white/20">
                        In inventory
                      </p>

                    </div>


                    {/* ==================================
                        SERVICIOS
                    ================================== */}

                    <div className="border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#9caf88]/30">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        Services
                      </p>


                      <p className="mt-4 text-4xl font-light">

                        {cargandoEstadisticas
                          ? '...'
                          : estadisticas.servicios}

                      </p>


                      <p className="mt-2 text-xs text-white/20">
                        Available
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
              element={isAdmin ? <Usuarios /> : <Navigate to="/admin/productos" replace />}
            />

          </Routes>

        </main>

      </div>

    </div>

  );
}
