const { useState, useEffect, useRef, useCallback } = React;

// ─── EXERCISE DATABASE ────────────────────────────────────────────────────────
const EXERCISE_DB = [
  { id: "e12", name: "Running",           category: "HIIT",         type: "hiit",  icon: "🏃",  custom: false },
  { id: "e1",  name: "Bench Press",       category: "Musculation",  type: "reps",  icon: "🤲",  custom: false },
  { id: "e2",  name: "Squat",             category: "Musculation",  type: "reps",  icon: "🦵",  custom: false },
  { id: "e3",  name: "Deadlift",          category: "Musculation",  type: "reps",  icon: "🏋️", custom: false },
  { id: "e4",  name: "Shoulder Press",    category: "Musculation",  type: "reps",  icon: "🙆",  custom: false },
  { id: "e5",  name: "Barbell Row",       category: "Musculation",  type: "reps",  icon: "🏋️", custom: false },
  { id: "e6",  name: "Bicep Curl",        category: "Musculation",  type: "reps",  icon: "💪",  custom: false },
  { id: "e7",  name: "Tricep Extension",  category: "Musculation",  type: "reps",  icon: "💪",  custom: false },
  { id: "e8",  name: "Leg Press",         category: "Musculation",  type: "reps",  icon: "🦵",  custom: false },
  { id: "e9",  name: "Burpees",           category: "HIIT",         type: "hiit",  icon: "🔥",  custom: false },
  { id: "e10", name: "Jump Squats",       category: "HIIT",         type: "hiit",  icon: "🔥",  custom: false },
  { id: "e11", name: "Mountain Climbers", category: "HIIT",         type: "hiit",  icon: "⛰️", custom: false },
  { id: "e13", name: "Box Jumps",         category: "HIIT",         type: "hiit",  icon: "📦",  custom: false },
  { id: "e14", name: "Jumping Jacks",     category: "HIIT",         type: "hiit",  icon: "⚡",  custom: false },
  { id: "e15", name: "Pull-up",           category: "Calisthenics", type: "reps",  icon: "➖",  custom: false },
  { id: "e16", name: "Muscle-up",         category: "Calisthenics", type: "reps",  icon: "➖",  custom: false },
  { id: "e17", name: "L-sit",             category: "Calisthenics", type: "time",  icon: "🟰",  custom: false },
  { id: "e18", name: "Ring Dips",         category: "Calisthenics", type: "reps",  icon: "⭕",  custom: false },
  { id: "e19", name: "Ring Row",          category: "Calisthenics", type: "reps",  icon: "⭕",  custom: false },
  { id: "e20", name: "Front Lever",       category: "Calisthenics", type: "time",  icon: "➖",  custom: false },
  { id: "e21", name: "Back Lever",        category: "Calisthenics", type: "time",  icon: "➖",  custom: false },
  { id: "e22", name: "Bar Hang",          category: "Calisthenics", type: "time",  icon: "➖",  custom: false },
  { id: "e23", name: "Push-up",           category: "Bodyweight",   type: "reps",  icon: "🤲",  custom: false },
  { id: "e24", name: "Dips",              category: "Bodyweight",   type: "reps",  icon: "🤲",  custom: false },
  { id: "e25", name: "Plank",             category: "Bodyweight",   type: "time",  icon: "🧱",  custom: false },
  { id: "e26", name: "Hollow Hold",       category: "Bodyweight",   type: "time",  icon: "🧱",  custom: false },
  { id: "e27", name: "Pistol Squat",      category: "Bodyweight",   type: "reps",  icon: "🦵",  custom: false },
  { id: "e28", name: "Nordic Curl",       category: "Bodyweight",   type: "reps",  icon: "🦵",  custom: false },
  { id: "e29", name: "Handstand Hold",    category: "Bodyweight",   type: "time",  icon: "🤸",  custom: false },
  { id: "e30", name: "Glute Bridge",      category: "Bodyweight",   type: "reps",  icon: "🍑",  custom: false },
];

const CATEGORIES = ["Tous", "Musculation", "HIIT", "Calisthenics", "Bodyweight"];
const TYPES      = ["reps", "time", "hiit"];
const ICON_POOL  = ["💪","🦵","🤲","🏋️","🙆","🧱","🤸","🏃","🔥","⛰️","📦","⚡","➖","🟰","⭕","🍑","🧠","🫀","🦴","🔱","🎯","🏅","⚙️","🌊"];

