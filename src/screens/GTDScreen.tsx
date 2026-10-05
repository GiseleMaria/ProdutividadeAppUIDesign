import { useState } from "react";
import { Screen } from "../App";
import { useStore, GTDBucket } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";
import ConfirmActivityModal, { ActivityData } from "../components/ConfirmActivityModal";

interface Props { navigate: (s: Screen) => void; }

const BUCKETS: { key: GTDBucket; label: string; icon: string; color: string; desc: string }[] = [
  { key: "inbox", label: "Caixa de entrada", icon: "📥", color: "#7c6af7", desc: "Capture tudo aqui" },
  { key: "next", label: "Próximas ações", icon: "⚡", color: "#34d399", desc: "Ações físicas concretas" },
  { key: "waiting", label: "Aguardando", icon: "⏳", color: "#f59e0b", desc: "Delegado ou bloqueado" },
  { key: "someday", label: "Algum dia", icon: "🌙", color: "#a78bfa", desc: "Talvez no futuro" },
  { key: "done", label: "Concluído", icon: "✓", color: "var(--muted-foreground)", desc: "Finalizado" },
];

export default function GTDScreen({ navigate }: Props) {
  const { tasks, addTask, updateTask, removeTask, addEvent } = useStore();
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState<GTDBucket | "">("inbox");
  const [createTaskId, setCreateTaskId] = useState<number | null>(null);

  const gtdTasks = tasks.filter(t => t.gtdBucket);
  const add = () => {
    if (!input.trim()) return;
    addTask(input.trim(), { gtdBucket: "inbox", twoMinVerdict: null });
    setInput("");
  };

  const moveTo = (id: number, bucket: GTDBucket) => updateTask(id, { gtdBucket: bucket, done: bucket === "done" });

  const promoteToTask = (id: number, data: ActivityData) => {
    if (data.type === "event") {
      const date = new Date(`${data.date}T12:00:00`);
      addEvent({ day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), title: data.title, time: data.time, notes: data.notes, color: "#7c6af7", type: "event" });
      removeTask(id);
      setCreateTaskId(null);
      return;
    }
    updateTask(id, {
      text: data.title,
      deadline: data.date,
      time: data.time,
      quadrant: "schedule",
      inTopSix: data.addToTopSix,
      topSixOrder: data.addToTopSix ? tasks.filter(task => task.inTopSix && task.topSixDate === data.date).length + 1 : 0,
      topSixDate: data.addToTopSix ? data.date : undefined,
      kind: data.type,
    });
    setCreateTaskId(null);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <BackButton navigate={navigate} />
        <HelpTooltip title="Método GTD" content="Getting Things Done de David Allen — capture tudo, clarifique, organize e execute com confiança." steps={["Capture tudo na Caixa de entrada", "Clarifique: exige ação? Menos de 2 min? Faça já", "Organize com os botões de mover", "Use 'Criar tarefa' para promover ao sistema principal"]} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Método GTD</h1>
      <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 18 }}>Getting Things Done — capture, clarifique, organize.</p>

      {createTaskId !== null && (
        <ConfirmActivityModal
          initialTitle={tasks.find(task => task.id === createTaskId)?.text || ""}
          allowTypeChange
          onCancel={() => setCreateTaskId(null)}
          onConfirm={data => promoteToTask(createTaskId, data)}
        />
      )}

      {/* Quick capture */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Capture um pensamento, tarefa, ideia..." style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          <button onClick={add} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "0 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>Capturar</button>
        </div>
      </div>

      {/* Buckets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BUCKETS.map(b => {
          const bItems = gtdTasks.filter(t => t.gtdBucket === b.key);
          const isOpen = expanded === b.key;
          return (
            <div key={b.key} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <button onClick={() => setExpanded(isOpen ? "" : b.key)} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 15 }}>{b.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: b.color }}>{b.label}</p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>{b.desc}</p>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", background: "var(--muted)", padding: "2px 8px", borderRadius: 20 }}>{bItems.length}</div>
              </button>
              {isOpen && (
                <div style={{ borderTop: "1px solid var(--border)", padding: bItems.length ? "6px 14px 10px" : "10px 14px" }}>
                  {bItems.length === 0 ? (
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)" }}>vazio</p>
                  ) : bItems.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ flex: 1, fontSize: 12, color: "var(--foreground)" }}>{item.text}</span>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {BUCKETS.filter(x => x.key !== b.key && x.key !== "done").map(dest => (
                          <button key={dest.key} onClick={() => moveTo(item.id, dest.key)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, padding: "2px 5px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", color: dest.color, cursor: "pointer" }}>
                            {dest.label.split(" ")[0]}
                          </button>
                        ))}
                        <button onClick={() => moveTo(item.id, "done")} style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, border: "1px solid #34d39944", background: "transparent", color: "#34d399", cursor: "pointer" }}>✓</button>
                        {/* Create task button */}
                        {b.key !== "done" && (
                          <button onClick={() => setCreateTaskId(item.id)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, padding: "2px 5px", borderRadius: 4, border: "1px solid var(--primary)44", background: "rgba(124,106,247,0.1)", color: "var(--primary)", cursor: "pointer" }}>✦ tarefa</button>
                        )}
                        <button onClick={() => removeTask(item.id)} style={{ fontSize: 12, padding: "2px 5px", borderRadius: 4, border: "none", background: "transparent", color: "var(--muted-foreground)", cursor: "pointer" }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
