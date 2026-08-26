import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Star, CalendarDays, FileText,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useSync } from '../hooks/useSync';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Users, label: 'Clients', to: '/clients' },
  { icon: Star, label: 'Kundli', to: '/kundli' },
  { icon: CalendarDays, label: 'Appointments', to: '/appointments' },
  { icon: FileText, label: 'Consultations', to: '/consultations' },
];

function formatLastSync(t: Date | null) {
  if (!t) return 'Never synced';
  const mins = Math.floor((Date.now() - t.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  return `${mins}m ago`;
}

export function Sidebar() {
  const [theme, setTheme] = useState('dark');
  const { t, language, setLanguage } = useTranslation();
  const { isSyncing, isOnline, lastSyncTime, pendingCount, sync } = useSync();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">Astro<span>Vanta</span></div>
        <div className="tagline">{t('Practice Management')}</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{t('Workspace')}</div>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="icon" size={16} />
            {t(label)}
          </NavLink>
        ))}
      </nav>

      {/* Language Switcher */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '10px 12px 0' }}>
        {(['en', 'hi', 'bn'] as const).map(l => (
          <button 
            key={l} 
            onClick={() => setLanguage(l)} 
            style={{ 
              padding: '4px 8px', fontSize: '11px', borderRadius: '4px', 
              background: language === l ? 'var(--accent)' : 'var(--bg-elevated)', 
              color: language === l ? '#fff' : 'var(--text-muted)', 
              border: '1px solid var(--border)', cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'বাংলা'}
          </button>
        ))}
      </div>

      {/* Theme Switcher */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', padding: '16px 12px' }}>
        <button
          onClick={() => changeTheme('dark')}
          style={{ width: 22, height: 22, borderRadius: '50%', background: '#13161e', border: theme === 'dark' ? '2px solid #7c6af7' : '1px solid #262a3a', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Dark Theme"
        />
        <button
          onClick={() => changeTheme('saffron')}
          style={{ width: 22, height: 22, borderRadius: '50%', background: '#fffaf2', border: theme === 'saffron' ? '2px solid #e65100' : '1px solid #e8d8c8', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Vedic Saffron Theme"
        />
        <button
          onClick={() => changeTheme('cyan')}
          style={{ width: 22, height: 22, borderRadius: '50%', background: '#05131a', border: theme === 'cyan' ? '2px solid #00e5ff' : '1px solid #1e3f52', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Cyber Cyan Theme"
        />
      </div>

      <div className="sync-status" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className={`sync-dot`} style={{ background: !isOnline ? '#ef4444' : pendingCount > 0 ? '#f59e0b' : '#10b981' }} />
          <span style={{ flex: 1, fontSize: '12px' }}>
            {!isOnline ? t('Offline Mode') : pendingCount > 0 ? `${pendingCount} ${t('pending')}` : t('Connected')}
          </span>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
            onClick={sync}
            disabled={isSyncing || !isOnline}
            title={t('Sync')}
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {t('Sync')}
          </button>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
          Last sync: {formatLastSync(lastSyncTime)}
        </div>
      </div>
    </aside>
  );
}
