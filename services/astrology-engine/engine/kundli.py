from .ephemeris import set_ayanamsha, get_julian_day, get_planet_positions, get_houses_and_ascendant
from ..models.chart import ChartData, PlanetPosition, HouseCusp, BirthData

def calculate_kundli(birth_data: BirthData) -> ChartData:
    set_ayanamsha(birth_data.ayanamsha)
    
    jd = get_julian_day(birth_data.dob, birth_data.tob, birth_data.timezone)
    
    positions = get_planet_positions(jd)
    asc_lon, asc_sign, asc_deg, house_cusps = get_houses_and_ascendant(jd, birth_data.lat, birth_data.lon)
    
    # Calculate Whole Sign houses relative to Ascendant
    asc_sign_id = int(asc_lon / 30)
    
    planets = []
    for pid, pdata in positions.items():
        # Determine house (1 to 12) based on Whole Sign distance from Ascendant sign
        p_sign_id = pdata["sign_id"]
        house = ((p_sign_id - asc_sign_id) % 12) + 1
        
        planets.append(PlanetPosition(
            id=pid,
            name=pdata["name"],
            longitude=pdata["longitude"],
            sign=pdata["sign"],
            sign_id=pdata["sign_id"],
            degree_in_sign=pdata["degree_in_sign"],
            house=house,
            nakshatra=pdata["nakshatra"],
            nakshatra_pada=pdata["nakshatra_pada"],
            is_retrograde=pdata["is_retrograde"]
        ))
        
    houses = []
    for hc in house_cusps:
        houses.append(HouseCusp(
            house=hc["house"],
            longitude=hc["longitude"],
            sign=hc["sign"],
            degree_in_sign=hc["degree_in_sign"]
        ))
        
    return ChartData(
        ascendant=asc_lon,
        ascendant_sign=asc_sign,
        ascendant_degree=asc_deg,
        planets=planets,
        houses=houses
    )
