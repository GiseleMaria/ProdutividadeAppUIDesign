import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type Quadrant = "do" | "schedule" | "delegate" | "eliminate";
export type GTDBucket = "inbox" | "next" | "waiting" | "someday" | "done";
export type TwoMinVerdict = "do" | "defer" | "delegate" | null;

export interface SharedTask {
  id: number;
  text: string;
  done: boolean;
  deadline?: string; // YYYY-MM-DD — used for reminders and calendar
  quadrant?: Quadrant;
  inTopSix: boolean;
  topSixOrder: number; // 1-6, 0 = not ordered
  parkinsionMins?: number;
  twoMinVerdict: TwoMinVerdict;
  gtdBucket?: GTDBucket;
  createdAt: string;
}

export interface CalEvent {
  id: number;
  day: number;
  month: number; // 0-indexed
  year: number;
  title: string;
  time: string;
  color: string;
  notes?: string;
  type: "event" | "activity";
}

// ── Seed data ──────────────────────────────────────────────────────────────

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, "0")}-${String(nextWeek.getDate()).padStart(2, "0")}`;

const SEED_TASKS: SharedTask[] = [
  { id: 1, text: "Revisar relatório Q3", done: false, deadline: today, quadrant: "do", inTopSix: true, topSixOrder: 1, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 2, text: "Reunião com equipe às 14h", done: false, deadline: today, quadrant: "do", inTopSix: true, topSixOrder: 2, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 3, text: "Enviar proposta ao cliente", done: true, deadline: today, quadrant: "schedule", inTopSix: true, topSixOrder: 3, twoMinVerdict: "do", gtdBucket: "done", createdAt: today },
  { id: 4, text: "Estudar TypeScript avançado", done: false, deadline: tomorrowStr, quadrant: "schedule", inTopSix: true, topSixOrder: 4, twoMinVerdict: null, gtdBucket: "someday", createdAt: today },
  { id: 5, text: "Responder e-mails rotineiros", done: false, quadrant: "delegate", inTopSix: false, topSixOrder: 0, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 6, text: "Redes sociais pessoais", done: false, quadrant: "eliminate", inTopSix: false, topSixOrder: 0, twoMinVerdict: "defer", gtdBucket: "someday", createdAt: today },
  { id: 7, text: "Planejamento trimestral", done: false, deadline: nextWeekStr, quadrant: "schedule", inTopSix: false, topSixOrder: 0, twoMinVerdict: null, gtdBucket: "inbox", createdAt: today },
  { id: 8, text: "Atualizar documentação", done: false, deadline: nextWeekStr, quadrant: "schedule", inTopSix: true, topSixOrder: 5, parkinsionMins: 30, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 9, text: "Bug crítico em produção", done: false, deadline: today, quadrant: "do", inTopSix: false, topSixOrder: 0, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 10, text: "Confirmar reunião de amanhã", done: false, twoMinVerdict: null, inTopSix: false, topSixOrder: 0, createdAt: today },
];

const SEED_EVENTS: CalEvent[] = [
  { id: 101, day: now.getDate(), month: now.getMonth(), year: now.getFullYear(), title: "Revisão de sprint", time: "09:00", color: "#7c6af7", type: "event" },
  { id: 102, day: now.getDate() + 2, month: now.getMonth(), year: now.getFullYear(), title: "Almoço com cliente", time: "12:30", color: "#34d399", type: "event" },
  { id: 103, day: now.getDate() + 5, month: now.getMonth(), year: now.getFullYear(), title: "Dentista", time: "15:00", color: "#f59e0b", type: "event" },
  { id: 104, day: now.getDate() + 8, month: now.getMonth(), year: now.getFullYear(), title: "Apresentação Q3", time: "10:00", color: "#7c6af7", type: "event" },
  { id: 105, day: now.getDate() + 8, month: now.getMonth(), year: now.getFullYear(), title: "Reunião de produto", time: "14:00", color: "#f472b6", type: "event" },
  { id: 106, day: now.getDate() + 3, month: now.getMonth(), year: now.getFullYear(), title: "Workshop design", time: "09:30", color: "#34d399", type: "activity" },
];

// ── Context ──────────────────────────────────────────────────────────────────

interface StoreCtx {
  tasks: SharedTask[];
  events: CalEvent[];
  addTask: (text: string, opts?: Partial<SharedTask>) => SharedTask;
  updateTask: (id: number, patch: Partial<SharedTask>) => void;
  removeTask: (id: number) => void;
  addEvent: (ev: Omit<CalEvent, "id">) => void;
  updateEvent: (id: number, patch: Partial<CalEvent>) => void;
  removeEvent: (id: number) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<SharedTask[]>(() => loadFromStorage("focus-tasks", SEED_TASKS));
  const [events, setEvents] = useState<CalEvent[]>(() => loadFromStorage("focus-events", SEED_EVENTS));

  const persist = useCallback((t: SharedTask[], e: CalEvent[]) => {
    localStorage.setItem("focus-tasks", JSON.stringify(t));
    localStorage.setItem("focus-events", JSON.stringify(e));
  }, []);

  const setT = useCallback((fn: (prev: SharedTask[]) => SharedTask[]) => {
    setTasks(prev => { const next = fn(prev); persist(next, events); return next; });
  }, [events, persist]);

  const setE = useCallback((fn: (prev: CalEvent[]) => CalEvent[]) => {
    setEvents(prev => { const next = fn(prev); persist(tasks, next); return next; });
  }, [tasks, persist]);

  const addTask = useCallback((text: string, opts?: Partial<SharedTask>): SharedTask => {
    const t: SharedTask = {
      id: Date.now(),
      text,
      done: false,
      inTopSix: false,
      topSixOrder: 0,
      twoMinVerdict: null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...opts,
    };
    setT(prev => [...prev, t]);
    return t;
  }, [setT]);

  const updateTask = useCallback((id: number, patch: Partial<SharedTask>) => {
    setT(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, [setT]);

  const removeTask = useCallback((id: number) => {
    setT(prev => prev.filter(t => t.id !== id));
  }, [setT]);

  const addEvent = useCallback((ev: Omit<CalEvent, "id">) => {
    setE(prev => [...prev, { ...ev, id: Date.now() }]);
  }, [setE]);

  const updateEvent = useCallback((id: number, patch: Partial<CalEvent>) => {
    setE(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, [setE]);

  const removeEvent = useCallback((id: number) => {
    setE(prev => prev.filter(e => e.id !== id));
  }, [setE]);

  return (
    <Ctx.Provider value={{ tasks, events, addTask, updateTask, removeTask, addEvent, updateEvent, removeEvent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
