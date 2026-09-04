import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌂', end: true },
  { to: '/inventory', label: 'Inventory', icon: '▣', end: true },
  { to: '/receive-stock', label: 'Receive Stock', icon: '＋', end: false },
  { to: '/products', label: 'Products', icon: '◫', end: true },
  { to: '/products/add', label: 'Add Product', icon: '✚', end: true },
];

function Sidebar() {
  return (
    <aside className="sidebar-shell hidden w-64 shrink-0 p-4 md:block">
      <div className="flex h-full flex-col">
        <div className="mb-6 px-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/80">Overview</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'sidebar-link',
                  isActive ? 'active' : '',
                ].join(' ')
              }
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-emerald-100">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
