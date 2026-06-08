import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Stats } from "../api";
import { StatCard } from "../components/StatCard";

export function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { api.stats().then(setStats).catch(console.error); }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 0 60px" }}>
        <div style={{ fontSize: 13, color: "#7b4fd4", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>
          The Game Awards
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
          background: "linear-gradient(135deg, #f0f0f0 0%, #c9a84c 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "0 0 20px",
        }}>
          TGA Explorer
        </h1>
        <p style={{ color: "#888899", fontSize: 18, maxWidth: 560, margin: "0 auto 40px" }}>
          Explore o histórico completo do The Game Awards — vencedores, indicados, tendências e comparações desde 2014.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/explorer" style={btnStyle("#c9a84c", "#0a0a0f")}>Explorar dados</Link>
          <Link to="/trends" style={btnStyle("transparent", "#c9a84c", "1px solid #c9a84c")}>Ver tendências</Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 60 }}>
          <StatCard label="Anos cobertos" value={stats.years} sub="2014 até hoje" />
          <StatCard label="Categorias" value={stats.categories} sub="únicas no histórico" />
          <StatCard label="Jogos indicados" value={stats.games} sub="títulos únicos" />
          <StatCard label="Empresa dominante" value={stats.top_company} sub={`${stats.top_company_wins} vitórias`} />
        </div>
      )}

      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {[
          { to: "/explorer", title: "Explorer", desc: "Filtre e navegue por todos os indicados e vencedores por ano, categoria e tipo de voto.", color: "#c9a84c" },
          { to: "/compare", title: "Comparar", desc: "Compare lado a lado o histórico de vitórias e indicações de jogos ou empresas.", color: "#7b4fd4" },
          { to: "/trends", title: "Tendências", desc: "Visualize a evolução do TGA ao longo dos anos com gráficos interativos.", color: "#4d9de0" },
        ].map(({ to, title, desc, color }) => (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#13131a", border: "1px solid #1e1e2e",
              borderRadius: 12, padding: 28, cursor: "pointer",
              transition: "border-color .2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e2e")}
            >
              <div style={{ color, fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</div>
              <div style={{ color: "#888899", fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string, border = "none"): React.CSSProperties {
  return {
    background: bg, color, border, borderRadius: 8,
    padding: "12px 28px", fontWeight: 600, fontSize: 15,
    textDecoration: "none", display: "inline-block",
  };
}
