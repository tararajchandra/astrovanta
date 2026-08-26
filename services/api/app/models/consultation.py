from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TenantMixin

class Consultation(TenantMixin, Base):
    __tablename__ = "consultations"
    
    client_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    appointment_id: Mapped[str] = mapped_column(String, nullable=True)
    
    consultation_date: Mapped[str] = mapped_column(String, nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=True)
    
    private_notes: Mapped[str] = mapped_column(Text, nullable=True)
    recommendations: Mapped[str] = mapped_column(Text, nullable=True)
    
    sync_status: Mapped[str] = mapped_column(String, default='SYNCED')
