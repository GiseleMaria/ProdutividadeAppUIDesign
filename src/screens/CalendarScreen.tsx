import { useState, useRef } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";
import EventActionModal from "../components/EventActionModal";
import AddEventModal from "../components/AddEventModal";

interface Props { navigate: (s: Screen) => void; }

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function CalendarScreen({ navigate }: Props) {
  const { tasks, events, routines, addEvent, updateEvent, removeEvent, addTask, updateTask, removeTask } = useStore();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());
  const [actionEventId, setActionEventId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const lastTapRef = useRef<{ key: string; time: number } | null>(null);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  // Tasks with deadline on this day also show as calendar items
  const tasksAsEvents = tasks
    .filter(t => t.deadline)
    .map(t => {
      const [ty, tm, td] = t.deadline!.split("-").map(Number);
      return { id: -t.id, day: td, month: tm - 1, year: ty, title: t.text, time: t.time || "—", color: t.done ? "var(--muted-foreground)" : "#34d399", notes: t.done ? "concluída" : t.kind === "reminder" ? "lembrete" : "tarefa", type: "activity" as const };
    });
  const routineEvents = routines.flatMap((routine, routineIndex) => Array.from({ length: new Date(viewYear, viewMonth + 1, 0).getDate() }, (_, index) => {
    const date = new Date(viewYear, viewMonth, index + 1);
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
    if (key < routine.startsOn || !routine.weekdays.includes(date.getDay())) return null;
    const alreadyMaterialized = routine.type === "task"
      ? tasks.some(task => task.routineId === routine.id && task.deadline === key)
      : events.some(event => event.routineId === routine.id && event.day === index + 1 && event.month === viewMonth && event.year === viewYear);
    if (alreadyMaterialized) return null;
    return { id: Number.MAX_SAFE_INTEGER - routineIndex * 100 - index, day: index + 1, month: viewMonth, year: viewYear, title: routine.title, time: routine.startTime, color: routine.type === "event" ? "#7c6af7" : "#34d399", notes: `recorrente · até ${routine.endTime}`, type: routine.type === "event" ? "event" as const : "activity" as const };
  }).filter(Boolean)).filter((item): item is NonNullable<typeof item> => item !== null);

  const allDayItems = [...events, ...tasksAsEvents, ...routineEvents]
    .filter(e => e.day === selected && e.month === viewMonth && e.year === viewYear);

  const itemCount = [...events, ...tasksAsEvents, ...routineEvents]
    .filter(e => e.month === viewMonth && e.year === viewYear)
    .reduce<Record<number, number>>((counts, item) => ({ ...counts, [item.day]: (counts[item.day] || 0) + 1 }), {});

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const selectedCellIndex = cells.findIndex(day => day === selected);
  const weekStart = Math.max(0, Math.floor(selectedCellIndex / 7) * 7);
  const visibleCells = viewMode === "week" ? cells.slice(weekStart, weekStart + 7) : cells;

  const handleEventTap = (id: number, key: string) => {
    const now = Date.now();
    if (lastTapRef.current?.key === key && now - lastTapRef.current.time < 350) {
      setActionEventId(id);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { key, time: now };
    }
  };

  const actionEvent = actionEventId !== null
    ? actionEventId < 0
      ? tasksAsEvents.find(e => e.id === actionEventId)
      : events.find(e => e.id === actionEventId)
    : null;

  const handleAddEvent = (data: ReturnType<typeof Object.create>) => {
    if (data.type === "event") {
      addEvent({ day: selected, month: viewMonth, year: viewYear, title: data.title, time: data.time, color: data.color, notes: data.notes, type: "event" });
    } else {
      const deadlineStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selected).padStart(2, "0")}`;
      addTask(data.title, { deadline: deadlineStr, twoMinVerdict: null, inTopSix: false, topSixOrder: 0 });
    }
    setShowAddModal(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      {showAddModal && (
        <AddEventModal
          day={selected} month={viewMonth} year={viewYear}
          onConfirm={handleAddEvent}
          onCancel={() => setShowAddModal(false)}
        />
      )}
      {actionEvent && (
        <EventActionModal
          event={actionEvent}
          initialKind={actionEvent.id < 0 ? (tasks.find(task => task.id === -actionEvent.id)?.kind || "task") : "event"}
          onClose={() => setActionEventId(null)}
          onSave={updated => {
            const deadline = `${updated.year}-${String(updated.month + 1).padStart(2, "0")}-${String(updated.day).padStart(2, "0")}`;
            if (actionEvent.id < 0) {
              if (updated.itemKind === "event") {
                removeTask(-actionEvent.id);
                addEvent({ day: updated.day, month: updated.month, year: updated.year, title: updated.title, time: updated.time, notes: updated.notes, color: "#7c6af7", type: "event" });
              } else updateTask(-actionEvent.id, { text: updated.title, time: updated.time, deadline, kind: updated.itemKind });
            } else if (updated.itemKind === "event") updateEvent(actionEvent.id, updated);
            else {
              removeEvent(actionEvent.id);
              addTask(updated.title, { deadline, time: updated.time, kind: updated.itemKind });
            }
            setActionEventId(null);
          }}
          onDelete={() => actionEvent.id < 0 ? removeTask(-actionEvent.id) : removeEvent(actionEvent.id)}
          onComplete={actionEvent.id < 0 ? () => updateTask(-actionEvent.id, { done: true }) : undefined}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <BackButton navigate={navigate} />
        <HelpTooltip
          title="Calendário"
          content="Visualize eventos e tarefas com prazo. Toque 2× em evento para timer/editar. Tarefas com prazo aparecem automaticamente."
          steps={["Navegue entre meses com as setas", "Clique em um dia e use + para adicionar", "Toque 2× em um evento para timer ou editar"]}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Calendário</h1>
        <div style={{ display: "flex", padding: 3, borderRadius: 10, background: "var(--muted)" }}>
          {(["month", "week"] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ border: "none", borderRadius: 8, padding: "6px 10px", background: viewMode === mode ? "var(--primary)" : "transparent", color: viewMode === mode ? "white" : "var(--muted-foreground)", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 9 }}>
              {mode === "month" ? "MÊS" : "SEMANA"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={prevMonth} style={navBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={navBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelected(today.getDate()); }} style={{ width: "100%", marginBottom: 10, border: "1px solid var(--border)", borderRadius: 9, background: "var(--card)", color: "var(--primary)", padding: "7px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>VOLTAR PARA {viewMode === "month" ? "O MÊS" : "A SEMANA"} ATUAL</button>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
          {DAYS_OF_WEEK.map(d => <div key={d} style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", padding: "3px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {visibleCells.map((day, i) => {
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSel = day === selected;
            const count = day ? itemCount[day] || 0 : 0;
            const intensity = Math.min(count, 4);
            const heat = intensity === 0 ? "transparent" : `rgba(124,106,247,${0.12 + intensity * 0.14})`;
            return (
              <div key={`${day}-${i}`} onClick={() => day && setSelected(day)} style={{ aspectRatio: viewMode === "week" ? "0.8" : "1", minHeight: viewMode === "week" ? 58 : undefined, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 8, cursor: day ? "pointer" : "default", background: isSel ? "var(--primary)" : isToday && !count ? "var(--muted)" : heat, border: isToday && !isSel ? "1px solid var(--primary)" : "1px solid transparent", transition: "background 0.1s" }}
              >
                <span style={{ fontSize: 13, fontWeight: isSel || isToday ? 600 : 400, color: isSel ? "white" : "var(--foreground)" }}>{day ?? ""}</span>
                {count > 0 && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: isSel ? "white" : "var(--foreground)", opacity: .75 }}>{count}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day header + add button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {MONTHS_SHORT[viewMonth]} {selected}
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--primary)", background: "rgba(124,106,247,0.1)", border: "1px solid rgba(124,106,247,0.25)", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}
        >
          + adicionar
        </button>
      </div>

      {allDayItems.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
          Nenhum evento ou tarefa neste dia.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {allDayItems.map((item, i) => {
            const isTask = item.id < 0;
            const key = `${item.id}-${i}`;
            return (
              <div key={key} onClick={() => item.id < Number.MAX_SAFE_INTEGER - 10000 && handleEventTap(item.id, key)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "border-color 0.15s", userSelect: "none" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + "66"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{ width: 3, height: 36, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>{item.title}</p>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: item.type === "event" ? "var(--primary)" : "#34d399", background: item.type === "event" ? "rgba(124,106,247,0.12)" : "rgba(52,211,153,0.12)", padding: "1px 6px", borderRadius: 10 }}>
                      {item.type === "event" ? "evento" : "atividade"}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{item.time}{item.notes ? ` · ${item.notes}` : ""}</p>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)", opacity: 0.5 }}>2×</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" };
