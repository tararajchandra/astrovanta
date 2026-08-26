from pydantic import BaseModel
from typing import Optional

class ConsultationBase(BaseModel):
    id: str
    client_id: str
    appointment_id: Optional[str] = None
    consultation_date: str
    topic: Optional[str] = None
    private_notes: Optional[str] = None
    recommendations: Optional[str] = None
    sync_status: Optional[str] = "SYNCED"

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationResponse(ConsultationBase):
    tenant_id: str
