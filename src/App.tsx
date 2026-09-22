import { useState } from "react";
import { StoreProvider } from "./store";
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
import DailyOnboarding from "./components/DailyOnboarding";
import AuthScreen from "./components/AuthScreen";

export type Screen =
  | "home" | "calendar" | "pomodoro" | "eisenhower" | "gtd"
  | "topSix" | "parkinson" | "twoMinute" | "roulette" | "reminders";

export interface User { name: string; email: string; avatar: string; }

const TODAY_KEY = `onboarding-${new Date().toDateString()}`;
const USER_KEY = "focus-user";

function AppInner() {
  const [screen, setScreen] = useState<Screen>("home");
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? "null"); } catch { return null; }
  });
  const [onboardingDone, setOnboardingDone] = useState(() => !!localStorage.getItem(TODAY_KEY));
  const [onboardingTasks, setOnboardingTasks] = useState<string[]>([]);

  const navigate = (s: Screen) => setScreen(s);

  const handleLogin = (u: User) => { localStorage.setItem(USER_KEY, JSON.stringify(u)); setUser(u); };
  const finishOnboarding = (tasks: string[]) => {
    localStorage.setItem(TODAY_KEY, "1");
    setOnboardingTasks(tasks);
    setOnboardingDone(true);
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  if (!onboardingDone) return <DailyOnboarding onComplete={finishOnboarding} />;

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
