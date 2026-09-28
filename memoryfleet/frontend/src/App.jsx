import { useEffect, useState } from 'react';
import { Activity, Brain, ChevronRight, Clock3, Gauge, MapPinned, Route, ShieldCheck, Sparkles, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const API = 'http://localhost:8000/api';

const initialTrip = { origin: 'Chennai', destination: 'Bengaluru', delivery_deadline: '2026-09-29 14:00', cargo: 'Electronics — 420 kg', preferred_vehicle: '' };

function Stat({ icon: Icon, label, value, sub }) {
  return <div className="stat"><div className="stat-icon"><Icon size={18}/></div><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div></div>
}

function App(){
  const [trip, setTrip] = useState(initialTrip);
  const [recommendation, setRecommendation] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState('checking');
  const [outcomeSaved, setOutcomeSaved] = useState(false);

  useEffect(()=>{
    fetch(`${API}/health`).then(r=>r.json()).then(x=>setHealth(x.memory)).catch(()=>setHealth('offline'));
    fetch(`${API}/trips`).then(r=>r.json()).then(setTrips).catch(()=>{});
  },[]);

  async function analyze(e){
    e.preventDefault(); setLoading(true); setOutcomeSaved(false);
    try { const r=await fetch(`${API}/recommend`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(trip)}); setRecommendation(await r.json()); }
    finally { setLoading(false); }
  }

  async function saveOutcome(){
    if(!recommendation) return;
    await fetch(`${API}/outcome`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trip_id:`DEMO-${Date.now()}`, outcome:'On time', notes:`Recommended ${recommendation.route} with ${recommendation.vehicle}. Demo outcome confirmed by operator.`, actual_delay_minutes:4, fuel_used_liters:76})});
    setOutcomeSaved(true);
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Brain size={20}/></div><div><div className="brand-name">MEMORY<span>FLEET</span></div><div className="brand-tag">Operational intelligence that remembers</div></div></div>
      <div className="top-actions"><div className="memory-status"><span className={`pulse ${health==='hindsight'?'live':''}`}></span>{health==='hindsight'?'Hindsight memory live':health==='demo'?'Demo memory':'Backend '+health}</div><button className="ghost"><Activity size={16}/> Live Operations</button></div>
    </header>

    <main>
      <section className="hero"><div><div className="eyebrow"><Sparkles size={14}/> MEMORY-POWERED FLEET DECISIONS</div><h1>Your fleet remembers<br/><span>what happened last time.</span></h1><p>Turn historical trips, incidents and outcomes into better decisions for the next journey.</p></div><div className="hero-orb"><Brain size={76}/><div className="orbit o1"></div><div className="orbit o2"></div></div></section>

      <section className="stats-grid">
        <Stat icon={Truck} label="Fleet monitored" value="42 vehicles" sub="8 active routes"/>
        <Stat icon={Brain} label="Operational memories" value={health==='hindsight'?'LIVE':'248'} sub={health==='hindsight'?'Synced with Hindsight':'Demo memory bank'}/>
        <Stat icon={ShieldCheck} label="Risk signals" value="12" sub="3 need attention"/>
        <Stat icon={Gauge} label="Decision confidence" value={recommendation?`${recommendation.confidence}%`:'94%'} sub="Historical evidence"/>
      </section>

      <div className="workspace">
        <section className="panel trip-panel">
          <div className="panel-head"><div><div className="panel-kicker">01 / NEW DECISION</div><h2>Plan a trip</h2></div><div className="step-dot">A</div></div>
          <form onSubmit={analyze}>
            <div className="field-row"><label>Origin<input value={trip.origin} onChange={e=>setTrip({...trip,origin:e.target.value})}/></label><label>Destination<input value={trip.destination} onChange={e=>setTrip({...trip,destination:e.target.value})}/></label></div>
            <label>Cargo<input value={trip.cargo} onChange={e=>setTrip({...trip,cargo:e.target.value})}/></label>
            <div className="field-row"><label>Delivery deadline<input value={trip.delivery_deadline} onChange={e=>setTrip({...trip,delivery_deadline:e.target.value})}/></label><label>Preferred vehicle<input placeholder="Any vehicle" value={trip.preferred_vehicle} onChange={e=>setTrip({...trip,preferred_vehicle:e.target.value})}/></label></div>
            <button className="primary" disabled={loading}>{loading?'Consulting fleet memory…':<>Ask MemoryFleet <ChevronRight size={17}/></>}</button>
          </form>
          <div className="memory-strip"><Brain size={16}/><span><b>Memory first.</b> Before deciding, the agent searches previous trips, failures and successful decisions.</span></div>
        </section>

        <section className="panel decision-panel">
          <div className="panel-head"><div><div className="panel-kicker">02 / AI DECISION</div><h2>Recommended plan</h2></div><div className={`risk-pill ${recommendation?.risk_level?.toLowerCase()||'pending'}`}>{recommendation?.risk_level||'AWAITING'}</div></div>
          {!recommendation ? <div className="empty"><div className="empty-icon"><Route size={28}/></div><h3>Ask the fleet memory</h3><p>Enter a trip and MemoryFleet will retrieve relevant operational experience before making a recommendation.</p></div> : <>
            <div className="recommendation"><div className="rec-main"><div className="rec-label">RECOMMENDED ROUTE</div><div className="rec-route"><MapPinned size={22}/>{recommendation.route}</div><div className="rec-meta"><span><Truck size={14}/> {recommendation.vehicle}</span><span><Clock3 size={14}/> ~{recommendation.estimated_delay} min historical delay</span></div></div><div className="confidence"><div>{recommendation.confidence}%</div><span>confidence</span></div></div>
            <div className="rationale"><Sparkles size={16}/><div><b>Why this decision?</b><p>{recommendation.rationale}</p></div></div>
            <div className="risk-list"><div className="section-title">Risk signals</div>{recommendation.risks.map((r,i)=><div className="risk-row" key={i}><AlertTriangle size={15}/>{r}</div>)}</div>
            <button className={`success-btn ${outcomeSaved?'saved':''}`} onClick={saveOutcome}>{outcomeSaved?<><CheckCircle2 size={16}/> Outcome stored in memory</>:<>✓ Confirm outcome & teach MemoryFleet</>}</button>
          </>}
        </section>
      </div>

      {recommendation && <section className="panel memories-panel"><div className="panel-head"><div><div className="panel-kicker">03 / MEMORY TRACE</div><h2>What did it remember?</h2></div><div className="memory-count"><Brain size={15}/> {recommendation.memories.length} memories recalled</div></div><div className="memory-grid">{recommendation.memories.map((m,i)=><div className="memory-card" key={i}><div className="memory-top"><span className="memory-type">{m.type}</span><span className="memory-id">{m.id}</span></div><p>{m.text}</p><div className="memory-context">{m.context}</div></div>)}</div><div className="learning-banner"><div className="learning-icon"><Brain size={18}/></div><div><b>Learning loop</b><span>{recommendation.learning_note}</span></div><div className="loop">RECALL → DECIDE → OUTCOME → RETAIN → <b>RECALL</b></div></div></section>}

      <section className="history-section"><div className="section-heading"><div><div className="panel-kicker">HISTORICAL OPERATIONS</div><h2>Recent fleet experience</h2></div><span>{trips.length} trips in demo history</span></div><div className="table-wrap"><table><thead><tr><th>Trip</th><th>Route</th><th>Vehicle</th><th>Outcome</th><th>Delay</th><th>Incident</th></tr></thead><tbody>{trips.slice(0,6).map(t=><tr key={t.trip_id}><td className="mono">{t.trip_id}</td><td>{t.route}</td><td>{t.vehicle}</td><td><span className={`outcome ${t.outcome.toLowerCase()}`}>{t.outcome}</span></td><td>{t.delay} min</td><td>{t.incident}</td></tr>)}</tbody></table></div></section>
    </main>
    <footer><div>MEMORYFLEET <span>•</span> AI Fleet Operations</div><div>Built around persistent operational memory</div></footer>
  </div>
}
export default App;
