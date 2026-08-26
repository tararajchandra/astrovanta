from pydantic import BaseModel
from typing import Optional

class AppointmentBase(BaseModel):
    id: str
    customer_id: str
    start_time: str
    end_time: str
    status: Optional[str] = "PENDING"
    sync_status: Optional[str] = "SYNCED"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    tenant_id: str
