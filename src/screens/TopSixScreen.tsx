import { useState } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";
import ConfirmActivityModal, { ActivityData } from "../components/ConfirmActivityModal";

interface Props { navigate: (s: Screen) => void; }

export default function TopSixScreen({ navigate }: Props) {
  const { tasks, updateTask, addTask } = useStore();
  const [showPicker, setShowPicker] = useState(false);
  const [scheduleTask, setScheduleTask] = useState<number | null>(null);

  const top6 = tasks
    .filter(t => t.inTopSix)
    .sort((a, b) => a.topSixOrder - b.topSixOrder)
    .slice(0, 6);

  const available = tasks.filter(t => !t.inTopSix && !t.done);

  const toggle = (id: number, done: boolean) => updateTask(id, { done });

  const remove = (id: number) => updateTask(id, { inTopSix: false, topSixOrder: 0 });

  const moveUp = (task: typeof tasks[0]) => {
    const idx = top6.findIndex(t => t.id === task.id);
    if (idx <= 0) return;
    const prev = top6[idx - 1];
    updateTask(task.id, { topSixOrder: prev.topSixOrder });
    updateTask(prev.id, { topSixOrder: task.topSixOrder });
  };

  const moveDown = (task: typeof tasks[0]) => {
    const idx = top6.findIndex(t => t.id === task.id);
    if (idx >= top6.length - 1) return;
    const next = top6[idx + 1];
    updateTask(task.id, { topSixOrder: next.topSixOrder });
    updateTask(next.id, { topSixOrder: task.topSixOrder });
  };

  const addExisting = (id: number) => {
    const count = top6.length;
    if (count >= 6) return;
    updateTask(id, { inTopSix: true, topSixOrder: count + 1 });
    setShowPicker(false);
  };

  const addNew = (text: string) => {
    if (top6.length >= 6) return;
    addTask(text, { inTopSix: true, topSixOrder: top6.length + 1 });
    setShowPicker(false);
  };

  const handleSchedule = (data: ActivityData) => {
    if (scheduleTask === null) return;
    updateTask(scheduleTask, { deadline: data.date });
    setScheduleTask(null);
  };

  const completedCount = top6.filter(t => t.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 480, margin: "0 auto", overflow: "hidden" }}>
      {/* Modals */}
      {scheduleTask !== null && (
        <ConfirmActivityModal
          initialTitle={tasks.find(t => t.id === scheduleTask)?.text ?? ""}
          onConfirm={handleSchedule}
          onCancel={() => setScheduleTask(null)}
        />
      )}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 480, maxHeight: "70vh", display: "flex", flexDirection: "column" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Adicionar ao Top 6</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
            </div>
            {/* Add new */}
            <AddInline onAdd={addNew} placeholder="Nova tarefa..." />
            {available.length > 0 && (
              <>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 8, marginTop: 14 }}>tarefas existentes</p>
                <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {available.map(t => (
                    <button key={t.id} onClick={() => addExisting(t.id)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--muted)", color: "var(--foreground)", fontSize: 13, cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                      {t.text}
                      {t.deadline && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)", marginLeft: 8 }}>📅 {t.deadline}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Scrollable area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <BackButton navigate={navigate} />
          <HelpTooltip title="Lista das 6 Tarefas" content="Método Ivy Lee: defina 6 tarefas em ordem de prioridade e trabalhe nessa ordem. Mude a ordem com as setas. Crie tarefas reais com 🗓." steps={["Adicione ou selecione tarefas existentes", "Reordene com ↑↓ por prioridade", "Marque como concluída ao terminar", "Use 🗓 para agendar no calendário"]} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Lista das 6 Tarefas</h1>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 18 }}>Método Ivy Lee — 6 tarefas, em ordem de prioridade.</p>

        {/* Progress */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>progresso</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{completedCount}/{top6.length}</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${top6.length ? (completedCount / top6.length) * 100 : 0}%`, background: "var(--primary)", borderRadius: 2, transition: "width 0.4s" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {top6.map((task, index) => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid", borderColor: !task.done && index === 0 ? "var(--primary)44" : "var(--border)", borderRadius: "var(--radius)", padding: "12px 14px", opacity: task.done ? 0.6 : 1, transition: "all 0.2s" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: index === 0 && !task.done ? "var(--primary)" : "var(--muted-foreground)", width: 14, flexShrink: 0 }}>{index + 1}</span>
              <div onClick={() => toggle(task.id, !task.done)} style={{ width: 18, height: 18, borderRadius: 5, border: task.done ? "none" : "1.5px solid var(--border)", background: task.done ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all 0.15s" }}>
                {task.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ flex: 1, fontSize: 13, textDecoration: task.done ? "line-through" : "none", color: "var(--foreground)" }}>{task.text}</span>
              {task.deadline && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>📅</span>}
              {index === 0 && !task.done && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--primary)", background: "rgba(124,106,247,0.15)", padding: "2px 6px", borderRadius: 20 }}>AGORA</span>}
              {/* Controls */}
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                <button onClick={() => moveUp(task)} style={iconBtn} title="Subir">↑</button>
                <button onClick={() => moveDown(task)} style={iconBtn} title="Descer">↓</button>
                <button onClick={() => setScheduleTask(task.id)} style={{ ...iconBtn, fontSize: 12 }} title="Agendar">🗓</button>
                <button onClick={() => remove(task.id)} style={{ ...iconBtn, color: "var(--muted-foreground)" }}>×</button>
              </div>
            </div>
          ))}
        </div>

        {top6.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "var(--muted-foreground)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>nenhuma tarefa no top 6 — adicione abaixo</div>
        )}
      </div>

      {/* Fixed footer */}
      {top6.length < 6 ? (
        <div style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "12px 20px 20px", flexShrink: 0 }}>
          <button
            onClick={() => setShowPicker(true)}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px dashed var(--border)", background: "transparent", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
          >
            + Adicionar tarefa ({top6.length}/6)
          </button>
        </div>
      ) : (
        <div style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "12px 20px 20px", flexShrink: 0, textAlign: "center" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)" }}>máximo atingido — foque no que importa.</span>
        </div>
      )}
    </div>
  );
}

function AddInline({ onAdd, placeholder }: { onAdd: (t: string) => void; placeholder: string }) {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); } }} placeholder={placeholder} autoFocus style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
      <button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+</button>
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 14, padding: "2px 4px", lineHeight: 1, borderRadius: 4, transition: "color 0.1s" };
