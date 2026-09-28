# MemoryFleet

AI Fleet Operations Agent powered by Hindsight memory.

## Core idea
MemoryFleet learns from historical fleet trips, incidents, delays, compliance events, and successful decisions. For a new trip, it recalls relevant operational experience and uses it to produce a risk-aware recommendation. After the trip, the outcome is retained as new memory.

## Stack
- Frontend: React + Vite + Lucide React
- Backend: FastAPI + Python
- Memory: Hindsight Cloud / local Hindsight
- LLM: Groq-compatible API (optional in demo mode)

## Project structure
```
memoryfleet/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── memory.py
│   │   ├── agent.py
│   │   └── demo_data.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── index.html
├── data/
├── .env.example
└── README.md
```

## 1. Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```
Copy `.env.example` to `.env` and add Hindsight credentials when ready.

Run:
```powershell
uvicorn app.main:app --reload --port 8000
```

## 2. Frontend
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal.

## Hindsight
Current Hindsight Python client uses `retain()` to store memories and `recall()` to retrieve relevant memories. The app uses one memory bank named `memoryfleet-demo`. See the official docs before production deployment.

## Demo mode
If Hindsight credentials are missing, MemoryFleet uses the included realistic historical trip dataset. This is only for development/demo UI; the hackathon demo should be switched to real Hindsight memory before submission.
