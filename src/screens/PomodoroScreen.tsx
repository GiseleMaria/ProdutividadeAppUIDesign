import { useState, useEffect, useRef } from "react";
import { Screen } from "../App";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";

interface Props { navigate: (s: Screen) => void; }
type Phase = "focus" | "short" | "long";

export default function PomodoroScreen({ navigate }: Props) {
  const [focusMins, setFocusMins] = useState(25);
  const [shortMins, setShortMins] = useState(5);
  const [longMins, setLongMins] = useState(15);
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [editing, setEditing] = useState<Phase | null>(null);
  const [autoNotice, setAutoNotice] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const getMins = (p: Phase) => p === "focus" ? focusMins : p === "short" ? shortMins : longMins;

  const goToNextPhase = (currentPhase: Phase, completedSessions: number) => {
    let next: Phase;
    if (currentPhase === "focus") {
      next = completedSessions % 4 === 0 ? "long" : "short";
    } else {
      next = "focus";
    }
    const label = next === "focus" ? "Foco" : next === "short" ? "Pausa curta" : "Pausa longa";
    setAutoNotice(`Iniciando ${label} automaticamente…`);
    setTimeout(() => setAutoNotice(null), 3000);
    setPhase(next);
    setSecondsLeft(getMins(next) * 60);
    setRunning(true);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            if (phase === "focus") {
              const newSessions = sessionsRef.current + 1;
              setSessions(newSessions);
              setTimeout(() => goToNextPhase("focus", newSessions), 500);
            } else {
              setTimeout(() => goToNextPhase(phase, sessionsRef.current), 500);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase]);

  const reset = (p: Phase) => { setRunning(false); setPhase(p); setSecondsLeft(getMins(p) * 60); };

  const applyTime = (p: Phase, val: number) => {
    const v = Math.max(1, Math.min(90, val));
    if (p === "focus") { setFocusMins(v); if (phase === "focus") setSecondsLeft(v * 60); }
    if (p === "short") { setShortMins(v); if (phase === "short") setSecondsLeft(v * 60); }
    if (p === "long") { setLongMins(v); if (phase === "long") setSecondsLeft(v * 60); }
    setEditing(null); setRunning(false);
  };

  const totalSeconds = getMins(phase) * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 90;
  const phaseColor = phase === "focus" ? "var(--primary)" : phase === "short" ? "#34d399" : "#f59e0b";
  const phaseLabel = phase === "focus" ? "Foco" : phase === "short" ? "Pausa curta" : "Pausa longa";

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <BackButton navigate={navigate} />
        <HelpTooltip title="Técnica Pomodoro" content="Intervalos de foco intenso separados por pausas curtas. Ao fim de cada fase, a próxima inicia automaticamente." steps={["Escolha uma tarefa para focar", "Inicie o timer e trabalhe sem interrupções", "A pausa começa sozinha ao fim do foco", "A cada 4 pomodoros, pausa longa automática"]} />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Pomodoro</h1>

      {/* Auto notice */}
      {autoNotice && (
        <div style={{ background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--primary)", textAlign: "center" }}>
          {autoNotice}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {(["focus", "short", "long"] as Phase[]).map(p => (
          <button key={p} onClick={() => reset(p)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid", borderColor: phase === p ? phaseColor : "var(--border)", background: "transparent", color: phase === p ? phaseColor : "var(--muted-foreground)", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", transition: "all 0.15s" }}>
            {p === "focus" ? "Foco" : p === "short" ? "Curta" : "Longa"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", width: 210, height: 210 }}>
          <svg width="210" height="210" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="105" cy="105" r="90" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="105" cy="105" r="90" fill="none" stroke={phaseColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 44, fontWeight: 500, lineHeight: 1 }}>{mins}:{secs}</span>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6 }}>{phaseLabel}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={() => reset(phase)} style={{ width: 44, height: 44, borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 1 0 1-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M3 5V3H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={() => setRunning(r => !r)} style={{ width: 64, height: 44, borderRadius: 12, background: phaseColor, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {running ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="3" width="3" height="10" rx="1" fill="white" /><rect x="9" y="3" width="3" height="10" rx="1" fill="white" /></svg> : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3l8 5-8 5V3z" fill="white" /></svg>}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < (sessions % 4) ? "var(--primary)" : "var(--border)", transition: "background 0.3s" }} />
        ))}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginLeft: 8 }}>{sessions} sessões</span>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>configurar tempos</p>
        {([{ key: "focus" as Phase, label: "Foco", val: focusMins }, { key: "short" as Phase, label: "Pausa curta", val: shortMins }, { key: "long" as Phase, label: "Pausa longa", val: longMins }]).map(item => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>{item.label}</span>
            {editing === item.key ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" min={1} max={90} defaultValue={item.val} autoFocus onInput={e => { if (Number(e.currentTarget.value) < 0) e.currentTarget.value = "1"; }} onBlur={e => applyTime(item.key, Number(e.target.value))} onKeyDown={e => e.key === "Enter" && applyTime(item.key, Number((e.target as HTMLInputElement).value))} style={{ width: 56, background: "var(--muted)", border: "1px solid var(--primary)", borderRadius: 6, padding: "4px 8px", color: "var(--foreground)", fontFamily: "'DM Mono', monospace", fontSize: 13, textAlign: "center", outline: "none" }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)" }}>min</span>
              </div>
            ) : (
              <button onClick={() => setEditing(item.key)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>{item.val} min</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
