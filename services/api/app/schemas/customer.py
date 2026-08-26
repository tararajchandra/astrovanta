from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    id: str
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    tob: Optional[str] = None
    birth_city: Optional[str] = None
    sync_status: Optional[str] = "SYNCED"

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    tenant_id: str
