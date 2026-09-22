import { Screen } from "../App";

interface Props {
  navigate: (s: Screen) => void;
  to?: Screen;
}

export default function BackButton({ navigate, to = "home" }: Props) {
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: "var(--muted-foreground)",
        fontSize: "13px",
        fontFamily: "'DM Mono', monospace",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
        transition: "color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      voltar
    </button>
  );
}
