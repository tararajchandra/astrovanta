from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TenantMixin

class Appointment(TenantMixin, Base):
    __tablename__ = "appointments"
    
    customer_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    start_time: Mapped[str] = mapped_column(String, nullable=False)
    end_time: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="PENDING")
    
    sync_status: Mapped[str] = mapped_column(String, default='SYNCED')
