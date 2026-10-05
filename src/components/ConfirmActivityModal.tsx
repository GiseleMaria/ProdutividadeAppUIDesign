import { useState } from "react";

export interface ActivityData {
  title: string;
  date: string;
  time: string;
  notes: string;
  addToTopSix: boolean;
  type: "task" | "reminder" | "event";
}

interface Props {
  initialTitle: string;
  onConfirm: (data: ActivityData) => void;
  onCancel: () => void;
  initialType?: "task" | "reminder" | "event";
  allowTypeChange?: boolean;
}

export default function ConfirmActivityModal({ initialTitle, onConfirm, onCancel, initialType = "task", allowTypeChange = false }: Props) {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const nowTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTime);
  const [notes, setNotes] = useState("");
  const [addToTopSix, setAddToTopSix] = useState(false);
  const [type, setType] = useState(initialType);

  const isToday = date === todayStr;

  const fmt = (d: string) => {
    const [y, m, day] = d.split("-");
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${day} ${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Confirmar atividade</h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {allowTypeChange && (
            <div>
              <label style={labelStyle}>Tipo</label>
              <div className="segmented">
                {(["task", "reminder", "event"] as const).map(value => (
                  <button type="button" className={type === value ? "active" : ""} onClick={() => setType(value)} key={value}>
                    {value === "task" ? "Tarefa" : value === "reminder" ? "Lembrete" : "Evento"}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Title */}
          <div>
            <label style={labelStyle}>Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "var(--primary)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }}
                onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }}
                onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalhes, contexto, links..."
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
              onFocus={e => (e.target.style.borderColor = "var(--primary)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Top 6 toggle */}
          <div
            onClick={() => setAddToTopSix(v => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: addToTopSix ? "rgba(124,106,247,0.1)" : "var(--muted)",
              border: "1px solid",
              borderColor: addToTopSix ? "rgba(124,106,247,0.4)" : "var(--border)",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              userSelect: "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: addToTopSix ? "var(--primary)" : "var(--foreground)" }}>
                ✦ Adicionar ao Top 6 {isToday ? "de hoje" : `de ${fmt(date)}`}
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>
                {isToday ? "aparece na lista de tarefas do dia" : "fica salva para o dia do evento"}
              </p>
            </div>
            {/* Toggle */}
            <div style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              background: addToTopSix ? "var(--primary)" : "var(--border)",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: 3,
                left: addToTopSix ? 21 : 3,
                transition: "left 0.2s",
              }} />
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: "var(--muted)", borderRadius: 10, padding: 14 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>resumo</p>
            <p style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>{title || "—"}</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginTop: 3 }}>
              {fmt(date)} às {time}{addToTopSix ? " · Top 6" : ""}
            </p>
          </div>
        </div>

        <button
          onClick={() => onConfirm({ title, date, time, notes, addToTopSix, type })}
          disabled={!title.trim()}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: title.trim() ? "var(--primary)" : "var(--muted)",
            color: title.trim() ? "white" : "var(--muted-foreground)",
            fontSize: 14,
            fontWeight: 700,
            cursor: title.trim() ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          Confirmar →
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 13,
  color: "var(--foreground)",
  fontFamily: "'Outfit', sans-serif",
  outline: "none",
  transition: "border-color 0.15s",
};
