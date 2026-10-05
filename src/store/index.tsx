import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type Quadrant = "do" | "schedule" | "delegate" | "eliminate";
export type GTDBucket = "inbox" | "next" | "waiting" | "someday" | "done";
export type TwoMinVerdict = "do" | "defer" | "delegate" | null;
export type ItemKind = "task" | "reminder";

export interface SharedTask {
  id: number;
  text: string;
  done: boolean;
  deadline?: string;
  time?: string;
  kind?: ItemKind;
  quadrant?: Quadrant;
  inTopSix: boolean;
  topSixOrder: number;
  topSixDate?: string;
  parkinsionMins?: number;
  twoMinVerdict: TwoMinVerdict;
  gtdBucket?: GTDBucket;
  createdAt: string;
  routineId?: number;
}

export interface CalEvent {
  id: number;
  day: number;
  month: number;
  year: number;
  title: string;
  time: string;
  color: string;
  notes?: string;
  type: "event" | "activity";
  routineId?: number;
}

export interface Habit {
  id: number;
  name: string;
  goal?: number;
  entries: Record<string, number>;
  createdAt: string;
}

export interface RoutineItem {
  id: number;
  title: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  type: "routine" | "task" | "event";
  startsOn: string;
}

export interface NoteList {
  id: number;
  title: string;
  items: { id: number; text: string; done: boolean }[];
}

const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const now = new Date();
const today = localDate(now);
const tomorrowDate = new Date(now);
tomorrowDate.setDate(now.getDate() + 1);
const tomorrow = localDate(tomorrowDate);

const SEED_TASKS: SharedTask[] = [
  { id: 1, text: "Revisar relatório Q3", done: false, deadline: today, kind: "task", quadrant: "do", inTopSix: true, topSixOrder: 1, topSixDate: today, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 2, text: "Reunião com equipe às 14h", done: false, deadline: today, time: "14:00", kind: "reminder", quadrant: "do", inTopSix: true, topSixOrder: 2, topSixDate: today, twoMinVerdict: null, gtdBucket: "next", createdAt: today },
  { id: 3, text: "Enviar proposta ao cliente", done: true, deadline: today, kind: "task", quadrant: "schedule", inTopSix: true, topSixOrder: 3, topSixDate: today, twoMinVerdict: "do", gtdBucket: "done", createdAt: today },
  { id: 4, text: "Estudar TypeScript avançado", done: false, deadline: tomorrow, kind: "task", quadrant: "schedule", inTopSix: false, topSixOrder: 0, twoMinVerdict: null, gtdBucket: "someday", createdAt: today },
];

const SEED_EVENTS: CalEvent[] = [
  { id: 101, day: now.getDate(), month: now.getMonth(), year: now.getFullYear(), title: "Revisão de sprint", time: "09:00", color: "#7c6af7", type: "event" },
  { id: 102, day: now.getDate() + 2, month: now.getMonth(), year: now.getFullYear(), title: "Almoço com cliente", time: "12:30", color: "#f472b6", type: "event" },
];

interface StoreCtx {
  tasks: SharedTask[];
  events: CalEvent[];
  habits: Habit[];
  routines: RoutineItem[];
  lists: NoteList[];
  addTask: (text: string, opts?: Partial<SharedTask>) => SharedTask;
  updateTask: (id: number, patch: Partial<SharedTask>) => void;
  removeTask: (id: number) => void;
  addEvent: (event: Omit<CalEvent, "id">) => void;
  updateEvent: (id: number, patch: Partial<CalEvent>) => void;
  removeEvent: (id: number) => void;
  addHabit: (name: string, goal?: number) => void;
  incrementHabit: (id: number, date?: string) => void;
  updateHabit: (id: number, patch: Partial<Pick<Habit, "name" | "goal">>) => void;
  removeHabit: (id: number) => void;
  addRoutine: (item: Omit<RoutineItem, "id">) => void;
  updateRoutine: (id: number, patch: Partial<RoutineItem>) => void;
  removeRoutine: (id: number) => void;
  addList: (title: string) => void;
  removeList: (id: number) => void;
  addListItem: (listId: number, text: string) => void;
  toggleListItem: (listId: number, itemId: number) => void;
  updateList: (id: number, title: string) => void;
  updateListItem: (listId: number, itemId: number, text: string) => void;
  moveList: (id: number, direction: -1 | 1) => void;
  moveListItem: (listId: number, itemId: number, direction: -1 | 1) => void;
  clearAllData: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<SharedTask[]>(() => load("focus-tasks", SEED_TASKS));
  const [events, setEvents] = useState<CalEvent[]>(() => load("focus-events", SEED_EVENTS));
  const [habits, setHabits] = useState<Habit[]>(() => load<any[]>("focus-habits", []).map(habit => ({ ...habit, createdAt: habit.createdAt || today })));
  const [routines, setRoutines] = useState<RoutineItem[]>(() => load<any[]>("focus-routines", []).map(item => ({ ...item, weekdays: item.weekdays || [item.weekday ?? 1], startsOn: item.startsOn || today })));
  const [lists, setLists] = useState<NoteList[]>(() => load("focus-lists", []));

