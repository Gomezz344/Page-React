import { NavLink } from 'react-router-dom';

export function AdminSidebar() {
  const links = [
    {
      to: '/admin',
      label: 'Dashboard',
      end: true,
    },
    {
      to: '/admin/productos',
      label: 'Productos',
    },
    {
      to: '/admin/servicios',
      label: 'Servicios',
    },
    {
      to: '/admin/usuarios',
      label: 'Usuarios',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#07100b]">

      {/* LOGO */}

      <div className="flex h-24 items-center border-b border-white/10 px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#9caf88]">
            Wildlife
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/30">
            Administration
          </p>
        </div>
      </div>

      {/* NAVEGACIÓN */}

      <nav className="flex-1 px-4 py-8">

        <p className="mb-4 px-4 text-[9px] uppercase tracking-[0.3em] text-white/20">
          Management
        </p>

        <div className="space-y-1">

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block px-4 py-3 text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? 'bg-[#9caf88]/10 text-[#9caf88]'
                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white/80'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

        </div>

      </nav>

      {/* FOOTER SIDEBAR */}

      <div className="border-t border-white/10 p-6">

        <NavLink
          to="/"
          className="block text-center text-[10px] uppercase tracking-[0.2em] text-white/30 transition hover:text-[#9caf88]"
        >
          ← Volver al sitio
        </NavLink>

      </div>

    </aside>
  );
}