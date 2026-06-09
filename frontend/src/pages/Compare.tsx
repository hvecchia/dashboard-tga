import { useState, useEffect } from "react";
import { api } from "../api";
import type { EntityHistory } from "../api";
import { CompareCard } from "../components/CompareCard";

type Mode = "games" | "companies";

export function Compare() {
  const [mode, setMode] = useState<Mode>("games");
  const [allItems, setAllItems] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<EntityHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelected([]);
    setFilter("");
    setAllItems([]);
    const fn = mode === "games" ? api.listGames : api.listCompanies;
    fn().then(setAllItems).catch(() => setAllItems([]));
  }, [mode]);

  async function toggleEntity(name: string) {
    const alreadySelected = selected.some(e => e.name === name);
    if (alreadySelected) {
      setSelected(prev => prev.filter(e => e.name !== name));
      return;
    }
    if (selected.length >= 3) return;
    setLoading(true);
    try {
      const fn = mode === "games" ? api.game : api.company;
      const data = await fn(name);
      setSelected(prev => [...prev, data]);
    } finally {
      setLoading(false);
    }
  }

  const modeBtn = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      style={{
        background: mode === m ? "#c9a84c" : "#13131a",
        color: mode === m ? "#0a0a0f" : "#f0f0f0",
        border: "1px solid #1e1e2e", borderRadius: 8,
        padding: "8px 20px", fontWeight: 600, cursor: "pointer",
      }}
    >{label}</button>
  );

  const filteredItems = filter.trim()
    ? allItems.filter(item => item.toLowerCase().includes(filter.toLowerCase()))
    : allItems;

  const selectedNames = new Set(selected.map(e => e.name));
  const atLimit = selected.length >= 3;

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* Painel esquerdo: seleção */}
      <div style={{ flex: "0 0 300px", minWidth: 260 }}>
        <h1 style={{ color: "#f0f0f0", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Comparar</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {modeBtn("games", "Jogos")}
          {modeBtn("companies", "Empresas")}
        </div>

        <p style={{ color: "#888899", fontSize: 13, marginBottom: 12 }}>
          {selected.length}/3 selecionados — clique para adicionar ou remover
        </p>

        {/* Filtro local */}
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder={`Filtrar ${mode === "games" ? "jogos" : "empresas"}...`}
          style={{
            width: "100%", background: "#13131a", color: "#f0f0f0",
            border: "1px solid #1e1e2e", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, boxSizing: "border-box", marginBottom: 8,
          }}
        />

        {/* Lista de itens */}
        <div style={{
          background: "#13131a", border: "1px solid #1e1e2e", borderRadius: 10,
          maxHeight: 420, overflowY: "auto",
        }}>
          {filteredItems.length === 0 && (
            <div style={{ color: "#888899", padding: "20px 14px", fontSize: 13 }}>
              {allItems.length === 0 ? "Carregando..." : "Nenhum resultado."}
            </div>
          )}
          {filteredItems.map(item => {
            const isSelected = selectedNames.has(item);
            const isDisabled = atLimit && !isSelected;
            return (
              <div
                key={item}
                onClick={() => !isDisabled && toggleEntity(item)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", cursor: isDisabled ? "not-allowed" : "pointer",
                  background: isSelected ? "#1e1a0e" : "transparent",
                  borderLeft: isSelected ? "3px solid #c9a84c" : "3px solid transparent",
                  opacity: isDisabled ? 0.4 : 1,
                  fontSize: 13,
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.background = isSelected ? "#252010" : "#1e1e2e"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "#1e1a0e" : "transparent"; }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: isSelected ? "2px solid #c9a84c" : "2px solid #888899",
                  background: isSelected ? "#c9a84c" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{ color: isSelected ? "#c9a84c" : "#f0f0f0" }}>{item}</span>
              </div>
            );
          })}
        </div>

        {loading && <p style={{ color: "#888899", fontSize: 12, marginTop: 8 }}>Carregando dados...</p>}
      </div>

      {/* Painel direito: cards de comparação */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ paddingTop: 72 }}>
          {selected.length === 0 ? (
            <div style={{ color: "#888899", textAlign: "center", padding: "80px 0" }}>
              Selecione até 3 {mode === "games" ? "jogos" : "empresas"} para comparar.
            </div>
          ) : (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {selected.map((e, i) => (
                <CompareCard key={e.name} entity={e} index={i} onRemove={() => toggleEntity(e.name)} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
