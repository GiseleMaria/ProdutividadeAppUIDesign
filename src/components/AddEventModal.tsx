import { useState } from "react";

export type EventType = "event" | "activity";

export interface NewEventData {
  title: string;
  time: string;
  color: string;
  notes: string;
  type: EventType;
}

interface Props {
  day: number;
  month: number;
  year: number;
  onConfirm: (data: NewEventData) => void;
  onCancel: () => void;
}

const COLORS = ["#7c6af7", "#34d399", "#f59e0b", "#f472b6", "#60a5fa", "#ef4444", "#a78bfa"];
const MONTHS_PT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export default function AddEventModal({ day, month, year, onConfirm, onCancel }: Props) {
  const [type, setType] = useState<EventType>("event");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState(COLORS[0]);
  const [notes, setNotes] = useState("");

  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 480 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Adicionar ao dia</h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginBottom: 18 }}>
          {day} de {MONTHS_PT[month]}, {year}
        </p>

        {/* Type selector */}
        <div style={{ display: "flex", gap: 4, background: "var(--muted)", borderRadius: 10, padding: 4, marginBottom: 18 }}>
          {(["event", "activity"] as EventType[]).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: type === t ? "var(--card)" : "transparent", color: type === t ? "var(--foreground)" : "var(--muted-foreground)", fontSize: 13, fontWeight: type === t ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
              {t === "event" ? "📅 Evento" : "⚡ Atividade"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>{type === "event" ? "Nome do evento" : "Descrição da atividade"}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={type === "event" ? "Ex: Reunião com time" : "Ex: Revisar proposta"} style={inp} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} autoFocus />
          </div>

          <div>
            <label style={lbl}>Horário</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...inp, colorScheme: "dark" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div>
            <label style={lbl}>Cor</label>
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: color === c ? "3px solid white" : "3px solid transparent", cursor: "pointer", boxShadow: color === c ? `0 0 0 2px ${c}` : "none", transition: "all 0.15s" }} />
              ))}
            </div>
          </div>

          {type === "event" && (
            <div>
              <label style={lbl}>Notas (opcional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detalhes, local, link..." rows={2} style={{ ...inp, resize: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
            </div>
          )}
        </div>

        <button
          onClick={() => title.trim() && onConfirm({ title: title.trim(), time, color, notes, type })}
          disabled={!title.trim()}
          style={{ marginTop: 20, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: title.trim() ? "var(--primary)" : "var(--muted)", color: title.trim() ? "white" : "var(--muted-foreground)", fontSize: 14, fontWeight: 700, cursor: title.trim() ? "pointer" : "default", transition: "all 0.2s" }}
        >
          {type === "event" ? "Adicionar evento" : "Adicionar atividade"}
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none", transition: "border-color 0.15s" };
