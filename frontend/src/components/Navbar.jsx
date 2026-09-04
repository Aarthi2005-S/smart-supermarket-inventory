import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/inventory', label: 'Inventory', end: true },
  { to: '/receive-stock', label: 'Receive Stock', end: false },
  { to: '/products', label: 'Products', end: true },
  { to: '/products/add', label: 'Add Product', end: true },
];

function Navbar() {
  return (
    <header className="topbar-shell sticky top-0 z-40">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="brand-badge">SS</div>
            <div>
              <p className="text-sm font-bold tracking-[0.12em] text-slate-800 uppercase">Smart Supermarket</p>
              <p className="hidden text-xs text-slate-500 sm:block">Inventory management</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
