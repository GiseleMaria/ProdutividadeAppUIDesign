import { useState } from "react";
import { Screen } from "../App";
import { useStore, Quadrant } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";

interface Props { navigate: (s: Screen) => void; }

const QUADRANTS: { key: Quadrant; label: string; sub: string; color: string; bg: string }[] = [
  { key: "do", label: "Fazer", sub: "Urgente + Importante", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  { key: "schedule", label: "Agendar", sub: "Importante, não urgente", color: "#7c6af7", bg: "rgba(124,106,247,0.08)" },
  { key: "delegate", label: "Delegar", sub: "Urgente, não importante", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { key: "eliminate", label: "Eliminar", sub: "Nem urgente, nem importante", color: "var(--muted-foreground)", bg: "var(--muted)" },
];

export default function EisenhowerScreen({ navigate }: Props) {
  const { tasks, addTask, updateTask, removeTask } = useStore();
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Quadrant>("do");
  const [showPicker, setShowPicker] = useState(false);

  const matrixTasks = tasks.filter(t => t.quadrant);
  const unassigned = tasks.filter(t => !t.quadrant && !t.done);

  const add = () => {
    if (!input.trim()) return;
    addTask(input.trim(), { quadrant: selected });
    setInput("");
  };

  const addExisting = (id: number) => {
    updateTask(id, { quadrant: selected });
    setShowPicker(false);
  };

  const remove = (id: number) => updateTask(id, { quadrant: undefined });
  const toggleDone = (id: number, done: boolean) => updateTask(id, { done });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 600, margin: "0 auto", overflow: "hidden" }}>
      {/* Existing task picker */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 480, maxHeight: "60vh", display: "flex", flexDirection: "column" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Adicionar tarefa existente</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", marginBottom: 10 }}>Será adicionada ao quadrante: <span style={{ color: QUADRANTS.find(q => q.key === selected)?.color }}>{QUADRANTS.find(q => q.key === selected)?.label}</span></p>
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {unassigned.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: 12, padding: 16, fontFamily: "'DM Mono', monospace" }}>nenhuma tarefa disponível</p>
              ) : unassigned.map(t => (
                <button key={t.id} onClick={() => addExisting(t.id)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--muted)", color: "var(--foreground)", fontSize: 13, cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {t.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable matrix */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <BackButton navigate={navigate} />
          <HelpTooltip title="Matriz de Eisenhower" content="Divide tarefas em 4 quadrantes por urgência e importância." steps={["Urgente + Importante → Fazer", "Importante, não urgente → Agendar", "Urgente, não importante → Delegar", "Nem um nem outro → Eliminar"]} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Matriz de Eisenhower</h1>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16 }}>Classifique suas tarefas por urgência e importância.</p>

        {/* Fixed 2×2 matrix */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {QUADRANTS.map(q => {
            const qTasks = matrixTasks.filter(t => t.quadrant === q.key);
            return (
              <div key={q.key} style={{ background: q.bg, border: "1px solid", borderColor: q.color + "33", borderRadius: "var(--radius)", padding: 12, minHeight: 120, maxHeight: 200, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: q.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: q.color }}>{q.label}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>{q.sub}</p>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {qTasks.map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 5, background: "rgba(0,0,0,0.18)", borderRadius: 5, padding: "5px 7px" }}>
                      <div onClick={() => toggleDone(t.id, !t.done)} style={{ width: 14, height: 14, borderRadius: 3, border: t.done ? "none" : "1px solid var(--border)", background: t.done ? "var(--primary)" : "transparent", flexShrink: 0, cursor: "pointer", marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {t.done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1, lineHeight: 1.4, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
                      <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 0, lineHeight: 1, fontSize: 13, flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "12px 20px 20px", flexShrink: 0 }}>
        {/* Quadrant selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
          {QUADRANTS.map(q => (
            <button key={q.key} onClick={() => setSelected(q.key)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: "1px solid", borderColor: selected === q.key ? q.color : "var(--border)", background: selected === q.key ? q.bg : "transparent", color: selected === q.key ? q.color : "var(--muted-foreground)", fontSize: 12, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {q.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Nova tarefa..." style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          <button onClick={() => setShowPicker(true)} style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", borderRadius: 10, padding: "0 12px", cursor: "pointer", fontSize: 12, flexShrink: 0, fontFamily: "'DM Mono', monospace" }} title="Adicionar existente">📋</button>
          <button onClick={add} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 10, width: 40, height: 40, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
        </div>
      </div>
    </div>
  );
}
