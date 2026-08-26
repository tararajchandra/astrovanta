import React, { useState, useEffect } from 'react';
import { Star, AlertCircle, MapPin, RefreshCw, Printer, Save, FolderOpen, X, Trash2 } from 'lucide-react';
import { DatePicker } from '../components/ui/DatePicker';
import { TimePicker } from '../components/ui/TimePicker';
import { LocationPickerModal } from '../components/ui/LocationPickerModal';
import { calculateKundli, calculateDivisionalChart, calculateTransitChart } from '../lib/astroEngine';
import { saveKundli, getSavedKundlis, deleteKundli } from '../lib/db';
import { useTranslation } from '../contexts/LanguageContext';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  degree_in_sign: number;
  retrograde: boolean;
  nakshatra: string;
  nakshatra_pada: number;
  house: number;
}

interface DashaPeriod {
  lord: string;
  start_date: string;
  end_date: string;
  years: number;
}

interface KundliResult {
  planets: Planet[];
  dashas: DashaPeriod[];
  ascendant_sign: string;
  ascendant_degree: number;
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Unicode astrological glyphs for each planet
const PLANET_GLYPH: Record<string, string> = {
  'Sun':      '☉',
  'Moon':     '☽',
  'Mars':     '♂',
  'Mercury':  '☿',
  'Jupiter':  '♃',
  'Venus':    '♀',
  'Saturn':   '♄',
  'Rahu':     '☊',
  'Ketu':     '☋',
  'Ascendant':'Asc',
};

// Color per planet for the pill in the chart (Vedic Aesthetic)
const PLANET_COLOR: Record<string, { bg: string; text: string }> = {
  'Sun':      { bg: 'rgba(255, 140, 0, 0.12)',  text: '#FFA500' }, // Gold/Orange
  'Moon':     { bg: 'rgba(255, 255, 255, 0.08)',text: '#E2E8F0' }, // Pearl White
  'Mars':     { bg: 'rgba(230, 57, 70, 0.12)',  text: '#E63946' }, // Vermilion
  'Mercury':  { bg: 'rgba(42, 157, 143, 0.12)', text: '#2A9D8F' }, // Emerald/Leaf
  'Jupiter':  { bg: 'rgba(244, 162, 97, 0.12)', text: '#F4A261' }, // Saffron/Yellow
  'Venus':    { bg: 'rgba(255, 200, 221, 0.12)',text: '#FFC8DD' }, // Soft Diamond/Pink
  'Saturn':   { bg: 'rgba(61, 90, 128, 0.12)',  text: '#82A0D8' }, // Indigo/Blue
  'Rahu':     { bg: 'rgba(108, 117, 125, 0.12)',text: '#ADB5BD' }, // Smoke
  'Ketu':     { bg: 'rgba(156, 102, 68, 0.12)', text: '#D4A373' }, // Rust/Brown
};

const PLANET_ABBR: Record<string, string> = {
  'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
  'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa',
  'Rahu': 'Ra', 'Ketu': 'Ke', 'Ascendant': 'As'
};


export function KundliPage() {
  const { t, language } = useTranslation();
  const [form, setForm] = useState({
    name: '', dob: '', tob: '12:00',
    latitude: 28.6139, longitude: 77.2090, timezone: 5.5, city: 'New Delhi'
  });
  const [result, setResult] = useState<KundliResult | null>(null);
  const [d9, setD9]       = useState<any>(null);
  const [d3, setD3]       = useState<any>(null);
  const [d10, setD10]     = useState<any>(null);
  const [transit, setTransit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [activeTab, setActiveTab] = useState<'d1' | 'd9' | 'd3' | 'd10' | 'gochor' | 'planets' | 'dasha'>('d1');
  const [mapOpen, setMapOpen] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [savedKundlis, setSavedKundlis] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState('');

  const loadSavedList = async () => {
    const list = await getSavedKundlis();
    setSavedKundlis(list);
  };

  useEffect(() => {
    loadSavedList();
  }, []);

  async function handleSave() {
    if (!form.name || !form.dob) {
      alert("Generate a Kundli first with Name and DOB.");
      return;
    }
    try {
      const id = form.name + "_" + form.dob + "_" + form.tob;
      await saveKundli(id, form.name, form.dob, form.tob, form.latitude, form.longitude, form.timezone, form.city);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
      loadSavedList();
    } catch (e: any) {
      console.error(e);
      alert("Failed to save: " + e.message);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this saved Kundli?")) {
      await deleteKundli(id);
      loadSavedList();
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleGenerate() {
    if (!form.name || !form.dob) { setError('Please fill in Name and Date of Birth.'); return; }
    setError('');
    setLoading(true);
    try {
      const [year, month, day] = form.dob.split('-').map(Number);
      const [hour, minute] = form.tob.split(':').map(Number);
      const input = {
        name: form.name,
        year, month, day,
        hour, minute, second: 0,
        latitude: form.latitude,
        longitude: form.longitude,
        timezone: form.timezone
      };
      const res = calculateKundli(input);
      setResult(res as any);
      setD9(calculateDivisionalChart(res, 9));
      setD3(calculateDivisionalChart(res, 3));
      setD10(calculateDivisionalChart(res, 10));
      setTransit(calculateTransitChart(res, form.latitude, form.longitude, form.timezone));
      setActiveTab('d1');
    } catch (e: any) {
      setError(e.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }

  function refreshTransit() {
    if (!result) return;
    setTransit(calculateTransitChart(result as any, form.latitude, form.longitude, form.timezone));
  }


  // Build the 4x4 North Indian grid
  function KundliChart({ planets, ascSign }: { planets: Planet[], ascSign: string }) {
    const ascIdx = SIGNS.indexOf(ascSign);
    const signAtHouse = (h: number) => SIGNS[(ascIdx + h - 1) % 12];
    const planetsInHouse = (h: number) => planets.filter(p => p.house === h);

    const cellBase: React.CSSProperties = {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      padding: '8px 6px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'background 0.2s',
      overflow: 'hidden',
    };

    const HouseCell = ({ house }: { house: number | null }) => {
      if (house === null) {
        return (
          <div style={{ ...cellBase, background: 'var(--bg-elevated)', gridColumn: 'span 2', gridRow: 'span 2', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)' }}></div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--gold-light)', fontWeight: 600, textAlign: 'center', zIndex: 1, letterSpacing: '0.5px' }}>
              {form.name || 'Kundli'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', letterSpacing: '0.8px', textTransform: 'uppercase', zIndex: 1 }}>
              {ascSign} Lagna
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: 4, zIndex: 1, letterSpacing: '0.5px' }}>
              {form.dob}
            </div>
          </div>
        );
      }
      
      const ps = planetsInHouse(house);
      const signName = signAtHouse(house);
      const isLagna = house === 1;

      return (
        <div style={{...cellBase, background: isLagna ? 'var(--accent-glow)' : 'var(--bg-surface)'}}>
          {isLagna && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent)' }}></div>}
          
          {/* House number + Sign */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: isLagna ? 'var(--accent-light)' : 'var(--text-secondary)', padding: '2px 4px', background: 'var(--bg-base)', borderRadius: '4px' }}>
              H{house}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {language === 'en' ? t(signName).substring(0, 3) : t(signName)}
            </span>
          </div>
          
          {/* Planet pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', flex: 1, alignContent: 'center', justifyContent: 'center' }}>
            {ps.map(p => {
              const col = PLANET_COLOR[p.name] || { bg: 'var(--bg-elevated)', text: 'var(--text-primary)' };
              const glyph = PLANET_GLYPH[p.name] || p.name.substring(0, 2);
              return (
                <div
                  key={p.name}
                  title={`${p.name}${p.retrograde ? ' (Retrograde)' : ''} · ${p.degree_in_sign.toFixed(1)}° ${p.sign}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: col.bg,
                    border: `1px solid ${col.text}33`,
                    borderRadius: '8px',
                    padding: '4px 6px',
                    minWidth: '32px',
                    cursor: 'default',
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.05)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${col.text}22`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${col.text}88`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = `${col.text}33`;
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '22px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1, color: col.text }}>{glyph}</span>
                    {p.retrograde && (
                      <span style={{ position: 'absolute', bottom: '-2px', right: '-8px', fontSize: '8px', color: col.text, fontWeight: 800 }}>R</span>
                    )}
                  </div>
                  <span style={{ fontSize: '8px', color: col.text, opacity: 0.8, marginTop: '2px', fontWeight: 700, letterSpacing: '0.2px' }}>
                    {PLANET_ABBR[p.name] || p.name.substring(0,2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        background: 'var(--bg-surface)',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '1',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <HouseCell house={12} />
        <HouseCell house={1} />
        <HouseCell house={2} />
        <HouseCell house={3} />
        <HouseCell house={11} />
        <HouseCell house={null} />
        <HouseCell house={4} />
        <HouseCell house={10} />
        <HouseCell house={5} />
        <HouseCell house={9} />
        <HouseCell house={8} />
        <HouseCell house={7} />
        <HouseCell house={6} />
      </div>
    );
  }

  const now = new Date();

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">{t('Kundli Generator')}</div>
          <div className="topbar-subtitle">{t('Offline_Calc')}</div>
        </div>
        <div className="topbar-buttons" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={() => setSavedModalOpen(true)}>
            <FolderOpen size={14} /> {t('Load Saved')}
          </button>
          {result && (
            <>
              <button className="btn btn-ghost" onClick={handleSave}>
                <Save size={14} /> {saveStatus || t('Save Kundli')}
              </button>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={14} /> {t('Print')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="page-content" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Form Panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t('Birth Details')}</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">{t('Full Name')}</label>
              <input className="input-field" placeholder="e.g. Priya Sharma" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">{t('Date of Birth')}</label>
              <DatePicker value={form.dob} onChange={dob => setForm(f => ({ ...f, dob }))} />
            </div>
            <div className="input-group">
              <label className="input-label">{t('Time of Birth')}</label>
              <TimePicker value={form.tob} onChange={tob => setForm(f => ({ ...f, tob }))} />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '2px' }}>
                Interpreted as: {(() => {
                  if (!form.tob) return '';
                  const [h, m] = form.tob.split(':').map(Number);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const h12 = h % 12 || 12;
                  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
                })()}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{t('City / Place')}</label>
              <div
                className="input-field"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => setMapOpen(true)}
              >
                <span style={{ color: form.city ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {form.city || 'Click to pick on map…'}
                </span>
                <MapPin size={13} color="var(--accent-light)" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">{t('Latitude')}</label>
                <div className="input-field" style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>{form.latitude.toFixed(4)}°</div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('Longitude')}</label>
                <div className="input-field" style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>{form.longitude.toFixed(4)}°</div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{t('Timezone (UTC+)')}</label>
              <input className="input-field" type="number" step="0.5" value={form.timezone}
                onChange={e => setForm(f => ({ ...f, timezone: parseFloat(e.target.value) }))} />
            </div>

            <LocationPickerModal
              open={mapOpen}
              onClose={() => setMapOpen(false)}
              onSelect={(lat, lon, city) => setForm(f => ({ ...f, latitude: lat, longitude: lon, city }))}
              initialLat={form.latitude}
              initialLon={form.longitude}
            />

            {error && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--danger)', fontSize: '12.5px', padding: '8px 12px', background: 'rgba(240,82,82,0.1)', borderRadius: 8 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={handleGenerate} disabled={loading}>
              {loading ? <><span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} /> Calculating...</> : <><Star size={14} /> Generate Kundli</>}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-surface)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {([
                { key: 'd1',     label: 'D1_Rashi',    desc: 'Birth Chart' },
                { key: 'd9',     label: 'D9_Navamsa',  desc: 'Marriage & Dharma' },
                { key: 'd3',     label: 'D3_Drekkana', desc: 'Siblings & Courage' },
                { key: 'd10',    label: 'D10_Dasamsa', desc: 'Career & Profession' },
                { key: 'gochor', label: 'Gochor',         desc: 'Current Transit' },
                { key: 'planets',label: 'Planets',        desc: 'Positions' },
                { key: 'dasha',  label: 'Dasha',          desc: 'Vimshottari' },
              ] as const).map(t_tab => (
                <button key={t_tab.key} onClick={() => setActiveTab(t_tab.key)}
                  title={t_tab.desc}
                  style={{
                    padding: '6px 14px', fontSize: '12px', borderRadius: '7px',
                    background: activeTab === t_tab.key ? 'var(--accent)' : 'transparent',
                    color: activeTab === t_tab.key ? 'white' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: activeTab === t_tab.key ? 600 : 400,
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}>
                  {t(t_tab.label)}
                </button>
              ))}
            </div>

            {/* Chart renderer — reused for D1, D9, D3, D10, Gochor */}
            {(['d1','d9','d3','d10','gochor'] as const).includes(activeTab as any) && (() => {
              const chartData =
                activeTab === 'd1'     ? { ascendant_sign: result.ascendant_sign, ascendant_degree: result.ascendant_degree, planets: result.planets } :
                activeTab === 'd9'     ? d9 :
                activeTab === 'd3'     ? d3 :
                activeTab === 'd10'    ? d10 :
                transit;

              const chartMeta: Record<string, { title: string; subtitle: string; color: string }> = {
                d1:     { title: 'D1 · Rashi Chart',     subtitle: 'Lagna (Birth Chart)',            color: 'var(--accent-light)' },
                d9:     { title: 'D9 · Navamsa',         subtitle: 'Divisional — Marriage & Dharma', color: '#f0c040' },
                d3:     { title: 'D3 · Drekkana',        subtitle: 'Divisional — Siblings & Courage',color: '#f06ac8' },
                d10:    { title: 'D10 · Dasamsa',        subtitle: 'Divisional — Career & Profession',color: '#50d2a0' },
                gochor: { title: 'Gochor',               subtitle: `Transit · ${transit?.transit_date || ''}`, color: '#f97060' },
              };
              const meta = chartMeta[activeTab];
              if (!chartData) return null;
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', alignItems: 'start' }}>
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title" style={{ color: meta.color }}>{meta.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {meta.subtitle} · {chartData.ascendant_sign} Lagna
                        {activeTab === 'gochor' && (
                          <button onClick={refreshTransit} title="Refresh transit to now" style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-light)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', padding: 0 }}>
                            <RefreshCw size={11} /> Refresh
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <KundliChart planets={chartData.planets} ascSign={chartData.ascendant_sign} />
                    </div>
                  </div>

                  {/* Side stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="stat-card">
                      <div className="stat-label">{t('Lagna')}</div>
                      <div className="stat-value" style={{ fontSize: '18px', marginTop: 6, color: meta.color }}>{t(chartData.ascendant_sign)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{chartData.ascendant_degree?.toFixed(2)}°</div>
                    </div>
                    {activeTab === 'd1' && (
                      <>
                        <div className="stat-card gold">
                          <div className="stat-label">{t('Current Dasha')}</div>
                          <div className="stat-value" style={{ fontSize: '16px', marginTop: 6, color: 'var(--gold)' }}>{t(result.dashas[0]?.lord)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{t('until')} {result.dashas[0]?.end_date}</div>
                        </div>
                        <div className="stat-card" style={{ borderColor: 'var(--accent-dark)' }}>
                          <div className="stat-label">{t('Moon Sign (Rashi)')}</div>
                          <div className="stat-value" style={{ fontSize: '14px', marginTop: 6, color: 'var(--accent-light)' }}>
                            {t(result.planets.find(p => p.name === 'Moon')?.sign || '')}
                          </div>
                        </div>
                        <div className="stat-card success">
                          <div className="stat-label">{t('Moon Nakshatra')}</div>
                          <div className="stat-value" style={{ fontSize: '13px', marginTop: 6 }}>{result.planets.find(p => p.name === 'Moon')?.nakshatra}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{t('Pada')} {result.planets.find(p => p.name === 'Moon')?.nakshatra_pada}</div>
                        </div>
                      </>
                    )}
                    {activeTab === 'd9' && (
                      <div className="stat-card" style={{ borderColor: '#f0c04044' }}>
                        <div className="stat-label">Navamsa Lagna</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                          Navamsa reveals the inner nature, spouse qualities, and spiritual path. 
                          D9 Lagna shows the soul's deeper dharma.
                        </div>
                      </div>
                    )}
                    {activeTab === 'd3' && (
                      <div className="stat-card" style={{ borderColor: '#f06ac844' }}>
                        <div className="stat-label">Drekkana Lagna</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                          Drekkana indicates siblings, courage, and the nature of the vitality of the body.
                        </div>
                      </div>
                    )}
                    {activeTab === 'd10' && (
                      <div className="stat-card" style={{ borderColor: '#50d2a044' }}>
                        <div className="stat-label">Dasamsa Lagna</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                          Dasamsa governs career, profession, status, and worldly actions.
                        </div>
                      </div>
                    )}
                    {activeTab === 'gochor' && (
                      <div className="stat-card" style={{ borderColor: '#f9706044' }}>
                        <div className="stat-label">Transit</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
                          Current planetary positions in the sky, placed in houses relative to your natal Lagna.
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 8, opacity: 0.6 }}>
                          {transit?.transit_date}
                        </div>
                      </div>
                    )}

                    {/* Planet summary mini-list */}
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>{t('Positions')}</div>
                      {chartData.planets.slice(0, 9).map((p: any) => {
                        const col = PLANET_COLOR[p.name] || { text: '#888' };
                        const glyph = PLANET_GLYPH[p.name] || p.name[0];
                        return (
                          <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '13px', color: col.text, width: 18 }}>{glyph}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t(p.name)}</span>
                            </div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                              {language === 'en' ? t(p.sign).substring(0,3) : t(p.sign)} · H{p.house}
                              {p.retrograde && <span style={{ color: col.text, marginLeft: 3 }}>ᴿ</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Planets Tab */}
            {activeTab === 'planets' && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Planetary Positions</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Sidereal · Lahiri Ayanamsha</div>
                </div>
                <table className="planet-table">
                  <thead>
                    <tr>
                      <th>Planet</th><th>Sign</th><th>Degree</th>
                      <th>House</th><th>Nakshatra</th><th>Pada</th><th>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.planets.map(p => {
                      const col = PLANET_COLOR[p.name] || { bg: 'rgba(120,120,160,0.2)', text: 'rgba(200,200,220,0.8)' };
                      const glyph = PLANET_GLYPH[p.name] || '';
                      return (
                        <tr key={p.name}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: col.bg, border: `1px solid ${col.text}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: col.text }}>
                                {glyph}
                              </div>
                              <span className="planet-name">{p.name}</span>
                            </div>
                          </td>
                          <td>{p.sign}</td>
                          <td>{p.degree_in_sign.toFixed(2)}°</td>
                          <td style={{ color: 'var(--accent-light)' }}>{p.house}</td>
                          <td>{p.nakshatra}</td>
                          <td>{p.nakshatra_pada}</td>
                          <td>{p.retrograde ? <span className="badge pending">ᴿ Retro</span> : <span className="badge synced">Direct</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Dasha Tab */}
            {activeTab === 'dasha' && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Vimshottari Dasha</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Mahadasha Periods</div>
                </div>
                <div className="card-body">
                  {result.dashas.map((d, i) => {
                    const start = new Date(d.start_date);
                    const end   = new Date(d.end_date);
                    const isCurrent = now >= start && now <= end;
                    const progress = isCurrent
                      ? Math.max(0, Math.min(100, ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100))
                      : now > end ? 100 : 0;
                    const col = PLANET_COLOR[d.lord] || { bg: 'rgba(120,120,160,0.2)', text: '#888' };
                    const glyph = PLANET_GLYPH[d.lord] || d.lord[0];
                    return (
                      <div key={i} className={`dasha-item ${isCurrent ? 'current' : ''}`}>
                        <div className="dasha-lord" style={{ background: col.bg, border: `1px solid ${col.text}44`, color: col.text, fontSize: '18px' }}>{glyph}</div>
                        <div className="dasha-info">
                          <div className="dasha-lord-name">
                            {d.lord}
                            {isCurrent && <span style={{ color: 'var(--gold)', fontSize: '10px', marginLeft: 6 }}>● Active</span>}
                          </div>
                          <div className="dasha-dates">{d.start_date} → {d.end_date} · {d.years} yrs</div>
                        </div>
                        <div>
                          <div className="dasha-bar-wrap">
                            <div className="dasha-bar" style={{ width: `${progress}%`, background: col.text }} />
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 3, textAlign: 'right' }}>{progress.toFixed(0)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div className="empty-state">
              <Star size={36} className="icon" />
              <div style={{ marginTop: 12, fontSize: '14px', color: 'var(--text-muted)' }}>Fill in birth details to generate a Kundli</div>
              <div style={{ marginTop: 6, fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6 }}>Works fully offline · 5 charts generated instantly</div>
            </div>
          </div>
        )}
      </div>

      {savedModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title">Saved Kundlis</div>
              <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setSavedModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', padding: 0 }}>
              {savedKundlis.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No saved Kundlis found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {savedKundlis.map((k, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{k.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {k.dob} {k.tob} · {k.city}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => {
                          setForm({
                            name: k.name,
                            dob: k.dob,
                            tob: k.tob,
                            latitude: k.latitude,
                            longitude: k.longitude,
                            timezone: k.timezone,
                            city: k.city
                          });
                          setSavedModalOpen(false);
                          setTimeout(() => {
                            // Can't auto generate easily since handleGenerate relies on state that might not have updated yet in this render.
                            // But user can click Generate.
                          }, 100);
                        }}>
                          Load
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => handleDelete(k.id)}>
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

