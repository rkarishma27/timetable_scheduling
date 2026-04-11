import { useState, useEffect, useRef } from "react";

// ─── SLOT DATA ─────────────────────────────────────────────────────────────
const SLOT_GRID = {
  MON: ["A1/L1","F1/L2","D1/L3","TB1/L4","TG1/L5","L6","LUNCH","A2/L31","F2/L32","D2/L33","TB2/L34","TG2/L35","L36"],
  TUE: ["B1/L7","G1/L8","E1/L9","TC1/L10","TAA1/L11","L12","LUNCH","B2/L37","G2/L38","E2/L39","TC2/L40","TAA2/L41","L42"],
  WED: ["C1/L13","A1/L14","F1/L15","V1/L16","V2/L17","L18","LUNCH","C2/L43","A2/L44","F2/L45","TD2/L46","TBB2/L47","L48"],
  THU: ["D1/L19","B1/L20","G1/L21","TE1/L22","TCC1/L23","L24","LUNCH","D2/L49","B2/L50","G2/L51","TE2/L52","TCC2/L53","L54"],
  FRI: ["E1/L25","C1/L26","TA1/L27","TF1/L28","TD1/L29","L30","LUNCH","E2/L55","C2/L56","TA2/L57","TF2/L58","TDD2/L59","L60"],
};
const DAYS = ["MON","TUE","WED","THU","FRI"];
const FREE_SLOTS_SET = new Set(["V1/L16","V2/L17"]);

const TIME_LABELS = [
  "8:00–8:50","9:00–9:50","10:00–10:50","11:00–11:50","12:00–12:50",
  "—","LUNCH","2:00–2:50","3:00–3:50","4:00–4:50","5:00–5:50","6:00–6:50","—"
];

const MAX_CR = 25;
const REACT_APP_API_URL = process.env.REACT_APP_API_BASE_URL || "https://timetable-scheduling-pagl.onrender.com";
const API_TIMEOUT_MS = 25000;

const LAB_PAIRS = [
  "L1+L2","L3+L4","L5+L6","L7+L8","L9+L10","L11+L12",
  "L13+L14","L15+L16","L17+L18","L19+L20","L21+L22","L23+L24",
  "L25+L26","L27+L28","L29+L30","L31+L32","L33+L34","L35+L36",
  "L37+L38","L39+L40","L41+L42","L43+L44","L45+L46","L47+L48",
  "L49+L50","L51+L52","L53+L54","L55+L56","L57+L58","L59+L60",
];

const THEORY_SLOTS = [
  "A1","B1","C1","D1","E1","F1","G1","A2","B2","C2","D2","E2","F2","G2",
  "TA1","TB1","TC1","TD1","TE1","TF1","TG1","TA2","TB2","TC2","TD2","TE2","TF2","TG2",
  "TAA1","TAA2","TBB2","TCC1","TCC2","TDD2"
];

function parseCell(cell) {
  if (!cell || cell === "LUNCH") return { theory: null, lab: null };
  const [theory, lab] = cell.split("/");
  return { theory: theory || null, lab: lab || null };
}

