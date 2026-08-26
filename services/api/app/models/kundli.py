from sqlalchemy import String, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TenantMixin

class SavedKundli(TenantMixin, Base):
    __tablename__ = "saved_kundlis"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    dob: Mapped[str] = mapped_column(String, nullable=False)
    tob: Mapped[str] = mapped_column(String, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    timezone: Mapped[float] = mapped_column(Float, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=True)
