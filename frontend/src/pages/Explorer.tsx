import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import type { Nominee } from "../api";
import { FilterBar } from "../components/FilterBar";
import { WinnerBadge } from "../components/WinnerBadge";

export function Explorer() {
  const [years, setYears] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [voted, setVoted] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.years().then(setYears);
    api.categories().then(setCategories);
  }, []);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    const params = {
      year: year ? Number(year) : undefined,
      category: category || undefined,
      voted: voted || undefined,
      search: search || undefined,
      page: p,
      page_size: 25,
    };
    const [rows, count] = await Promise.all([
      api.nominees(params),
      api.nomineesCount({ year: params.year, category: params.category, search: params.search }),
    ]);
    setNominees(rows);
    setTotal(count.total);
    setPage(p);
    setLoading(false);
  }, [year, category, voted, search]);

  useEffect(() => { load(1); }, [load]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div>
      <h1 style={{ color: "#f0f0f0", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Explorer</h1>

      <FilterBar
        years={years} categories={categories}
        year={year} category={category} voted={voted} search={search}
        onYear={v => setYear(v)} onCategory={v => setCategory(v)}
        onVoted={v => setVoted(v)} onSearch={v => setSearch(v)}
      />

      <div style={{ color: "#888899", fontSize: 13, marginBottom: 12 }}>
        {loading ? "Carregando..." : `${total} registro(s) encontrado(s)`}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {["Ano", "Categoria", "Indicado", "Empresa", "Voto"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#888899", borderBottom: "1px solid #1e1e2e", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nominees.map((n, i) => (
              <tr key={i} style={{
                background: n.winner ? "rgba(201,168,76,0.05)" : "transparent",
                borderLeft: n.winner ? "2px solid #c9a84c" : "2px solid transparent",
              }}>
                <td style={td}>{n.year}</td>
                <td style={td}>{n.category}</td>
                <td style={{ ...td, color: n.winner ? "#f0f0f0" : "#cccccc" }}>
                  {n.nominee}
                  {!!n.winner && <span style={{ marginLeft: 8 }}><WinnerBadge /></span>}
                </td>
                <td style={{ ...td, color: "#888899" }}>{n.company || "—"}</td>
                <td style={td}>
                  <span style={{
                    background: n.voted === "jury" ? "rgba(123,79,212,0.2)" : "rgba(77,157,224,0.2)",
                    color: n.voted === "jury" ? "#7b4fd4" : "#4d9de0",
                    borderRadius: 4, padding: "2px 8px", fontSize: 11,
                  }}>
                    {n.voted === "jury" ? "Júri" : "Fãs"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <button onClick={() => load(page - 1)} disabled={page === 1} style={pageBtn}>← Anterior</button>
          <span style={{ color: "#888899", lineHeight: "36px", fontSize: 13 }}>
            Página {page} de {totalPages}
          </span>
          <button onClick={() => load(page + 1)} disabled={page === totalPages} style={pageBtn}>Próxima →</button>
        </div>
      )}
    </div>
  );
}

const td: React.CSSProperties = {
  padding: "10px 12px", borderBottom: "1px solid #1e1e2e", color: "#f0f0f0",
};

const pageBtn: React.CSSProperties = {
  background: "#13131a", color: "#f0f0f0", border: "1px solid #1e1e2e",
  borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13,
};
