export function WinnerBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "rgba(201,168,76,0.15)", color: "#c9a84c",
      border: "1px solid rgba(201,168,76,0.4)",
      borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600,
    }}>
      🏆 Vencedor
    </span>
  );
}
