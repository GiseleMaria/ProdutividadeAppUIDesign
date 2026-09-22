interface Props {
  taskText: string;
  onClose: (verdict: "do" | "schedule") => void;
}

export default function TwoMinutePopup({ taskText, onClose }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,106,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>
          ⚡
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Regra dos 2 minutos</h3>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 6 }}>
          Você adicionou:
        </p>
        <div style={{ background: "var(--muted)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "var(--foreground)", fontStyle: "italic" }}>&ldquo;{taskText}&rdquo;</p>
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 20, color: "var(--foreground)" }}>
          Essa atividade pode ser feita em até <span style={{ color: "var(--accent)" }}>2–5 minutos</span>?
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onClose("do")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: "var(--primary)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⚡ Sim — fazer agora
          </button>
          <button
            onClick={() => onClose("schedule")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--foreground)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            📅 Não — agendar
          </button>
        </div>
      </div>
    </div>
  );
}
