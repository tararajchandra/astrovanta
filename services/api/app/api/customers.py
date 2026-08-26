from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerResponse, CustomerCreate
from app.core.deps import get_current_tenant_id

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Customer).where(Customer.tenant_id == tenant_id))
    return result.scalars().all()

@router.post("/sync", response_model=CustomerResponse)
async def sync_customer(
    customer_in: CustomerCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    # Upsert logic based on ID
    result = await db.execute(
        select(Customer).where(Customer.id == customer_in.id, Customer.tenant_id == tenant_id)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        for key, value in customer_in.dict(exclude={"id"}).items():
            setattr(existing, key, value)
        existing.sync_status = "SYNCED"
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_customer = Customer(**customer_in.dict(), tenant_id=tenant_id)
        new_customer.sync_status = "SYNCED"
        db.add(new_customer)
        await db.commit()
        await db.refresh(new_customer)
        return new_customer
