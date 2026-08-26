import swisseph as swe
from datetime import datetime, timezone, timedelta

# Constants mapping
ZODIAC_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
              "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
              "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]

PLANET_MAPPING = {
    0: "Sun",
    1: "Moon",
    2: "Mercury",
    3: "Venus",
    4: "Mars",
    5: "Jupiter",
    6: "Saturn",
    10: "Rahu",  # True Node (or Mean Node 11)
    # Ketu is calculated exactly 180 degrees from Rahu
}

def set_ayanamsha(ayanamsha_name: str):
    if ayanamsha_name.lower() == "lahiri":
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    elif ayanamsha_name.lower() == "raman":
        swe.set_sid_mode(swe.SIDM_RAMAN)
    else:
        swe.set_sid_mode(swe.SIDM_LAHIRI)

def get_julian_day(dob: str, tob: str, tz_offset: float) -> float:
    # dob: YYYY-MM-DD, tob: HH:MM:SS
    dt_str = f"{dob} {tob}"
    dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    # subtract tz offset to get UTC
    utc_dt = dt - timedelta(hours=tz_offset)
    
    # swe.utc_to_jd returns (jd_et, jd_ut)
    res = swe.utc_to_jd(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour, utc_dt.minute, utc_dt.second + utc_dt.microsecond / 1e6)
    return res[1]

def get_planet_positions(jd: float) -> dict:
    positions = {}
    flag = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    
    for p_id, p_name in PLANET_MAPPING.items():
        res, ret_flag = swe.calc_ut(jd, p_id, flag)
        longitude = res[0]
        speed = res[3]
        
        # Calculate sign and degree
        sign_id = int(longitude / 30)
        degree_in_sign = longitude % 30
        
        # Calculate Nakshatra (each is 13deg 20min = 13.3333 deg)
        nak_val = longitude / (360 / 27)
        nak_id = int(nak_val)
        nak_pada = int((nak_val - nak_id) * 4) + 1
        
        positions[p_id] = {
            "name": p_name,
            "longitude": longitude,
            "sign": ZODIAC_SIGNS[sign_id],
            "sign_id": sign_id,
            "degree_in_sign": degree_in_sign,
            "is_retrograde": speed < 0 if p_id != 10 else True, # Rahu is always retrograde nominally
            "nakshatra": NAKSHATRAS[nak_id],
            "nakshatra_pada": nak_pada
        }
        
    # Calculate Ketu
    rahu_lon = positions[10]["longitude"]
    ketu_lon = (rahu_lon + 180) % 360
    k_sign_id = int(ketu_lon / 30)
    k_nak_val = ketu_lon / (360 / 27)
    k_nak_id = int(k_nak_val)
    k_nak_pada = int((k_nak_val - k_nak_id) * 4) + 1
    
    positions[11] = {
        "name": "Ketu",
        "longitude": ketu_lon,
        "sign": ZODIAC_SIGNS[k_sign_id],
        "sign_id": k_sign_id,
        "degree_in_sign": ketu_lon % 30,
        "is_retrograde": True,
        "nakshatra": NAKSHATRAS[k_nak_id],
        "nakshatra_pada": k_nak_pada
    }
    
    return positions

def get_houses_and_ascendant(jd: float, lat: float, lon: float) -> tuple:
    # For Vedic, usually whole sign is used for basic Kundli, but we can calculate Placidus or similar 
    # to find the exact degree of Ascendant.
    # 'P' for Placidus, 'W' for Whole Sign
    res = swe.houses_ex(jd, lat, lon, b'P'.decode('utf-8'), swe.FLG_SIDEREAL)
    cusps = res[0] # array of 12 house cusps (1-indexed theoretically, but swisseph returns 13 elements where index 0 is unused or ASC)
    ascendant = res[1][0] # Ascendant
    
    asc_sign_id = int(ascendant / 30)
    
    houses = []
    # Convert Placidus to simple 12 houses or return the raw cusps. 
    # For standard Kundli, House 1 = Ascendant Sign.
    for i in range(1, 13):
        # We will do simple whole sign for house calculation relative to lagna, 
        # but return actual cusps for advanced mapping
        h_lon = cusps[i]
        h_sign_id = int(h_lon / 30)
        houses.append({
            "house": i,
            "longitude": h_lon,
            "sign": ZODIAC_SIGNS[h_sign_id],
            "degree_in_sign": h_lon % 30
        })
        
    return ascendant, ZODIAC_SIGNS[asc_sign_id], ascendant % 30, houses
