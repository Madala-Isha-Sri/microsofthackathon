from pydantic import BaseModel, Field
from typing import List, Optional

class TripRequest(BaseModel):
    origin: str
    destination: str
    delivery_deadline: str
    cargo: str
    preferred_vehicle: Optional[str] = None
    route_options: List[str] = Field(default_factory=lambda: ["Route A", "Route B", "Route C"])

class TripOutcome(BaseModel):
    trip_id: str
    outcome: str
    notes: str = ""
    actual_delay_minutes: int = 0
    fuel_used_liters: float = 0

class Recommendation(BaseModel):
    vehicle: str
    route: str
    confidence: int
    risk_level: str
    estimated_delay: int
    rationale: str
    risks: List[str]
    memories: List[dict]
    learning_note: str
