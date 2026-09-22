import { useState, useRef, useEffect, useCallback } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import Confetti from "../components/Confetti";
import TwoMinutePopup from "../components/TwoMinutePopup";
import HelpTooltip from "../components/HelpTooltip";
import ConfirmActivityModal, { ActivityData } from "../components/ConfirmActivityModal";
import DoNowReminder from "../components/DoNowReminder";
import TaskPickerModal from "../components/TaskPickerModal";

interface Props {
  navigate: (s: Screen) => void;
  initialTasks?: string[];
  user: { name: string; email: string; avatar: string };
}

interface AudioMsg { id: number; duration: number; timestamp: Date; }
interface FileMsg { id: number; name: string; size: string; timestamp: Date; }
type ActivityLog = { id: number; text: string; verdict: string; timestamp: Date };

const NAV_ITEMS: { label: string; screen: Screen; icon: string; desc: string }[] = [
  { label: "Calendário", screen: "calendar", icon: "📅", desc: "Seus eventos" },
  { label: "Pomodoro", screen: "pomodoro", icon: "⏱", desc: "Foco profundo" },
  { label: "Eisenhower", screen: "eisenhower", icon: "⚡", desc: "Urgente × Importante" },
  { label: "GTD", screen: "gtd", icon: "🧠", desc: "Getting Things Done" },
  { label: "Top 6", screen: "topSix", icon: "✦", desc: "6 tarefas do dia" },
  { label: "Parkinson", screen: "parkinson", icon: "⏳", desc: "Lei do tempo" },
  { label: "2 Minutos", screen: "twoMinute", icon: "⚡", desc: "Regra dos 2 min" },
  { label: "Roleta", screen: "roulette", icon: "🎯", desc: "Deixe o acaso decidir" },
  { label: "Lembretes", screen: "reminders", icon: "🔔", desc: "Tarefas com prazo" },
];

type FlowStep = "idle" | "confirm" | "twoMin";

