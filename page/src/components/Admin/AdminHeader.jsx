import { useAuth } from '../../context/AuthContext';

export function AdminHeader() {
  const { usuario, logout } = useAuth();

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-24 items-center justify-between border-b border-white/10 bg-[#07100b]/95 px-8 backdrop-blur-md">

      {/* TÍTULO */}

      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
          Wildlife
        </p>

        <h1 className="mt-1 text-lg font-light tracking-wide">
          Administration Panel
        </h1>
      </div>

      {/* USUARIO */}

      <div className="flex items-center gap-6">

        <div className="text-right">

          <p className="text-sm text-white/80">
            {usuario?.nombre} {usuario?.apellido}
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#9caf88]">
            {usuario?.rol_id === 1
              ? 'Administrador'
              : usuario?.rol_id === 2
              ? 'Empleado'
              : 'Usuario'}
          </p>

        </div>

        <button
          type="button"
          onClick={logout}
          className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-white/40 transition hover:border-red-400/30 hover:text-red-300"
        >
          Cerrar sesión
        </button>

      </div>

    </header>
  );
}