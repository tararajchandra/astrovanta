import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, CalendarDays, FileText } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

export function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    { label: 'Total Clients', value: '0', sub: 'in database', color: 'text-white' },
    { label: 'Appointments', value: '0', sub: 'this month', color: 'text-yellow-400' },
    { label: 'Consultations', value: '0', sub: 'completed', color: 'text-green-400' },
    { label: 'Reports', value: '0', sub: 'generated', color: 'text-white' },
  ];

  const quickActions = [
    { icon: Star, label: 'New Kundli', sub: 'Generate chart', to: '/astrologer/kundli', accent: true },
    { icon: Users, label: 'Add Client', sub: 'Save to DB', to: '/astrologer/clients', accent: false },
    { icon: CalendarDays, label: 'Appointments', sub: 'View schedule', to: '/astrologer/appointments', accent: false },
    { icon: FileText, label: 'Consultation', sub: 'Add notes', to: '/astrologer/consultations', accent: false },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/50">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl" />
        <h2 className="text-2xl font-serif font-bold text-white mb-2 relative z-10">
          Good {greeting} ✦
        </h2>
        <p className="text-white/60 max-w-xl relative z-10">
          Your AstroVanta web portal is ready. Manage your clients, view appointments, and generate Kundli charts securely from the cloud.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-sm font-medium text-white/60 mb-2">{s.label}</div>
            <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map(a => (
          <Link key={a.label} to={a.to} className="block group">
            <div className={`
              h-full rounded-2xl p-6 transition-all duration-200 border
              ${a.accent 
                ? 'bg-gradient-to-br from-indigo-900/60 to-slate-900/60 border-indigo-500/30 group-hover:border-indigo-400/50' 
                : 'bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20'}
            `}>
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center mb-4
                ${a.accent ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-white/60'}
              `}>
                <a.icon size={20} />
              </div>
              <div className="font-semibold text-white mb-1">{a.label}</div>
              <div className="text-xs text-white/50">{a.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