  useEffect(() => localStorage.setItem("focus-tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("focus-events", JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem("focus-habits", JSON.stringify(habits)), [habits]);
  useEffect(() => localStorage.setItem("focus-routines", JSON.stringify(routines)), [routines]);
  useEffect(() => localStorage.setItem("focus-lists", JSON.stringify(lists)), [lists]);
  useEffect(() => {
    const current = new Date();
    const date = localDate(current);
    routines.filter(item => item.startsOn <= date && item.weekdays.includes(current.getDay()) && item.type !== "routine").forEach(item => {
      if (item.type === "task" && !tasks.some(task => task.routineId === item.id && task.deadline === date)) {
        setTasks(previous => [...previous, {
          id: Date.now() + Math.random(), text: item.title, done: false, deadline: date, time: item.startTime, kind: "task",
          inTopSix: false, topSixOrder: 0, twoMinVerdict: null, createdAt: date, routineId: item.id,
        }]);
      }
      if (item.type === "event" && !events.some(event => event.routineId === item.id && event.day === current.getDate() && event.month === current.getMonth() && event.year === current.getFullYear())) {
        setEvents(previous => [...previous, { id: Date.now() + Math.random(), day: current.getDate(), month: current.getMonth(), year: current.getFullYear(), title: item.title, time: item.startTime, color: "#7c6af7", type: "event", notes: `Rotina · até ${item.endTime}`, routineId: item.id }]);
      }
    });
  }, [routines, tasks, events]);

  const addTask = useCallback((text: string, opts: Partial<SharedTask> = {}) => {
    const task: SharedTask = {
      id: Date.now() + Math.random(),
      text,
      done: false,
      kind: "task",
      inTopSix: false,
      topSixOrder: 0,
      twoMinVerdict: null,
      createdAt: localDate(),
      ...opts,
    };
    setTasks(previous => [...previous, task]);
    return task;
  }, []);
  const updateTask = useCallback((id: number, patch: Partial<SharedTask>) => setTasks(previous => previous.map(task => task.id === id ? { ...task, ...patch } : task)), []);
  const removeTask = useCallback((id: number) => setTasks(previous => previous.filter(task => task.id !== id)), []);
  const addEvent = useCallback((event: Omit<CalEvent, "id">) => setEvents(previous => [...previous, { ...event, id: Date.now() + Math.random() }]), []);
  const updateEvent = useCallback((id: number, patch: Partial<CalEvent>) => setEvents(previous => previous.map(event => event.id === id ? { ...event, ...patch } : event)), []);
  const removeEvent = useCallback((id: number) => setEvents(previous => previous.filter(event => event.id !== id)), []);
  const addHabit = useCallback((name: string, goal?: number) => setHabits(previous => [...previous, { id: Date.now(), name, goal, entries: {}, createdAt: localDate() }]), []);
  const incrementHabit = useCallback((id: number, date = localDate()) => setHabits(previous => previous.map(habit => habit.id === id ? { ...habit, entries: { ...habit.entries, [date]: (habit.entries[date] || 0) + 1 } } : habit)), []);
  const updateHabit = useCallback((id: number, patch: Partial<Pick<Habit, "name" | "goal">>) => setHabits(previous => previous.map(habit => habit.id === id ? { ...habit, ...patch } : habit)), []);
  const removeHabit = useCallback((id: number) => setHabits(previous => previous.filter(habit => habit.id !== id)), []);
  const addRoutine = useCallback((item: Omit<RoutineItem, "id">) => setRoutines(previous => [...previous, { ...item, id: Date.now() }]), []);
  const updateRoutine = useCallback((id: number, patch: Partial<RoutineItem>) => {
    setRoutines(previous => previous.map(item => item.id === id ? { ...item, ...patch } : item));
    if (patch.title || patch.startTime) {
      setTasks(previous => previous.map(task => task.routineId === id ? { ...task, text: patch.title || task.text, time: patch.startTime || task.time } : task));
      setEvents(previous => previous.map(event => event.routineId === id ? { ...event, title: patch.title || event.title, time: patch.startTime || event.time } : event));
    }
  }, []);
  const removeRoutine = useCallback((id: number) => setRoutines(previous => previous.filter(item => item.id !== id)), []);
  const addList = useCallback((title: string) => setLists(previous => [...previous, { id: Date.now(), title, items: [] }]), []);
  const removeList = useCallback((id: number) => setLists(previous => previous.filter(list => list.id !== id)), []);
  const addListItem = useCallback((listId: number, text: string) => setLists(previous => previous.map(list => list.id === listId ? { ...list, items: [...list.items, { id: Date.now(), text, done: false }] } : list)), []);
  const toggleListItem = useCallback((listId: number, itemId: number) => setLists(previous => previous.map(list => list.id === listId ? { ...list, items: list.items.map(item => item.id === itemId ? { ...item, done: !item.done } : item) } : list)), []);
  const updateList = useCallback((id: number, title: string) => setLists(previous => previous.map(list => list.id === id ? { ...list, title } : list)), []);
  const updateListItem = useCallback((listId: number, itemId: number, text: string) => setLists(previous => previous.map(list => list.id === listId ? { ...list, items: list.items.map(item => item.id === itemId ? { ...item, text } : item) } : list)), []);
  const moveList = useCallback((id: number, direction: -1 | 1) => setLists(previous => {
    const from = previous.findIndex(list => list.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= previous.length) return previous;
    const next = [...previous];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  }), []);
  const moveListItem = useCallback((listId: number, itemId: number, direction: -1 | 1) => setLists(previous => previous.map(list => {
    if (list.id !== listId) return list;
    const from = list.items.findIndex(item => item.id === itemId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= list.items.length) return list;
    const items = [...list.items];
    [items[from], items[to]] = [items[to], items[from]];
    return { ...list, items };
  })), []);

  const clearAllData = useCallback(() => {
    setTasks([]);
    setEvents([]);
    setHabits([]);
    setRoutines([]);
    setLists([]);
  }, []);

  return (
    <Ctx.Provider value={{ tasks, events, habits, routines, lists, addTask, updateTask, removeTask, addEvent, updateEvent, removeEvent, addHabit, incrementHabit, updateHabit, removeHabit, addRoutine, updateRoutine, removeRoutine, addList, removeList, addListItem, toggleListItem, updateList, updateListItem, moveList, moveListItem, clearAllData }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