// ─── COURSES ───────────────────────────────────────────────────────────────
const COURSES = {
  NC: [
    { code:"ENG1901", title:"Technical English I",           type:"TH",  L:2,T:0,P:0,J:0, credits:0 },
    { code:"PHY1901", title:"Physics Value-Add Lab",         type:"LO",  L:0,T:0,P:2,J:0, credits:0 },
    { code:"NSS101",  title:"NSS / NCC / NSO",               type:"OC",  L:0,T:0,P:0,J:2, credits:0 },
  ],
  UC: [
    { code:"MAT1001", title:"Calculus and its Applications", type:"TH",  L:3,T:1,P:0,J:0, credits:4 },
    { code:"PHY1001", title:"Engineering Physics",           type:"ETL", L:3,T:0,P:2,J:0, credits:4 },
    { code:"CHY1001", title:"Engineering Chemistry",         type:"ETL", L:3,T:0,P:2,J:0, credits:4 },
    { code:"ENG1001", title:"Technical English II",          type:"TH",  L:2,T:0,P:0,J:0, credits:2 },
    { code:"HUM1001", title:"Ethics and Values",             type:"TH",  L:2,T:0,P:0,J:0, credits:2 },
    { code:"BIO1001", title:"Biology for Engineers",         type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
  ],
  PC: [
    { code:"CSE1001", title:"Problem Solving & Python",      type:"ETL", L:3,T:0,P:2,J:0, credits:4 },
    { code:"CSE1002", title:"Data Structures & Algorithms",  type:"ETL", L:3,T:1,P:2,J:0, credits:5 },
    { code:"CSE2001", title:"Object Oriented Programming",   type:"ETL", L:3,T:0,P:2,J:0, credits:4 },
    { code:"CSE2002", title:"Database Management Systems",   type:"ETL", L:3,T:0,P:2,J:0, credits:4 },
    { code:"CSE3001", title:"Computer Networks",             type:"TH",  L:3,T:1,P:0,J:0, credits:4 },
    { code:"CSE3002", title:"Operating Systems",             type:"ETL", L:3,T:0,P:2,J:0, credits:4 },
  ],
  CONC: [
    { code:"CSE4001", title:"Machine Learning",              type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
    { code:"CSE4002", title:"Deep Learning",                 type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
    { code:"CSE4003", title:"Cloud Computing",               type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
    { code:"CSE4004", title:"Cybersecurity Fundamentals",    type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
    { code:"CSE4005", title:"Blockchain Technology",         type:"TH",  L:2,T:0,P:0,J:0, credits:2 },
  ],
  OE: [
    { code:"MGT1001", title:"Principles of Management",     type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
    { code:"ECO1001", title:"Engineering Economics",        type:"TH",  L:3,T:0,P:0,J:0, credits:3 },
    { code:"PSY1001", title:"Psychology for Engineers",     type:"OC",  L:2,T:0,P:0,J:0, credits:2 },
    { code:"ENV1001", title:"Environmental Sciences",       type:"OC",  L:2,T:0,P:0,J:0, credits:2 },
    { code:"LAN1001", title:"French – Level 1",             type:"TH",  L:2,T:0,P:0,J:0, credits:2 },
  ],
};

const CAT_INFO = {
  NC:   { label:"Non-Credit Courses", emoji:"🎯", color:"#f59e0b" },
  UC:   { label:"University Core",    emoji:"🏛️", color:"#f87171" },
  PC:   { label:"Programme Core",     emoji:"⚙️", color:"#34d399" },
  CONC: { label:"Concentration",      emoji:"🎓", color:"#60a5fa" },
  OE:   { label:"Open Elective",      emoji:"🌐", color:"#a78bfa" },
};

// ─── TEACHER / SLOT HELPERS ────────────────────────────────────────────────
const TEACHER_POOL = [
  { name:"Dr. Ramesh Kumar",   room:"SJT 301", seats:65 },
  { name:"Prof. Anita Sharma", room:"TT 201",  seats:8  },
  { name:"Dr. Venkat Raman",   room:"SJT 412", seats:42 },
  { name:"Dr. Priya Nair",     room:"MB 105",  seats:71 },
  { name:"Prof. Suresh Babu",  room:"SJT 203", seats:5  },
];

function getTeachers(courseCode) {
  const s = courseCode.charCodeAt(courseCode.length - 1) % 3;
  return TEACHER_POOL.slice(s, s + 3);
}

function getTeacherSlots(idx, code, type) {
  const s  = (idx * 7 + code.charCodeAt(3)) % THEORY_SLOTS.length;
  const ls = (idx * 5 + code.charCodeAt(Math.min(4, code.length - 1))) % LAB_PAIRS.length;
  if (type === "TH")  return { theory: THEORY_SLOTS[s], lab: null };
  if (type === "LO")  return { theory: null, lab: LAB_PAIRS[ls] };
  if (type === "ETL") return { theory: THEORY_SLOTS[s], labMorn: LAB_PAIRS[ls], labEve: LAB_PAIRS[(ls + 3) % LAB_PAIRS.length] };
  return { theory: null, lab: null };
}

// ─── CAPTCHA ───────────────────────────────────────────────────────────────
function genCaptcha() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

function CaptchaCanvas({ text }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    cv.width = 200; cv.height = 54;
    ctx.clearRect(0, 0, 200, 54);
    for (let i = 0; i < 350; i++) {
      ctx.fillStyle = `rgba(160,160,200,${Math.random() * 0.25})`;
      ctx.fillRect(Math.random() * 200, Math.random() * 54, 2, 2);
    }
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = "rgba(120,130,180,0.2)";
      ctx.beginPath();
      ctx.moveTo(Math.random() * 200, Math.random() * 54);
      ctx.lineTo(Math.random() * 200, Math.random() * 54);
      ctx.stroke();
    }
    text.split("").forEach((ch, i) => {
      ctx.save();
      ctx.font = `bold ${22 + Math.random() * 5}px monospace`;
      ctx.fillStyle = `hsl(${210 + i * 18},65%,${60 + Math.random() * 18}%)`;
      ctx.translate(18 + i * 28, 36 + Math.random() * 5 - 2);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, [text]);
  return <canvas ref={ref} style={{ display:"block", borderRadius:8 }} />;
}

// ─── CREDIT LIMIT POPUP ────────────────────────────────────────────────────
function CreditLimitModal({ course, usedCr, onClose }) {
  const wouldBe = usedCr + course.credits;
  const over    = wouldBe - MAX_CR;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999,
      background:"rgba(0,0,0,0.72)",
      display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(4px)",
    }}>
      <div style={{
        background:"#161b22", border:"1px solid #da3633", borderRadius:18,
        padding:"36px 36px 28px", maxWidth:420, width:"90%",
        boxShadow:"0 0 0 1px #da363344, 0 24px 60px rgba(0,0,0,0.7)",
      }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, borderRadius:"50%", background:"rgba(218,54,51,0.12)", border:"2px solid rgba(218,54,51,0.35)", fontSize:"1.9rem" }}>🚫</div>
        </div>
        <div style={{ textAlign:"center", fontSize:"1.2rem", fontWeight:800, color:"#f85149", marginBottom:8 }}>Credit Limit Exceeded</div>
        <div style={{ textAlign:"center", fontSize:"0.83rem", color:"#8b949e", marginBottom:24 }}>You cannot add this course — it pushes you over the maximum allowed credits.</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {[["Current",`${usedCr} cr`,"#58a6ff"],["This Course",`+${course.credits} cr`,"#f0883e"],["Would Be",`${wouldBe} cr`,"#f85149"]].map(([label,val,color]) => (
            <div key={label} style={{ background:"#0d1117", borderRadius:10, padding:"12px 8px", textAlign:"center", border:"1px solid #21262d" }}>
              <div style={{ fontSize:"0.62rem", color:"#484f58", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:"1.1rem", fontWeight:800, fontFamily:"monospace", color }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(218,54,51,0.08)", border:"1px solid rgba(218,54,51,0.25)", borderRadius:8, padding:"10px 14px", fontSize:"0.82rem", color:"#ff7b72", textAlign:"center", marginBottom:24 }}>
          ⚠️ <strong>{course.title}</strong> adds <strong>{course.credits} credits</strong>, exceeding the limit by <strong>{over} credit{over !== 1 ? "s" : ""}</strong>.
          <br /><span style={{ color:"#8b949e", fontSize:"0.76rem" }}>Remove another course first to make room.</span>
        </div>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.7rem", color:"#8b949e", marginBottom:6 }}>
            <span>Credit usage</span><span style={{ fontFamily:"monospace" }}>{usedCr} / {MAX_CR}</span>
          </div>
          <div style={{ height:8, background:"#0d1117", borderRadius:4, overflow:"hidden", border:"1px solid #21262d" }}>
            <div style={{ height:"100%", width:`${Math.min(100,(usedCr/MAX_CR)*100)}%`, background:"linear-gradient(90deg,#58a6ff,#7c5cfc)", borderRadius:4 }} />
          </div>
          <div style={{ marginTop:4, fontSize:"0.68rem", color:"#484f58", textAlign:"right" }}>{MAX_CR - usedCr} credit{MAX_CR - usedCr !== 1 ? "s" : ""} remaining</div>
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:"11px", borderRadius:10, background:"linear-gradient(135deg,#21262d,#30363d)", border:"1px solid #30363d", color:"#c9d1d9", fontSize:"0.92rem", fontWeight:700, cursor:"pointer" }}>
          Got it, go back
        </button>
      </div>
    </div>
  );
}

// ─── TYPE BADGE ────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  TH:  { bg:"rgba(96,165,250,0.15)",  fg:"#60a5fa" },
  ETL: { bg:"rgba(52,211,153,0.15)",  fg:"#34d399" },
  LO:  { bg:"rgba(251,191,36,0.15)",  fg:"#fbbf24" },
  OC:  { bg:"rgba(167,139,250,0.15)", fg:"#a78bfa" },
};

function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || { bg:"#1e2433", fg:"#9ca3af" };
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:"0.7rem", fontWeight:700, fontFamily:"monospace", background:c.bg, color:c.fg }}>{type}</span>
  );
}

function SlotBadge({ slot, type, taken }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", borderRadius:5, fontSize:"0.68rem", fontFamily:"monospace",
      background: taken ? "rgba(248,81,73,0.12)" : type === "lab" ? "rgba(52,211,153,0.1)" : "rgba(88,166,255,0.1)",
      color:      taken ? "#f85149"               : type === "lab" ? "#3fb950"              : "#58a6ff",
      border:`1px solid ${taken ? "#da363344" : type === "lab" ? "#3fb95033" : "#58a6ff33"}`
    }}>{slot}</span>
  );
}

// ─── TOPBAR ────────────────────────────────────────────────────────────────
function Topbar({ regNum, used, max, timeLeft, onLogout }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div style={{
      background:"#0d1117", borderBottom:"1px solid #21262d", padding:"0 28px",
      height:56, display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:200
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ fontFamily:"monospace", fontSize:"1.05rem", fontWeight:700, color:"#58a6ff", letterSpacing:"0.06em" }}>FFCS</span>
        <span style={{ color:"#30363d", fontSize:"0.78rem" }}>VIT Vellore</span>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <button onClick={onLogout} style={{ background:"#da3633", color:"#fff", border:"none", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontSize:"0.75rem" }}>Logout</button>
        <span style={{ background:"#161b22", border:"1px solid #21262d", padding:"3px 12px", borderRadius:20, fontSize:"0.74rem", color:"#8b949e", fontFamily:"monospace" }}>{regNum}</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:100, height:5, background:"#21262d", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#58a6ff,#7c5cfc)", borderRadius:3, transition:"width 0.4s" }} />
          </div>
          <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#58a6ff", fontFamily:"monospace" }}>{used}/{max}cr</span>
        </div>
        <span style={{ color:"#f0883e", fontFamily:"monospace", fontSize:"0.8rem", marginLeft:10 }}>
          ⏳ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

// ─── SHARED UI ─────────────────────────────────────────────────────────────
function FInput({ label, ...props }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.02em", marginBottom:5 }}>{title}</div>
      <div style={{ color:"#8b949e", fontSize:"0.84rem" }}>{sub}</div>
    </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontSize:"0.72rem", color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700, marginBottom:12 }}>{children}</div>;
}

