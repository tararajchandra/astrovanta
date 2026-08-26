from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from ..core.pdf_engine import generate_pdf_report

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

class PlanetPayload(BaseModel):
    name: str
    sign: str
    degree_in_sign: float
    nakshatra: str
    nakshatra_pada: int

class ReportRequest(BaseModel):
    astrologer_name: str
    client_name: str
    dob: str
    tob: str
    city: str
    recommendations: str
    planets: List[PlanetPayload]

@router.post("/generate")
def generate_report(req: ReportRequest):
    try:
        pdf_bytes = generate_pdf_report(req.model_dump())
        
        # In production, we would upload `pdf_bytes` to Supabase Storage here
        # and return the signed URL. For Phase 4, we simulate success.
        
        return {
            "status": "success",
            "message": "PDF generated successfully",
            "file_size_bytes": len(pdf_bytes),
            "url": "https://storage.supabase.co/fake_url/report.pdf" 
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