export default function HomeScreen({ navigate, initialTasks = [], user }: Props) {
  const { tasks, addTask, updateTask } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.deadline === today || t.inTopSix);

  const [chatInput, setChatInput] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [audioMessages, setAudioMessages] = useState<AudioMsg[]>([]);
  const [fileMessages, setFileMessages] = useState<FileMsg[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [pendingText, setPendingText] = useState("");
  const [pendingActivity, setPendingActivity] = useState<ActivityData | null>(null);
  const [reminderTask, setReminderTask] = useState<string | null>(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAllDoneRef = useRef(false);

  const now = new Date();
  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const monthNames = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

  const pendingCount = todayTasks.filter(t => !t.done).length;
  const allDone = todayTasks.length > 0 && pendingCount === 0;

  useEffect(() => {
    if (allDone && !prevAllDoneRef.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    prevAllDoneRef.current = allDone;
  }, [allDone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activityLog, audioMessages, fileMessages]);

  useEffect(() => () => { if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current); }, []);

  const toggleTask = (id: number, done: boolean) => updateTask(id, { done });

  const initiateActivity = (text: string) => {
    if (!text.trim()) return;
    setPendingText(text.trim());
    setChatInput("");
    setFlowStep("confirm");
  };

  const handleConfirmActivity = (data: ActivityData) => {
    setPendingActivity(data);
    if (data.addToTopSix) {
      addTask(data.title, { inTopSix: true, topSixOrder: tasks.filter(t => t.inTopSix).length + 1, deadline: data.date, twoMinVerdict: null });
    }
    setFlowStep("twoMin");
  };

  const handleTwoMinVerdict = useCallback((verdict: "do" | "schedule") => {
    const text = pendingActivity?.title ?? pendingText;
    setActivityLog(prev => [...prev, { id: Date.now(), text, verdict: verdict === "do" ? "Fazer agora" : "Agendado", timestamp: new Date() }]);
    if (verdict === "do") {
      if (!tasks.some(t => t.text === text && t.inTopSix)) {
        addTask(text, { inTopSix: true, topSixOrder: tasks.filter(t => t.inTopSix).length + 1, twoMinVerdict: "do", deadline: today });
      }
      reminderTimerRef.current = setTimeout(() => setReminderTask(text), 10 * 60 * 1000);
    } else {
      addTask(text, { deadline: pendingActivity?.date ?? today, twoMinVerdict: "defer" });
    }
    setFlowStep("idle");
    setPendingActivity(null);
    setPendingText("");
  }, [pendingActivity, pendingText, tasks, addTask, today]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = Math.round(file.size / 1024);
    const size = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    setFileMessages(m => [...m, { id: Date.now(), name: file.name, size, timestamp: new Date() }]);
    e.target.value = "";
  };

  const startRecording = async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (_) { /* no-op */ }
    setRecording(true); setRecordSeconds(0);
    recordIntervalRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    setAudioMessages(m => [...m, { id: Date.now(), duration: recordSeconds, timestamp: new Date() }]);
    setRecordSeconds(0);
  };

  const fmtTime = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const firstName = user.name.split(" ")[0];
  const hasMedia = activityLog.length > 0 || audioMessages.length > 0 || fileMessages.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", maxWidth: 480, margin: "0 auto" }}>
      <Confetti active={showConfetti} />

      {flowStep === "confirm" && (
        <ConfirmActivityModal initialTitle={pendingText} onConfirm={handleConfirmActivity} onCancel={() => { setFlowStep("idle"); setPendingText(""); }} />
      )}
      {flowStep === "twoMin" && pendingActivity && (
        <TwoMinutePopup taskText={pendingActivity.title} onClose={handleTwoMinVerdict} />
      )}
      {reminderTask && (
        <DoNowReminder taskText={reminderTask} onDone={() => { updateTask(tasks.find(t => t.text === reminderTask)?.id ?? 0, { done: true }); setReminderTask(null); }} onNotYet={() => setReminderTask(null)} />
      )}
      {showTaskPicker && (
        <TaskPickerModal
          existingTasks={tasks.map(t => ({ id: t.id, text: t.text, done: t.done }))}
          onAdd={text => { const t = tasks.find(x => x.text === text); if (t) { updateTask(t.id, { inTopSix: true, topSixOrder: tasks.filter(x => x.inTopSix).length + 1, deadline: today }); } else { addTask(text, { inTopSix: true, topSixOrder: tasks.filter(x => x.inTopSix).length + 1, deadline: today, twoMinVerdict: null }); } }}
          onClose={() => setShowTaskPicker(false)}
        />
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 8px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
              {dayNames[now.getDay()]}, {now.getDate()} {monthNames[now.getMonth()]}
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>Bom dia, {firstName} 👋</h1>
            <p style={{ fontSize: 13, color: allDone ? "#34d399" : "var(--muted-foreground)", marginTop: 4, transition: "color 0.3s" }}>
              {allDone ? "🎉 Todas as tarefas concluídas!" : `${pendingCount} tarefa${pendingCount !== 1 ? "s" : ""} pendente${pendingCount !== 1 ? "s" : ""} hoje.`}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HelpTooltip title="Tela Inicial" content="Hub de produtividade. Dados são compartilhados entre todos os métodos." steps={["Marque tarefas ao longo do dia", "Use os cards para acessar métodos", "Chat para registrar atividades rapidamente"]} />
            <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border)" }} />
          </div>
        </div>

        {/* Nav grid */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>métodos e ferramentas</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
            {NAV_ITEMS.map(item => (
              <button key={item.screen} onClick={() => navigate(item.screen)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 10px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "var(--muted)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", margin: "3px 0 1px" }}>{item.label}</p>
                <p style={{ fontSize: 9, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}>{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div style={{ background: "var(--card)", border: "1px solid", borderColor: allDone ? "#34d39944" : "var(--border)", borderRadius: "var(--radius)", padding: 14, marginBottom: 10, transition: "border-color 0.4s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>tarefas de hoje</p>
            <button onClick={() => setShowTaskPicker(true)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--primary)", background: "rgba(124,106,247,0.1)", border: "1px solid rgba(124,106,247,0.2)", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>+ adicionar</button>
          </div>
          {todayTasks.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", textAlign: "center", padding: "8px 0" }}>nenhuma tarefa para hoje</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {todayTasks.map(task => (
                <label key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div onClick={() => toggleTask(task.id, !task.done)} style={{ width: 18, height: 18, borderRadius: 5, border: task.done ? "none" : "1.5px solid var(--border)", background: task.done ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {task.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: task.done ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: task.done ? "line-through" : "none", transition: "all 0.15s", flex: 1 }}>{task.text}</span>
                  {task.deadline && task.deadline < new Date().toISOString().slice(0, 10) && !task.done && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#ef4444" }}>atrasada</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Activity log (not message bubbles) */}
        {hasMedia && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>registro de atividades</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activityLog.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.verdict === "Fazer agora" ? "#34d399" : "#7c6af7", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: "var(--foreground)" }}>{a.text}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>{fmtTime(a.timestamp)} · {a.verdict}</span>
                </div>
              ))}
              {audioMessages.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(124,106,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🎙</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 2, background: "var(--border)", borderRadius: 1 }}><div style={{ height: "100%", width: "30%", background: "var(--primary)", borderRadius: 1 }} /></div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>{fmtDuration(a.duration)}</span>
                </div>
              ))}
              {fileMessages.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(124,106,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>📎</div>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--foreground)" }}>{f.name}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>{f.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed chat at bottom */}
      <div style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "10px 16px 18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>atividades</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--muted-foreground)" }}>online</span>
          </div>
        </div>
        {recording ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 24, padding: "8px 16px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#ef4444", flex: 1 }}>Gravando {fmtDuration(recordSeconds)}</span>
            <button onClick={stopRecording} style={{ background: "#ef4444", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" fill="white" /></svg>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button onClick={() => fileInputRef.current?.click()} style={iconBtn} onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M15 8.5L8.5 15a4.5 4.5 0 01-6.364-6.364l7-7a3 3 0 014.243 4.243L6.5 12.75a1.5 1.5 0 01-2.121-2.121L10.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
            <div style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 20, padding: "9px 14px", display: "flex", alignItems: "center", transition: "border-color 0.15s" }} onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--primary)")} onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <textarea value={chatInput} onChange={e => { setChatInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); initiateActivity(chatInput); } }} placeholder="Escreva uma atividade..." rows={1} style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", resize: "none", lineHeight: 1.5, maxHeight: 96, overflowY: "auto" }} />
            </div>
            {chatInput.trim() ? (
              <button onClick={() => initiateActivity(chatInput)} style={{ ...iconBtn, background: "var(--primary)", color: "white", border: "none" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            ) : (
              <button onClick={startRecording} style={iconBtn} onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary)")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="6" y="1" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 8a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M8 13v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--muted)", color: "var(--muted-foreground)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" };
