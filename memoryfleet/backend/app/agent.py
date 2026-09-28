import json
from typing import List, Dict
from .demo_data import HISTORICAL_TRIPS
from .memory import memory


def demo_recall(trip) -> List[Dict]:
    q = f"{trip.origin} {trip.destination} {trip.cargo} route vehicle delay breakdown compliance"
    terms = set(q.lower().split())
    scored = []
    for item in HISTORICAL_TRIPS:
        text = json.dumps(item).lower()
        score = sum(1 for t in terms if len(t) > 3 and t in text)
        scored.append((score, item))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {"id": x[1]["trip_id"], "text": f"{x[1]['trip_id']}: {x[1]['route']} / {x[1]['vehicle']} — {x[1]['outcome']}; delay {x[1]['delay']} min; incident: {x[1]['incident']}. {x[1]['notes']}", "type": "experience", "context": "historical trip"}
        for x in scored[:5]
    ]


def recommend(trip):
    memories = memory.recall(f"Historical fleet experience for {trip.origin} to {trip.destination}; {trip.cargo}; route reliability; vehicle incidents; delays; compliance")
    if not memories:
        memories = demo_recall(trip)

    # Demo decision engine: transparent rules based on historical outcomes.
    route_stats = {}
    vehicle_stats = {}
    for item in HISTORICAL_TRIPS:
        route_stats.setdefault(item["route"], []).append(item)
        vehicle_stats.setdefault(item["vehicle"], []).append(item)

    route_scores = {}
    for route, rows in route_stats.items():
        avg_delay = sum(r["delay"] for r in rows) / len(rows)
        incident_count = sum(r["outcome"] == "Incident" for r in rows)
        route_scores[route] = avg_delay + incident_count * 20

    route = min(route_scores, key=route_scores.get)
    vehicle_scores = {}
    for vehicle, rows in vehicle_stats.items():
        avg_delay = sum(r["delay"] for r in rows) / len(rows)
        incidents = sum(r["outcome"] == "Incident" for r in rows)
        vehicle_scores[vehicle] = avg_delay + incidents * 35
    vehicle = min(vehicle_scores, key=vehicle_scores.get)

    risks = []
    if vehicle == "V-07":
        risks.append("Repeated thermal incidents recorded for V-07")
    if route == "Route A":
        risks.append("Route A has repeated delay history on this corridor")
    risks.append("Recommendation should be re-evaluated if the delivery window changes")

    avg_delay = round(route_scores[route])
    confidence = max(72, min(96, 94 - avg_delay // 3))
    rationale = (
        f"Historical fleet memory favors {route} with {vehicle}. Similar trips show lower delay exposure "
        f"than the alternatives, while previous incidents make higher-risk vehicle/route combinations less desirable."
    )
    learning_note = (
        "The next trip can change this recommendation because its outcome will be retained as a new experience."
    )

    return {
        "vehicle": vehicle,
        "route": route,
        "confidence": confidence,
        "risk_level": "LOW" if avg_delay < 10 else "MEDIUM" if avg_delay < 25 else "HIGH",
        "estimated_delay": avg_delay,
        "rationale": rationale,
        "risks": risks,
        "memories": memories,
        "learning_note": learning_note,
    }
