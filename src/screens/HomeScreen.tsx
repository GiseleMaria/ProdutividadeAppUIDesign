import { useEffect, useRef, useState } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import ConfirmActivityModal, { ActivityData } from "../components/ConfirmActivityModal";
import Confetti from "../components/Confetti";

interface Props {
  navigate: (screen: Screen) => void;
  initialTasks?: string[];
  user: { name: string; email: string; avatar: string };
}

type ComposerKind = "task" | "reminder" | "event";
type DraftMedia = { type: "file"; name: string; size: string } | { type: "audio"; duration: number };
type PendingEntry = { kind: ComposerKind; text: string };

const NAV_ITEMS: { label: string; screen: Screen; mark: string }[] = [
  { label: "Calendário", screen: "calendar", mark: "CA" },
  { label: "Pomodoro", screen: "pomodoro", mark: "PO" },
  { label: "Eisenhower", screen: "eisenhower", mark: "EI" },
  { label: "GTD", screen: "gtd", mark: "GT" },
  { label: "Top 6", screen: "topSix", mark: "06" },
  { label: "Hábitos", screen: "habits", mark: "HA" },
  { label: "Rotina", screen: "routine", mark: "RO" },
  { label: "Listas", screen: "lists", mark: "LI" },
  { label: "Parkinson", screen: "parkinson", mark: "PA" },
  { label: "2 Minutos", screen: "twoMinute", mark: "02" },
  { label: "Roleta", screen: "roulette", mark: "RL" },
  { label: "Lembretes", screen: "reminders", mark: "LE" },
];

