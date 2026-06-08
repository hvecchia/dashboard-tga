import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Home } from "./pages/Home";
import { Explorer } from "./pages/Explorer";
import { Compare } from "./pages/Compare";
import { Trends } from "./pages/Trends";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/explorer", label: "Explorer" },
  { to: "/compare", label: "Comparar" },
  { to: "/trends", label: "Tendências" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0", fontFamily: "Inter, sans-serif" }}>
        <nav style={{
          borderBottom: "1px solid #1e1e2e", padding: "0 40px",
          display: "flex", alignItems: "center", gap: 32, height: 60,
          position: "sticky", top: 0, background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(8px)", zIndex: 100,
        }}>
          <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
            🏆 TGA
          </span>
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                color: isActive ? "#c9a84c" : "#888899",
                textDecoration: "none", fontSize: 14, fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? "2px solid #c9a84c" : "2px solid transparent",
                paddingBottom: 4,
              })}
            >{label}</NavLink>
          ))}
        </nav>

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/trends" element={<Trends />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
