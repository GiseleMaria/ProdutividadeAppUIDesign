interface Props {
  onLogin: (user: { name: string; email: string; avatar: string }) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const handleGoogle = () => {
    onLogin({
      name: "Pedro Alves",
      email: "pedro.alves@gmail.com",
      avatar: "https://ui-avatars.com/api/?name=Pedro+Alves&background=7c6af7&color=fff&size=80",
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      background: "var(--background)",
    }}>
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
          ✦
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Focus</h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: 40 }}>
          Seu sistema de produtividade pessoal.<br />Faça login para salvar seus dados.
        </p>

        <button
          onClick={handleGoogle}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            marginBottom: 16,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "var(--muted)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.62 4.62 0 01-2 3.03v2.5h3.24c1.9-1.75 3-4.33 3-7.32z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.97-.9 6.63-2.43l-3.24-2.51c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.07v2.6A10 10 0 0010 20z" fill="#34A853"/>
            <path d="M4.41 11.9A6.01 6.01 0 014.1 10c0-.66.11-1.3.31-1.9V5.5H1.07A10 10 0 000 10c0 1.61.38 3.13 1.07 4.5l3.34-2.6z" fill="#FBBC05"/>
            <path d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.96 9.96 0 0010 0 10 10 0 001.07 5.5l3.34 2.6C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}>
          seus dados ficam salvos na sua conta
        </p>

        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
          {["Tarefas sincronizadas", "Calendário integrado", "Histórico de sessões Pomodoro"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(124,106,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
