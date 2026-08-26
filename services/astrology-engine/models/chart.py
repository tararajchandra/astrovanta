from pydantic import BaseModel
from typing import List, Optional

class BirthData(BaseModel):
    dob: str  # YYYY-MM-DD
    tob: str  # HH:MM:SS
    lat: float
    lon: float
    timezone: float
    ayanamsha: str = "lahiri"

class PlanetPosition(BaseModel):
    id: int
    name: str
    longitude: float
    sign: str
    sign_id: int
    degree_in_sign: float
    house: int
    nakshatra: str
    nakshatra_pada: int
    is_retrograde: bool

class HouseCusp(BaseModel):
    house: int
    longitude: float
    sign: str
    degree_in_sign: float

class ChartData(BaseModel):
    ascendant: float
    ascendant_sign: str
    ascendant_degree: float
    planets: List[PlanetPosition]
    houses: List[HouseCusp]

class DashaPeriod(BaseModel):
    planet: str
    start_date: str
    end_date: str
    antardashas: Optional[List['DashaPeriod']] = None
