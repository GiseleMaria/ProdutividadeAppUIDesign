import { useState } from "react";
import { Screen } from "../App";
import { useStore, TwoMinVerdict } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";

interface Props { navigate: (s: Screen) => void; }

export default function TwoMinuteScreen({ navigate }: Props) {
  const { tasks, addTask, updateTask } = useStore();
  const [input, setInput] = useState("");

  // All tasks without a verdict (pending decision)
  const pending = tasks.filter(t => t.twoMinVerdict === null && !t.done);
  // Already decided
  const decided = tasks.filter(t => t.twoMinVerdict !== null);

  const setVerdict = (id: number, v: TwoMinVerdict) => updateTask(id, { twoMinVerdict: v, done: v === "do" ? true : undefined });

  const add = () => {
    if (!input.trim()) return;
    addTask(input.trim(), { twoMinVerdict: null });
    setInput("");
  };

  const verdictMap = {
    do: { label: "Fazer agora", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "#34d39944" },
    defer: { label: "Adiar", color: "#7c6af7", bg: "rgba(124,106,247,0.1)", border: "rgba(124,106,247,0.3)" },
    delegate: { label: "Delegar", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <BackButton navigate={navigate} />
        <HelpTooltip title="Regra dos 2 Minutos" content="Se leva menos de 2 minutos, faça agora. Todas as suas tarefas sem decisão aparecem aqui para triagem rápida." steps={["Avalie cada tarefa", "Menos de 2 min → Fazer agora", "Mais de 2 min, sua tarefa → Adiar", "Mais de 2 min, pode delegar → Delegar"]} />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Regra dos 2 Minutos</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 18 }}>Se leva menos de 2 minutos, faça agora.</p>

      {/* Legend */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[{ label: "Fazer agora", desc: "< 2 min", color: "#34d399", icon: "⚡" }, { label: "Adiar", desc: "> 2 min, seu", color: "#7c6af7", icon: "📅" }, { label: "Delegar", desc: "> 2 min, não seu", color: "#f59e0b", icon: "↗" }].map(item => (
            <div key={item.label} style={{ textAlign: "center", padding: 10, background: "var(--muted)", borderRadius: 8 }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{item.icon}</div>
              <p style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{item.label}</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)", marginTop: 1 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending tasks — all without verdict */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>para decidir ({pending.length})</p>
          {pending.length > 0 && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>toque para decidir</span>}
        </div>
        {pending.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}>todas as tarefas foram triadas 🎉</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map(task => (
              <div key={task.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14 }}>
                <p style={{ fontSize: 14, color: "var(--foreground)", marginBottom: 10 }}>{task.text}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setVerdict(task.id, "do")} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${verdictMap.do.border}`, background: verdictMap.do.bg, color: verdictMap.do.color, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>⚡ Fazer agora</button>
                  <button onClick={() => setVerdict(task.id, "defer")} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${verdictMap.defer.border}`, background: verdictMap.defer.bg, color: verdictMap.defer.color, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>📅 Adiar</button>
                  <button onClick={() => setVerdict(task.id, "delegate")} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${verdictMap.delegate.border}`, background: verdictMap.delegate.bg, color: verdictMap.delegate.color, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>↗ Delegar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decided */}
      {decided.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>decididas ({decided.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {decided.map(task => {
              const v = verdictMap[task.twoMinVerdict as keyof typeof verdictMap];
              return (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", opacity: 0.65 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: v?.color ?? "var(--border)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: "var(--foreground)" }}>{task.text}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: v?.color ?? "var(--muted-foreground)" }}>{v?.label ?? ""}</span>
                  <button onClick={() => updateTask(task.id, { twoMinVerdict: null })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 12, padding: 0 }}>↩</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 10 }}>adicionar tarefa para triagem</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="O que precisa ser decidido?" style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          <button onClick={add} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+</button>
        </div>
      </div>
    </div>
  );
}
