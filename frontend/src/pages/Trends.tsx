import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../api";

const CHART_COLORS = ["#c9a84c", "#7b4fd4", "#4d9de0", "#e05d4d", "#4de09e"];
const chartProps = {
  style: { background: "#13131a", borderRadius: 12, padding: 24, marginBottom: 40 },
};

export function Trends() {
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [votedData, setVotedData] = useState<any[]>([]);
  const [topN, setTopN] = useState(5);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    api.trendsCompanies(topN).then(rows => {
      const comps = [...new Set(rows.map(r => r.company))];
      setCompanies(comps);
      const byYear: Record<number, Record<string, number>> = {};
      rows.forEach(r => {
        if (!byYear[r.year]) byYear[r.year] = { year: r.year };
        byYear[r.year][r.company] = r.wins;
      });
      setCompanyData(Object.values(byYear).sort((a, b) => a.year - b.year));
    });
  }, [topN]);

  useEffect(() => {
    api.trendsCategories().then(rows => {
      const cats = [...new Set(rows.map(r => r.category))].slice(0, 8);
      const byYear: Record<number, Record<string, number>> = {};
      rows.filter(r => cats.includes(r.category)).forEach(r => {
        if (!byYear[r.year]) byYear[r.year] = { year: r.year };
        byYear[r.year][r.category] = r.nominees_count;
      });
      setCategoryData(Object.values(byYear).sort((a, b) => a.year - b.year));
    });
    api.trendsVoted().then(setVotedData);
  }, []);

  const axis = { stroke: "#888899", fontSize: 12 };
  const grid = { stroke: "#1e1e2e" };
  const tooltip = { contentStyle: { background: "#13131a", border: "1px solid #1e1e2e", borderRadius: 8, color: "#f0f0f0" } };

  return (
    <div>
      <h1 style={{ color: "#f0f0f0", fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Tendências</h1>

      {/* Chart 1 — Company wins */}
      <div {...chartProps}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#f0f0f0", fontSize: 18, margin: 0 }}>Vitórias por empresa ao longo dos anos</h2>
          <select
            value={topN}
            onChange={e => setTopN(Number(e.target.value))}
            style={{ background: "#0a0a0f", color: "#f0f0f0", border: "1px solid #1e1e2e", borderRadius: 6, padding: "6px 10px" }}
          >
            {[3, 5, 8, 10].map(n => <option key={n} value={n}>Top {n}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={companyData}>
            <CartesianGrid {...grid} />
            <XAxis dataKey="year" {...axis} />
            <YAxis {...axis} allowDecimals={false} />
            <Tooltip {...tooltip} />
            <Legend wrapperStyle={{ color: "#888899", fontSize: 12 }} />
            {companies.map((c, i) => (
              <Line key={c} type="monotone" dataKey={c} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2 — Voted distribution */}
      <div {...chartProps}>
        <h2 style={{ color: "#f0f0f0", fontSize: 18, marginBottom: 20 }}>Distribuição Júri vs. Fãs por ano</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={votedData}>
            <CartesianGrid {...grid} />
            <XAxis dataKey="year" {...axis} />
            <YAxis {...axis} allowDecimals={false} />
            <Tooltip {...tooltip} />
            <Legend wrapperStyle={{ color: "#888899", fontSize: 12 }} />
            <Area type="monotone" dataKey="jury_count" name="Júri" stackId="1" stroke="#7b4fd4" fill="rgba(123,79,212,0.3)" />
            <Area type="monotone" dataKey="fan_count" name="Fãs" stackId="1" stroke="#4d9de0" fill="rgba(77,157,224,0.3)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3 — Category nominees count */}
      <div {...chartProps}>
        <h2 style={{ color: "#f0f0f0", fontSize: 18, marginBottom: 20 }}>Indicados por categoria (top 8)</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={categoryData}>
            <CartesianGrid {...grid} />
            <XAxis dataKey="year" {...axis} />
            <YAxis {...axis} allowDecimals={false} />
            <Tooltip {...tooltip} />
            <Legend wrapperStyle={{ color: "#888899", fontSize: 12 }} />
            {Object.keys(categoryData[0] ?? {}).filter(k => k !== "year").map((cat, i) => (
              <Bar key={cat} dataKey={cat} fill={CHART_COLORS[i % CHART_COLORS.length]} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