const labelStyle = { display:"block", fontSize:"0.74rem", color:"#8b949e", marginBottom:6, letterSpacing:"0.05em", textTransform:"uppercase", fontWeight:600 };
const inputStyle = { width:"100%", background:"#0d1117", border:"1px solid #30363d", color:"#e6edf3", padding:"10px 13px", borderRadius:9, fontSize:"0.92rem", fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
const btnPrimary = { width:"100%", background:"linear-gradient(135deg,#1f6feb,#7c5cfc)", color:"#fff", border:"none", padding:"12px", borderRadius:10, fontSize:"0.95rem", fontWeight:700, cursor:"pointer" };
const btnAct     = { background:"rgba(88,166,255,0.12)", border:"1px solid rgba(88,166,255,0.3)", color:"#58a6ff", padding:"5px 13px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem", fontWeight:600, whiteSpace:"nowrap" };
const btnSel     = { background:"rgba(63,185,80,0.12)", border:"1px solid rgba(63,185,80,0.3)", color:"#3fb950", padding:"5px 13px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem", fontWeight:600, whiteSpace:"nowrap" };
const backBtnStyle = { background:"none", border:"none", color:"#8b949e", cursor:"pointer", fontSize:"0.86rem", padding:"4px 0", marginBottom:12, display:"inline-block" };
const pageWrap   = { padding:"24px 32px", maxWidth:1400, margin:"0 auto" };
const td         = { padding:"11px 14px", borderBottom:"1px solid #161b22", verticalAlign:"middle" };

// ─── FULL TIMETABLE ────────────────────────────────────────────────────────
// Uses a sticky first column + horizontal scroll inside a bounded container
function FullTimetable({ ttMap, selections, highlight, courseName, showTeacher }) {
  const COL_W = 88; // px per time slot column
  const DAY_W = 52; // px for day label column

  function cellInfo(day, ci) {
    const cell = SLOT_GRID[day][ci];
    if (!cell) return null;
    if (cell === "LUNCH") return { label:"LUNCH", bg:"#0d1117", fg:"#484f58", small:true };
    const isFree = FREE_SLOTS_SET.has(cell);
    const { theory, lab } = parseCell(cell);

    if (highlight) {
      if (highlight.theory && theory === highlight.theory)
        return { label:(theory + "\n" + (courseName||"")), bg:"rgba(88,166,255,0.22)", fg:"#79c0ff", bold:true };
      if (highlight.lab && lab && highlight.lab.split("+").includes(lab))
        return { label:(lab + "\n" + (courseName||"")), bg:"rgba(52,211,153,0.22)", fg:"#56d364", bold:true };
    }

    if (theory && ttMap[theory]) {
      const sc = selections?.find(s => s.theorySlot === theory);
      return {
        label: theory + "\n" + ttMap[theory] + (showTeacher && sc?.teacher ? "\n📍 " + sc.teacher.split(" ").slice(-1)[0] : ""),
        bg:"rgba(88,166,255,0.18)", fg:"#79c0ff", bold:true
      };
    }
    if (lab && ttMap[lab]) {
      const sc = selections?.find(s => s.labSlot && s.labSlot.includes(lab));
      return {
        label: lab + "\n" + ttMap[lab] + (showTeacher && sc?.teacher ? "\n📍 " + sc.teacher.split(" ").slice(-1)[0] : ""),
        bg:"rgba(52,211,153,0.14)", fg:"#56d364", bold:true
      };
    }
    if (isFree) return { label:"FREE", bg:"rgba(248,238,98,0.04)", fg:"#2a2e1f", small:true };
    return { label:theory || lab || "", bg:"transparent", fg:"#21262d", small:true };
  }

  return (
    <div style={{ width:"100%", overflowX:"auto", borderRadius:12, border:"1px solid #21262d" }}>
      <table style={{ borderCollapse:"collapse", tableLayout:"fixed", width: DAY_W + COL_W * 13 }}>
        <colgroup>
          <col style={{ width:DAY_W }} />
          {TIME_LABELS.map((_, i) => <col key={i} style={{ width:COL_W }} />)}
        </colgroup>
        <thead>
          <tr style={{ background:"#161b22" }}>
            <th style={{ padding:"8px 10px", textAlign:"left", fontSize:"0.65rem", color:"#8b949e", borderBottom:"1px solid #21262d", position:"sticky", left:0, background:"#161b22", zIndex:2, width:DAY_W }}>Day</th>
            {TIME_LABELS.map((t, i) => (
              <th key={i} style={{
                padding:"6px 4px", fontSize:"0.6rem", color: t === "LUNCH" || t === "—" ? "#30363d" : "#8b949e",
                textAlign:"center", borderBottom:"1px solid #21262d",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
              }}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(day => (
            <tr key={day} style={{ borderBottom:"1px solid #0d1117" }}>
              <td style={{ padding:"4px 10px", fontWeight:700, fontFamily:"monospace", fontSize:"0.72rem", color:"#8b949e", position:"sticky", left:0, background:"#0d1117", zIndex:1, borderRight:"1px solid #21262d" }}>{day}</td>
              {SLOT_GRID[day].map((cell, ci) => {
                const info = cellInfo(day, ci);
                if (!info) return <td key={ci} />;
                return (
                  <td key={ci} style={{ padding:"2px" }}>
                    <div style={{
                      padding:"5px 4px", textAlign:"center", fontSize:"0.58rem", fontFamily:"monospace",
                      lineHeight:1.3, borderRadius:4, background:info.bg, color:info.fg,
                      fontWeight: info.bold ? 700 : 400, whiteSpace:"pre",
                      minHeight:38, display:"flex", alignItems:"center", justifyContent:"center",
                      opacity: info.small ? 0.5 : 1
                    }}>
                      {info.label}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SLOT SELECTION PAGE ───────────────────────────────────────────────────
function SlotPage({ course, etlPref, setEtlPref, takenTheory, takenLab, usedCr, ttMap, selections, wishlist, regNum, timeLeft, onBack, onConfirm, onLogout }) {
  const [selTeacherName, setSelTeacherName] = useState("");
  const teachers = getTeachers(course.code);
  const teachersWithSlotsAll = teachers.map((t, i) => ({ ...t, slots: getTeacherSlots(i, course.code, course.type) }));
  const teachersWithSlots =
    course.type === "ETL"
      ? teachersWithSlotsAll.filter((ts) => {
          const requiredSuffix = etlPref === "MT" ? "1" : "2"; // MT -> Txx1, EM -> Txx2
          return ts.slots?.theory?.endsWith(requiredSuffix);
        })
      : teachersWithSlotsAll;

  useEffect(() => {
    // If user switches ETL preference, clear an incompatible previously selected faculty
    if (course.type !== "ETL" || !selTeacherName) return;
    const selected = teachersWithSlots.find((ts) => ts.name === selTeacherName);
    if (!selected) { setSelTeacherName(""); return; }
    const requiredSuffix = etlPref === "MT" ? "1" : "2";
    if (!selected.slots?.theory?.endsWith(requiredSuffix)) setSelTeacherName("");
  }, [etlPref, course.type, selTeacherName, teachersWithSlots]);

  function getActive(ts) {
    if (course.type === "ETL") {
      // MT: Morning Theory + Evening Lab, EM: Evening Theory + Morning Lab
      const lab = etlPref === "MT" ? ts.slots.labEve : ts.slots.labMorn;
      return { theory: ts.slots.theory, lab };
    }
    return { theory: ts.slots.theory, lab: ts.slots.lab };
  }

  function hasClash(ts) {
    const { theory, lab } = getActive(ts);
    if (theory && takenTheory.has(theory)) return true;
    if (lab && lab.split("+").some(l => takenLab.has(l))) return true;
    return false;
  }

  function getClashDetails(ts) {
    const { theory, lab } = getActive(ts);
    const labs = lab ? lab.split("+") : [];
    return selections
      .filter((s) => s.course.code !== course.code)
      .filter((s) => {
        const theoryClash = theory && s.theorySlot === theory;
        const labClash = labs.length > 0 && s.labSlot && labs.some((l) => s.labSlot.split("+").includes(l));
        return theoryClash || labClash;
      })
      .map((s) => `${s.teacher || "Faculty"} in ${s.course.code} (${s.course.title})`);
  }

  function optionsForCourse(targetCourse) {
    const teachers = getTeachers(targetCourse.code);
    const teacherSlots = teachers.map((t, i) => ({ ...t, slots: getTeacherSlots(i, targetCourse.code, targetCourse.type) }));
    const filtered = targetCourse.type === "ETL"
      ? teacherSlots.filter((x) => x.slots?.theory?.endsWith(etlPref === "MT" ? "1" : "2"))
      : teacherSlots;
    return filtered.map((ts) => {
      if (targetCourse.type === "ETL") {
        const lab = etlPref === "MT" ? ts.slots.labEve : ts.slots.labMorn;
        return { teacher: ts.name, theory: ts.slots.theory, lab };
      }
      return { teacher: ts.name, theory: ts.slots.theory, lab: ts.slots.lab };
    });
  }

  function slotsConflict(a, b) {
    const aLabs = a.lab ? a.lab.split("+") : [];
    const bLabs = b.lab ? b.lab.split("+") : [];
    const theoryConflict = a.theory && b.theory && a.theory === b.theory;
    const labConflict = aLabs.some((l) => bLabs.includes(l));
    return theoryConflict || labConflict;
  }

  function getFutureConsequences(ts) {
    const chosen = getActive(ts);
    return wishlist
      .filter((w) => w.course.code !== course.code)
      .filter((w) => !selections.some((s) => s.course.code === w.course.code))
      .map((w) => {
        if (w.course.type === "OC") return null;
        const opts = optionsForCourse(w.course);
        const blocked = opts.filter((opt) => slotsConflict(chosen, opt)).map((opt) => opt.teacher);
        if (blocked.length === 0) return null;
        const remaining = opts.length - blocked.length;
        return {
          courseCode: w.course.code,
          courseTitle: w.course.title,
          blocked,
          remaining,
        };
      })
      .filter(Boolean);
  }

  function confirm() {
    const selected = teachersWithSlots.find((ts) => ts.name === selTeacherName);
    if (!selected) return;
    const { theory, lab } = getActive(selected);
    onConfirm(selected.name, theory, lab);
  }

  const afterCr = usedCr + course.credits;
  const overLimit = afterCr > MAX_CR;
  const selectedTeacher = teachersWithSlots.find((ts) => ts.name === selTeacherName) || null;
  const selectedClashes = selectedTeacher ? getClashDetails(selectedTeacher) : [];
  const futureConsequences = selectedTeacher ? getFutureConsequences(selectedTeacher) : [];

  return (
    <div>
      <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={onLogout} />
      <div style={pageWrap}>
        <button style={backBtnStyle} onClick={onBack}>← Back to Faculty Selection</button>
        <PageHeader
          title={course.title}
          sub={
            <span style={{ display:"flex", alignItems:"center", gap:8 }}>
              <TypeBadge type={course.type} />
              <span style={{ color:"#8b949e" }}>{course.code} · {course.credits} credits · L:{course.L} T:{course.T} P:{course.P} J:{course.J}</span>
            </span>
          }
        />

        {course.type === "ETL" && (
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:10, padding:"14px 18px", marginBottom:20, display:"inline-flex", flexDirection:"column", gap:8 }}>
            <div style={{ fontSize:"0.75rem", color:"#8b949e" }}>ETL — choose lab session preference:</div>
            <div style={{ display:"flex", gap:8 }}>
              {[["MT","🌅 Morning Theory + Evening Lab"],["EM","🌆 Evening Theory + Morning Lab"]].map(([val, label]) => (
                <button key={val}
                  style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${etlPref === val ? "#58a6ff" : "#30363d"}`, background:etlPref === val ? "rgba(88,166,255,0.1)" : "#0d1117", color:etlPref === val ? "#58a6ff" : "#8b949e", cursor:"pointer", fontSize:"0.82rem" }}
                  onClick={() => setEtlPref(val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
          <div style={{ flex:"0 0 300px", minWidth:280 }}>
            <SLabel>Select Faculty</SLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
              {teachersWithSlots.map((ts, i) => {
                const clash = hasClash(ts);
                const clashDetails = getClashDetails(ts);
                const { theory, lab } = getActive(ts);
                const sel = selTeacherName === ts.name;
                return (
                  <div key={i}
                    style={{ background:sel?"rgba(63,185,80,0.08)":"#161b22", border:`1px solid ${sel?"#3fb950":clash?"#da3633":"#21262d"}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"flex-start", justifyContent:"space-between", transition:"border-color 0.15s" }}
                    onClick={() => setSelTeacherName(ts.name)}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"0.9rem", marginBottom:3 }}>{ts.name}</div>
                      <div style={{ fontSize:"0.75rem", color:ts.seats < 10 ? "#f85149" : "#f0883e", marginBottom:3 }}>Seats left: {ts.seats}</div>
                      <div style={{ fontSize:"0.75rem", color:"#8b949e", marginBottom:8 }}>📍 {ts.room}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {theory && <SlotBadge slot={theory} type="theory" taken={takenTheory.has(theory)} />}
                        {lab && lab.split("+").map(l => <SlotBadge key={l} slot={"Lab:"+l} type="lab" taken={takenLab.has(l)} />)}
                      </div>
                      {clashDetails.length > 0 && (
                        <div style={{ marginTop:8, fontSize:"0.72rem", color:"#ff7b72", lineHeight:1.4 }}>
                          Choosing {ts.name.split(" ")[0]} clashes with {clashDetails.slice(0, 2).join(" and ")}{clashDetails.length > 2 ? "..." : ""}.
                        </div>
                      )}
                    </div>
                    {clash && <span style={{ fontSize:"0.7rem", color:"#f85149", fontWeight:700, background:"rgba(248,81,73,0.1)", padding:"3px 9px", borderRadius:6, whiteSpace:"nowrap" }}>⚠ CLASH</span>}
                    {sel && <span style={{ fontSize:"0.9rem", color:"#3fb950", background:"rgba(63,185,80,0.12)", width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            {selectedTeacher && (
              <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, padding:16 }}>
                {selectedClashes.length > 0 && (
                  <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:"rgba(248,81,73,0.1)", border:"1px solid rgba(248,81,73,0.25)", color:"#ff7b72", fontSize:"0.78rem", lineHeight:1.45 }}>
                    Choosing <strong>{selectedTeacher.name}</strong> will clash with:
                    <div style={{ marginTop:6 }}>
                      {selectedClashes.map((msg, idx) => (
                        <div key={idx}>• {msg}</div>
                      ))}
                    </div>
                  </div>
                )}
                {futureConsequences.length > 0 && (
                  <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:"rgba(240,136,62,0.08)", border:"1px solid rgba(240,136,62,0.3)", color:"#f0b37e", fontSize:"0.78rem", lineHeight:1.45 }}>
                    Choosing <strong>{selectedTeacher.name}</strong> for <strong>{course.code}</strong> may reduce options in upcoming courses:
                    <div style={{ marginTop:6 }}>
                      {futureConsequences.map((c, idx) => (
                        <div key={idx}>
                          • <strong>{c.courseCode}</strong>: blocks {c.blocked.slice(0, 2).join(", ")}{c.blocked.length > 2 ? "..." : ""} ({c.remaining} option{c.remaining !== 1 ? "s" : ""} left)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ fontSize:"0.84rem", color:"#8b949e", marginBottom:12 }}>
                  Credits after adding: <strong style={{ color:"#58a6ff" }}>{afterCr}</strong> / {MAX_CR}
                  {overLimit && <span style={{ color:"#f85149", marginLeft:8 }}>⚠ Exceeds limit!</span>}
                </div>
                <button
                  style={{ ...btnPrimary, background:(overLimit || selectedClashes.length > 0)?"#21262d":"linear-gradient(135deg,#238636,#1a6e2e)", cursor:(overLimit || selectedClashes.length > 0)?"not-allowed":"pointer", opacity:(overLimit || selectedClashes.length > 0)?0.5:1 }}
                  onClick={confirm} disabled={overLimit || selectedClashes.length > 0}>
                  {selectedClashes.length > 0 ? "Resolve Clash to Continue" : "Confirm Selection →"}
                </button>
              </div>
            )}
          </div>

          <div style={{ flex:"1", minWidth:0 }}>
            <SLabel>Timetable Preview</SLabel>
            <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
              <FullTimetable
                ttMap={ttMap}
                selections={[]}
                highlight={selectedTeacher ? getActive(selectedTeacher) : {}}
                courseName={course.code.slice(-4)}
                showTeacher={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FULL TIMETABLE VIEW PAGE ──────────────────────────────────────────────
function TimetableView({ selections, ttMap, regNum, usedCr, timeLeft, onBack, isFinalized, goHome, onLogout }) {
  return (
    <div>
      <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={onLogout} />
      <div style={pageWrap}>
        {!isFinalized && <button style={backBtnStyle} onClick={onBack}>← Back to Courses</button>}
        {isFinalized && (
          <button style={{ background:"#30363d", color:"#fff", padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:10 }} onClick={goHome}>🏠 Go Home</button>
        )}
        <PageHeader title="My Timetable" sub={`${usedCr} credits · ${selections.length} courses registered`} />

        <FullTimetable ttMap={ttMap} selections={selections} highlight={null} showTeacher={true} />

        <div style={{ marginTop:32 }}>
          <SLabel>Registered Courses</SLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
            {selections.map(sc => (
              <div key={sc.course.code} style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <TypeBadge type={sc.course.type} />
                  <span style={{ fontFamily:"monospace", fontSize:"0.78rem", color:"#f0883e", fontWeight:700 }}>{sc.course.credits} cr</span>
                </div>
                <div style={{ fontWeight:700, fontSize:"0.87rem", marginBottom:3 }}>{sc.course.title}</div>
                <div style={{ fontFamily:"monospace", fontSize:"0.72rem", color:"#58a6ff", marginBottom:8 }}>{sc.course.code}</div>
                <div style={{ fontSize:"0.76rem", color:"#8b949e", display:"flex", flexDirection:"column", gap:3 }}>
                  {sc.teacher    && <span>👤 {sc.teacher}</span>}
                  {sc.theorySlot && <span>📖 Theory: <span style={{ color:"#79c0ff" }}>{sc.theorySlot}</span></span>}
                  {sc.labSlot    && <span>🔬 Lab: <span style={{ color:"#56d364" }}>{sc.labSlot}</span></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FINAL REVIEW ──────────────────────────────────────────────────────────
function FinalPage({ selections, onSubmit, isSubmitting, submitError }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div style={{ padding:30, background:"#0d1117", minHeight:"100vh" }}>
      <h2 style={{ color:"#e6edf3" }}>Final Review</h2>
      {selections.map((sc, i) => (
        <div key={i} style={{ border:"1px solid #30363d", padding:12, marginBottom:10, borderRadius:8, background:"#161b22" }}>
          <strong style={{ color:"#58a6ff" }}>{sc.course.code}</strong> — {sc.course.title}<br />
          Credits: <span style={{ color:"#f0883e" }}>{sc.course.credits}</span><br />
          Professor: {sc.teacher || "N/A"}<br />
          Theory Slot: <span style={{ color:"#79c0ff" }}>{sc.theorySlot || "—"}</span><br />
          Lab Slot: <span style={{ color:"#56d364" }}>{sc.labSlot || "—"}</span>
        </div>
      ))}
      <div style={{ marginTop:20, color:"#c9d1d9" }}>
        <label>
          <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)} />
          {" "}I confirm my selections
        </label>
      </div>
      <button
        disabled={!confirmed || isSubmitting}
        style={{ marginTop:20, padding:"10px 20px", background:confirmed && !isSubmitting ? "#238636":"#555", color:"white", border:"none", borderRadius:8, cursor:confirmed && !isSubmitting ? "pointer":"not-allowed" }}
        onClick={onSubmit}>
        {isSubmitting ? "Submitting..." : "Final Submit"}
      </button>
      {submitError && <div style={{ marginTop:12, color:"#ff7b72", fontSize:"0.82rem" }}>{submitError}</div>}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]                   = useState("login");
  const [regNum, setRegNum]               = useState("");
  const [password, setPassword]           = useState("");
  const [timeLeft, setTimeLeft]           = useState(2700);
  const [capText, setCapText]             = useState(genCaptcha);
  const [capInput, setCapInput]           = useState("");
  const [loginErr, setLoginErr]           = useState("");
  const [currentCat, setCurrentCat]       = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [etlPref, setEtlPref]             = useState("MT");
  const [selections, setSelections]       = useState([]);
  const [wishlist, setWishlist]           = useState([]);
  const [backendTTMap, setBackendTTMap] = useState(null);
  const [isFinalized, setIsFinalized]     = useState(false);
  const [creditModal, setCreditModal]     = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (page !== "login" && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [page, timeLeft]);

  const usedCr      = selections.reduce((s, x) => s + x.course.credits, 0);
  const takenTheory = new Set(selections.flatMap(x => x.theorySlot ? [x.theorySlot] : []));
  const takenLab    = new Set(selections.flatMap(x => x.labSlot ? x.labSlot.split("+") : []));

  const clientTTMap = {};
  selections.forEach(sc => {
    const short = sc.course.code.slice(-4);
    if (sc.theorySlot) clientTTMap[sc.theorySlot] = short;
    if (sc.labSlot) sc.labSlot.split("+").forEach(l => { clientTTMap[l] = short; });
  });

  const ttMap = backendTTMap || clientTTMap;

  function refreshCap() { setCapText(genCaptcha()); setCapInput(""); }

  async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function getErrorMessage(res, fallback) {
    const payload = await res.json().catch(() => null);
    return payload?.error || payload?.message || fallback;
  }

  function buildTTMapFromSavedRows(rows) {
    const map = {};
    rows.forEach((r) => {
      const slot = (r?.slotId || "").toString();
      const code = (r?.subjectId || "").toString();
      // Works when slotId is saved as UI slot code (A1, L1, ...).
      if (/^(?:[A-Z]{1,3}\d{1,2}|L\d{1,2})$/.test(slot) && code.length >= 4) {
        map[slot] = code.slice(-4);
      }
    });
    return map;
  }

  async function doLogin() {
    setLoginErr("");
    if (!/^\d{2}[A-Z]{3}\d{4}$/i.test(regNum)) { setLoginErr("Invalid reg. number — e.g. 22BCB0001"); return; }
    if (password.length < 6) { setLoginErr("Password must be at least 6 characters"); return; }
    if (capInput.toUpperCase() !== capText) { setLoginErr("CAPTCHA mismatch — please try again"); refreshCap(); return; }
    try {
      const sessionRes = await fetch(`${REACT_APP_API_URL}/api/users/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNum, password }),
      });
      if (!sessionRes.ok) {
        const err = await sessionRes.json().catch(() => ({}));
        setLoginErr(err.error || "Invalid credentials");
        return;
      }

      const stateRes = await fetch(`${REACT_APP_API_URL}/api/users/state?regNum=${encodeURIComponent(regNum)}`);
      if (stateRes.ok) {
        const payload = await stateRes.json();
        const state = payload?.appState || {};
        if (Array.isArray(state.wishlist)) setWishlist(state.wishlist);
        if (Array.isArray(state.selections)) setSelections(state.selections);
        if (state.ttMap && typeof state.ttMap === "object") setBackendTTMap(state.ttMap);
        if (typeof state.isFinalized === "boolean") setIsFinalized(state.isFinalized);
      } else {
        // Backward compatibility: restore from timetable rows if user state is unavailable.
        const res = await fetch(`${REACT_APP_API_URL}/api/timetable?regNum=${encodeURIComponent(regNum)}`);
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const restoredMap = buildTTMapFromSavedRows(rows);
            if (Object.keys(restoredMap).length > 0) setBackendTTMap(restoredMap);
            setIsFinalized(true);
          }
        }
      }
    } catch (e) {
      console.warn("Could not restore saved state:", e);
    }
    setPage("wishlist");
  }

  useEffect(() => {
    if (page === "login") return;
    fetch(`${REACT_APP_API_URL}/health`).catch(() => {});
  }, [page]);

  function handleLogout() {
    setPage("login"); setSelections([]); setIsFinalized(false); setTimeLeft(2700);
    setRegNum(""); setPassword(""); setCapInput(""); setCapText(genCaptcha()); setLoginErr(""); setCreditModal(null);
    setWishlist([]);
    setBackendTTMap(null);
    setIsSubmittingFinal(false);
    setSubmitError("");
  }

  const isWishlisted = (code) => wishlist.some((w) => w.course.code === code);
  function toggleWishlist(course, cat) {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.course.code === course.code);
      if (exists) return prev.filter((w) => w.course.code !== course.code);
      return [...prev, { course, cat }];
    });
  }
  function beginFacultySelection() {
    if (wishlist.length === 0) {
      alert("Please add at least one course to your wishlist.");
      return;
    }
    setPage("faculty");
  }

  function handleSelectCourse(course, cat) {
    if (course.credits > 0 && usedCr + course.credits > MAX_CR) { setCreditModal(course); return; }
    setCurrentCourse({ course, cat });
    if (course.type === "OC") {
      setSelections(prev => [...prev.filter(x => x.course.code !== course.code), { course, cat, teacher:"Online", theorySlot:null, labSlot:null }]);
      setPage("faculty");
    } else {
      setPage("slots");
    }
  }

  function handleRemove(code) { setSelections(prev => prev.filter(x => x.course.code !== code)); }

  function handleConfirmSlot(teacher, theorySlot, labSlot) {
    setSelections(prev => [
      ...prev.filter(x => x.course.code !== currentCourse.course.code),
      { course: currentCourse.course, cat: currentCourse.cat, teacher, theorySlot, labSlot }
    ]);
    setPage("faculty");
  }
  const handleFinalSubmit = async () => {
    if (isSubmittingFinal) return;

    setIsSubmittingFinal(true);
    setSubmitError("");

    try {
      setBackendTTMap(null);

      const res = await fetchWithTimeout(`${REACT_APP_API_URL}/api/timetable/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ selections }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Could not generate timetable"));
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Error generating timetable");
      }

      const nextTtMap = data.ttMap || {};
      setBackendTTMap(nextTtMap);
      setIsFinalized(true);
      setPage("timetable");

      Promise.allSettled([
        fetchWithTimeout(`${REACT_APP_API_URL}/api/timetable/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regNum, timetable: data.timetable || [] }),
        }, 15000),
        fetchWithTimeout(`${REACT_APP_API_URL}/api/users/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            regNum,
            wishlist,
            selections,
            ttMap: nextTtMap,
            isFinalized: true,
          }),
        }, 15000),
      ]).then((results) => {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.warn(index === 0 ? "Timetable save failed:" : "User state save failed:", result.reason);
          }
        });
      });
    } catch (err) {
      console.error("ERROR:", err);
      const message = err.name === "AbortError"
        ? "Backend took too long to respond. Render may be waking up, so please try again in a few seconds."
        : (err.message || "Backend connection failed");
      setSubmitError(message);
      alert(message);
    } finally {
      setIsSubmittingFinal(false);
    }
  };
  const catCount = cat => selections.filter(x => x.cat === cat).length;

  return (
    <div style={{ background:"#0d1117", minHeight:"100vh", color:"#c9d1d9", fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {creditModal && <CreditLimitModal course={creditModal} usedCr={usedCr} onClose={() => setCreditModal(null)} />}

      {/* LOGIN */}
      {page === "login" && (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
          background:"radial-gradient(ellipse at 60% 10%,rgba(88,166,255,0.09) 0%,transparent 55%),radial-gradient(ellipse at 10% 90%,rgba(124,92,252,0.08) 0%,transparent 45%),#0d1117" }}>
          <div style={{ width:"100%", maxWidth:420, padding:20 }}>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ fontFamily:"monospace", fontSize:"2.8rem", fontWeight:700, color:"#58a6ff", letterSpacing:"0.12em", lineHeight:1 }}>FFCS</div>
              <div style={{ color:"#484f58", fontSize:"0.82rem", marginTop:8 }}>Fully Flexible Credit System · VIT Vellore</div>
            </div>
            <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:16, padding:36, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize:"1.25rem", fontWeight:700, marginBottom:4 }}>Student Sign In</div>
              <div style={{ color:"#8b949e", fontSize:"0.83rem", marginBottom:26 }}>Enter your VIT credentials to begin course registration</div>
              <FInput label="Registration Number" value={regNum} onChange={e => setRegNum(e.target.value.toUpperCase())} placeholder="e.g. 22BCB0001" maxLength={10} />
              <FInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && doLogin()} />
              <div style={{ marginBottom:18 }}>
                <label style={labelStyle}>CAPTCHA</label>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ background:"#0d1117", border:"1px solid #30363d", borderRadius:10, padding:"8px 14px", flex:1 }}>
                    <CaptchaCanvas text={capText} />
                  </div>
                  <button style={{ background:"#161b22", border:"1px solid #30363d", color:"#8b949e", padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:"1.1rem" }} onClick={refreshCap}>↺</button>
                </div>
                <input style={{ ...inputStyle, marginTop:8 }} value={capInput} onChange={e => setCapInput(e.target.value.toUpperCase())} placeholder="Type characters above" maxLength={6} />
              </div>
              {loginErr && <div style={{ color:"#ff7b72", fontSize:"0.8rem", textAlign:"center", marginBottom:12 }}>{loginErr}</div>}
              <button style={btnPrimary} onClick={doLogin}>Sign In →</button>
            </div>
          </div>
        </div>
      )}

      {/* COURSES */}
      {page === "courses" && (
        <div>
          <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={handleLogout} />
          <div style={pageWrap}>
            <PageHeader title="Course Registration" sub={`Select courses by category · Max ${MAX_CR} credits`} />
            <div style={{ display:"flex", gap:0, background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden", marginBottom:28 }}>
              {[["Credits Used",usedCr,"#58a6ff"],["Max Credits",MAX_CR,"#c9d1d9"],["Courses",selections.length,"#3fb950"],["Remaining",MAX_CR-usedCr,"#f0883e"]].map(([l,v,c],i) => (
                <div key={i} style={{ flex:1, padding:"16px 20px", borderRight:i<3?"1px solid #21262d":"none" }}>
                  <div style={{ fontSize:"0.7rem", color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:"1.5rem", fontWeight:800, fontFamily:"monospace", color:c }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:12, marginBottom:28 }}>
              {Object.entries(CAT_INFO).map(([cat, info]) => {
                const courses = COURSES[cat];
                const totalCr = courses.reduce((s, c) => s + c.credits, 0);
                const cnt     = catCount(cat);
                return (
                  <div key={cat}
                    style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:14, padding:"20px 18px", cursor:"pointer", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = info.color+"66"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
                    onClick={() => { setCurrentCat(cat); setPage("subjects"); }}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:info.color }} />
                    <div style={{ fontSize:"1.7rem", marginBottom:10 }}>{info.emoji}</div>
                    <div style={{ fontSize:"0.85rem", fontWeight:700, marginBottom:3 }}>{info.label}</div>
                    <div style={{ fontSize:"0.75rem", color:"#8b949e", marginBottom:10 }}>Total credits: {totalCr}</div>
                    <div style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:"0.7rem", fontWeight:600, fontFamily:"monospace", background:info.color+"22", color:info.color }}>
                      {cnt > 0 ? `${cnt} selected` : `${courses.length} courses`}
                    </div>
                  </div>
                );
              })}
            </div>

            {selections.length > 0 && (
              <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, padding:20, marginBottom:20 }}>
                <div style={{ fontSize:"0.72rem", color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Selected Courses</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
                  {selections.map(sc => (
                    <div key={sc.course.code} style={{ background:"#0d1117", border:"1px solid #30363d", borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:8, fontSize:"0.8rem" }}>
                      <span style={{ fontFamily:"monospace", fontSize:"0.72rem", color:"#58a6ff" }}>{sc.course.code}</span>
                      <span style={{ color:"#e6edf3", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sc.course.title}</span>
                      <span style={{ color:"#f0883e", fontWeight:700, fontFamily:"monospace" }}>{sc.course.credits}cr</span>
                      <span style={{ color:"#f85149", cursor:"pointer", fontSize:"0.75rem" }} onClick={() => handleRemove(sc.course.code)}>✕</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button style={{ ...btnPrimary, width:"auto", padding:"9px 22px", fontSize:"0.88rem", background:"linear-gradient(135deg,#238636,#1a6e2e)" }} onClick={() => setPage("timetable")}>View My Timetable →</button>
                  <button style={{ background:"#30363d", color:"#fff", padding:"9px 22px", borderRadius:8, border:"none", cursor:"pointer" }} onClick={() => setPage("final")}>Done Selecting →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST */}
      {page === "wishlist" && (
        <div>
          <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={handleLogout} />
          <div style={pageWrap}>
            <PageHeader title="Build Your Wishlist" sub="First choose courses, then select faculty/slots only for these courses." />
            {Object.entries(CAT_INFO).map(([cat, info]) => (
              <div key={cat} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span>{info.emoji}</span>
                  <span style={{ fontWeight:700, color:info.color }}>{info.label}</span>
                  <span style={{ color:"#8b949e", fontSize:"0.76rem" }}>({COURSES[cat].length} courses)</span>
                  <span style={{ marginLeft:"auto", color:"#8b949e", fontSize:"0.74rem" }}>
                    {wishlist.filter((w) => w.cat === cat).length} selected
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                  {COURSES[cat].map((course) => {
                    const sel = isWishlisted(course.code);
                    return (
                      <div key={course.code} style={{ background:"#161b22", border:`1px solid ${sel ? "#3fb950" : "#21262d"}`, borderRadius:12, padding:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <TypeBadge type={course.type} />
                          <span style={{ fontFamily:"monospace", fontSize:"0.75rem", color:"#8b949e" }}>{cat}</span>
                        </div>
                        <div style={{ fontSize:"0.84rem", fontWeight:700, marginBottom:4 }}>{course.title}</div>
                        <div style={{ fontFamily:"monospace", fontSize:"0.72rem", color:"#58a6ff", marginBottom:8 }}>{course.code}</div>
                        <div style={{ fontSize:"0.73rem", color:"#8b949e", marginBottom:12 }}>Credits: {course.credits}</div>
                        <button
                          onClick={() => toggleWishlist(course, cat)}
                          style={sel ? btnSel : btnAct}
                        >
                          {sel ? "✓ Wishlisted" : "Add to Wishlist"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:"#8b949e", fontSize:"0.82rem" }}>{wishlist.length} course(s) in wishlist</span>
              <button style={{ ...btnPrimary, width:"auto", padding:"10px 20px" }} onClick={beginFacultySelection}>
                Continue to Faculty Selection →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY SUBJECT LIST (from wishlist) */}
      {page === "faculty" && (
        <div>
          <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={handleLogout} />
          <div style={pageWrap}>
            <button style={backBtnStyle} onClick={() => setPage("wishlist")}>← Back to Wishlist</button>
            <PageHeader title="Faculty Selection" sub="Select faculty and slots only for your wishlisted courses." />
            <div style={{ overflowX:"auto", borderRadius:12, border:"1px solid #21262d", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.86rem" }}>
                <thead>
                  <tr style={{ background:"#161b22" }}>
                    {["S.No","Code","Title","Type","L","T","P","J","Credits",""].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"0.7rem", color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #21262d", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wishlist.map(({ course, cat }, i) => {
                    const isSel = selections.some(x => x.course.code === course.code);
                    const wouldOvr = course.credits > 0 && !isSel && usedCr + course.credits > MAX_CR;
                    return (
                      <tr key={course.code} style={{ borderBottom:"1px solid #161b22", background:isSel?"rgba(63,185,80,0.05)":"transparent" }}>
                        <td style={td}>{i+1}</td>
                        <td style={{ ...td, fontFamily:"monospace", fontSize:"0.77rem", color:"#58a6ff" }}>{course.code}</td>
                        <td style={{ ...td, fontWeight:600, maxWidth:240 }}>
                          {course.title}
                          {wouldOvr && <span style={{ marginLeft:8, fontSize:"0.65rem", color:"#f85149", background:"rgba(248,81,73,0.1)", border:"1px solid rgba(248,81,73,0.25)", padding:"1px 7px", borderRadius:5, verticalAlign:"middle" }}>+{course.credits}cr over limit</span>}
                        </td>
                        <td style={td}><TypeBadge type={course.type} /></td>
                        {[course.L,course.T,course.P,course.J].map((v,k) => (
                          <td key={k} style={{ ...td, textAlign:"center", fontFamily:"monospace", color:"#8b949e" }}>{v}</td>
                        ))}
                        <td style={{ ...td, textAlign:"center", fontFamily:"monospace", fontWeight:700, color:"#f0883e" }}>{course.credits}</td>
                        <td style={td}>
                          {isSel
                            ? <button style={btnSel} onClick={() => handleRemove(course.code)}>✓ Remove</button>
                            : <button style={btnAct} onClick={() => handleSelectCourse(course, cat)}>{course.type === "OC" ? "Add →" : "Choose Slot →"}</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selections.length > 0 && (
              <div style={{ marginTop:20, display:"flex", gap:10, flexWrap:"wrap" }}>
                <button style={{ ...btnPrimary, width:"auto", padding:"9px 22px", fontSize:"0.88rem", background:"linear-gradient(135deg,#238636,#1a6e2e)" }} onClick={() => setPage("timetable")}>View My Timetable →</button>
                <button style={{ background:"#30363d", color:"#fff", padding:"9px 22px", borderRadius:8, border:"none", cursor:"pointer" }} onClick={() => setPage("final")}>Done Selecting →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBJECTS */}
      {page === "subjects" && currentCat && (
        <div>
          <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={handleLogout} />
          <div style={pageWrap}>
            <button style={backBtnStyle} onClick={() => setPage("courses")}>← Back</button>
            <PageHeader title={`${CAT_INFO[currentCat].emoji} ${CAT_INFO[currentCat].label}`} sub="Click a course row to choose faculty and slots" />
            <div style={{ overflowX:"auto", borderRadius:12, border:"1px solid #21262d", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.86rem" }}>
                <thead>
                  <tr style={{ background:"#161b22" }}>
                    {["S.No","Code","Title","Type","L","T","P","J","Credits",""].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"0.7rem", color:"#8b949e", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #21262d", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COURSES[currentCat].map((course, i) => {
                    const isSel    = selections.some(x => x.course.code === course.code);
                    const wouldOvr = course.credits > 0 && !isSel && usedCr + course.credits > MAX_CR;
                    return (
                      <tr key={course.code}
                        style={{ borderBottom:"1px solid #161b22", background:isSel?"rgba(63,185,80,0.05)":"transparent", cursor:"pointer" }}
                        onMouseEnter={e => !isSel && (e.currentTarget.style.background="#161b22")}
                        onMouseLeave={e => !isSel && (e.currentTarget.style.background="transparent")}>
                        <td style={td}>{i+1}</td>
                        <td style={{ ...td, fontFamily:"monospace", fontSize:"0.77rem", color:"#58a6ff" }}>{course.code}</td>
                        <td style={{ ...td, fontWeight:600, maxWidth:240 }}>
                          {course.title}
                          {wouldOvr && <span style={{ marginLeft:8, fontSize:"0.65rem", color:"#f85149", background:"rgba(248,81,73,0.1)", border:"1px solid rgba(248,81,73,0.25)", padding:"1px 7px", borderRadius:5, verticalAlign:"middle" }}>+{course.credits}cr over limit</span>}
                        </td>
                        <td style={td}><TypeBadge type={course.type} /></td>
                        {[course.L,course.T,course.P,course.J].map((v,k) => (
                          <td key={k} style={{ ...td, textAlign:"center", fontFamily:"monospace", color:"#8b949e" }}>{v}</td>
                        ))}
                        <td style={{ ...td, textAlign:"center", fontFamily:"monospace", fontWeight:700, color:"#f0883e" }}>{course.credits}</td>
                        <td style={td}>
                          {isSel
                            ? <button style={btnSel} onClick={e => { e.stopPropagation(); handleRemove(course.code); }}>✓ Remove</button>
                            : <button style={btnAct} onClick={e => { e.stopPropagation(); handleSelectCourse(course, currentCat); }}>{course.type === "OC" ? "Add →" : "Choose Slot →"}</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SLOT SELECTION */}
      {page === "slots" && currentCourse && (
        <SlotPage
          key={currentCourse.course.code}
          course={currentCourse.course}
          etlPref={etlPref}
          setEtlPref={setEtlPref}
          takenTheory={takenTheory}
          takenLab={takenLab}
          usedCr={usedCr}
          ttMap={ttMap}
          selections={selections}
          wishlist={wishlist}
          regNum={regNum}
          timeLeft={timeLeft}
          onBack={() => setPage("faculty")}
          onConfirm={handleConfirmSlot}
          onLogout={handleLogout}
        />
      )}

      {/* TIMETABLE */}
      {page === "timetable" && (
        <TimetableView
          selections={selections}
          ttMap={ttMap}
          regNum={regNum}
          usedCr={usedCr}
          timeLeft={timeLeft}
          onBack={() => { if (!isFinalized) setPage("faculty"); }}
          isFinalized={isFinalized}
          goHome={() => setPage("home")}
          onLogout={handleLogout}
        />
      )}

      {/* FINAL REVIEW */}

    {/* FINAL REVIEW */}
{page === "final" && (
  <FinalPage
    selections={selections}
    onSubmit={handleFinalSubmit}
    isSubmitting={isSubmittingFinal}
    submitError={submitError}
  />
)}


      {/* HOME */}
      {page === "home" && (
        <div>
          <Topbar regNum={regNum} used={usedCr} max={MAX_CR} timeLeft={timeLeft} onLogout={handleLogout} />
          <div style={{ padding:30 }}>
            <h2 style={{ color:"#e6edf3" }}>🏠 Home</h2>
            <p style={{ color:"#8b949e" }}>Your timetable has already been generated.</p>
            <button style={{ marginTop:20, padding:"10px 20px", background:"#1f6feb", color:"white", border:"none", borderRadius:8, cursor:"pointer" }} onClick={() => setPage("timetable")}>View Timetable</button>
          </div>
        </div>
      )}

      <div style={{ position:"fixed", bottom:20, right:20, padding:"8px 16px", borderRadius:30, fontSize:"0.75rem", color:"#58a6ff", fontFamily:"monospace", background:"linear-gradient(135deg,rgba(88,166,255,0.15),rgba(124,92,252,0.15))", border:"1px solid rgba(88,166,255,0.3)", boxShadow:"0 0 12px rgba(88,166,255,0.2)", backdropFilter:"blur(6px)" }}>
        🚀 Team Trio
      </div>
    </div>
  );
}
