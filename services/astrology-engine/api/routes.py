from fastapi import APIRouter, HTTPException
from models.chart import BirthData, ChartData, DashaPeriod
from engine.kundli import calculate_kundli
from engine.dasha import calculate_vimshottari_dasha
from typing import List

router = APIRouter(prefix="/api/v1/astrology", tags=["Astrology"])

@router.post("/kundli", response_model=ChartData)
def get_kundli(data: BirthData):
    try:
        chart = calculate_kundli(data)
        return chart
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dasha", response_model=List[DashaPeriod])
def get_dasha(data: BirthData):
    try:
        periods = calculate_vimshottari_dasha(data)
        return periods
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transit", response_model=ChartData)
def get_transit(data: BirthData):
    # A transit chart is effectively a natal chart cast for the "current time" 
    # at the specified location.
    try:
        chart = calculate_kundli(data)
        return chart
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
