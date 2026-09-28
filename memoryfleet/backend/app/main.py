from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import TripRequest, TripOutcome
from .agent import recommend
from .memory import memory
from .demo_data import HISTORICAL_TRIPS

app = FastAPI(title="MemoryFleet API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "memory": "hindsight" if memory.enabled else "demo"}

@app.get("/api/trips")
def trips():
    return HISTORICAL_TRIPS

@app.post("/api/recommend")
def get_recommendation(trip: TripRequest):
    return recommend(trip)

@app.post("/api/outcome")
def record_outcome(outcome: TripOutcome):
    content = (
        f"Fleet trip {outcome.trip_id} completed with outcome '{outcome.outcome}'. "
        f"Actual delay: {outcome.actual_delay_minutes} minutes. Fuel used: {outcome.fuel_used_liters} liters. "
        f"Operator notes: {outcome.notes}"
    )
    result = memory.retain(content, context="fleet trip outcome")
    return {"ok": True, **result}
