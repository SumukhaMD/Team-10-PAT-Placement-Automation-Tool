import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: 'dashboard' },
    { name: 'Statistics', path: '/statistics', icon: 'bar_chart' },
    { name: 'Placement Report', path: '/placement-report', icon: 'description' },
    { name: 'Student Details', path: '/student-details', icon: 'group' },
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-surface border-r border-border-color flex flex-col h-full relative z-10">
      <div className="p-6 flex flex-col gap-1 border-b border-border-color">
        <h1 className="text-text-main text-2xl font-display font-bold tracking-tight">P.A.T</h1>
        <p className="text-primary text-xs font-medium uppercase tracking-widest">Analytics</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                isActive
                  ? 'bg-primary/10 border-l-2 border-primary text-primary'
                  : 'border-l-2 border-transparent text-muted hover:text-text-main hover:bg-white/5'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border-color">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-text-main">
            PO
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-main leading-none">Placement Officer</span>
            <span className="text-xs text-muted mt-1">Admin Access</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
