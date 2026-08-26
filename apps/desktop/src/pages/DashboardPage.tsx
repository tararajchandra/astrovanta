import React from 'react';
import { Star, Users, CalendarDays, FileText, TrendingUp, ArrowUpRight } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { label: 'Total Clients', value: '0', sub: 'stored locally', color: '' },
    { label: 'Appointments', value: '0', sub: 'this month', color: 'gold' },
    { label: 'Consultations', value: '0', sub: 'completed', color: 'success' },
    { label: 'Reports', value: '0', sub: 'generated', color: '' },
  ];

  const quickActions = [
    { icon: Star, label: 'New Kundli', sub: 'Generate offline chart', to: '/kundli', accent: true },
    { icon: Users, label: 'Add Client', sub: 'Save to local DB', to: '/clients', accent: false },
    { icon: CalendarDays, label: 'Appointments', sub: 'View schedule', to: '/appointments', accent: false },
    { icon: FileText, label: 'Consultation', sub: 'Add notes', to: '/consultations', accent: false },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="page-content">
        {/* Welcome */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1d2e 0%, #1e1b3a 100%)',
          border: '1px solid rgba(124,106,247,0.2)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(40px)' }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} ✦
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: 480 }}>
            Your AstroVanta workspace is running in offline mode. All client data is stored locally and will sync when connected.
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          {stats.map(s => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="section-title">Quick Actions</div>
        <div className="grid-4">
          {quickActions.map(a => (
            <a key={a.label} href={`#${a.to}`} style={{ textDecoration: 'none' }} onClick={e => { e.preventDefault(); window.location.hash = a.to; }}>
              <div style={{
                background: a.accent ? 'linear-gradient(135deg, #1a1740, #16142d)' : 'var(--bg-surface)',
                border: `1px solid ${a.accent ? 'rgba(124,106,247,0.3)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: a.accent ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <a.icon size={16} color={a.accent ? 'var(--accent-light)' : 'var(--text-muted)'} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: 2 }}>{a.sub}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
