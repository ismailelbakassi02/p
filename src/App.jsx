import { useState } from "react";
import { DARK, ACCENT } from "./constants.js";
import ContractFlow from "./components/ContractFlow.jsx";
import AvenantFlow from "./components/AvenantFlow.jsx";
import EntrepriseFlow from "./components/EntrepriseFlow.jsx";
import Icon from "./components/Icon.jsx";

const TABS = [
  { v: "contrat",    icon: "FileText",  label: "Nouveau contrat" },
  { v: "avenant",    icon: "FilePen",   label: "Avenant" },
  { v: "entreprise", icon: "Building2", label: "Création d'entreprise" },
];

export default function App() {
  const [mode, setMode] = useState("contrat");

  return (
    <div style={{ minHeight: "100vh", background: "#EEF3F9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet" />

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header style={{ background: DARK, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 24px rgba(0,0,0,0.45)" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: "62px", gap: "20px" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, textDecoration: "none" }}>
            <div style={{ width: "36px", height: "36px", background: ACCENT, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: DARK }}>
                <Icon name="Scale" size={18} strokeWidth={1.75} />
              </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>RH Génère</div>
              <div style={{ fontSize: "9px", fontWeight: 600, color: "#4A6080", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "2px" }}>Droit du travail · IA</div>
            </div>
          </div>

          {/* Tab navigation */}
          <nav style={{ display: "flex", flex: 1, justifyContent: "center", gap: "2px" }}>
            {TABS.map(({ v, icon, label }) => {
              const active = mode === v;
              return (
                <button
                  key={v}
                  onClick={() => setMode(v)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "9px 14px",
                    border: "none",
                    borderBottom: `2px solid ${active ? ACCENT : "transparent"}`,
                    background: active ? "rgba(0,230,118,0.08)" : "transparent",
                    color: active ? ACCENT : "#5A7A9A",
                    fontSize: "12.5px", fontWeight: active ? 700 : 500,
                    cursor: "pointer", borderRadius: "6px 6px 0 0",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}>
                  <Icon name={icon} size={14} strokeWidth={1.75} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right badge */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "20px", padding: "5px 12px" }}>
            <Icon name="Flag" size={13} strokeWidth={1.5} color="#4A6080" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#4A6080", textTransform: "uppercase", letterSpacing: "0.1em" }}>FR</span>
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 16px 48px" }}>

        {/* Context label */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, transparent, #CBD5E1)" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon name={TABS.find(t => t.v === mode)?.icon} size={12} color="#94A3B8" />
            {TABS.find(t => t.v === mode)?.label}
          </span>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(to left, transparent, #CBD5E1)" }} />
        </div>

        {/* Main card */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "clamp(22px,4vw,40px)",
          boxShadow: "0 8px 40px rgba(13,27,46,0.08), 0 1px 4px rgba(13,27,46,0.04)",
          border: "1px solid rgba(13,27,46,0.05)",
        }}>
          {mode === "contrat"    && <ContractFlow    key="contract"    />}
          {mode === "avenant"    && <AvenantFlow     key="avenant"     />}
          {mode === "entreprise" && <EntrepriseFlow  key="entreprise"  />}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#94A3B8", fontSize: "11px", marginTop: "20px", letterSpacing: "0.04em" }}>
          RH Génère · Droit du travail &amp; Droit des sociétés français
        </p>
      </main>
    </div>
  );
}