const CAT_COLORS = {
  Musculation:  { bg: "#FF6B3520", text: "#FF6B35", border: "#FF6B3540" },
  HIIT:         { bg: "#FF003320", text: "#FF0033", border: "#FF003340" },
  Calisthenics: { bg: "#00D9FF20", text: "#00D9FF", border: "#00D9FF40" },
  Bodyweight:   { bg: "#7FFF0020", text: "#7FFF00", border: "#7FFF0040" },
};

function makeSet(type) {
  if (type === "hiit") return { work: 40, rest: 20, rounds: 8 };
  if (type === "time") return { duration: 30, rest: 60, sets: 3 };
  return { reps: 10, weight: 0, rest: 90, sets: 3 };
}

function uid() { return Math.random().toString(36).slice(2, 9); }
function load(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function persist(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// speak without cancelling ongoing speech — fire and forget
function speakQ(text, lang = "fr-FR") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = lang;
  u.rate  = 1.6; // 1.4 si trop rapide
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

// speak and wait (used only for launch countdown)
function speak(text, lang = "fr-FR") {
  return new Promise(resolve => {
    if (!window.speechSynthesis) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 1.3; u.pitch = 1;
    u.onend = resolve; u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

// ─── SESSION BUILDER ──────────────────────────────────────────────────────────
// Steps: only "launch" (initial countdown screen) + "timer" (work/rest) + "reps" + "done"
function buildSteps(items) {
  const steps = [];

  // flatten items into timer/reps steps
  const timerSteps = [];
  items.forEach((item, idx) => {
    const ex  = item.exercise;
    const cfg = item.config;
    const name = item.label ?? ex.name;
    const isLast = idx === items.length - 1;

    if (ex.type === "hiit") {
      for (let r = 0; r < cfg.rounds; r++) {
        const nextIsRest = r < cfg.rounds - 1 || !isLast;
        timerSteps.push({ kind: "timer", phase: "work", label: "TRAVAIL", sublabel: name, icon: "🔥", duration: cfg.work, nextAnnounce: nextIsRest ? "Récupération" : null });
        if (nextIsRest) {
          // figure out what comes after rest
          const isLastRound = r === cfg.rounds - 1;
          const nextName = isLastRound ? (items[idx + 1] ? (items[idx + 1].label ?? items[idx + 1].exercise.name) : null) : name;
          timerSteps.push({ kind: "timer", phase: "rest", label: "RÉCUPÉRATION", sublabel: name, icon: "😮‍💨", duration: cfg.rest, nextAnnounce: nextName ?? "Travail" });
        }
      }
    } else if (ex.type === "time") {
      for (let s = 0; s < cfg.sets; s++) {
        const nextIsRest = s < cfg.sets - 1 || !isLast;
        timerSteps.push({ kind: "timer", phase: "work", label: name, sublabel: `Série ${s + 1} / ${cfg.sets}`, icon: ex.icon, duration: cfg.duration, nextAnnounce: nextIsRest ? "Récupération" : null });
        if (nextIsRest) {
          const isLastSet = s === cfg.sets - 1;
          const nextName = isLastSet ? (items[idx + 1] ? (items[idx + 1].label ?? items[idx + 1].exercise.name) : null) : name;
          timerSteps.push({ kind: "timer", phase: "rest", label: "RÉCUPÉRATION", sublabel: name, icon: "😮‍💨", duration: cfg.rest, nextAnnounce: nextName ?? name });
        }
      }
    } else {
      timerSteps.push({ kind: "reps", label: name, icon: ex.icon, config: cfg });
    }
  });

  // first step: launch countdown screen, knows first exercise name
  const firstName = items.length > 0 ? (items[0].label ?? items[0].exercise.name) : "Go";
  steps.push({ kind: "launch", firstName });
  timerSteps.forEach(s => steps.push(s));
  steps.push({ kind: "done" });
  return steps;
}

// ─── SESSION SCREEN ───────────────────────────────────────────────────────────
function SessionScreen({ items, onClose }) {
  const steps    = useRef(buildSteps(items));
  const [stepIdx,    setStepIdx]    = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(null);
  const [cdN,        setCdN]        = useState(null); // launch countdown display
  const [launching,  setLaunching]  = useState(true); // showing launch screen
  const abortRef  = useRef(false);
  const timerRef  = useRef(null);
  const spokenRef = useRef(false); // guard: only speak countdown once per step

  const step = steps.current[stepIdx];

  // Progress
  const timerSteps = steps.current.filter(s => s.kind === "timer");
  const doneTSteps = steps.current.slice(0, stepIdx).filter(s => s.kind === "timer").length;
  const progress   = timerSteps.length > 0 ? doneTSteps / timerSteps.length : 0;

  // ── launch countdown then jump to first real step
  async function startSession() {
    abortRef.current = false;
    window.speechSynthesis.cancel();
    const firstName = steps.current[0].firstName;
    await speak(firstName);
    if (abortRef.current) return;
    await new Promise(resolve => {
      [5, 4, 3, 2, 1].forEach((n, i) => {
        setTimeout(() => {
          if (abortRef.current) return;
          setCdN(n);
          speakQ(String(n));
          if (n === 1) setTimeout(resolve, 900);
        }, i * 1000);
      });
    });
    if (abortRef.current) return;
    speakQ("Travail");
    await new Promise(r => setTimeout(r, 600));
    if (abortRef.current) return;
    setCdN(null);
    setLaunching(false);
    runStep(1);
  }

  // ── run a step by index
  function runStep(idx) {
    if (abortRef.current) return;
    const s = steps.current[idx];
    if (!s) return;
    setStepIdx(idx);
    spokenRef.current = false;

    if (s.kind === "timer") {
      setTimeLeft(s.duration);
      let t = s.duration;
      timerRef.current = setInterval(() => {
        if (abortRef.current) { clearInterval(timerRef.current); return; }
        t--;
        setTimeLeft(t);

        // Vocal countdown on last 5 seconds — exactly 1s per digit
        if (t === 5 && !spokenRef.current && s.nextAnnounce) {
          spokenRef.current = true;
          [5, 4, 3, 2, 1].forEach((n, i) => {
            setTimeout(() => { if (!abortRef.current) speakQ(String(n)); }, i * 1000);
          });
          setTimeout(() => { if (!abortRef.current && s.nextAnnounce) speakQ(s.nextAnnounce); }, 5000);
        }

        if (t <= 0) {
          clearInterval(timerRef.current);
          runStep(idx + 1);
        }
      }, 1000);

    } else if (s.kind === "reps") {
      setTimeLeft(null);
      speakQ(s.label);

    } else if (s.kind === "done") {
      setTimeLeft(null);
      speakQ("Workout terminé, bravo !");
    }
  }

  function skip() {
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    spokenRef.current = true;
    const next = stepIdx + 1;
    if (steps.current[next]) runStep(next);
  }

  function stop() {
    abortRef.current = true;
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    onClose();
  }

  useEffect(() => () => {
    abortRef.current = true;
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
  }, []);

  const isTimer = step?.kind === "timer";
  const isReps  = step?.kind === "reps";
  const isDone  = step?.kind === "done";
  const isWork  = step?.phase === "work";
  const isRest  = step?.phase === "rest";
  const accent  = isRest ? "#00D9FF" : isWork ? "#FF0033" : isDone ? "#e8ff47" : "#e8ff47";

  const radius  = 90;
  const circ    = 2 * Math.PI * radius;
  const dashOff = isTimer && timeLeft !== null ? circ * (timeLeft / step.duration) : circ;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#080808", zIndex: 300, display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #1a1a1a" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: 2 }}>
          {isDone ? "Terminé" : launching ? "Démarrage" : `${doneTSteps} / ${timerSteps.length}`}
        </span>
        <button onClick={stop} style={{ background: "none", border: "1px solid #fff", borderRadius: 6, color: "#fff", padding: "4px 12px", cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>Arrêter</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#1a1a1a" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: accent, transition: "width .5s" }} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>

        {/* ── LAUNCH SCREEN ── */}
        {launching && (
          <div style={{ textAlign: "center" }}>
            {cdN === null ? (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Prêt ?</div>
                <div style={{ fontSize: 12, color: "#444", fontFamily: "'Space Mono', monospace", marginBottom: 32 }}>
                  {items.length} exercices · {timerSteps.length} blocs chrono
                </div>
                <button onClick={startSession} style={{ padding: "16px 48px", borderRadius: 12, border: "none", background: "#e8ff47", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
                  DÉMARRER
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#555", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 3, marginBottom: 20 }}>
                  {steps.current[0].firstName}
                </div>
                <div style={{ fontSize: 140, fontWeight: 900, color: "#e8ff47", fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{cdN}</div>
              </>
            )}
          </div>
        )}

        {/* ── TIMER ── */}
        {!launching && isTimer && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: accent, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>
              {step.label}
            </div>
            <div style={{ fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", marginBottom: 24 }}>
              {step.sublabel}
            </div>
            <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
              <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="8" />
                <circle cx="110" cy="110" r={radius} fill="none" stroke={accent} strokeWidth="8"
                  strokeDasharray={circ} strokeDashoffset={dashOff}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: "#fff", fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{timeLeft}</div>
                <div style={{ fontSize: 12, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>sec</div>
              </div>
            </div>
            {step.nextAnnounce && (
              <div style={{ marginTop: 16, fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 2 }}>
                Suivant → {step.nextAnnounce}
              </div>
            )}
            <button onClick={skip} style={{ marginTop: 24, padding: "10px 28px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#444", fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
              Passer →
            </button>
          </div>
        )}

        {/* ── REPS ── */}
        {!launching && isReps && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{step.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{step.label}</div>
            <div style={{ fontSize: 13, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>
              {step.config.sets} × {step.config.reps} reps{step.config.weight > 0 ? ` · ${step.config.weight}kg` : ""}
            </div>
            <div style={{ fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", marginBottom: 32 }}>Repos : {step.config.rest}s</div>
            <button onClick={skip} style={{ padding: "12px 32px", borderRadius: 10, border: "1px solid #e8ff4740", background: "#e8ff4710", color: "#e8ff47", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
              Suivant →
            </button>
          </div>
        )}

        {/* ── DONE ── */}
        {isDone && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#e8ff47", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Workout terminé !</div>
            <div style={{ fontSize: 12, color: "#444", fontFamily: "'Space Mono', monospace", marginBottom: 40 }}>{items.length} exercices complétés</div>
            <button onClick={stop} style={{ padding: "14px 40px", borderRadius: 10, border: "none", background: "#e8ff47", color: "#000", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ cat, custom }) {
  const c = custom ? { bg: "#e8ff4720", text: "#e8ff47", border: "#e8ff4740" } : (CAT_COLORS[cat] || {});
  return (
    <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 1, padding: "2px 7px", borderRadius: 3, background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "uppercase" }}>
      {custom ? "custom" : cat}
    </span>
  );
}

const btnSmall = { width: 24, height: 24, borderRadius: 4, border: "1px solid #333", background: "#1a1a1a", color: "#aaa", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 };

function NumInput({ value, onChange, min = 0, max = 999, step = 1, unit, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {label && <span style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Space Mono', monospace" }}>{label}</span>}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={btnSmall}>−</button>
        <span style={{ minWidth: 32, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + step))} style={btnSmall}>+</button>
      </div>
      {unit && <span style={{ fontSize: 9, color: "#555", fontFamily: "'Space Mono', monospace" }}>{unit}</span>}
    </div>
  );
}

function ExerciseCard({ ex, onAdd, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "#111", border: `1px solid ${ex.custom ? "#e8ff4725" : "#222"}`, marginBottom: 6, transition: "border-color .15s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = ex.custom ? "#e8ff4760" : "#444"}
      onMouseLeave={e => e.currentTarget.style.borderColor = ex.custom ? "#e8ff4725" : "#222"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{ex.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#eee", fontFamily: "'DM Sans', sans-serif" }}>{ex.name}</div>
          <Badge cat={ex.category} custom={ex.custom} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {ex.custom && <button onClick={() => onDelete(ex.id)} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 5, color: "#444", cursor: "pointer", fontSize: 12, padding: "2px 6px" }}>🗑</button>}
        <button onClick={() => onAdd(ex)} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#e8ff47", color: "#000", fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
    </div>
  );
}

function WorkoutExercise({ item, onRemove, onUpdate, onDragStart, onDragOver, onDrop, isDragging }) {
  const { exercise: ex, config } = item;
  const isHIIT = ex.type === "hiit";
  const isTime = ex.type === "time";
  const [editingLabel, setEditingLabel] = useState(false);
  const label = item.label ?? ex.name;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={e => { e.preventDefault(); onDragOver(item.id); }}
      onDrop={() => onDrop(item.id)}
      style={{ borderRadius: 10, border: `1px solid ${isDragging ? "#e8ff4760" : "#2a2a2a"}`, background: "#0f0f0f", marginBottom: 10, overflow: "hidden", opacity: isDragging ? 0.45 : 1, transition: "opacity .15s, border-color .15s" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#151515", borderBottom: "1px solid #222" }}>
        <span style={{ fontSize: 16, color: "#2a2a2a", marginRight: 6, cursor: "grab", userSelect: "none", flexShrink: 0 }}>⠿</span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{ex.icon}</span>
          {editingLabel ? (
            <input autoFocus value={label}
              onChange={e => onUpdate(item.id, { label: e.target.value })}
              onBlur={() => setEditingLabel(false)}
              onKeyDown={e => e.key === "Enter" && setEditingLabel(false)}
              style={{ background: "none", border: "none", borderBottom: "1px solid #e8ff47", color: "#fff", fontSize: 13, fontWeight: 700, outline: "none", flex: 1, minWidth: 0, fontFamily: "'DM Sans', sans-serif" }}
            />
          ) : (
            <span onClick={() => setEditingLabel(true)} title="Cliquer pour renommer"
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", cursor: "text", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
              {label !== ex.name && <span style={{ fontSize: 10, color: "#444", marginLeft: 6, fontFamily: "'Space Mono', monospace" }}>({ex.name})</span>}
            </span>
          )}
          <Badge cat={ex.category} custom={ex.custom} />
        </div>
        <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>×</button>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {isHIIT && (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <NumInput label="Travail" value={config.work}   onChange={v => onUpdate(item.id, { work: v })}   min={5} step={5} unit="sec" />
            <NumInput label="Repos"   value={config.rest}   onChange={v => onUpdate(item.id, { rest: v })}   min={0} step={5} unit="sec" />
            <NumInput label="Rounds"  value={config.rounds} onChange={v => onUpdate(item.id, { rounds: v })} min={1} />
          </div>
        )}
        {isTime && (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <NumInput label="Durée"  value={config.duration} onChange={v => onUpdate(item.id, { duration: v })} min={5} step={5} unit="sec" />
            <NumInput label="Repos"  value={config.rest}     onChange={v => onUpdate(item.id, { rest: v })}     min={0} step={5} unit="sec" />
            <NumInput label="Séries" value={config.sets}     onChange={v => onUpdate(item.id, { sets: v })}     min={1} />
          </div>
        )}
        {!isHIIT && !isTime && (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <NumInput label="Séries" value={config.sets}   onChange={v => onUpdate(item.id, { sets: v })}   min={1} />
            <NumInput label="Reps"   value={config.reps}   onChange={v => onUpdate(item.id, { reps: v })}   min={1} />
            <NumInput label="Poids"  value={config.weight} onChange={v => onUpdate(item.id, { weight: v })} min={0} step={2.5} unit="kg" />
            <NumInput label="Repos"  value={config.rest}   onChange={v => onUpdate(item.id, { rest: v })}   min={0} step={5}   unit="sec" />
          </div>
        )}
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#555", background: "#1a1a1a", padding: "3px 10px", borderRadius: 20, border: "1px solid #222" }}>
            {isHIIT  && `${config.rounds} × ${config.work}s / ${config.rest}s repos`}
            {isTime  && `${config.sets} × ${config.duration}s  •  repos ${config.rest}s`}
            {!isHIIT && !isTime && `${config.sets} × ${config.reps} reps${config.weight > 0 ? ` @${config.weight}kg` : ""}  •  repos ${config.rest}s`}
          </span>
        </div>
      </div>
    </div>
  );
}

function CreateExerciseModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [cat,  setCat]  = useState("Bodyweight");
  const [type, setType] = useState("reps");
  const [icon, setIcon] = useState("🎯");
  function submit() {
    if (!name.trim()) return;
    onCreate({ id: "c_" + uid(), name: name.trim(), category: cat, type, icon, custom: true });
    onClose();
  }
  const label = { fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Space Mono', monospace", display: "block", marginBottom: 6 };
  const inp   = { width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 7, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
  const pill  = (a) => ({ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: a ? "#e8ff47" : "#2a2a2a", background: a ? "#e8ff4715" : "transparent", color: a ? "#e8ff47" : "#555", fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all .15s" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 430, background: "#0f0f0f", borderRadius: "16px 16px 0 0", border: "1px solid #2a2a2a", padding: "20px 20px 36px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Nouvel exercice</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={label}>Nom</span>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Typewriter Pull-up" autoFocus onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={label}>Catégorie</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{CATEGORIES.filter(c => c !== "Tous").map(c => <button key={c} style={pill(cat === c)} onClick={() => setCat(c)}>{c}</button>)}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={label}>Type</span>
          <div style={{ display: "flex", gap: 6 }}>{TYPES.map(t => <button key={t} style={pill(type === t)} onClick={() => setType(t)}>{t === "reps" ? "Reps" : t === "time" ? "Durée" : "HIIT"}</button>)}</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <span style={label}>Icône — sélectionnée : {icon}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ICON_POOL.map(ic => <button key={ic} onClick={() => setIcon(ic)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${icon === ic ? "#e8ff47" : "#2a2a2a"}`, background: icon === ic ? "#e8ff4715" : "#1a1a1a", fontSize: 18, cursor: "pointer" }}>{ic}</button>)}
          </div>
        </div>
        <button onClick={submit} disabled={!name.trim()} style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: name.trim() ? "#e8ff47" : "#1a1a1a", color: name.trim() ? "#000" : "#333", fontWeight: 900, fontSize: 14, cursor: name.trim() ? "pointer" : "default", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
          Créer l'exercice
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [tab,         setTab]         = useState("builder");
  const [catFilter,   setCatFilter]   = useState("Tous");
  const [search,      setSearch]      = useState("");
  const [workoutName, setWorkoutName] = useState("Mon Workout");
  const [items,       setItems]       = useState([]);
  const [showCatalog, setShowCatalog] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [session,     setSession]     = useState(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null); // null | items[]

  const [savedWorkouts,   setSavedWorkouts]   = useState(() => load("wk_workouts", []));
  const [customExercises, setCustomExercises] = useState(() => load("wk_custom_ex", []));

  useEffect(() => persist("wk_workouts",  savedWorkouts),   [savedWorkouts]);
  useEffect(() => persist("wk_custom_ex", customExercises), [customExercises]);

  const allExercises = [...EXERCISE_DB, ...customExercises];
  const filtered = allExercises.filter(ex =>
    (catFilter === "Tous" || ex.category === catFilter) &&
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const addExercise    = (ex)        => setItems(prev => [...prev, { id: uid(), exercise: ex, config: makeSet(ex.type) }]);
  const removeExercise = (id)        => setItems(prev => prev.filter(i => i.id !== id));
  const updateExercise = (id, patch) => {
    // patch may contain config keys OR label
    const { label, ...configPatch } = patch;
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        ...(label !== undefined ? { label } : {}),
        config: Object.keys(configPatch).length > 0 ? { ...i.config, ...configPatch } : i.config,
      };
    }));
  };
  const createCustom   = (ex)        => setCustomExercises(prev => [...prev, ex]);
  const deleteCustom   = (id)        => setCustomExercises(prev => prev.filter(e => e.id !== id));

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const dragId  = useRef(null);
  const [overI, setOverId] = useState(null);

  function handleDragStart(id) { dragId.current = id; }
  function handleDragOver(id)  { if (id !== dragId.current) setOverId(id); }
  function handleDrop(targetId) {
    if (!dragId.current || dragId.current === targetId) { dragId.current = null; setOverId(null); return; }
    setItems(prev => {
      const arr  = [...prev];
      const from = arr.findIndex(i => i.id === dragId.current);
      const to   = arr.findIndex(i => i.id === targetId);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    dragId.current = null;
    setOverId(null);
  }

  function saveWorkout() {
    if (!items.length) return;
    const date = new Date().toLocaleDateString("fr-CA");
    if (editingWorkoutId) {
      // Écrase le workout existant, conserve sa position dans la liste
      setSavedWorkouts(prev => prev.map(w =>
        w.id === editingWorkoutId ? { ...w, name: workoutName, items: [...items], date } : w
      ));
    } else {
      setSavedWorkouts(prev => [{ id: uid(), name: workoutName, items: [...items], date }, ...prev]);
    }
    setItems([]);
    setWorkoutName("Mon Workout");
    setEditingWorkoutId(null);
    setTab("workouts");
  }

  const loadWorkout   = (w)  => { setItems(w.items); setWorkoutName(w.name); setEditingWorkoutId(w.id); setTab("builder"); };
  const deleteWorkout = (id) => { setSavedWorkouts(prev => prev.filter(w => w.id !== id)); if (editingWorkoutId === id) { setEditingWorkoutId(null); setItems([]); setWorkoutName("Mon Workout"); } };

  const totalMins = Math.floor(items.reduce((acc, i) => {
    const c = i.config;
    if (i.exercise.type === "hiit") return acc + c.rounds * (c.work + c.rest);
    if (i.exercise.type === "time") return acc + c.sets * (c.duration + c.rest);
    return acc + c.sets * (c.rest + 30);
  }, 0) / 60);

  const wMins = (its) => Math.floor(its.reduce((acc, i) => {
    const c = i.config;
    if (i.exercise.type === "hiit") return acc + c.rounds * (c.work + c.rest);
    if (i.exercise.type === "time") return acc + c.sets * (c.duration + c.rest);
    return acc + c.sets * (c.rest + 30);
  }, 0) / 60);

  const S = {
    root:     { minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" },
    header:   { padding: "18px 16px 10px", background: "#080808", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, zIndex: 50 },
    tabBar:   { display: "flex", border: "1px solid #222", borderRadius: 8, overflow: "hidden" },
    tab:  (a) => ({ flex: 1, padding: "8px 0", border: "none", cursor: "pointer", background: a ? "#e8ff47" : "#111", color: a ? "#000" : "#555", fontWeight: 700, fontSize: 12, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1, transition: "all .15s" }),
    body:     { flex: 1, overflowY: "auto", padding: "0 0 90px" },
    secTitle: { fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", padding: "14px 16px 8px" },
    catPill:(a)=> ({ padding: "5px 12px", borderRadius: 20, border: "1px solid", borderColor: a ? "#e8ff47" : "#2a2a2a", background: a ? "#e8ff4715" : "transparent", color: a ? "#e8ff47" : "#555", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Space Mono', monospace", transition: "all .15s" }),
    searchBox: { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
  };

  if (session) return <SessionScreen items={session} onClose={() => setSession(null)} />;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={S.root}>

        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: -0.5 }}>WORK<span style={{ color: "#e8ff47" }}>OUT</span></span>
            </div>
            {items.length > 0 && <span style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace" }}>{items.length} ex · ~{totalMins}min</span>}
          </div>
          <div style={S.tabBar}>
            <button style={S.tab(tab === "builder")}  onClick={() => setTab("builder")}>Builder</button>
            <button style={S.tab(tab === "workouts")} onClick={() => setTab("workouts")}>Workouts {savedWorkouts.length > 0 && `(${savedWorkouts.length})`}</button>
          </div>
        </div>

        <div style={S.body}>

          {tab === "builder" && (
            <>
              <div style={{ padding: "12px 16px 0" }}>
                {editingName ? (
                  <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={e => e.key === "Enter" && setEditingName(false)} autoFocus
                    style={{ background: "none", border: "none", borderBottom: "2px solid #e8ff47", color: "#fff", fontSize: 20, fontWeight: 900, outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif" }} />
                ) : (
                  <div onClick={() => setEditingName(true)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff" }}>{workoutName}</h2>
                    <span style={{ fontSize: 12, color: "#444" }}>✏️</span>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <>
                  <div style={S.secTitle}>Exercices ajoutés</div>
                  <div style={{ padding: "0 16px" }}>
                    {items.map(item => <WorkoutExercise key={item.id} item={item} onRemove={removeExercise} onUpdate={updateExercise}
                      onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                      isDragging={overI === item.id}
                    />)}
                  </div>
                </>
              )}

              <div style={{ padding: "8px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={S.secTitle}>Catalogue {customExercises.length > 0 && <span style={{ color: "#e8ff47" }}>+{customExercises.length}</span>}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setShowCreate(true)} style={{ background: "#e8ff4715", border: "1px solid #e8ff4740", borderRadius: 6, color: "#e8ff47", padding: "3px 10px", cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>+ Créer</button>
                  <button onClick={() => setShowCatalog(p => !p)} style={{ background: "none", border: "1px solid #222", borderRadius: 6, color: "#555", padding: "3px 10px", cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{showCatalog ? "Masquer" : "Afficher"}</button>
                </div>
              </div>

              {showCatalog && (
                <div style={{ padding: "0 16px" }}>
                  <input style={S.searchBox} placeholder="Rechercher un exercice..." value={search} onChange={e => setSearch(e.target.value)} />
                  <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 0", scrollbarWidth: "none" }}>
                    {CATEGORIES.map(c => <button key={c} style={S.catPill(catFilter === c)} onClick={() => setCatFilter(c)}>{c}</button>)}
                  </div>
                  {filtered.length === 0
                    ? <div style={{ color: "#444", textAlign: "center", padding: "24px 0", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>Aucun exercice trouvé</div>
                    : filtered.map(ex => <ExerciseCard key={ex.id} ex={ex} onAdd={addExercise} onDelete={deleteCustom} />)
                  }
                </div>
              )}

              {/* Bottom buttons */}
              <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 398, display: "flex", gap: 8, zIndex: 100 }}>
                <button onClick={saveWorkout} disabled={!items.length} style={{ flex: 1, padding: "14px 0", borderRadius: 10, border: "none", background: items.length > 0 ? "#e8ff47" : "#1a1a1a", color: items.length > 0 ? "#000" : "#333", fontWeight: 900, fontSize: 13, cursor: items.length > 0 ? "pointer" : "default", fontFamily: "'Space Mono', monospace", transition: "all .2s" }}>
                  {items.length > 0 ? (editingWorkoutId ? `💾 Écraser` : `💾 Sauvegarder`) : "Ajoutez des exercices"}
                </button>
                {items.length > 0 && (
                  <button onClick={() => setSession(items)} style={{ padding: "14px 18px", borderRadius: 10, border: "none", background: "#FF0033", color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                    ▶ GO
                  </button>
                )}
              </div>
            </>
          )}

          {tab === "workouts" && (
            <div style={{ padding: "0 16px" }}>
              {savedWorkouts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#333", fontFamily: "'Space Mono', monospace", fontSize: 12, lineHeight: 2 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  Aucun workout sauvegardé.<br />Créez-en un dans le builder !
                </div>
              ) : (
                <>
                  <div style={S.secTitle}>Sauvegardés</div>
                  {savedWorkouts.map(w => (
                    <div key={w.id} style={{ borderRadius: 10, border: "1px solid #222", background: "#0f0f0f", marginBottom: 10, overflow: "hidden" }}>
                      <div style={{ padding: "12px 14px", background: "#141414", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{w.name}</div>
                          <div style={{ fontSize: 10, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>{w.date} · {w.items.length} ex · ~{wMins(w.items)}min</div>
                        </div>
                        <button onClick={() => deleteWorkout(w.id)} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 6, color: "#555", padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>🗑</button>
                      </div>
                      <div style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                          {w.items.map(i => (
                            <span key={i.id} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#1a1a1a", color: "#666", border: "1px solid #222", fontFamily: "'Space Mono', monospace" }}>
                              {i.exercise.icon} {i.exercise.name}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => loadWorkout(w)} style={{ flex: 1, padding: "9px 0", borderRadius: 7, border: "1px solid #e8ff4740", background: "#e8ff4710", color: "#e8ff47", fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
                            Charger →
                          </button>
                          <button onClick={() => setSession(w.items)} style={{ padding: "9px 16px", borderRadius: 7, border: "none", background: "#FF0033", color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
                            ▶ GO
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateExerciseModal onClose={() => setShowCreate(false)} onCreate={createCustom} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
