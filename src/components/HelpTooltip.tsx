import { useState } from "react";

interface Props {
  title: string;
  content: string;
  steps?: string[];
}

export default function HelpTooltip({ title, content, steps }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--muted-foreground)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          transition: "border-color 0.15s, color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
        aria-label="Ajuda"
      >
        ?
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24, backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>como funciona</p>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: steps?.length ? 20 : 0 }}>{content}</p>
            {steps && steps.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--primary)", fontWeight: 600 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.5, marginTop: 2 }}>{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
