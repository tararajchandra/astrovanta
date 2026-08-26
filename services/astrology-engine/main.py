from fastapi import FastAPI
from api.routes import router as astrology_router

app = FastAPI(
    title="Astrology Calculation Engine",
    description="Isolated calculation engine using Swiss Ephemeris",
    version="1.0.0"
)

app.include_router(astrology_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "astrology-engine"}
