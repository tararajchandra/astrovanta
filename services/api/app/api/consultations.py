from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.models.consultation import Consultation
from app.schemas.consultation import ConsultationResponse, ConsultationCreate
from app.core.deps import get_current_tenant_id

router = APIRouter(prefix="/consultations", tags=["consultations"])

@router.get("/", response_model=List[ConsultationResponse])
async def get_consultations(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Consultation).where(Consultation.tenant_id == tenant_id))
    return result.scalars().all()

@router.post("/sync", response_model=ConsultationResponse)
async def sync_consultation(
    cons_in: ConsultationCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Consultation).where(Consultation.id == cons_in.id, Consultation.tenant_id == tenant_id)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        for key, value in cons_in.dict(exclude={"id"}).items():
            setattr(existing, key, value)
        existing.sync_status = "SYNCED"
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_cons = Consultation(**cons_in.dict(), tenant_id=tenant_id)
        new_cons.sync_status = "SYNCED"
        db.add(new_cons)
        await db.commit()
        await db.refresh(new_cons)
        return new_cons
