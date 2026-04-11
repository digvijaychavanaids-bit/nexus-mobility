// Unused import removed for clean build.
import { NavLink } from 'react-router-dom';
import { getCurrentRole, logout } from '../../services/session';

const Sidebar = () => {
  const role = getCurrentRole();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'City Pulse', icon: 'location_on', path: '/pulse', roles: ['User'] },
    { name: 'Traffic Analysis', icon: 'analytics', path: '/traffic', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'Pollution Insights', icon: 'eco', path: '/pollution', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'Predictions', icon: 'query_stats', path: '/predict', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'Safety Hub', icon: 'shield_with_heart', path: '/safety', roles: ['User'] },
    { name: 'Smart Signals', icon: 'traffic', path: '/signals', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'Reports', icon: 'description', path: '/reports', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'Messages', icon: 'inbox', path: '/inbox', roles: ['Admin', 'Analyst', 'User'] },
    { name: 'Settings', icon: 'settings', path: '/settings', roles: ['Admin', 'Analyst', 'User'] },
  ];

  const adminItems = [
    { name: 'Admin Panel', icon: 'admin_panel_settings', path: '/admin', roles: ['Admin'] },
    { name: 'Help Center', icon: 'help', path: '/help', roles: ['Admin', 'Analyst', 'User'] },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-900 flex flex-col py-6 px-4 font-inter text-sm font-medium z-40 transition-all duration-200 ease-in-out border-r border-white/5">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flow-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-on-primary text-xl">hub</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-white leading-tight tracking-tight">Nexus Mobility</h1>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">City Planning Division</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.filter((item) => item.roles.includes(role)).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold ${
                isActive 
                  ? 'text-sky-400 bg-sky-400/10 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-1.5">
        {adminItems.filter((item) => item.roles.includes(role)).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold ${
                isActive 
                  ? 'text-sky-400 bg-sky-400/10 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
        <button 
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-error/10 hover:text-error transition-all text-left rounded-lg font-semibold"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
