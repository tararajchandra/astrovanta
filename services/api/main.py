from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.customers import router as customers_router
from app.api.appointments import router as appointments_router
from app.api.consultations import router as consultations_router
from app.api.reports import router as reports_router

app = FastAPI(
    title="AstroVanta API",
    description="Multi-Tenant Astrology Practice Management Platform",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(appointments_router)
app.include_router(consultations_router)
app.include_router(reports_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "api"}
