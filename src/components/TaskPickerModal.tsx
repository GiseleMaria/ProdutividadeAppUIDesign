import { useState } from "react";

export interface Task {
  id: number;
  text: string;
  done: boolean;
}

interface Props {
  existingTasks: Task[];
  onAdd: (text: string) => void;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Responder e-mails pendentes",
  "Revisar documentação",
  "Atualizar status das tarefas",
  "Preparar pauta da reunião",
  "Fazer backup dos arquivos",
  "Revisar métricas do projeto",
];

export default function TaskPickerModal({ existingTasks, onAdd, onClose }: Props) {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"new" | "existing">("new");

  const handleAdd = (text: string) => {
    if (!text.trim()) return;
    onAdd(text.trim());
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 480, maxHeight: "70vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Adicionar tarefa</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--muted)", borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {(["new", "existing"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: tab === t ? "var(--card)" : "transparent", color: tab === t ? "var(--foreground)" : "var(--muted-foreground)", fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
            >
              {t === "new" ? "Nova tarefa" : "Já criadas"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "new" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd(input)}
                placeholder="Descreva a tarefa..."
                autoFocus
                style={{ width: "100%", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                onClick={() => handleAdd(input)}
                disabled={!input.trim()}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: input.trim() ? "var(--primary)" : "var(--muted)", color: input.trim() ? "white" : "var(--muted-foreground)", fontSize: 13, fontWeight: 600, cursor: input.trim() ? "pointer" : "default" }}
              >
                Adicionar tarefa
              </button>
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>sugestões</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleAdd(s)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--muted)", color: "var(--foreground)", fontSize: 12, cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {existingTasks.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: 13, padding: 20, fontFamily: "'DM Mono', monospace" }}>nenhuma tarefa criada ainda</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {existingTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleAdd(task.text)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: task.done ? "var(--muted)" : "var(--card)", color: task.done ? "var(--muted-foreground)" : "var(--foreground)", fontSize: 13, textAlign: "left", cursor: "pointer", textDecoration: task.done ? "line-through" : "none", transition: "border-color 0.15s", opacity: task.done ? 0.6 : 1 }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.done ? "var(--border)" : "var(--primary)", flexShrink: 0 }} />
                      {task.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
