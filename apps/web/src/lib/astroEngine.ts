/**
 * AstroVanta Offline Vedic Astronomy Engine
 * Implements simplified but accurate planetary calculations
 * Based on: Jean Meeus "Astronomical Algorithms" 2nd Ed.
 * Accuracy: ~1-2° for most planets, sufficient for Vedic chart generation
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function toRad(d: number) { return d * DEG; }
function toDeg(r: number) { return r * RAD; }
function norm(deg: number) { return ((deg % 360) + 360) % 360; }

// ---------------------------------------------------------------------------
// Julian Day Number
// ---------------------------------------------------------------------------
export function julianDay(
  year: number, month: number, day: number,
  hour: number, minute: number, second: number,
  timezone: number
): number {
  const utHour = hour + minute / 60 + second / 3600 - timezone;
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716))
       + Math.floor(30.6001 * (m + 1))
       + day + B - 1524.5
       + utHour / 24;
}

// Centuries from J2000.0
function cent(jd: number) { return (jd - 2451545.0) / 36525.0; }

// ---------------------------------------------------------------------------
// Lahiri Ayanamsha (Chitrapaksha)
// ---------------------------------------------------------------------------
export function lahiriAyanamsha(jd: number): number {
  const T = cent(jd);
  // Precise True Lahiri (Chitrapaksha) Ayanamsha calculation
  // 23° 51' 11" at J2000.0 with quadratic precession terms
  const meanAyanamsha = 23.853314 + 1.396041 * T + 0.000308 * T * T;
  
  // Nutation in longitude (equation of equinoxes) to get True Ayanamsha
  const omega = 125.04452 - 1934.136261 * T; // longitude of lunar node
  const L_sun = 280.4665 + 36000.7698 * T;   // mean longitude of sun
  const L_moon = 218.3165 + 481267.8813 * T; // mean longitude of moon
  
  const nutation = (-17.20 * Math.sin(toRad(omega))
                    - 1.32 * Math.sin(toRad(2 * L_sun))
                    - 0.23 * Math.sin(toRad(2 * L_moon))
                    + 0.21 * Math.sin(toRad(2 * omega))) / 3600;

  return meanAyanamsha + nutation;
}

// ---------------------------------------------------------------------------
// Sun
// ---------------------------------------------------------------------------
function sunLongitude(T: number): { lon: number, r: number } {
  const L0 = norm(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M  = toRad(norm(357.52911 + 35999.05029 * T - 0.0001537 * T * T));
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
           + 0.000289 * Math.sin(3 * M);
  const v = M + toRad(C);
  const ecc = 0.0167086 - 0.000042 * T;
  const r = 1.000001018 * (1 - ecc * ecc) / (1 + ecc * Math.cos(v));
  const sunLon = norm(L0 + C);
  // Apparent longitude (aberration)
  const omega = toRad(125.04 - 1934.136 * T);
  return { lon: norm(sunLon - 0.00569 - 0.00478 * Math.sin(omega)), r };
}

// ---------------------------------------------------------------------------
// Moon (Meeus simplified, ~5' accuracy)
// ---------------------------------------------------------------------------
function moonLongitude(T: number): number {
  const L1 = norm(218.3165 + 481267.8813 * T);
  const M  = toRad(norm(357.5291 + 35999.0503 * T));
  const Mp = toRad(norm(134.9634 + 477198.8676 * T));
  const F  = toRad(norm(93.2721  + 483202.0175 * T));
  const D  = toRad(norm(297.8502 + 445267.1115 * T));

  const lon = L1
    + 6.2888 * Math.sin(Mp)
    + 1.2740 * Math.sin(2*D - Mp)
    + 0.6583 * Math.sin(2*D)
    + 0.2136 * Math.sin(2*Mp)
    - 0.1851 * Math.sin(M)
    - 0.1143 * Math.sin(2*F)
    + 0.0588 * Math.sin(2*D - 2*Mp)
    + 0.0572 * Math.sin(2*D - M - Mp)
    + 0.0533 * Math.sin(2*D + Mp)
    + 0.0459 * Math.sin(2*D - M)
    + 0.0410 * Math.sin(Mp - M)
    + 0.0348 * Math.sin(D)
    - 0.0346 * Math.sin(M)
    + 0.0315 * Math.sin(Mp + M)
    + 0.0304 * Math.sin(2*D - 2*F);
  return norm(lon);
}

// ---------------------------------------------------------------------------
// Outer & inner planets (mean longitude + equation of centre, ~1° accuracy)
// ---------------------------------------------------------------------------
function planetHelio(T: number, L0: number, L1: number, M0: number, M1: number, ecc: number, a: number): { lon: number, r: number } {
  const L = norm(L0 + L1 * T);
  const M = toRad(norm(M0 + M1 * T));
  const C = (2 * ecc - ecc * ecc * ecc / 4) * Math.sin(M)
           + (5 / 4) * ecc * ecc * Math.sin(2 * M)
           + (13 / 12) * ecc * ecc * ecc * Math.sin(3 * M);
  const v = M + C; // C is in radians, M is in radians. So v is in radians.
  const r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(v));
  return { lon: norm(L + toDeg(C)), r };
}

function helioToGeo(p: { lon: number, r: number }, sun: { lon: number, r: number }): number {
  const earthLon = toRad(norm(sun.lon + 180));
  const helioLon = toRad(p.lon);
  const x = p.r * Math.cos(helioLon) - sun.r * Math.cos(earthLon);
  const y = p.r * Math.sin(helioLon) - sun.r * Math.sin(earthLon);
  return norm(toDeg(Math.atan2(y, x)));
}

function marsHelio(T: number)    { return planetHelio(T, 355.4332, 19140.2993, 19.3730, 19140.3030, 0.09341, 1.523679); }
function mercuryHelio(T: number) { return planetHelio(T, 252.2509, 149472.6749, 174.7948, 149472.5150, 0.20563, 0.387098); }
function jupiterHelio(T: number) { return planetHelio(T, 34.3515,  3034.9057, 20.9240, 3034.6967, 0.04849, 5.202603); }
function venusHelio(T: number)   { return planetHelio(T, 181.9798, 58517.8157, 50.4161, 58517.8036, 0.00677, 0.723332); }
function saturnHelio(T: number)  { return planetHelio(T, 50.0774,  1222.1138, 317.0207, 1222.1138, 0.05551, 9.554909); }

// ---------------------------------------------------------------------------
// Rahu / Ketu (Mean Lunar Node)
// ---------------------------------------------------------------------------
function rahuLongitude(T: number): number {
  // Mean ascending node
  return norm(125.0445 - 1934.1362 * T + 0.0020708 * T * T);
}

// ---------------------------------------------------------------------------
// Ascendant (ARMC method)
// ---------------------------------------------------------------------------
function calcAscendant(jd: number, lat: number, lon: number): number {
  const T = cent(jd);
  // Greenwich Sidereal Time
  const theta0 = 280.46061837
    + 360.98564736629 * (jd - 2451545)
    + 0.000387933 * T * T
    - T * T * T / 38710000;
  // Local Sidereal Time in degrees
  const lst = norm(theta0 + lon);
  const RAMC = toRad(lst);
  const eps  = toRad(23.4392911 - 0.013004167 * T); // obliquity
  const latR = toRad(lat);

  // Ascendant formula (Meeus Eq 14.2)
  // tan(Asc) = cos(RAMC) / ( -sin(RAMC)*cos(eps) - tan(lat)*sin(eps) )
  const y = Math.cos(RAMC);
  const x = -Math.sin(RAMC) * Math.cos(eps) - Math.tan(latR) * Math.sin(eps);
  let asc = toDeg(Math.atan2(y, x));
  if (asc < 0) asc += 360;
  return norm(asc);
}

// ---------------------------------------------------------------------------
// Retrograde detection (simplified: use daily speed < 0 check)
// ---------------------------------------------------------------------------
function isRetrograde(jd: number, calcFn: (T: number) => number): boolean {
  const T1 = cent(jd - 1);
  const T2 = cent(jd + 1);
  let diff = calcFn(T2) - calcFn(T1);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// ---------------------------------------------------------------------------
// Nakshatra & Pada from sidereal longitude
// ---------------------------------------------------------------------------
const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

export function getNakshatra(siderealLon: number): { nakshatra: string; pada: number } {
  const idx = Math.floor(norm(siderealLon) / (360 / 27));
  const pada = Math.floor((norm(siderealLon) % (360 / 27)) / (360 / 108)) + 1;
  return { nakshatra: NAKSHATRAS[idx % 27], pada: Math.min(pada, 4) };
}

// ---------------------------------------------------------------------------
// Zodiac signs
// ---------------------------------------------------------------------------
const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

function getSign(lon: number): { sign: string; degreeInSign: number } {
  const n = norm(lon);
  return { sign: SIGNS[Math.floor(n / 30)], degreeInSign: n % 30 };
}

// ---------------------------------------------------------------------------
// Whole Sign House (1 = Ascendant sign)
// ---------------------------------------------------------------------------
function getHouse(siderealLon: number, ascSiderealLon: number): number {
  const ascSign = Math.floor(norm(ascSiderealLon) / 30);
  const planetSign = Math.floor(norm(siderealLon) / 30);
  return ((planetSign - ascSign + 12) % 12) + 1;
}

// ---------------------------------------------------------------------------
// Vimshottari Dasha
// ---------------------------------------------------------------------------
const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};
const NAKSHATRA_LORD = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
];

export function calcVimshottariDasha(moonLon: number, birthDate: Date): Array<{lord: string; start_date: string; end_date: string; years: number}> {
  const nakshatraSpan = 360 / 27; // 13.333...°
  const nakshatraIdx = Math.floor(norm(moonLon) / nakshatraSpan);
  const elapsed = (norm(moonLon) % nakshatraSpan) / nakshatraSpan;

  const startLord = NAKSHATRA_LORD[nakshatraIdx];
  const startIdx = DASHA_ORDER.indexOf(startLord);

  const totalYearsConsumed = DASHA_YEARS[startLord] * elapsed;
  const remainingYearsInFirst = DASHA_YEARS[startLord] - totalYearsConsumed;

  // Start date of first dasha = birth date minus consumed years
  const firstDashaStart = new Date(birthDate);
  firstDashaStart.setFullYear(firstDashaStart.getFullYear() - Math.floor(totalYearsConsumed));
  firstDashaStart.setDate(firstDashaStart.getDate() - Math.round((totalYearsConsumed % 1) * 365.25));

  const periods = [];
  let cursor = new Date(birthDate);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = i === 0 ? remainingYearsInFirst : DASHA_YEARS[lord];
    const start = new Date(cursor);
    const end = new Date(cursor);
    const days = years * 365.25;
    end.setDate(end.getDate() + Math.round(days));

    periods.push({
      lord,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      years: Math.round(years * 10) / 10,
    });
    cursor = new Date(end);
  }
  return periods;
}

// ---------------------------------------------------------------------------
// Main calculation export
// ---------------------------------------------------------------------------
export interface KundliInput {
  name: string;
  year: number; month: number; day: number;
  hour: number; minute: number; second: number;
  latitude: number; longitude: number; timezone: number;
}

export function calculateKundli(input: KundliInput) {
  const jd = julianDay(input.year, input.month, input.day, input.hour, input.minute, input.second, input.timezone);
  const T = cent(jd);
  const ayanamsha = lahiriAyanamsha(jd);

  // Tropical longitudes
  const tropAsc    = calcAscendant(jd, input.latitude, input.longitude);
  const sunData    = sunLongitude(T);
  const tropSun    = sunData.lon;
  const tropMoon   = moonLongitude(T);
  const tropMars   = helioToGeo(marsHelio(T), sunData);
  const tropMerc   = helioToGeo(mercuryHelio(T), sunData);
  const tropJup    = helioToGeo(jupiterHelio(T), sunData);
  const tropVen    = helioToGeo(venusHelio(T), sunData);
  const tropSat    = helioToGeo(saturnHelio(T), sunData);
  const tropRahu   = rahuLongitude(T);

  // Sidereal (Vedic) longitudes
  const sid = (trop: number) => norm(trop - ayanamsha);

  const sidAsc  = sid(tropAsc);
  const sidSun  = sid(tropSun);
  const sidMoon = sid(tropMoon);
  const sidMars = sid(tropMars);
  const sidMerc = sid(tropMerc);
  const sidJup  = sid(tropJup);
  const sidVen  = sid(tropVen);
  const sidSat  = sid(tropSat);
  const sidRahu = sid(tropRahu);
  const sidKetu = norm(sidRahu + 180);

  const g = (lon: number) => getSign(lon);
  const n = (lon: number) => getNakshatra(lon);
  const h = (lon: number) => getHouse(lon, sidAsc);

  const makePlanet = (name: string, sidLon: number, retro: boolean) => {
    const { sign, degreeInSign } = g(sidLon);
    const { nakshatra, pada } = n(sidLon);
    return {
      name,
      sign,
      degree: sidLon,
      degree_in_sign: degreeInSign,
      retrograde: retro,
      nakshatra,
      nakshatra_pada: pada,
      house: h(sidLon),
    };
  };

  const getGeoMars = (t: number) => helioToGeo(marsHelio(t), sunLongitude(t));
  const getGeoMerc = (t: number) => helioToGeo(mercuryHelio(t), sunLongitude(t));
  const getGeoJup  = (t: number) => helioToGeo(jupiterHelio(t), sunLongitude(t));
  const getGeoVen  = (t: number) => helioToGeo(venusHelio(t), sunLongitude(t));
  const getGeoSat  = (t: number) => helioToGeo(saturnHelio(t), sunLongitude(t));

  const planets = [
    makePlanet('Sun',     sidSun,  false),
    makePlanet('Moon',    sidMoon, false),
    makePlanet('Mars',    sidMars, isRetrograde(jd, getGeoMars)),
    makePlanet('Mercury', sidMerc, isRetrograde(jd, getGeoMerc)),
    makePlanet('Jupiter', sidJup,  isRetrograde(jd, getGeoJup)),
    makePlanet('Venus',   sidVen,  isRetrograde(jd, getGeoVen)),
    makePlanet('Saturn',  sidSat,  isRetrograde(jd, getGeoSat)),
    makePlanet('Rahu',    sidRahu, true),  // Rahu always retrograde
    makePlanet('Ketu',    sidKetu, true),  // Ketu always retrograde
  ];

  const { sign: ascSign, degreeInSign: ascDeg } = g(sidAsc);

  const birthDate = new Date(input.year, input.month - 1, input.day);
  const dashas = calcVimshottariDasha(sidMoon, birthDate);

  return {
    ascendant_sign: ascSign,
    ascendant_degree: ascDeg,
    planets,
    dashas,
    ayanamsha: Math.round(ayanamsha * 1000) / 1000,
  };
}

// ---------------------------------------------------------------------------
// Divisional Chart Engine
// ---------------------------------------------------------------------------

export type PlanetData = ReturnType<typeof calculateKundli>['planets'][0];

/**
 * Get the divisional sign for any planet longitude.
 * Supports D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60
 */
