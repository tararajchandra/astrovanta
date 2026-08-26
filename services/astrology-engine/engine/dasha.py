from datetime import datetime, timedelta
from typing import List
from ..models.chart import DashaPeriod, BirthData
from .kundli import calculate_kundli

# Vimshottari sequence and duration in years
DASHA_SEQUENCE = [
    ("Ketu", 7),
    ("Venus", 20),
    ("Sun", 6),
    ("Moon", 10),
    ("Mars", 7),
    ("Rahu", 18),
    ("Jupiter", 16),
    ("Saturn", 19),
    ("Mercury", 17)
]

def calculate_vimshottari_dasha(birth_data: BirthData) -> List[DashaPeriod]:
    chart = calculate_kundli(birth_data)
    
    # Find Moon's longitude
    moon_lon = 0
    for p in chart.planets:
        if p.id == 1:
            moon_lon = p.longitude
            break
            
    # Calculate Nakshatra index and remaining percentage
    nak_val = moon_lon / (360 / 27)
    nak_index = int(nak_val)
    nak_progress = nak_val - nak_index
    
    # Which Lord?
    lord_index = nak_index % 9
    current_lord, total_years = DASHA_SEQUENCE[lord_index]
    
    # Years passed in current dasha
    years_passed = nak_progress * total_years
    years_remaining = total_years - years_passed
    
    dt_str = f"{birth_data.dob} {birth_data.tob}"
    birth_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    
    periods = []
    current_dt = birth_dt
    
    # Add first (partial) dasha
    end_dt = current_dt + timedelta(days=years_remaining * 365.2425)
    periods.append(DashaPeriod(
        planet=current_lord,
        start_date=current_dt.strftime("%Y-%m-%d"),
        end_date=end_dt.strftime("%Y-%m-%d")
    ))
    current_dt = end_dt
    
    # Add subsequent dashas for one full cycle (120 years minus first)
    for i in range(1, 9):
        idx = (lord_index + i) % 9
        lord, years = DASHA_SEQUENCE[idx]
        
        end_dt = current_dt + timedelta(days=years * 365.2425)
        periods.append(DashaPeriod(
            planet=lord,
            start_date=current_dt.strftime("%Y-%m-%d"),
            end_date=end_dt.strftime("%Y-%m-%d")
        ))
        current_dt = end_dt
        
    # (Advanced: Calculate Antardasha by proportionally splitting the Mahadasha)
    # We will keep it to Mahadasha for the initial Phase 3 scaffold, and expand later.
    
    return periods
