import { useState, useEffect, useRef } from "react";

export interface CalEvent {
  id: number;
  day: number;
  month: number;
  year: number;
  title: string;
  time: string;
  color: string;
  notes?: string;
  type: "event" | "activity";
  routineId?: number;
}

interface Props {
  event: CalEvent;
  onClose: () => void;
  initialKind?: "task" | "reminder" | "event";
  onSave: (updated: CalEvent & { itemKind: "task" | "reminder" | "event" }) => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

export default function EventActionModal({ event, onClose, onSave, onDelete, onComplete, initialKind = "event" }: Props) {
  const [mode, setMode] = useState<"choose" | "timer" | "edit">("choose");

  // Timer state
  const [timerMins, setTimerMins] = useState(25);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const totalSecs = timerMins * 60;
  const elapsed = totalSecs - timerSecs;
  const progress = totalSecs > 0 ? elapsed / totalSecs : 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSecs(s => {
          if (s <= 1) { clearInterval(intervalRef.current!); setTimerRunning(false); setTimerDone(true); onComplete?.(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, onComplete]);

  const startTimer = () => { setTimerSecs(timerMins * 60); setTimerDone(false); setTimerRunning(true); };
  const resetTimer = () => { setTimerRunning(false); setTimerSecs(0); setTimerDone(false); };

  const fmtT = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const circumference = 2 * Math.PI * 72;

  // Edit state
  const [title, setTitle] = useState(event.title);
  const [time, setTime] = useState(event.time);
  const [notes, setNotes] = useState(event.notes ?? "");
  const [date, setDate] = useState(`${event.year}-${String(event.month + 1).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`);
  const [itemKind, setItemKind] = useState<"task" | "reminder" | "event">(initialKind);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 480 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 16px" }} />

        {/* Event title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: event.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700 }}>{event.title}</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)" }}>{event.time}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
        </div>

        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => { setMode("timer"); setTimerSecs(timerMins * 60); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--muted)", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124,106,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>⏱</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Iniciar timer</p>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Defina um contador para concluir essa tarefa</p>
              </div>
            </button>
            <button
              onClick={() => setMode("edit")}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--muted)", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✏️</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Editar atividade</p>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Altere título, hora ou adicione notas</p>
              </div>
            </button>
            {onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                style={{ padding: "13px", borderRadius: 12, border: "1px solid rgba(241,120,120,0.35)", background: "rgba(241,120,120,0.08)", color: "#f17878", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                Excluir
              </button>
            )}
          </div>
        )}

        {mode === "timer" && (
          <div>
            <button onClick={() => setMode("choose")} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0 }}>← voltar</button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ position: "relative", width: 170, height: 170, marginBottom: 20 }}>
                <svg width="170" height="170" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="85" cy="85" r="72" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle cx="85" cy="85" r="72" fill="none" stroke={timerDone ? "#34d399" : "var(--primary)"} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 500, color: timerDone ? "#34d399" : "var(--foreground)" }}>
                    {timerRunning || timerDone ? fmtT(timerSecs) : fmtT(timerMins * 60)}
                  </span>
                </div>
              </div>

              {!timerRunning && !timerDone && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
                  {[5, 10, 15, 25, 30, 45].map(m => (
                    <button key={m} onClick={() => { setTimerMins(m); setTimerSecs(m * 60); }} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: timerMins === m ? "var(--primary)" : "var(--border)", background: timerMins === m ? "rgba(124,106,247,0.15)" : "transparent", color: timerMins === m ? "var(--primary)" : "var(--muted-foreground)", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>{m}m</button>
                  ))}
                </div>
              )}

              {timerDone ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#34d399", marginBottom: 12 }}>Tempo esgotado! 🎉</p>
                  <button onClick={resetTimer} style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", fontSize: 13, cursor: "pointer" }}>Novo timer</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={resetTimer} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer" }}>Reset</button>
                  <button onClick={timerRunning ? () => setTimerRunning(false) : startTimer} style={{ padding: "10px 32px", borderRadius: 10, border: "none", background: "var(--primary)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {timerRunning ? "⏸ Pausar" : "▶ Iniciar"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "edit" && (
          <div>
            <button onClick={() => setMode("choose")} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0 }}>← voltar</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={labelStyle}>Hora</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={labelStyle}>Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} /></div>
                <div><label style={labelStyle}>Tipo</label><select value={itemKind} onChange={e => setItemKind(e.target.value as typeof itemKind)} style={inputStyle}><option value="task">Tarefa</option><option value="reminder">Lembrete</option><option value="event">Evento</option></select></div>
              </div>
              <div>
                <label style={labelStyle}>Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detalhes..." rows={3} style={{ ...inputStyle, resize: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <button
                onClick={() => {
                  const [year, month, day] = date.split("-").map(Number);
                  onSave({ ...event, title, time, notes, day, month: month - 1, year, itemKind });
                  onClose();
                }}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "var(--primary)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Salvar alterações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none", transition: "border-color 0.15s" };
