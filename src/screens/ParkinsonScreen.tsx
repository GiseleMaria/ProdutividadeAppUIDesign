import { useState, useEffect, useRef } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";

interface Props { navigate: (s: Screen) => void; }

export default function ParkinsonScreen({ navigate }: Props) {
  const { tasks, addTask, updateTask } = useStore();
  const [input, setInput] = useState("");
  const [mins, setMins] = useState(25);
  const [showPicker, setShowPicker] = useState(false);
  const intervalsRef = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  useEffect(() => () => Object.values(intervalsRef.current).forEach(clearInterval), []);

  const parkinsonTasks = tasks.filter(t => t.parkinsionMins !== undefined);
  const available = tasks.filter(t => t.parkinsionMins === undefined && !t.done);

  const toggleTimer = (id: number) => {
    const task = parkinsonTasks.find(t => t.id === id);
    if (!task) return;
    // We store elapsed in a local ref for simplicity; actual running state is managed here
    // Since we store in store, we'll use a local state layer for running
    // This is a simplification — in real app use a separate running map
  };

  // Local running state for Parkinson tasks
  const [runningMap, setRunningMap] = useState<Record<number, boolean>>({});
  const [elapsedMap, setElapsedMap] = useState<Record<number, number>>({});

  const startStop = (id: number, allocatedMins: number) => {
    const isRunning = runningMap[id];
    if (isRunning) {
      clearInterval(intervalsRef.current[id]);
      setRunningMap(m => ({ ...m, [id]: false }));
    } else {
      intervalsRef.current[id] = setInterval(() => {
        setElapsedMap(prev => {
          const newElapsed = (prev[id] ?? 0) + 1;
          if (newElapsed >= allocatedMins * 60) {
            clearInterval(intervalsRef.current[id]);
            setRunningMap(m => ({ ...m, [id]: false }));
            updateTask(id, { done: true });
            return { ...prev, [id]: allocatedMins * 60 };
          }
          return { ...prev, [id]: newElapsed };
        });
      }, 1000);
      setRunningMap(m => ({ ...m, [id]: true }));
    }
  };

  const resetTask = (id: number) => {
    clearInterval(intervalsRef.current[id]);
    setRunningMap(m => ({ ...m, [id]: false }));
    setElapsedMap(m => ({ ...m, [id]: 0 }));
    updateTask(id, { done: false });
  };

  const removeFromParkinson = (id: number) => {
    clearInterval(intervalsRef.current[id]);
    updateTask(id, { parkinsionMins: undefined, done: false });
    setRunningMap(m => { const n = { ...m }; delete n[id]; return n; });
    setElapsedMap(m => { const n = { ...m }; delete n[id]; return n; });
  };

  const addNew = () => {
    if (!input.trim()) return;
    addTask(input.trim(), { parkinsionMins: mins });
    setInput("");
  };

  const addExisting = (id: number) => {
    updateTask(id, { parkinsionMins: mins });
    setShowPicker(false);
  };

  const fmt = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 480, margin: "0 auto", overflow: "hidden" }}>
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 480, maxHeight: "60vh", display: "flex", flexDirection: "column" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Tarefas existentes</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 20, padding: 0 }}>×</button>
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", marginBottom: 10 }}>Serão cronometradas com {mins} min</p>
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {available.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: 12, padding: 16, fontFamily: "'DM Mono', monospace" }}>nenhuma tarefa disponível</p>
              ) : available.map(t => (
                <button key={t.id} onClick={() => addExisting(t.id)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--muted)", color: "var(--foreground)", fontSize: 13, cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >{t.text}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <BackButton navigate={navigate} />
          <HelpTooltip title="Lei de Parkinson" content='"O trabalho expande-se até preencher o tempo disponível." Defina prazos curtos e intencionais.' steps={["Crie ou selecione tarefas existentes", "Escolha um prazo curto e inicie", "A pressão do timer elimina procrastinação", "Ao fim do tempo, considere encerrada"]} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Lei de Parkinson</h1>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 18, fontStyle: "italic" }}>"O trabalho expande-se até preencher o tempo disponível."</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {parkinsonTasks.map(task => {
            const elapsed = elapsedMap[task.id] ?? 0;
            const total = (task.parkinsionMins ?? 25) * 60;
            const pct = Math.min(1, elapsed / total);
            const remaining = total - elapsed;
            const barColor = pct > 0.8 ? "#ef4444" : pct > 0.5 ? "#f59e0b" : "var(--primary)";
            const isRunning = runningMap[task.id] ?? false;
            const isDone = task.done || elapsed >= total;
            return (
              <div key={task.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--muted-foreground)" : "var(--foreground)" }}>{task.text}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>{task.parkinsionMins} min alocados</p>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, color: isDone ? "#ef4444" : "var(--foreground)", minWidth: 52, textAlign: "right" }}>
                    {isDone ? "00:00" : fmt(remaining)}
                  </span>
                </div>
                <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * 100}%`, background: barColor, borderRadius: 2, transition: "width 0.5s, background 0.3s" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startStop(task.id, task.parkinsionMins ?? 25)} disabled={isDone} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: isDone ? "var(--muted)" : isRunning ? "#ef444433" : "var(--primary)", color: isDone ? "var(--muted-foreground)" : isRunning ? "#ef4444" : "white", fontSize: 12, fontWeight: 500, cursor: isDone ? "default" : "pointer", transition: "all 0.15s" }}>
                    {isDone ? "Tempo esgotado!" : isRunning ? "⏸ Pausar" : "▶ Iniciar"}
                  </button>
                  <button onClick={() => resetTask(task.id)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted-foreground)", fontSize: 11, cursor: "pointer" }}>Reset</button>
                  <button onClick={() => removeFromParkinson(task.id)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted-foreground)", fontSize: 14, cursor: "pointer" }}>×</button>
                </div>
              </div>
            );
          })}
          {parkinsonTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--muted-foreground)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>nenhuma tarefa — adicione abaixo</div>
          )}
        </div>
      </div>

      {/* Fixed chat-style input at bottom */}
      <div style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "12px 20px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
          {[10, 15, 20, 25, 30, 45].map(m => (
            <button key={m} onClick={() => setMins(m)} style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 20, border: "1px solid", borderColor: mins === m ? "var(--primary)" : "var(--border)", background: mins === m ? "rgba(124,106,247,0.12)" : "transparent", color: mins === m ? "var(--primary)" : "var(--muted-foreground)", fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>{m}m</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addNew()} placeholder="Nova tarefa cronometrada..." style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 20, padding: "10px 16px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          <button onClick={() => setShowPicker(true)} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--muted)", color: "var(--muted-foreground)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }} title="Tarefas existentes">📋</button>
          <button onClick={addNew} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>+</button>
        </div>
      </div>
    </div>
  );
}
