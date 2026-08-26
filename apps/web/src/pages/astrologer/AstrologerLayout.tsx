import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  CalendarDays, 
  FileText, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeLanguageSwitcher } from '../../components/ThemeLanguageSwitcher';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/astrologer' },
  { icon: Users, label: 'Clients', to: '/astrologer/clients' },
  { icon: Star, label: 'Kundli', to: '/astrologer/kundli' },
  { icon: CalendarDays, label: 'Appointments', to: '/astrologer/appointments' },
  { icon: FileText, label: 'Consultations', to: '/astrologer/consultations' },
  { icon: Settings, label: 'Settings', to: '/astrologer/settings' },
];

export function AstrologerLayout({ children }: { children?: React.ReactNode }) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0a0a0f] print:bg-white print:block print:h-auto print:min-h-0">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0c18] border-r border-white/5 flex flex-col print:hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Astro<span className="text-yellow-400">Vanta</span>
          </div>
          <div className="text-xs font-medium text-white/40 tracking-wider uppercase">Astrologer Portal</div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/astrologer'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-yellow-400/10 text-yellow-400' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex justify-center">
            <ThemeLanguageSwitcher />
          </div>
          
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-sm font-medium text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          
          <div className="pt-2 text-center">
            <Link to="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              &larr; Customer Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-h-screen overflow-y-auto print:max-h-none print:h-auto print:overflow-visible print:block">
        {children || <Outlet />}
      </main>
    </div>
  );
}
