import { useState } from "react";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const CHAPTERS = {
  Physics: ["Mechanics", "Thermodynamics", "Electrostatics", "Magnetism", "Optics", "Modern Physics", "Waves", "Current Electricity"],
  Chemistry: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Electrochemistry", "Chemical Kinetics", "Equilibrium", "Coordination Compounds", "Biomolecules"],
  Mathematics: ["Calculus", "Algebra", "Coordinate Geometry", "Trigonometry", "Vectors & 3D", "Probability", "Matrices", "Sequences & Series"],
};
const DIFFICULTY = ["Easy", "Medium", "Hard"];
const ERROR_TYPES = ["", "Conceptual", "Calculation", "Silly Mistake", "Time Pressure", "Didn't Attempt"];

const COLORS = {
  Physics:     { accent: "#e94560", light: "#1a0d14", border: "#3a1525" },
  Chemistry:   { accent: "#16c79a", light: "#0d1a18", border: "#1a3830" },
  Mathematics: { accent: "#f5a623", light: "#1a160a", border: "#3a2c10" },
};

const EXAMPLE_TEST = {
  id: 1000,
  name: "Allen Major Test — Example",
  date: "04/05/2025",
  rows: [
    { id:1,  subject:"Physics",     chapter:"Mechanics",          difficulty:"Hard",   totalQ:"8",  attempted:"7",  correct:"4",  incorrect:"3",  errorType:"Conceptual",     timeSpent:"25", notes:"NLM & rotational confused" },
    { id:2,  subject:"Physics",     chapter:"Electrostatics",     difficulty:"Medium", totalQ:"7",  attempted:"6",  correct:"5",  incorrect:"1",  errorType:"Silly Mistake",  timeSpent:"18", notes:"Sign error in last step" },
    { id:3,  subject:"Physics",     chapter:"Modern Physics",     difficulty:"Easy",   totalQ:"5",  attempted:"5",  correct:"2",  incorrect:"2",  errorType:"Conceptual",     timeSpent:"15", notes:"Photoelectric effect weak" },
    { id:4,  subject:"Chemistry",   chapter:"Organic Chemistry",  difficulty:"Hard",   totalQ:"9",  attempted:"7",  correct:"3",  incorrect:"4",  errorType:"Conceptual",     timeSpent:"28", notes:"Named reactions not clear" },
    { id:5,  subject:"Chemistry",   chapter:"Equilibrium",        difficulty:"Medium", totalQ:"6",  attempted:"6",  correct:"5",  incorrect:"1",  errorType:"Calculation",    timeSpent:"16", notes:"Le Chatelier ok, Kp/Kc formula" },
    { id:6,  subject:"Chemistry",   chapter:"Electrochemistry",   difficulty:"Medium", totalQ:"5",  attempted:"3",  correct:"1",  incorrect:"2",  errorType:"Didn't Attempt", timeSpent:"10", notes:"Nernst equation skipped" },
    { id:7,  subject:"Mathematics", chapter:"Calculus",           difficulty:"Hard",   totalQ:"10", attempted:"9",  correct:"6",  incorrect:"3",  errorType:"Calculation",    timeSpent:"30", notes:"Integration by parts mistakes" },
    { id:8,  subject:"Mathematics", chapter:"Algebra",            difficulty:"Medium", totalQ:"8",  attempted:"8",  correct:"7",  incorrect:"1",  errorType:"Silly Mistake",  timeSpent:"20", notes:"One quadratic sign error" },
    { id:9,  subject:"Mathematics", chapter:"Coordinate Geometry",difficulty:"Easy",   totalQ:"7",  attempted:"5",  correct:"3",  incorrect:"2",  errorType:"Time Pressure",  timeSpent:"12", notes:"Ran out of time last 2 Qs" },
  ],
};

const newRow = () => ({ id: Date.now() + Math.random(), subject:"Physics", chapter:"", difficulty:"Medium", totalQ:"", attempted:"", correct:"", incorrect:"", errorType:"", timeSpent:"", notes:"" });

const pctColor = (p) => p < 35 ? "#e94560" : p < 55 ? "#f5a623" : p < 75 ? "#facc15" : "#16c79a";

