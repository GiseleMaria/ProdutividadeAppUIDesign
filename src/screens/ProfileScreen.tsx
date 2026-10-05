import { useState } from "react";
import { Screen, User } from "../App";
import BackButton from "../components/BackButton";
import { useStore } from "../store";

interface Props { navigate: (screen: Screen) => void; user: User; onLogout: () => void; onUpdateUser: (patch: Partial<User>) => void; }

export default function ProfileScreen({ navigate, user, onLogout, onUpdateUser }: Props) {
  const { tasks, events, habits, routines, lists, clearAllData } = useStore();
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(user.name);
  const total = tasks.length + events.length + habits.length + routines.length + lists.length;

  return (
    <main className="screen">
      <header className="screen-header"><BackButton navigate={navigate} /><span className="eyebrow">CONTA E DADOS</span></header>
      <section className="profile-card">
        <label className="profile-photo">
          <img src={user.avatar} alt="" />
          <span>Alterar foto</span>
          <input type="file" accept="image/*" hidden onChange={event => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onUpdateUser({ avatar: String(reader.result) });
            reader.readAsDataURL(file);
          }} />
        </label>
        <div><h1>{user.name}</h1><p>{user.email}</p></div>
      </section>
      <section className="stats-row">
        <div><strong>{tasks.length}</strong><span>Tarefas</span></div>
        <div><strong>{habits.length}</strong><span>Hábitos</span></div>
        <div><strong>{total}</strong><span>Registros</span></div>
      </section>
      <section className="panel settings-list">
        <div className="profile-name-edit"><label>Nome de usuário<input value={name} onChange={event => setName(event.target.value)} /></label><button onClick={() => name.trim() && onUpdateUser({ name: name.trim() })}>Salvar</button></div>
        <button onClick={onLogout}><span><strong>Mudar de conta</strong><small>Sair e entrar com outro Google</small></span><b>→</b></button>
        <button onClick={() => setConfirmDelete(true)} className="danger"><span><strong>Excluir meus dados</strong><small>Apaga tarefas, eventos e demais registros</small></span><b>→</b></button>
      </section>
      <section className="panel feedback-card">
        <span className="eyebrow">FEEDBACK E BUGS</span>
        <h2>Ajude a melhorar o FocusFlow</h2>
        <textarea value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="Conte o que aconteceu ou o que podemos melhorar..." />
        <button className="primary-button wide" disabled={!feedback.trim()} onClick={() => { setFeedback(""); setSent(true); }}>{sent ? "Feedback enviado" : "Enviar feedback"}</button>
      </section>
      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(false)}>
          <div className="confirm-card" onClick={event => event.stopPropagation()}>
            <span className="eyebrow danger-text">AÇÃO IRREVERSÍVEL</span>
            <h2>Excluir todos os dados?</h2>
            <p>Seus registros de produtividade serão removidos deste dispositivo.</p>
            <div className="confirm-actions"><button onClick={() => setConfirmDelete(false)}>Cancelar</button><button className="danger-button" onClick={() => { clearAllData(); setConfirmDelete(false); }}>Excluir tudo</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
