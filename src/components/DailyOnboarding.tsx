import { useState } from "react";

interface Props {
  onComplete: (tasks: string[]) => void;
}

export default function DailyOnboarding({ onComplete }: Props) {
  const [tasks, setTasks] = useState<string[]>(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"intro" | "tasks">("intro");

  const update = (i: number, val: string) => setTasks(t => t.map((x, j) => j === i ? val : x));

  const filled = tasks.filter(t => t.trim()).length;

  const finish = () => {
    const valid = tasks.filter(t => t.trim());
    if (valid.length === 0) onComplete([]);
    else onComplete(valid);
  };

  const now = new Date();
  const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 24 }}>
      {step === "intro" ? (
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🌅</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            {dayNames[now.getDay()]}, {now.getDate()} de {monthNames[now.getMonth()]}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Bom dia!</h1>
          <p style={{ fontSize: 15, color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: 32 }}>
            Antes de começar, defina as <span style={{ color: "var(--accent)", fontWeight: 600 }}>6 tarefas mais importantes</span> do seu dia. Isso vai guiar seu foco e garantir que o essencial seja feito.
          </p>
          <button
            onClick={() => setStep("tasks")}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "var(--primary)", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Planejar meu dia →
          </button>
          <button
            onClick={() => onComplete([])}
            style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer" }}
          >
            Pular por hoje
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 440, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>método ivy lee</p>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Suas 6 tarefas de hoje</h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>Ordene do mais ao menos importante.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {tasks.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: t.trim() ? "var(--primary)" : "var(--muted)",
                  border: t.trim() ? "none" : "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: t.trim() ? "white" : "var(--muted-foreground)",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                  {i + 1}
                </div>
                <input
                  value={t}
                  onChange={e => update(i, e.target.value)}
                  placeholder={i === 0 ? "Tarefa mais importante do dia..." : `Tarefa ${i + 1}...`}
                  style={{
                    flex: 1,
                    background: "var(--card)",
                    border: "1px solid",
                    borderColor: t.trim() ? "var(--border)" : "var(--border)",
                    borderRadius: 10,
                    padding: "11px 14px",
                    fontSize: 13,
                    color: "var(--foreground)",
                    fontFamily: "'Outfit', sans-serif",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={finish}
              disabled={filled === 0}
              style={{
                flex: 1,
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: filled > 0 ? "var(--primary)" : "var(--muted)",
                color: filled > 0 ? "white" : "var(--muted-foreground)",
                fontSize: 14,
                fontWeight: 600,
                cursor: filled > 0 ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              {filled > 0 ? `Começar o dia com ${filled} tarefa${filled > 1 ? "s" : ""}` : "Adicione ao menos uma tarefa"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