export function getDivisionalSign(siderealLon: number, division: number): { sign: string; degreeInSign: number } {
  const normLon = norm(siderealLon);
  const signIdx = Math.floor(normLon / 30) % 12;
  const degInSign = normLon % 30;
  const partSize = 30 / division;
  const partNum = Math.floor(degInSign / partSize); // 0-based

  let startSign: number;

  if (division === 9) {
    // Navamsa: Movable->Aries(0), Fixed->Capricorn(9), Mutable->Libra(6)
    const mod = signIdx % 3;
    startSign = mod === 0 ? 0 : mod === 1 ? 9 : 6;
  } else if (division === 3) {
    // Drekkana: 0->same sign, 1->5th sign, 2->9th sign
    const offsets = [0, 4, 8];
    startSign = (signIdx + offsets[partNum]) % 12;
    return { sign: SIGNS[startSign], degreeInSign: degInSign % 10 };
  } else if (division === 10) {
    // Dasamsa: Odd signs start from same; Even signs start from 9th
    startSign = signIdx % 2 === 0 ? signIdx : (signIdx + 8) % 12;
  } else if (division === 12) {
    // Dwadasamsa: starts from same sign
    startSign = signIdx;
  } else if (division === 4) {
    // Chaturthamsa: Movable->Aries, Fixed->Cancer, Mutable->Libra, Scorpio/Capricorn->Capricorn
    const bases = [0, 3, 6, 9];
    startSign = bases[signIdx % 4];
  } else {
    // Generic: start from same sign
    startSign = signIdx;
  }

  const divSign = (startSign + partNum) % 12;
  return { sign: SIGNS[divSign], degreeInSign: partNum * partSize + (degInSign % partSize) };
}

