interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: Props) {
  return (
    <div style={{
      background: "#13131a", border: "1px solid #1e1e2e",
      borderRadius: 12, padding: "24px 28px", flex: 1, minWidth: 160,
    }}>
      <div style={{ color: "#888899", fontSize: 13, marginBottom: 8 }}>{label}</div>
      <div style={{ color: "#c9a84c", fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "#888899", fontSize: 12, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
