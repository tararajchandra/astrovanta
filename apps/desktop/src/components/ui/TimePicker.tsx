import React, { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (val: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [hour, setHour] = useState(() => value ? parseInt(value.split(':')[0]) : 12);
  const [minute, setMinute] = useState(() => value ? parseInt(value.split(':')[1]) : 0);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function apply(h: number, m: number) {
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }

  function adjustHour(delta: number) {
    const h = (hour + delta + 24) % 24;
    setHour(h);
    apply(h, minute);
  }

  function adjustMinute(delta: number) {
    const m = (minute + delta + 60) % 60;
    setMinute(m);
    apply(hour, m);
  }

  const display = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="input-field"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => setOpen(o => !o)}
      >
        <span>{display}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-light)', letterSpacing: '0.5px' }}>{ampm}</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 999,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          width: '200px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Time of Birth</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => adjustHour(1)} style={arrowBtnStyle}>▲</button>
              <div style={timeDisplayStyle}>{String(hour).padStart(2, '0')}</div>
              <button onClick={() => adjustHour(-1)} style={arrowBtnStyle}>▼</button>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>:</div>
            {/* Minutes */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => adjustMinute(1)} style={arrowBtnStyle}>▲</button>
              <div style={timeDisplayStyle}>{String(minute).padStart(2, '0')}</div>
              <button onClick={() => adjustMinute(-1)} style={arrowBtnStyle}>▼</button>
            </div>
            {/* AM/PM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '4px' }}>
              <button
                onClick={() => { const h = hour >= 12 ? hour - 12 : hour; setHour(h); apply(h, minute); }}
                style={{ ...ampmStyle, background: hour < 12 ? 'var(--accent)' : 'var(--bg-surface)' }}
              >AM</button>
              <button
                onClick={() => { const h = hour < 12 ? hour + 12 : hour; setHour(h); apply(h, minute); }}
                style={{ ...ampmStyle, background: hour >= 12 ? 'var(--accent)' : 'var(--bg-surface)' }}
              >PM</button>
            </div>
          </div>

          {/* Quick time slots */}
          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[['Dawn', 5, 30], ['Sunrise', 6, 0], ['Morning', 9, 0], ['Noon', 12, 0], ['Evening', 18, 0], ['Night', 21, 0]].map(([label, h, m]) => (
              <button key={String(label)} onClick={() => { setHour(h as number); setMinute(m as number); apply(h as number, m as number); setOpen(false); }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '10px', padding: '5px 2px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const arrowBtnStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  width: '36px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  transition: 'all 0.1s',
};

const timeDisplayStyle: React.CSSProperties = {
  width: '52px',
  height: '52px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-light)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.5px',
};

const ampmStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '6px',
  color: 'white',
  fontSize: '10px',
  fontWeight: 700,
  padding: '6px 8px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
  fontFamily: 'inherit',
};