export default function HomeScreen({ navigate, user }: Props) {
  const { tasks, events, addTask, addEvent, updateTask } = useStore();
  const todayDate = new Date();
  const today = todayDate.toISOString().slice(0, 10);
  const [navOrder, setNavOrder] = useState<Screen[]>(() => {
    try { return JSON.parse(localStorage.getItem("focus-nav-order") || "null") || NAV_ITEMS.map(item => item.screen); }
    catch { return NAV_ITEMS.map(item => item.screen); }
  });
  const [editingNav, setEditingNav] = useState(false);
  const [launcherMode, setLauncherMode] = useState<"scroll" | "grid">(() => localStorage.getItem("focus-launcher-mode") === "grid" ? "grid" : "scroll");
  const [kind, setKind] = useState<ComposerKind>("task");
  const [input, setInput] = useState("");
  const [draftMedia, setDraftMedia] = useState<DraftMedia | null>(null);
  const [pending, setPending] = useState<PendingEntry | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topSix = tasks.filter(task => task.inTopSix && (task.topSixDate || task.deadline || today) === today).sort((a, b) => a.topSixOrder - b.topSixOrder).slice(0, 6);
  const dayTasks = tasks.filter(task => task.deadline === today && !topSix.some(top => top.id === task.id));
  const dayEvents = events.filter(event => event.day === todayDate.getDate() && event.month === todayDate.getMonth() && event.year === todayDate.getFullYear());
  const allTodayDone = topSix.length > 0 && topSix.every(task => task.done);

  useEffect(() => {
    localStorage.setItem("focus-nav-order", JSON.stringify(navOrder));
  }, [navOrder]);
  useEffect(() => localStorage.setItem("focus-launcher-mode", launcherMode), [launcherMode]);
  useEffect(() => {
    if (!allTodayDone) return;
    setShowConfetti(true);
    const timeout = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timeout);
  }, [allTodayDone]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const orderedItems = navOrder.map(screen => NAV_ITEMS.find(item => item.screen === screen)).filter(Boolean) as typeof NAV_ITEMS;
  const moveNav = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= navOrder.length) return;
    setNavOrder(previous => {
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const send = () => {
    const mediaText = draftMedia?.type === "file" ? `Anexo: ${draftMedia.name}` : draftMedia ? `Áudio de ${draftMedia.duration}s` : "";
    const text = input.trim() || mediaText;
    if (!text) return;
    setPending({ kind, text });
  };

  const confirm = (data: ActivityData) => {
    if (!pending) return;
    if (data.type === "event") {
      const date = new Date(`${data.date}T12:00:00`);
      addEvent({ day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), title: data.title, time: data.time, notes: data.notes, color: "#7c6af7", type: "event" });
    } else {
      addTask(data.title, {
        deadline: data.date,
        time: data.time,
        kind: data.type,
        inTopSix: data.addToTopSix,
        topSixOrder: data.addToTopSix ? topSix.length + 1 : 0,
        topSixDate: data.addToTopSix ? data.date : undefined,
      });
    }
    setPending(null);
    setInput("");
    setDraftMedia(null);
  };

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const kb = Math.round(file.size / 1024);
    setDraftMedia({ type: "file", name: file.name, size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB` });
    event.target.value = "";
  };
  const startRecording = async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { /* preview may not expose a microphone */ }
    setRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => setRecordSeconds(seconds => seconds + 1), 1000);
  };
  const stopRecording = () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setDraftMedia({ type: "audio", duration: Math.max(1, recordSeconds) });
  };

  return (
    <div className="home-shell">
      <Confetti active={showConfetti} />
      {pending && <ConfirmActivityModal initialTitle={pending.text} initialType={pending.kind} allowTypeChange onConfirm={confirm} onCancel={() => setPending(null)} />}
      <div className="home-scroll">
        <header className="home-header">
          <div>
            <span className="eyebrow">{todayDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}</span>
            <h1>Olá, {user.name.split(" ")[0]}</h1>
            <p>{topSix.filter(task => !task.done).length} prioridades restantes hoje.</p>
          </div>
          <button className="avatar-button" onClick={() => navigate("profile")} aria-label="Abrir perfil"><img src={user.avatar} alt="" /></button>
        </header>

        <section className="launcher-section">
          <div className="section-heading"><span>ATALHOS</span><div><button onClick={() => setLauncherMode(mode => mode === "scroll" ? "grid" : "scroll")}>{launcherMode === "scroll" ? "Ver mais" : "Rolagem"}</button><button onClick={() => setEditingNav(value => !value)}>{editingNav ? "Concluir" : "Reordenar"}</button></div></div>
          <div className={launcherMode === "grid" ? "launcher-grid" : "launcher-row"}>
            {orderedItems.map((item, index) => (
              <div className="launcher-wrap" key={item.screen}>
                <button className="launcher-tile" onClick={() => !editingNav && navigate(item.screen)}>
                  <span>{item.mark}</span><small>{item.label}</small>
                </button>
                {editingNav && <div className="reorder-actions"><button onClick={() => moveNav(index, -1)}>‹</button><button onClick={() => moveNav(index, 1)}>›</button></div>}
              </div>
            ))}
          </div>
        </section>

        <section className="today-section">
          <div className="section-heading"><span>TOP 6 DO DIA</span><button onClick={() => navigate("topSix")}>Planejar</button></div>
          <div className="priority-list">
            {topSix.map((task, index) => (
              <button className={`priority-row ${task.done ? "is-done" : ""}`} onClick={() => updateTask(task.id, { done: !task.done })} key={task.id}>
                <span className="priority-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="task-check">{task.done ? "✓" : ""}</span>
                <span>{task.text}</span>
              </button>
            ))}
            {topSix.length === 0 && <button className="empty-inline" onClick={() => navigate("topSix")}>Defina as seis prioridades de hoje</button>}
          </div>
        </section>

        <section className="today-section">
          <div className="section-heading"><span>AGENDA DE HOJE</span><small>{dayTasks.length + dayEvents.length} ITENS</small></div>
          <div className="agenda-list">
            {dayEvents.map(event => <div className="agenda-row" key={`e-${event.id}`}><span className="agenda-time">{event.time}</span><i className="event-dot" /><div><strong>{event.title}</strong><small>EVENTO</small></div></div>)}
            {dayTasks.map(task => <button className={`agenda-row ${task.done ? "is-done" : ""}`} onClick={() => updateTask(task.id, { done: !task.done })} key={`t-${task.id}`}><span className="agenda-time">{task.time || "—"}</span><span className="task-check">{task.done ? "✓" : ""}</span><div><strong>{task.text}</strong><small>{task.kind === "reminder" ? "LEMBRETE" : "TAREFA"}</small></div></button>)}
            {dayTasks.length + dayEvents.length === 0 && <div className="empty-inline">Sua agenda está livre.</div>}
          </div>
        </section>

        <section className="today-section">
          <div className="section-heading"><span>PRÓXIMOS</span><small>7 DIAS</small></div>
          <div className="agenda-list">
            {[...tasks.filter(task => task.deadline && task.deadline > today).map(task => ({ id: `t-${task.id}`, date: task.deadline!, time: task.time || "—", title: task.text, type: task.kind === "reminder" ? "LEMBRETE" : "TAREFA" })),
              ...events.map(event => ({ id: `e-${event.id}`, date: `${event.year}-${String(event.month + 1).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`, time: event.time, title: event.title, type: "EVENTO" }))]
              .filter(item => item.date > today && item.date <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
              .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
              .slice(0, 8)
              .map(item => <div className="agenda-row" key={item.id}><span className="agenda-time">{item.date.slice(5).replace("-", "/")}</span><i className="event-dot" /><div><strong>{item.title}</strong><small>{item.time} · {item.type}</small></div></div>)}
          </div>
        </section>
      </div>

      <footer className="composer">
        <div className="composer-kinds">
          {(["task", "reminder", "event"] as const).map(value => <button className={kind === value ? "active" : ""} onClick={() => setKind(value)} key={value}>{value === "task" ? "Tarefa" : value === "reminder" ? "Lembrete" : "Evento"}</button>)}
        </div>
        {draftMedia && <div className="media-draft"><span>{draftMedia.type === "file" ? `${draftMedia.name} · ${draftMedia.size}` : `Áudio · ${draftMedia.duration}s`}</span><button onClick={() => setDraftMedia(null)}>×</button></div>}
        {recording ? (
          <div className="recording-row"><span className="record-dot" /><span>Gravando {recordSeconds}s</span><button onClick={stopRecording}>Parar e revisar</button></div>
        ) : (
          <div className="composer-row">
            <button className="composer-icon" onClick={() => fileRef.current?.click()} aria-label="Anexar imagem ou arquivo">＋</button>
            <input ref={fileRef} type="file" accept="image/*,audio/*" hidden onChange={selectFile} />
            <textarea rows={1} value={input} onChange={event => setInput(event.target.value)} placeholder={`Escreva ${kind === "event" ? "um evento" : kind === "reminder" ? "um lembrete" : "uma tarefa"}...`} />
            {!input.trim() && !draftMedia ? <button className="composer-icon" onClick={startRecording} aria-label="Gravar áudio">●</button> : <button className="send-button" onClick={send} aria-label="Enviar">↑</button>}
          </div>
        )}
      </footer>
    </div>
  );
}
