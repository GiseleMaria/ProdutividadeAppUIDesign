interface Props {
  taskText: string;
  onDone: () => void;
  onNotYet: () => void;
}

export default function DoNowReminder({ taskText, onDone, onNotYet }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: 24, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, maxWidth: 360, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
          ⏰
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>lembrete — 10 minutos depois</p>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>E aí, terminou?</h3>
        <div style={{ background: "var(--muted)", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontStyle: "italic" }}>&ldquo;{taskText}&rdquo;</p>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 24 }}>
          Você disse que ia fazer essa tarefa agora. Conseguiu concluir?
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onDone}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#34d399", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            ✓ Sim, feito!
          </button>
          <button
            onClick={onNotYet}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            ⏳ Ainda não
          </button>
        </div>
      </div>
    </div>
  );
}
