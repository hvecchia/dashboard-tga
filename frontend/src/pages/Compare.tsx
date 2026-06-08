import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import type { EntityHistory } from "../api";
import { CompareCard } from "../components/CompareCard";

type Mode = "games" | "companies";

export function Compare() {
  const [mode, setMode] = useState<Mode>("games");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<EntityHistory[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const fn = mode === "games" ? api.searchGames : api.searchCompanies;
    fn(query).then(setSuggestions).catch(() => setSuggestions([]));
  }, [query, mode]);

  // Fecha o dropdown ao clicar fora do wrapper
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function addEntity(name: string) {
    if (selected.length >= 3 || selected.some(e => e.name === name)) return;
    setSuggestions([]);
    setQuery("");
    const fn = mode === "games" ? api.game : api.company;
    const data = await fn(name);
    setSelected(prev => [...prev, data]);
  }

  function removeEntity(name: string) {
    setSelected(prev => prev.filter(e => e.name !== name));
  }

  const modeBtn = (m: Mode, label: string) => (
    <button
      onClick={() => { setMode(m); setSelected([]); setQuery(""); setSuggestions([]); }}
      style={{
        background: mode === m ? "#c9a84c" : "#13131a",
        color: mode === m ? "#0a0a0f" : "#f0f0f0",
        border: "1px solid #1e1e2e", borderRadius: 8,
        padding: "8px 20px", fontWeight: 600, cursor: "pointer",
      }}
    >{label}</button>
  );

  return (
    <div>
      <h1 style={{ color: "#f0f0f0", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Comparar</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {modeBtn("games", "Jogos")}
        {modeBtn("companies", "Empresas")}
      </div>

      {selected.length < 3 && (
        <div ref={wrapperRef} style={{ position: "relative", marginBottom: 32, maxWidth: 400 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Buscar ${mode === "games" ? "jogo" : "empresa"}...`}
            style={{
              width: "100%", background: "#13131a", color: "#f0f0f0",
              border: "1px solid #1e1e2e", borderRadius: 8,
              padding: "10px 14px", fontSize: 14, boxSizing: "border-box",
            }}
          />
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "#13131a", border: "1px solid #1e1e2e",
              borderRadius: 8, zIndex: 10, maxHeight: 240, overflowY: "auto",
            }}>
              {suggestions.map(s => (
                <div
                  key={s}
                  onMouseDown={() => addEntity(s)}
                  style={{ padding: "10px 14px", cursor: "pointer", color: "#f0f0f0", fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1e1e2e")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >{s}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected.length === 0 && (
        <div style={{ color: "#888899", textAlign: "center", padding: "60px 0" }}>
          Selecione até 3 {mode === "games" ? "jogos" : "empresas"} para comparar.
        </div>
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {selected.map((e, i) => (
          <CompareCard key={e.name} entity={e} index={i} onRemove={() => removeEntity(e.name)} />
        ))}
      </div>
    </div>
  );
}
