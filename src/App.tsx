import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import PomodoroScreen from "./screens/PomodoroScreen";
import EisenhowerScreen from "./screens/EisenhowerScreen";
import GTDScreen from "./screens/GTDScreen";
import TopSixScreen from "./screens/TopSixScreen";
import ParkinsonScreen from "./screens/ParkinsonScreen";
import TwoMinuteScreen from "./screens/TwoMinuteScreen";
import RouletteScreen from "./screens/RouletteScreen";
import RemindersScreen from "./screens/RemindersScreen";
import ProfileScreen from "./screens/ProfileScreen";
import HabitsScreen from "./screens/HabitsScreen";
import RoutineScreen from "./screens/RoutineScreen";
import ListsScreen from "./screens/ListsScreen";
import DailyOnboarding from "./components/DailyOnboarding";
import AuthScreen from "./components/AuthScreen";

export type Screen =
  | "home" | "calendar" | "pomodoro" | "eisenhower" | "gtd"
  | "topSix" | "parkinson" | "twoMinute" | "roulette" | "reminders"
  | "profile" | "habits" | "routine" | "lists";

export interface User { name: string; email: string; avatar: string; }

const TODAY_KEY = `onboarding-${new Date().toDateString()}`;
const USER_KEY = "focus-user";

function AppInner() {
  const { tasks, addTask, updateTask } = useStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? "null"); } catch { return null; }
  });
  const [onboardingDone, setOnboardingDone] = useState(() => !!localStorage.getItem(TODAY_KEY));
  const [onboardingTasks, setOnboardingTasks] = useState<string[]>([]);

  const navigate = (s: Screen) => setScreen(s);

  const handleLogin = (u: User) => { localStorage.setItem(USER_KEY, JSON.stringify(u)); setUser(u); };
  const finishOnboarding = (texts: string[]) => {
    localStorage.setItem(TODAY_KEY, "1");
    setOnboardingTasks(texts);
    const date = new Date().toISOString().slice(0, 10);
    const planned = tasks.filter(task => task.inTopSix && (task.topSixDate || task.deadline) === date);
    planned.forEach(task => {
      if (!texts.some(text => text.trim().toLowerCase() === task.text.trim().toLowerCase())) updateTask(task.id, { inTopSix: false, topSixOrder: 0, topSixDate: undefined });
    });
    texts.forEach((text, index) => {
      const existing = planned.find(task => task.text.trim().toLowerCase() === text.trim().toLowerCase());
      if (existing) updateTask(existing.id, { deadline: date, inTopSix: true, topSixOrder: index + 1, topSixDate: date });
      else addTask(text, { deadline: date, inTopSix: true, topSixOrder: index + 1, topSixDate: date });
    });
    setOnboardingDone(true);
  };
  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setScreen("home");
  };
  const handleUserUpdate = (patch: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setUser(next);
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  if (!onboardingDone) {
    const date = new Date().toISOString().slice(0, 10);
    const planned = tasks.filter(task => task.inTopSix && (task.topSixDate || task.deadline) === date).sort((a, b) => a.topSixOrder - b.topSixOrder).map(task => task.text);
    return <DailyOnboarding initialTasks={planned} onComplete={finishOnboarding} />;
  }

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", minHeight: "100vh" }}>
      {screen === "home" && <HomeScreen navigate={navigate} initialTasks={onboardingTasks} user={user} />}
      {screen === "calendar" && <CalendarScreen navigate={navigate} />}
      {screen === "pomodoro" && <PomodoroScreen navigate={navigate} />}
      {screen === "eisenhower" && <EisenhowerScreen navigate={navigate} />}
      {screen === "gtd" && <GTDScreen navigate={navigate} />}
      {screen === "topSix" && <TopSixScreen navigate={navigate} />}
      {screen === "parkinson" && <ParkinsonScreen navigate={navigate} />}
      {screen === "twoMinute" && <TwoMinuteScreen navigate={navigate} />}
      {screen === "roulette" && <RouletteScreen navigate={navigate} />}
      {screen === "reminders" && <RemindersScreen navigate={navigate} />}
      {screen === "profile" && <ProfileScreen navigate={navigate} user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} />}
      {screen === "habits" && <HabitsScreen navigate={navigate} />}
      {screen === "routine" && <RoutineScreen navigate={navigate} />}
      {screen === "lists" && <ListsScreen navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
