import type { EntityHistory } from "../api";

const COLORS = ["#c9a84c", "#7b4fd4", "#4d9de0"];

interface Props {
  entity: EntityHistory;
  index: number;
  onRemove: () => void;
}

export function CompareCard({ entity, index, onRemove }: Props) {
  const color = COLORS[index] ?? "#c9a84c";
  return (
    <div style={{
      background: "#13131a", border: `1px solid ${color}`,
      borderRadius: 12, padding: 24, flex: 1, minWidth: 240,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ color, fontSize: 16, fontWeight: 700, wordBreak: "break-word", maxWidth: "80%" }}>
          {entity.name}
        </div>
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", color: "#888899", cursor: "pointer", fontSize: 18 }}
        >×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          ["Indicações", entity.total_nominations],
          ["Vitórias", entity.total_wins],
          ["Taxa de vitória", `${entity.win_rate}%`],
          ["Categorias ganhas", entity.categories_won.length],
        ].map(([label, val]) => (
          <div key={label as string}>
            <div style={{ color: "#888899", fontSize: 11 }}>{label}</div>
            <div style={{ color: "#f0f0f0", fontSize: 22, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      {entity.categories_won.length > 0 && (
        <div>
          <div style={{ color: "#888899", fontSize: 11, marginBottom: 6 }}>Categorias ganhas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {entity.categories_won.map(c => (
              <span key={c} style={{
                background: "rgba(255,255,255,0.05)", color: "#f0f0f0",
                borderRadius: 4, padding: "2px 8px", fontSize: 11,
              }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
