import { useState } from "react";
import { Screen } from "../App";
import BackButton from "../components/BackButton";
import { useStore } from "../store";

interface Props { navigate: (screen: Screen) => void; }

export default function ListsScreen({ navigate }: Props) {
  const { lists, addList, removeList, addListItem, toggleListItem, updateList, updateListItem, moveList, moveListItem } = useStore();
  const [newList, setNewList] = useState("");
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const createList = () => {
    if (!newList.trim()) return;
    addList(newList.trim());
    setNewList("");
  };

  return (
    <main className="screen">
      <header className="screen-header">
        <BackButton navigate={navigate} />
        <span className="eyebrow">NOTAS ORGANIZADAS</span>
      </header>
      <section className="hero-row">
        <div><h1>Listas</h1><p>Um espaço simples para tudo que você quer lembrar.</p></div>
      </section>
      <section className="panel form-row">
        <input value={newList} onChange={event => setNewList(event.target.value)} onKeyDown={event => event.key === "Enter" && createList()} placeholder="Nome da nova lista" />
        <button className="primary-button" onClick={createList}>Criar lista</button>
      </section>
      <div className="stack">
        {lists.map(list => (
          <article className="panel list-card" key={list.id}>
            <div className="habit-top">
              <div><h2>{list.title}</h2><span className="muted-label">{list.items.length} ITENS</span></div>
              <div className="list-controls">
                <button onClick={() => moveList(list.id, -1)}>↑</button><button onClick={() => moveList(list.id, 1)}>↓</button>
                <button onClick={() => { const title = window.prompt("Editar nome da lista", list.title); if (title?.trim()) updateList(list.id, title.trim()); }}>Editar</button>
                <button onClick={() => removeList(list.id)} aria-label="Excluir lista">×</button>
              </div>
            </div>
            <div className="list-items">
              {list.items.map(item => (
                <div className={`list-item ${item.done ? "is-done" : ""}`} key={item.id}>
                  <button className="item-main" onClick={() => toggleListItem(list.id, item.id)}><span className="check-dot">{item.done ? "✓" : ""}</span><span>{item.text}</span></button>
                  <div className="list-controls">
                    <button onClick={() => moveListItem(list.id, item.id, -1)}>↑</button><button onClick={() => moveListItem(list.id, item.id, 1)}>↓</button>
                    <button onClick={() => { const text = window.prompt("Editar item", item.text); if (text?.trim()) updateListItem(list.id, item.id, text.trim()); }}>Editar</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="inline-add">
              <input value={drafts[list.id] || ""} onChange={event => setDrafts(previous => ({ ...previous, [list.id]: event.target.value }))} placeholder="Adicionar item..." onKeyDown={event => {
                if (event.key === "Enter" && drafts[list.id]?.trim()) {
                  addListItem(list.id, drafts[list.id].trim());
                  setDrafts(previous => ({ ...previous, [list.id]: "" }));
                }
              }} />
              <button onClick={() => {
                if (!drafts[list.id]?.trim()) return;
                addListItem(list.id, drafts[list.id].trim());
                setDrafts(previous => ({ ...previous, [list.id]: "" }));
              }}>+</button>
            </div>
          </article>
        ))}
        {lists.length === 0 && <div className="empty-state">Crie listas para filmes, compras, ideias ou qualquer tema.</div>}
      </div>
    </main>
  );
}
