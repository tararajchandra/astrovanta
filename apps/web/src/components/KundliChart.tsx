import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

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

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export function KundliChart({ chartData, title = "Kundli" }: { chartData: any, title?: string }) {
  const { t, language } = useTranslation();
  if (!chartData) return null;

  const ascIdx = SIGNS.indexOf(chartData.ascendant_sign);
  const signAtHouse = (h: number) => SIGNS[(ascIdx + h - 1) % 12];
  const planetsInHouse = (h: number) => chartData.planets.filter((p: any) => p.house === h);

  const HouseCell = ({ house }: { house: number | null }) => {
    if (house === null) {
      return (
        <div className="col-span-2 row-span-2 flex flex-col items-center justify-center p-4 border border-white/5 bg-black/40 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)' }}></div>
          <div className="text-xl font-bold text-yellow-400 z-10">{title}</div>
          <div className="text-white/50 text-xs mt-2 uppercase tracking-widest z-10">{t(chartData.ascendant_sign)} {t('Lagna')}</div>
        </div>
      );
    }
    
    const ps = planetsInHouse(house);
    const signName = signAtHouse(house);
    const isLagna = house === 1;

    return (
      <div className={`border border-white/5 p-2 min-h-[90px] relative transition-colors ${isLagna ? 'bg-purple-900/30' : 'bg-black/20'}`}>
        {isLagna && <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500"></div>}
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-bold px-1 rounded ${isLagna ? 'text-purple-400 bg-purple-900/40' : 'text-gray-500 bg-black/20'}`}>
            H{house}
          </span>
          <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
            {language === 'en' ? signName.substring(0, 3) : t(signName)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 items-center justify-center pt-1">
          {ps.map((p: any) => {
            const col = PLANET_COLOR[p.name] || { bg: 'rgba(255,255,255,0.1)', text: '#fff' };
            const glyph = PLANET_GLYPH[p.name] || p.name.substring(0, 2);
            
            // Abbreviation logic
            let abbr = PLANET_ABBR[p.name] || p.name.substring(0,2);
            if (language !== 'en') {
               // Get first character/grapheme for hindi/bengali (rough approx)
               abbr = t(p.name).substring(0, 2);
               if (abbr.endsWith('्') || abbr.endsWith('্')) abbr = t(p.name).substring(0, 3);
            }

            return (
              <div
                key={p.name}
                title={`${t(p.name)}${p.retrograde ? ' (R)' : ''} · ${p.degree_in_sign.toFixed(1)}°`}
                className="flex flex-col items-center justify-center rounded-lg p-1 min-w-[32px] cursor-default transition-transform hover:scale-110"
                style={{ background: col.bg, border: `1px solid ${col.text}33` }}
              >
                <div className="relative flex items-center justify-center h-[20px]">
                  <span style={{ fontSize: '18px', lineHeight: 1, color: col.text }}>{glyph}</span>
                  {p.retrograde && (
                    <span style={{ position: 'absolute', bottom: '-2px', right: '-6px', fontSize: '8px', color: col.text, fontWeight: 'bold' }}>R</span>
                  )}
                </div>
                <span style={{ fontSize: '8px', color: col.text, opacity: 0.9, marginTop: '2px', fontWeight: 'bold' }}>
                  {abbr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-0 w-full max-w-md aspect-square rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/60 backdrop-blur-md">
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
