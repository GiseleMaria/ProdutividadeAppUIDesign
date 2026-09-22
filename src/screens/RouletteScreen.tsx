import { useState, useRef, useEffect } from "react";
import { Screen } from "../App";
import { useStore } from "../store";
import BackButton from "../components/BackButton";
import HelpTooltip from "../components/HelpTooltip";

interface Props { navigate: (s: Screen) => void; }

const COLORS = ["#7c6af7","#34d399","#f59e0b","#f472b6","#60a5fa","#a78bfa","#ef4444","#10b981","#fb923c","#818cf8","#4ade80","#facc15"];

export default function RouletteScreen({ navigate }: Props) {
  const { tasks, addTask, updateTask } = useStore();
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRotRef = useRef(0);

  // Roulette items from pending tasks (not done)
  const pendingTasks = tasks.filter(t => !t.done);
  const [customItems, setCustomItems] = useState<string[]>([]);
  const allItems = [...pendingTasks.map(t => t.text), ...customItems];
  const SIZE = 280;
  const cx = SIZE / 2, cy = SIZE / 2, R = SIZE / 2 - 8;

  useEffect(() => { drawWheel(currentRotRef.current); }, [allItems]);

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas || allItems.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    const sliceAngle = (2 * Math.PI) / allItems.length;
    allItems.forEach((item, i) => {
      const start = rot + i * sliceAngle, end = start + sliceAngle;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, start, end); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
      ctx.strokeStyle = "#0d0d12"; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + sliceAngle / 2); ctx.textAlign = "right";
      ctx.fillStyle = "white"; ctx.font = `bold ${Math.min(12, 110 / allItems.length + 4)}px Outfit, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 4;
      ctx.fillText(item.length > 14 ? item.slice(0, 13) + "…" : item, R - 10, 5);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fillStyle = "#0d0d12"; ctx.fill();
  };

  const spin = () => {
    if (spinning || allItems.length < 2) return;
    setSpinning(true); setResult(null);
    const totalRot = (5 + Math.random() * 5) * Math.PI * 2 + Math.random() * Math.PI * 2;
    const duration = 3500, startTime = performance.now(), startRot = currentRotRef.current;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const angle = startRot + totalRot * easeOut(t);
      currentRotRef.current = angle;
      drawWheel(angle);
      if (t < 1) { requestAnimationFrame(animate); }
      else {
        setSpinning(false);
        const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const sliceAngle = (2 * Math.PI) / allItems.length;
        const pointerAngle = (Math.PI * 2 - norm + Math.PI * 1.5) % (Math.PI * 2);
        setResult(allItems[Math.floor(pointerAngle / sliceAngle) % allItems.length]);
      }
    };
    requestAnimationFrame(animate);
  };

  const addCustom = () => {
    if (!input.trim() || allItems.length >= 12) return;
    setCustomItems(c => [...c, input.trim()]);
    setInput("");
  };

  const removeItem = (label: string) => {
    const task = pendingTasks.find(t => t.text === label);
    if (task) { updateTask(task.id, { done: true }); }
    else { setCustomItems(c => c.filter(x => x !== label)); }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <BackButton navigate={navigate} />
        <HelpTooltip title="Roleta de Decisão" content="Deixe o acaso decidir! A roleta usa suas tarefas pendentes automaticamente." steps={["Suas tarefas pendentes já estão na roleta", "Adicione opções extras se quiser", "Gire e aceite o resultado"]} />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Roleta de Decisão</h1>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 24 }}>Muitas tarefas, sem saber por onde começar? Gire.</p>

      {/* Wheel */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
            <svg width="20" height="28" viewBox="0 0 20 28"><polygon points="10,28 0,4 20,4" fill="var(--foreground)" /><polygon points="10,28 2,6 18,6" fill="var(--primary)" /></svg>
          </div>
          <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{ borderRadius: "50%", display: "block" }} />
        </div>
        {result && (
          <div style={{ background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.3)", borderRadius: 12, padding: "12px 24px", textAlign: "center", marginBottom: 14, maxWidth: 280 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>a roleta escolheu</p>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{result}</p>
          </div>
        )}
        <button onClick={spin} disabled={spinning || allItems.length < 2} style={{ padding: "11px 36px", borderRadius: 12, border: "none", background: spinning || allItems.length < 2 ? "var(--muted)" : "var(--primary)", color: spinning || allItems.length < 2 ? "var(--muted-foreground)" : "white", fontSize: 14, fontWeight: 700, cursor: spinning || allItems.length < 2 ? "default" : "pointer" }}>
          {spinning ? "Girando…" : "🎯 Girar"}
        </button>
        {allItems.length < 2 && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", marginTop: 8 }}>adicione pelo menos 2 opções</p>}
      </div>

      {/* Items */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>opções ({allItems.length}/12)</p>
        {allItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {allItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS[i % COLORS.length] + "22", border: `1px solid ${COLORS[i % COLORS.length]}44`, borderRadius: 20, padding: "3px 10px 3px 12px" }}>
                <span style={{ fontSize: 11, color: "var(--foreground)", fontWeight: 500 }}>{item}</span>
                <button onClick={() => removeItem(item)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
        {allItems.length < 12 && (
          <div style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()} placeholder="Adicionar opção extra..." style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif", outline: "none" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
            <button onClick={addCustom} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
