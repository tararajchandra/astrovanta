from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentResponse, AppointmentCreate
from app.core.deps import get_current_tenant_id

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Appointment).where(Appointment.tenant_id == tenant_id))
    return result.scalars().all()

@router.post("/sync", response_model=AppointmentResponse)
async def sync_appointment(
    appt_in: AppointmentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appt_in.id, Appointment.tenant_id == tenant_id)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        for key, value in appt_in.dict(exclude={"id"}).items():
            setattr(existing, key, value)
        existing.sync_status = "SYNCED"
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_appt = Appointment(**appt_in.dict(), tenant_id=tenant_id)
        new_appt.sync_status = "SYNCED"
        db.add(new_appt)
        await db.commit()
        await db.refresh(new_appt)
        return new_appt
