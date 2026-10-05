import { useState } from "react";
import { Screen } from "../App";
import BackButton from "../components/BackButton";
import { RoutineItem, useStore } from "../store";

interface Props { navigate: (screen: Screen) => void; }
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function RoutineScreen({ navigate }: Props) {
  const { routines, addRoutine, updateRoutine, removeRoutine } = useStore();
  const [viewDay, setViewDay] = useState(new Date().getDay());
  const [weekdays, setWeekdays] = useState<number[]>([new Date().getDay()]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [type, setType] = useState<"routine" | "task" | "event">("routine");
  const [editingId, setEditingId] = useState<number | null>(null);

  const reset = () => { setTitle(""); setEditingId(null); };
  const save = () => {
    if (!title.trim() || weekdays.length === 0) return;
    const data = { title: title.trim(), weekdays, startTime, endTime, type, startsOn: new Date().toISOString().slice(0, 10) };
    if (editingId) updateRoutine(editingId, data);
    else addRoutine(data);
    reset();
  };
  const edit = (item: RoutineItem) => {
    setEditingId(item.id); setTitle(item.title); setWeekdays(item.weekdays); setStartTime(item.startTime); setEndTime(item.endTime); setType(item.type);
  };
  const selectedItems = routines.filter(item => item.weekdays.includes(viewDay)).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <main className="screen">
      <header className="screen-header"><BackButton navigate={navigate} /><span className="eyebrow">SEMANA RECORRENTE</span></header>
      <section className="hero-row"><div><h1>Rotina</h1><p>Escolha um ou vários dias para cada bloco.</p></div></section>
      <section className="panel routine-form">
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex: Faculdade" />
        <div><span className="muted-label">REPETIR EM</span><div className="multi-days">{DAYS.map((day, index) => <button className={weekdays.includes(index) ? "active" : ""} onClick={() => setWeekdays(previous => previous.includes(index) ? previous.filter(value => value !== index) : [...previous, index])} key={day}>{day.slice(0, 1)}</button>)}</div></div>
        <div className="form-grid">
          <label>Início<input type="time" value={startTime} onChange={event => setStartTime(event.target.value)} /></label>
          <label>Fim<input type="time" value={endTime} onChange={event => setEndTime(event.target.value)} /></label>
        </div>
        <div className="segmented">{(["routine", "task", "event"] as const).map(value => <button className={type === value ? "active" : ""} onClick={() => setType(value)} key={value}>{value === "routine" ? "Só rotina" : value === "task" ? "Tarefa" : "Evento"}</button>)}</div>
        <button className="primary-button wide" onClick={save}>{editingId ? "Salvar alterações" : "Adicionar à semana"}</button>
        {editingId && <button className="text-button" onClick={reset}>Cancelar edição</button>}
      </section>
      <nav className="day-tabs">{DAYS.map((day, index) => <button className={viewDay === index ? "active" : ""} onClick={() => setViewDay(index)} key={day}>{day}</button>)}</nav>
      <section className="timeline">
        {selectedItems.map(item => (
          <article className="timeline-item" key={item.id}>
            <div className="timeline-time">{item.startTime}<span>{item.endTime}</span></div>
            <button className={`timeline-card type-${item.type}`} onClick={() => edit(item)}><span className="muted-label">{item.type === "routine" ? "SÓ ROTINA" : `REPETE COMO ${item.type === "task" ? "TAREFA" : "EVENTO"}`}</span><h2>{item.title}</h2></button>
            <button className="ghost-icon" onClick={() => removeRoutine(item.id)}>×</button>
          </article>
        ))}
        {selectedItems.length === 0 && <div className="empty-state">Nenhum bloco recorrente para {DAYS[viewDay]}.</div>}
      </section>
    </main>
  );
}