export default function JEEAnalysis() {
  const [tests, setTests]             = useState([EXAMPLE_TEST]);
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [selectedTest, setSelectedTest] = useState(EXAMPLE_TEST.id);
  const [testName, setTestName]       = useState("");
  const [testDate, setTestDate]       = useState("");
  const [rows, setRows]               = useState([newRow()]);
  const [expandedRow, setExpandedRow] = useState(null);

  const addRow    = () => { const r = newRow(); setRows(p=>[...p,r]); setExpandedRow(r.id); };
  const removeRow = (id) => setRows(p=>p.filter(r=>r.id!==id));
  const updateRow = (id,f,v) => setRows(p=>p.map(r=>r.id===id?{...r,[f]:v}:r));

  const saveTest = () => {
    if (!testName.trim()) { alert("Enter a test name first."); return; }
    const t = { id:Date.now(), name:testName, date:testDate||new Date().toLocaleDateString("en-IN"), rows:rows.map(r=>({...r})) };
    setTests(p=>[...p,t]); setSelectedTest(t.id);
    setTestName(""); setTestDate(""); setRows([newRow()]); setExpandedRow(null);
    setActiveTab("dashboard");
  };

  const getStats = (rows) => {
    const s = {};
    SUBJECTS.forEach(sub => {
      const sr = rows.filter(r=>r.subject===sub && r.totalQ);
      if (!sr.length) return;
      const total     = sr.reduce((a,r)=>a+(+r.totalQ||0),0);
      const attempted = sr.reduce((a,r)=>a+(+r.attempted||0),0);
      const correct   = sr.reduce((a,r)=>a+(+r.correct||0),0);
      const incorrect = sr.reduce((a,r)=>a+(+r.incorrect||0),0);
      const score     = correct*4 - incorrect;
      const maxScore  = total*4;
      s[sub] = { total, attempted, correct, incorrect, score, maxScore, pct: maxScore ? Math.max(0,Math.round((score/maxScore)*100)) : 0 };
    });
    return s;
  };

  const getWeakChapters = (rows) => {
    const map = {};
    rows.forEach(r => {
      if (!r.chapter||!r.totalQ) return;
      const k = `${r.subject}|${r.chapter}`;
      if (!map[k]) map[k] = { subject:r.subject, chapter:r.chapter, correct:0, total:0, errors:[] };
      map[k].correct += +r.correct||0;
      map[k].total   += +r.totalQ||0;
      if (r.errorType) map[k].errors.push(r.errorType);
    });
    return Object.values(map).sort((a,b)=>(a.correct/a.total)-(b.correct/b.total));
  };

  const getErrors = (rows) => {
    const m = {};
    rows.forEach(r=>{ if(r.errorType) m[r.errorType]=(m[r.errorType]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  };

  const currentTest = tests.find(t=>t.id===selectedTest);

  /* ── shared styles ── */
  const inp = { background:"#080d18", border:"1px solid #1e3050", color:"#c8d8e8", borderRadius:"8px", padding:"9px 12px", fontSize:"13px", fontFamily:"monospace", outline:"none", width:"100%", boxSizing:"border-box" };

  const RadialScore = ({ pct, subject, score, maxScore }) => {
    const c=COLORS[subject], r=36, cx=46, cy=46, circ=2*Math.PI*r;
    const offset = circ - Math.max(0,pct)/100*circ;
    return (
      <div style={{ textAlign:"center" }}>
        <svg width="92" height="92" viewBox="0 0 92 92">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2a3a" strokeWidth="7"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.accent} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transform:"rotate(-90deg)", transformOrigin:"46px 46px", transition:"stroke-dashoffset 1s ease" }}/>
          <text x={cx} y={cy-1} textAnchor="middle" fill={c.accent} fontSize="13" fontWeight="bold" fontFamily="monospace">{pct}%</text>
          <text x={cx} y={cy+13} textAnchor="middle" fill="#4a6080" fontSize="8" fontFamily="monospace">{score}/{maxScore}</text>
        </svg>
        <div style={{ color:c.accent, fontSize:"9px", fontWeight:"bold", letterSpacing:"0.1em" }}>{subject.slice(0,4).toUpperCase()}</div>
      </div>
    );
  };

  const Bar = ({ label, value, max, color }) => (
    <div style={{ marginBottom:"9px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", color:"#4a6080", marginBottom:"4px" }}>
        <span>{label}</span><span style={{ color }}>{value}/{max}</span>
      </div>
      <div style={{ height:"5px", background:"#1a2535", borderRadius:"3px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${max?(value/max)*100:0}%`, background:color, borderRadius:"3px", transition:"width 0.9s ease" }}/>
      </div>
    </div>
  );

  const tips = {
    "Conceptual":     "Revise NCERT + HC Verma fundamentals. Watch concept videos. Solve chapter-wise PYQs.",
    "Calculation":    "Practice mental math daily. Write neat, step-by-step solutions. Double-check before moving on.",
    "Silly Mistake":  "Circle your answer before marking. Re-read every question once. Build a pre-mark checklist.",
    "Time Pressure":  "Timed practice daily. Attempt easy questions first. Hard ones — skip and return.",
    "Didn't Attempt": "Study every chapter at least briefly. Focus on high-weightage topics and build coverage.",
  };

  const tabs = [["dashboard","📊","Analysis"],["entry","📝","Log Test"],["action","🎯","Plan"]];

  return (
    <div style={{ minHeight:"100vh", background:"#060c18", color:"#c8d8e8", fontFamily:"'Courier New',monospace", fontSize:"13px" }}>

      {/* Header */}
      <div style={{ background:"#080e1a", borderBottom:"1px solid #1a2a40", padding:"14px 16px" }}>
        <div style={{ fontSize:"17px", fontWeight:"bold", letterSpacing:"0.12em", color:"#e2eaf4" }}>
          ⚡ JEE <span style={{ color:"#e94560" }}>MOCK</span> ANALYZER
        </div>
        <div style={{ fontSize:"9px", color:"#2a4060", letterSpacing:"0.2em", marginTop:"2px" }}>PERFORMANCE INTELLIGENCE SYSTEM</div>
      </div>

      {/* Tab nav */}
      <div style={{ position:"sticky", top:0, zIndex:10, background:"#080e1a", borderBottom:"1px solid #1a2a40", display:"flex" }}>
        {tabs.map(([id,icon,label]) => (
          <button key={id} onClick={()=>setActiveTab(id)}
            style={{ flex:1, padding:"10px 4px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"monospace",
              borderBottom: activeTab===id?"2px solid #e94560":"2px solid transparent",
              color: activeTab===id?"#e94560":"#4a6080", fontSize:"11px", letterSpacing:"0.05em", transition:"all 0.2s" }}>
            <div style={{ fontSize:"16px" }}>{icon}</div>
            <div>{label}</div>
          </button>
        ))}
      </div>

      <div style={{ padding:"14px", maxWidth:"680px", margin:"0 auto" }}>

        {/* ═══════════════════════════════════
            LOG TEST TAB
        ═══════════════════════════════════ */}
        {activeTab==="entry" && (
          <div>
            <div style={{ background:"#0a0f1a", border:"1px solid #1e3050", borderRadius:"10px", padding:"14px", marginBottom:"14px" }}>
              <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.18em", marginBottom:"12px" }}>TEST DETAILS</div>
              <input style={{ ...inp, marginBottom:"10px" }} placeholder="Test name (e.g. Allen Major Test 6)"
                value={testName} onChange={e=>setTestName(e.target.value)} />
              <input style={inp} type="date" value={testDate} onChange={e=>setTestDate(e.target.value)} />
            </div>

            <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.18em", marginBottom:"10px" }}>CHAPTER ENTRIES</div>

            {rows.map(row => (
              <div key={row.id} style={{ background:"#0a0f1a", border:`1px solid ${expandedRow===row.id?"#e9456055":"#1e3050"}`, borderRadius:"10px", marginBottom:"10px", overflow:"hidden" }}>
                {/* Collapsed row header */}
                <div onClick={()=>setExpandedRow(expandedRow===row.id?null:row.id)}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center", minWidth:0 }}>
                    <span style={{ color:COLORS[row.subject].accent, fontSize:"9px", fontWeight:"bold", flexShrink:0 }}>{row.subject.slice(0,3).toUpperCase()}</span>
                    <span style={{ color:"#6a8098", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.chapter||"— select chapter —"}</span>
                  </div>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center", flexShrink:0 }}>
                    {row.correct  && <span style={{ color:"#16c79a", fontSize:"11px" }}>✓{row.correct}</span>}
                    {row.incorrect && <span style={{ color:"#e94560", fontSize:"11px" }}>✗{row.incorrect}</span>}
                    <span style={{ color:"#2a4060" }}>{expandedRow===row.id?"▲":"▼"}</span>
                  </div>
                </div>

                {expandedRow===row.id && (
                  <div style={{ padding:"0 14px 14px", borderTop:"1px solid #1a2535" }}>

                    {/* Subject + Chapter */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"12px" }}>
                      <div>
                        <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.12em", marginBottom:"5px" }}>SUBJECT</div>
                        <select style={inp} value={row.subject} onChange={e=>updateRow(row.id,"subject",e.target.value)}>
                          {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.12em", marginBottom:"5px" }}>CHAPTER</div>
                        <select style={inp} value={row.chapter} onChange={e=>updateRow(row.id,"chapter",e.target.value)}>
                          <option value="">Select...</option>
                          {CHAPTERS[row.subject].map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div style={{ marginTop:"10px" }}>
                      <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.12em", marginBottom:"6px" }}>DIFFICULTY</div>
                      <div style={{ display:"flex", gap:"8px" }}>
                        {DIFFICULTY.map(d => {
                          const dc = d==="Easy"?"#16c79a":d==="Medium"?"#f5a623":"#e94560";
                          const sel = row.difficulty===d;
                          return (
                            <button key={d} onClick={()=>updateRow(row.id,"difficulty",d)}
                              style={{ flex:1, padding:"8px 4px", border:`1px solid ${sel?dc:"#1e3050"}`,
                                background: sel?`${dc}22`:"transparent",
                                color: sel?dc:"#4a6080",
                                borderRadius:"7px", cursor:"pointer", fontFamily:"monospace", fontSize:"11px", transition:"all 0.15s" }}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Q counts */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px", marginTop:"10px" }}>
                      {[["totalQ","Total"],["attempted","Done"],["correct","✓ OK"],["incorrect","✗ No"]].map(([f,l])=>(
                        <div key={f}>
                          <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.1em", marginBottom:"5px" }}>{l}</div>
                          <input style={{ ...inp, textAlign:"center", padding:"8px 2px" }} type="number" min="0" value={row[f]}
                            onChange={e=>updateRow(row.id,f,e.target.value)} />
                        </div>
                      ))}
                    </div>

                    {/* Error + Time */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"10px" }}>
                      <div>
                        <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.12em", marginBottom:"5px" }}>ERROR TYPE</div>
                        <select style={inp} value={row.errorType} onChange={e=>updateRow(row.id,"errorType",e.target.value)}>
                          {ERROR_TYPES.map(et=><option key={et} value={et}>{et||"None"}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.12em", marginBottom:"5px" }}>TIME (min)</div>
                        <input style={{ ...inp, textAlign:"center" }} type="number" min="0" value={row.timeSpent}
                          onChange={e=>updateRow(row.id,"timeSpent",e.target.value)} />
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginTop:"10px" }}>
                      <div style={{ fontSize:"9px", color:"#4a6080", letterSpacing:"0.12em", marginBottom:"5px" }}>NOTES</div>
                      <input style={inp} placeholder="Quick note about this chapter..." value={row.notes}
                        onChange={e=>updateRow(row.id,"notes",e.target.value)} />
                    </div>

                    {rows.length>1 && (
                      <button onClick={()=>removeRow(row.id)}
                        style={{ marginTop:"12px", width:"100%", padding:"9px", background:"#120508", border:"1px solid #e9456033",
                          color:"#e94560", borderRadius:"7px", cursor:"pointer", fontFamily:"monospace", fontSize:"11px" }}>
                        ✕ REMOVE ENTRY
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display:"flex", gap:"10px", marginTop:"6px" }}>
              <button onClick={addRow}
                style={{ flex:1, padding:"12px", background:"transparent", border:"1px dashed #1e3050",
                  color:"#4a6080", borderRadius:"9px", cursor:"pointer", fontFamily:"monospace", fontSize:"12px" }}>
                + ADD CHAPTER
              </button>
              <button onClick={saveTest}
                style={{ flex:1, padding:"12px", background:"linear-gradient(135deg,#e94560,#c23152)", border:"none",
                  color:"#fff", borderRadius:"9px", cursor:"pointer", fontFamily:"monospace", fontSize:"12px", fontWeight:"bold" }}>
                ▶ SAVE & ANALYZE
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            DASHBOARD TAB
        ═══════════════════════════════════ */}
        {activeTab==="dashboard" && (
          <div>
            {/* Test pills */}
            <div style={{ display:"flex", gap:"7px", marginBottom:"14px", flexWrap:"wrap" }}>
              {tests.map(t=>(
                <button key={t.id} onClick={()=>setSelectedTest(t.id)}
                  style={{ padding:"6px 12px", borderRadius:"20px", border:"1px solid", cursor:"pointer",
                    fontFamily:"monospace", fontSize:"10px", transition:"all 0.2s",
                    background: selectedTest===t.id?"#e94560":"transparent",
                    borderColor: selectedTest===t.id?"#e94560":"#1e3050",
                    color: selectedTest===t.id?"#fff":"#4a6080" }}>
                  {t.name}
                </button>
              ))}
            </div>

            {!currentTest && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#2a3a50" }}>
                <div style={{ fontSize:"36px" }}>📋</div>
                <div style={{ marginTop:"10px", letterSpacing:"0.15em" }}>NO TEST SELECTED</div>
              </div>
            )}

            {currentTest && (()=>{
              const stats = getStats(currentTest.rows);
              const weak  = getWeakChapters(currentTest.rows);
              const errors = getErrors(currentTest.rows);
              const totalScore = SUBJECTS.reduce((a,s)=>a+(stats[s]?.score||0),0);
              const totalMax   = SUBJECTS.reduce((a,s)=>a+(stats[s]?.maxScore||0),0);
              const totalPct   = totalMax ? Math.max(0,Math.round((totalScore/totalMax)*100)) : 0;
              const grade = totalPct>=75?"🔥 Excellent":totalPct>=55?"⚡ Good":totalPct>=35?"⚠️ Needs Work":"🚨 Critical";

              return (
                <>
                  {/* Example note */}
                  {currentTest.id===EXAMPLE_TEST.id && (
                    <div style={{ background:"#0d1a30", border:"1px solid #1e4060", borderRadius:"8px", padding:"10px 13px", marginBottom:"13px", fontSize:"11px", color:"#4a7a9a", display:"flex", gap:"8px" }}>
                      <span style={{ flexShrink:0 }}>💡</span>
                      <span>This is a <strong style={{ color:"#16c79a" }}>sample test</strong> pre-loaded so you can explore all features. Tap <strong style={{ color:"#e94560" }}>📝 Log Test</strong> to add your own.</span>
                    </div>
                  )}

                  {/* Overall Score */}
                  <div style={{ background:"linear-gradient(135deg,#0d1b2a,#10202e)", border:"1px solid #1e3050", borderRadius:"12px", padding:"16px", marginBottom:"13px" }}>
                    <div style={{ fontSize:"9px", color:"#3a5070", letterSpacing:"0.2em", marginBottom:"4px" }}>TOTAL SCORE · {currentTest.date}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px" }}>
                      <div>
                        <div style={{ fontSize:"36px", fontWeight:"bold", color:"#e2eaf4", lineHeight:1 }}>{totalScore}</div>
                        <div style={{ fontSize:"11px", color:"#2a4060", marginTop:"3px" }}>out of {totalMax}</div>
                        <div style={{ fontSize:"13px", color:pctColor(totalPct), marginTop:"7px", fontWeight:"bold" }}>{totalPct}% · {grade}</div>
                      </div>
                      <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                        {SUBJECTS.map(s=>stats[s]&&<RadialScore key={s} pct={stats[s].pct} subject={s} score={stats[s].score} maxScore={stats[s].maxScore}/>)}
                      </div>
                    </div>
                  </div>

                  {/* Subject cards */}
                  {SUBJECTS.map(sub=>{
                    if (!stats[sub]) return null;
                    const s=stats[sub], c=COLORS[sub];
                    const acc = s.attempted ? Math.round((s.correct/s.attempted)*100) : 0;
                    return (
                      <div key={sub} style={{ background:c.light, border:`1px solid ${c.border}`, borderRadius:"10px", padding:"14px", marginBottom:"10px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                          <div style={{ color:c.accent, fontSize:"11px", fontWeight:"bold", letterSpacing:"0.12em" }}>{sub.toUpperCase()}</div>
                          <div style={{ fontSize:"11px" }}>
                            <span style={{ color:"#3a5070" }}>Accuracy </span>
                            <span style={{ color:c.accent, fontWeight:"bold" }}>{acc}%</span>
                          </div>
                        </div>
                        <Bar label="Correct"   value={s.correct}   max={s.total} color={c.accent}/>
                        <Bar label="Attempted" value={s.attempted} max={s.total} color="#3a5070"/>
                        <Bar label="Incorrect" value={s.incorrect} max={s.total} color="#e94560"/>
                        <div style={{ display:"flex", gap:"14px", marginTop:"10px", paddingTop:"10px", borderTop:"1px solid #1a2535", fontSize:"10px", color:"#3a5070" }}>
                          <span>Score: <strong style={{ color:c.accent }}>{s.score}</strong></span>
                          <span style={{ color:"#16c79a" }}>+{s.correct*4}</span>
                          <span style={{ color:"#e94560" }}>-{s.incorrect}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Weak Chapters */}
                  <div style={{ background:"#0a0f1a", border:"1px solid #1e3050", borderRadius:"10px", padding:"14px", marginBottom:"10px" }}>
                    <div style={{ color:"#e94560", fontSize:"11px", fontWeight:"bold", letterSpacing:"0.15em", marginBottom:"12px" }}>⚠ WEAK CHAPTERS</div>
                    {weak.map((w,i)=>{
                      const p=Math.round((w.correct/w.total)*100);
                      return (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #0d1520" }}>
                          <div style={{ minWidth:0, flex:1 }}>
                            <span style={{ color:COLORS[w.subject].accent, fontSize:"9px", marginRight:"5px" }}>[{w.subject.slice(0,3).toUpperCase()}]</span>
                            <span style={{ color:"#c8d8e8" }}>{w.chapter}</span>
                            {w.errors[0] && <div style={{ color:"#2a4060", fontSize:"9px", marginTop:"2px" }}>{w.errors[0]}</div>}
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0, marginLeft:"10px" }}>
                            <div style={{ width:"44px", height:"4px", background:"#1a2535", borderRadius:"2px" }}>
                              <div style={{ height:"100%", width:`${p}%`, background:pctColor(p), borderRadius:"2px" }}/>
                            </div>
                            <span style={{ color:pctColor(p), fontSize:"11px", fontWeight:"bold", minWidth:"30px", textAlign:"right" }}>{p}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Error Breakdown */}
                  <div style={{ background:"#0a0f1a", border:"1px solid #1e3050", borderRadius:"10px", padding:"14px" }}>
                    <div style={{ color:"#f5a623", fontSize:"11px", fontWeight:"bold", letterSpacing:"0.15em", marginBottom:"12px" }}>🔍 ERROR BREAKDOWN</div>
                    {errors.length===0 ? <div style={{ color:"#2a3a50" }}>No errors logged.</div>
                      : errors.map(([type,count],i)=>(
                        <div key={i} style={{ marginBottom:"10px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", marginBottom:"4px" }}>
                            <span style={{ color:"#8899aa" }}>{type}</span>
                            <span style={{ color:"#f5a623" }}>{count}×</span>
                          </div>
                          <div style={{ height:"5px", background:"#1a2535", borderRadius:"3px" }}>
                            <div style={{ height:"100%", width:`${(count/errors[0][1])*100}%`, background:"#f5a623", borderRadius:"3px" }}/>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ═══════════════════════════════════
            ACTION PLAN TAB
        ═══════════════════════════════════ */}
        {activeTab==="action" && (
          <div>
            {tests.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#2a3a50" }}>
                <div style={{ fontSize:"36px" }}>🎯</div>
                <div style={{ marginTop:"10px", letterSpacing:"0.15em" }}>LOG A TEST FIRST</div>
              </div>
            ) : (()=>{
              const allRows  = tests.flatMap(t=>t.rows);
              const weak     = getWeakChapters(allRows);
              const errors   = getErrors(allRows);
              const topError = errors[0]?.[0]||null;

              const priorities = [
                { label:"CRITICAL", color:"#e94560", icon:"🚨", items:weak.filter(w=>w.correct/w.total<0.35) },
                { label:"HIGH",     color:"#f5a623", icon:"⚠️", items:weak.filter(w=>w.correct/w.total>=0.35&&w.correct/w.total<0.55) },
                { label:"MEDIUM",   color:"#facc15", icon:"📌", items:weak.filter(w=>w.correct/w.total>=0.55&&w.correct/w.total<0.75) },
              ];

              return (
                <>
                  {/* Priority list */}
                  <div style={{ marginBottom:"14px" }}>
                    <div style={{ color:"#e2eaf4", fontSize:"12px", fontWeight:"bold", letterSpacing:"0.1em", marginBottom:"12px" }}>📋 REVISION PRIORITY</div>
                    {priorities.every(p=>p.items.length===0)
                      ? <div style={{ color:"#16c79a", textAlign:"center", padding:"20px" }}>✅ All chapters above 75%! Keep it up.</div>
                      : priorities.map(p => p.items.length>0 && (
                          <div key={p.label} style={{ background:"#0a0f1a", borderLeft:`3px solid ${p.color}`, borderRadius:"8px", padding:"12px 13px", marginBottom:"10px" }}>
                            <div style={{ color:p.color, fontSize:"9px", letterSpacing:"0.2em", fontWeight:"bold", marginBottom:"10px" }}>{p.icon} {p.label} PRIORITY</div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                              {p.items.map((c,i)=>(
                                <div key={i} style={{ background:"#060c18", border:`1px solid ${p.color}33`, borderRadius:"6px", padding:"5px 9px", fontSize:"11px" }}>
                                  <span style={{ color:COLORS[c.subject].accent }}>{c.subject.slice(0,3)} · </span>
                                  <span style={{ color:"#c8d8e8" }}>{c.chapter}</span>
                                  <span style={{ color:p.color, marginLeft:"5px", fontWeight:"bold" }}>{Math.round((c.correct/c.total)*100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    }
                  </div>

                  {/* Top error fix */}
                  {topError && (
                    <div style={{ background:"#0a0f1a", borderLeft:"3px solid #f5a623", borderRadius:"8px", padding:"14px", marginBottom:"14px" }}>
                      <div style={{ color:"#f5a623", fontSize:"9px", letterSpacing:"0.18em", fontWeight:"bold", marginBottom:"8px" }}>🔧 FIX YOUR TOP ERROR: {topError.toUpperCase()}</div>
                      <div style={{ color:"#c8d8e8", lineHeight:"1.75", fontSize:"12px" }}>{tips[topError]}</div>
                    </div>
                  )}

                  {/* Weekly plan */}
                  <div style={{ background:"#0a0f1a", border:"1px solid #1e3050", borderRadius:"10px", padding:"14px", marginBottom:"13px" }}>
                    <div style={{ color:"#16c79a", fontSize:"11px", fontWeight:"bold", letterSpacing:"0.15em", marginBottom:"14px" }}>📅 WEEKLY STUDY PLAN</div>
                    {[
                      ["MON","Physics","Critical chapters — theory + 20 problems"],
                      ["TUE","Chemistry","Organic reactions + Inorganic facts"],
                      ["WED","Maths","Calculus + Algebra — PYQ drill"],
                      ["THU","Mixed","1-hr sectional test (Physics)"],
                      ["FRI","Mixed","1-hr sectional test (Chem + Math)"],
                      ["SAT","Revision","Re-solve all wrong answers from this week"],
                      ["SUN","Full Mock","3-hr mock → log here → review errors"],
                    ].map(([day,sub,task])=>(
                      <div key={day} style={{ display:"flex", gap:"10px", marginBottom:"10px", alignItems:"flex-start" }}>
                        <div style={{ minWidth:"32px", color:"#e94560", fontSize:"10px", fontWeight:"bold", letterSpacing:"0.08em", paddingTop:"1px" }}>{day}</div>
                        <div style={{ minWidth:"60px", color:"#3a5070", fontSize:"10px", paddingTop:"1px" }}>{sub}</div>
                        <div style={{ color:"#c8d8e8", fontSize:"12px" }}>{task}</div>
                      </div>
                    ))}
                  </div>

                  {/* Golden Rules */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px" }}>
                    {[
                      ["⏱","TIME BOX","Never >3 min per Q. Skip & return later."],
                      ["🔄","REATTEMPT","Redo every wrong Q after 3 days, no hints."],
                      ["📊","TRACK IT","Log every mock. Patterns show after 5+ tests."],
                      ["🧠","SLEEP","7–8 hrs. Memory forms during deep sleep."],
                    ].map(([icon,title,desc])=>(
                      <div key={title} style={{ background:"#080d18", border:"1px solid #1a2535", borderRadius:"10px", padding:"13px" }}>
                        <div style={{ fontSize:"20px", marginBottom:"6px" }}>{icon}</div>
                        <div style={{ color:"#e94560", fontSize:"9px", letterSpacing:"0.15em", fontWeight:"bold", marginBottom:"5px" }}>{title}</div>
                        <div style={{ color:"#4a6080", fontSize:"11px", lineHeight:"1.6" }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
