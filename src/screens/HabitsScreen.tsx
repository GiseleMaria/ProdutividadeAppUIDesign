import { useState } from "react";
import { Screen } from "../App";
import BackButton from "../components/BackButton";
import { Habit, useStore } from "../store";

interface Props { navigate: (screen: Screen) => void; }

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export default function HabitsScreen({ navigate }: Props) {
  const { habits, addHabit, incrementHabit, updateHabit, removeHabit } = useStore();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [selected, setSelected] = useState<Habit | null>(null);
  const today = dateKey(new Date());

  const create = () => {
    if (!name.trim()) return;
    addHabit(name.trim(), goal ? Math.max(1, Number(goal)) : undefined);
    setName("");
    setGoal("");
  };

  return (
    <main className="screen">
      <header className="screen-header"><BackButton navigate={navigate} /><span className="eyebrow">CONSISTÊNCIA DIÁRIA</span></header>
      <section className="hero-row"><div><h1>Hábitos</h1><p>Pequenos avanços, todos os dias.</p></div><div className="hero-orb">{habits.length}</div></section>
      <section className="panel habit-create">
        <input value={name} onChange={event => setName(event.target.value)} onKeyDown={event => event.key === "Enter" && create()} placeholder="Novo hábito" />
        <div className="goal-row">
          <input aria-label="Meta diária opcional" type="number" min={1} value={goal} onChange={event => setGoal(event.target.value.replace("-", ""))} placeholder="Meta opcional" />
          <button className="primary-button" onClick={create}>Adicionar</button>
        </div>
      </section>
      <div className="stack">
        {habits.map(habit => {
          const count = habit.entries[today] || 0;
          const percent = habit.goal ? Math.min(100, (count / habit.goal) * 100) : Math.min(100, count * 12);
          return (
            <article className="panel habit-card" key={habit.id} onDoubleClick={() => setSelected(habit)}>
              <div className="habit-top">
                <div><h2>{habit.name}</h2><span className="muted-label">{habit.goal ? `META ${habit.goal} POR DIA` : "SEM META · CLIQUE 2× PARA ESTATÍSTICAS"}</span></div>
                <button className="ghost-icon" onClick={() => removeHabit(habit.id)} aria-label="Excluir hábito">×</button>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
              <div className="habit-bottom">
                <span><strong>{count}</strong>{habit.goal ? ` / ${habit.goal}` : ""} hoje</span>
                <button className="increment-button" onClick={() => incrementHabit(habit.id)}>+1</button>
              </div>
            </article>
          );
        })}
        {habits.length === 0 && <div className="empty-state">Crie seu primeiro hábito e comece uma sequência hoje.</div>}
      </div>
      {selected && <HabitStats habit={habits.find(habit => habit.id === selected.id) || selected} onClose={() => setSelected(null)} onSave={(nameValue, goalValue) => updateHabit(selected.id, { name: nameValue, goal: goalValue })} />}
    </main>
  );
}

function HabitStats({ habit, onClose, onSave }: { habit: Habit; onClose: () => void; onSave: (name: string, goal?: number) => void }) {
  const [name, setName] = useState(habit.name);
  const [goal, setGoal] = useState(habit.goal?.toString() || "");
  const doneDates = Object.entries(habit.entries).filter(([, count]) => count > 0).map(([date]) => date).sort();
  let currentStreak = 0;
  const cursor = new Date();
  while (habit.entries[dateKey(cursor)] > 0) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const best = Math.max(0, ...Object.values(habit.entries));
  const lastDay = doneDates.at(-1);
  const month = new Date();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="confirm-card habit-stats" onClick={event => event.stopPropagation()}>
        <div className="section-heading"><span>ESTATÍSTICAS DO HÁBITO</span><button onClick={onClose}>×</button></div>
        <div className="stats-row">
          <div><strong>{currentStreak}</strong><span>Ofensiva atual</span></div>
          <div><strong>{best}</strong><span>Maior marca</span></div>
          <div><strong>{doneDates.length}</strong><span>Dias ativos</span></div>
        </div>
        <div className="habit-meta"><span>Iniciado em <b>{habit.createdAt}</b></span><span>Último +1 <b>{lastDay || "—"}</b></span></div>
        <div className="habit-calendar">
          {Array.from({ length: days }, (_, index) => {
            const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
            const count = habit.entries[date] || 0;
            return <div className={count ? "active" : ""} title={`${date}: ${count}`} key={date}>{index + 1}</div>;
          })}
        </div>
        <label className="modal-field">Nome<input value={name} onChange={event => setName(event.target.value)} /></label>
        <label className="modal-field">Meta opcional<input type="number" min={1} value={goal} onChange={event => setGoal(event.target.value.replace("-", ""))} /></label>
        <button className="primary-button wide" onClick={() => { onSave(name.trim() || habit.name, goal ? Number(goal) : undefined); onClose(); }}>Salvar alterações</button>
      </section>
    </div>
  );
}
