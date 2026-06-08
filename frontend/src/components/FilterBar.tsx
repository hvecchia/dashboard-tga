const selectStyle: React.CSSProperties = {
  background: "#13131a", color: "#f0f0f0",
  border: "1px solid #1e1e2e", borderRadius: 8,
  padding: "8px 12px", fontSize: 14, cursor: "pointer", minWidth: 140,
};

interface Props {
  years: number[];
  categories: string[];
  year: string;
  category: string;
  voted: string;
  search: string;
  onYear: (v: string) => void;
  onCategory: (v: string) => void;
  onVoted: (v: string) => void;
  onSearch: (v: string) => void;
}

export function FilterBar({ years, categories, year, category, voted, search, onYear, onCategory, onVoted, onSearch }: Props) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Buscar jogo ou empresa..."
        style={{ ...selectStyle, minWidth: 220 }}
      />
      <select value={year} onChange={e => onYear(e.target.value)} style={selectStyle}>
        <option value="">Todos os anos</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={category} onChange={e => onCategory(e.target.value)} style={selectStyle}>
        <option value="">Todas as categorias</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={voted} onChange={e => onVoted(e.target.value)} style={selectStyle}>
        <option value="">Júri + Fãs</option>
        <option value="jury">Júri</option>
        <option value="fan">Fãs</option>
      </select>
    </div>
  );
}
