import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, BedDouble, ClipboardList,
  CreditCard, AlertTriangle, Building2, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/etudiants',    icon: GraduationCap,   label: 'Étudiants' },
  { to: '/chambres',     icon: BedDouble,        label: 'Chambres' },
  { to: '/attributions', icon: ClipboardList,    label: 'Attributions' },
  { to: '/paiements',    icon: CreditCard,       label: 'Paiements' },
  { to: '/incidents',    icon: AlertTriangle,    label: 'Incidents' },
  { to: '/batiments',    icon: Building2,        label: 'Bâtiments' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300"
      style={{
        width: collapsed ? 72 : 260,
        background: 'linear-gradient(180deg, #1E3A8A 0%, #1a3278 60%, #152a6e 100%)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg">SC</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-tight truncate">SunuCampus</p>
            <p className="text-blue-300 text-xs truncate">ESP / UCAD · Dakar</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="ml-auto flex-shrink-0 text-blue-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 group
               ${isActive
                 ? 'bg-accent text-white shadow-md shadow-amber-900/20'
                 : 'text-blue-200 hover:bg-white/10 hover:text-white'}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-blue-400 text-xs text-center">Résidence Universitaire</p>
          <p className="text-blue-500 text-xs text-center">© 2025 SunuCampus</p>
        </div>
      )}
    </aside>
  );
}