/**
 * Convert a full birth chart into a divisional chart.
 * Recalculates each planet's sign and house in the given division.
 */
export function calculateDivisionalChart(
  birthChart: ReturnType<typeof calculateKundli>,
  division: number
) {
  // Recompute all planets in divisional sign
  // We keep the sidereal degree and recalculate the sign
  const divPlanets = birthChart.planets.map(p => {
    const { sign, degreeInSign } = getDivisionalSign(p.degree, division);
    return { ...p, sign, degree_in_sign: degreeInSign };
  });

  // Recalculate houses using divisional ascendant
  // Ascendant's divisional sign:
  // We need the raw sidereal longitude of the ascendant. 
  // Reconstruct: ascendant_sign index * 30 + ascendant_degree
  const ascSignIdx = SIGNS.indexOf(birthChart.ascendant_sign);
  const ascSidLon  = ascSignIdx * 30 + birthChart.ascendant_degree;
  const { sign: divAscSign } = getDivisionalSign(ascSidLon, division);
  const divAscIdx  = SIGNS.indexOf(divAscSign);

  const withHouses = divPlanets.map(p => {
    const pSignIdx  = SIGNS.indexOf(p.sign);
    const house = ((pSignIdx - divAscIdx + 12) % 12) + 1;
    return { ...p, house };
  });

  return {
    ascendant_sign: divAscSign,
    ascendant_degree: birthChart.ascendant_degree, // approximate
    planets: withHouses,
    division,
  };
}

// ---------------------------------------------------------------------------
// Transit (Gochor) Chart
// ---------------------------------------------------------------------------
export function calculateTransitChart(
  birthChart: ReturnType<typeof calculateKundli>,
  latitude: number,
  longitude: number,
  timezone: number
) {
  const now = new Date();
  const transitInput: KundliInput = {
    name: 'Transit',
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
    second: now.getUTCSeconds(),
    latitude,
    longitude,
    timezone: 0, // Using pure UTC
  };
  const transit = calculateKundli(transitInput);

  // Re-assign houses relative to birth chart ASCENDANT (not transit ascendant)
  // This is the traditional Gochor interpretation
  const ascSignIdx = SIGNS.indexOf(birthChart.ascendant_sign);
  const transitWithBirthHouses = transit.planets.map(p => {
    const pSignIdx = SIGNS.indexOf(p.sign);
    const house = ((pSignIdx - ascSignIdx + 12) % 12) + 1;
    return { ...p, house };
  });

  return {
    ...transit,
    planets: transitWithBirthHouses,
    transit_date: now.toLocaleString('en-IN'),
  };
}
