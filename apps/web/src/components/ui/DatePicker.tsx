import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value + 'T00:00:00') : new Date(1990, 0, 1);
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (selectedDate && !open) {
      setInputValue(selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    } else if (!value) {
      setInputValue('');
    }
  }, [value, selectedDate, open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  function selectDay(day: number) {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      parseAndSetDate(inputValue);
      setOpen(false);
    }
  }

  function handleBlur() {
    parseAndSetDate(inputValue);
  }

  function parseAndSetDate(str: string) {
    const parts = str.match(/(\d+)[-/ .](\d+)[-/ .](\d+)/);
    if (parts) {
      let y = parseInt(parts[3]);
      let m = parseInt(parts[2]);
      let d = parseInt(parts[1]);
      if (parts[1].length === 4) {
         y = parseInt(parts[1]);
         m = parseInt(parts[2]);
         d = parseInt(parts[3]);
      } else if (parts[3].length === 2) {
         y = y + (y > 50 ? 1900 : 2000);
      }
      
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        const val = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        onChange(val);
        const dObj = new Date(val + 'T00:00:00');
        if (!isNaN(dObj.getTime())) {
          setViewYear(dObj.getFullYear());
          setViewMonth(dObj.getMonth());
        }
        return;
      }
    }
    if (selectedDate) {
      setInputValue(selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    } else {
      setInputValue('');
    }
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="input-field"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: 'var(--bg-elevated)' }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="DD/MM/YYYY"
          style={{ 
            background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', 
            width: '100%', padding: '9px 0', fontSize: '13.5px', fontFamily: 'inherit'
          }}
          onFocus={() => {
            if (value) {
              const [y, m, d] = value.split('-');
              setInputValue(`${d}/${m}/${y}`);
            }
          }}
        />
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
          style={{ cursor: 'pointer', flexShrink: 0, padding: 2 }}
          onClick={() => { 
            setOpen(o => !o); 
            if (value) { 
              const d = new Date(value + 'T00:00:00'); 
              setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); 
            } 
          }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 999,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px', width: '260px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', borderRadius: 6, display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={viewMonth}
                onChange={e => setViewMonth(Number(e.target.value))}
                style={{ background: 'var(--bg-surface)', border: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
              >
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <input
                type="number"
                value={viewYear}
                onChange={e => setViewYear(Number(e.target.value))}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, width: '60px', textAlign: 'center', outline: 'none', padding: '2px 4px', fontFamily: 'inherit' }}
              />
            </div>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', borderRadius: 6, display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0', letterSpacing: '0.3px' }}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const isSelected = selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
              const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
              return (
                <button
                  key={i}
                  onClick={() => selectDay(day)}
                  style={{
                    background: isSelected ? 'var(--accent)' : isToday ? 'rgba(124,106,247,0.12)' : 'transparent',
                    border: 'none',
                    color: isSelected ? 'white' : isToday ? 'var(--accent-light)' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '6px 2px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.1s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
