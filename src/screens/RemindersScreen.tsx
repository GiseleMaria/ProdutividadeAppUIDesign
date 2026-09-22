import { useState } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";

interface Props { navigate: (s: Screen) => void; }

export default function RemindersScreen({ navigate }: Props) {
  const { tasks, addTask, updateTask } = useStore();
  const [input, setInput] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  });

  const today = new Date().toISOString().slice(0, 10);

  const withDeadline = tasks.filter(t => t.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!));

  const overdue = withDeadline.filter(t => t.deadline! < today && !t.done);
  const todayTasks = withDeadline.filter(t => t.deadline === today && !t.done);
  const upcoming = withDeadline.filter(t => t.deadline! > today && !t.done);
  const done = withDeadline.filter(t => t.done);

  const add = () => {
    if (!input.trim()) return;
    addTask(input.trim(), { deadline, twoMinVerdict: null });
    setInput("");
  };

  const toggle = (id: number, done: boolean) => updateTask(id, { done });

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("-");
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${day} ${months[parseInt(m) - 1]} ${y}`;
  };

  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - new Date(today).getTime()) / 86400000);
    if (diff === 0) return "hoje";
    if (diff === 1) return "amanhã";
    if (diff < 0) return `${Math.abs(diff)}d atrasado`;
    return `em ${diff}d`;
  };

  const Section = ({ title, items, color }: { title: string; items: typeof withDeadline; color: string }) => (
    items.length > 0 ? (
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{title} ({items.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid", borderColor: task.deadline! < today && !task.done ? "#ef444433" : "var(--border)", borderRadius: "var(--radius)", padding: "12px 14px", opacity: task.done ? 0.55 : 1, transition: "opacity 0.2s" }}>
              <div onClick={() => toggle(task.id, !task.done)} style={{ width: 18, height: 18, borderRadius: 5, border: task.done ? "none" : "1.5px solid var(--border)", background: task.done ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all 0.15s" }}>
                {task.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--foreground)", textDecoration: task.done ? "line-through" : "none" }}>{task.text}</p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: task.deadline! < today && !task.done ? "#ef4444" : "var(--muted-foreground)", marginTop: 2 }}>
                  📅 {fmtDate(task.deadline!)} · {daysUntil(task.deadline!)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <BackButton navigate={navigate} />
        <HelpTooltip title="Lembretes" content="Tarefas com prazo definido. Aparecem também no calendário no dia correspondente." steps={["Adicione uma tarefa com prazo", "Ela aparece no calendário automaticamente", "Tarefas atrasadas ficam em vermelho"]} />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Lembretes</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 24 }}>Tarefas com prazo — aparecem no calendário.</p>

      <Section title="atrasadas" items={overdue} color="#ef4444" />
      <Section title="hoje" items={todayTasks} color="#34d399" />
      <Section title="próximas" items={upcoming} color="var(--muted-foreground)" />
      <Section title="concluídas" items={done} color="var(--muted-foreground)" />

      {withDeadline.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--muted-foreground)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          nenhum lembrete — adicione um abaixo
        </div>
      )}

      {/* Add reminder */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, marginTop: 8 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>novo lembrete</p>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Descreva a tarefa..." style={{ width: "100%", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none", marginBottom: 12 }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Prazo</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} min={today} style={{ width: "100%", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none", colorScheme: "dark" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <button onClick={add} disabled={!input.trim()} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: input.trim() ? "var(--primary)" : "var(--muted)", color: input.trim() ? "white" : "var(--muted-foreground)", fontSize: 13, fontWeight: 600, cursor: input.trim() ? "pointer" : "default", flexShrink: 0, marginTop: 18 }}>
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
