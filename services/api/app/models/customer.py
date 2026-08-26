from sqlalchemy import String, Date, Time
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TenantMixin

class Customer(TenantMixin, Base):
    __tablename__ = "customers"
    
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    
    # Birth Details
    dob: Mapped[str] = mapped_column(String, nullable=True)
    tob: Mapped[str] = mapped_column(String, nullable=True)
    birth_city: Mapped[str] = mapped_column(String, nullable=True)
    
    # Track syncing state if needed on the backend
    sync_status: Mapped[str] = mapped_column(String, default='SYNCED')
