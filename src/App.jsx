// Root component — switches between contract and avenant modes
import { useState } from "react";
import { NAVY } from "./constants.js";
import ContractFlow from "./components/ContractFlow.jsx";
import AvenantFlow from "./components/AvenantFlow.jsx";

export default function App() {
  const [mode, setMode] = useState("contrat");

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "32px 16px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dbeafe", color: NAVY, padding: "4px 16px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            ⚖️ Générateur RH
          </span>
          <h1 style={{ fontSize: "clamp(22px,5vw,30px)", color: "#0f172a", fontWeight: 800, margin: "0 0 5px" }}>
            Contrats & Avenants
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Droit du travail français</p>
        </div>

        {/* Main card */}
        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "clamp(20px,4vw,36px)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          {/* Mode switcher */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "18px", background: "#e2e8f0", padding: "5px", borderRadius: "12px" }}>
            {[{ v: "contrat", t: "📄 Nouveau contrat" }, { v: "avenant", t: "✏️ Avenant" }].map(({ v, t }) => (
              <button key={v} onClick={() => setMode(v)} style={{ flex: 1, padding: "11px", borderRadius: "8px", cursor: "pointer", fontSize: "13.5px", fontWeight: 700, border: "none", background: mode === v ? "#fff" : "transparent", color: mode === v ? NAVY : "#64748b", boxShadow: mode === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Active flow — key prop forces a full reset when switching modes */}
          {mode === "contrat" ? <ContractFlow key="contract" /> : <AvenantFlow key="avenant" />}
        </div>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "11px", marginTop: "14px" }}>
          Générateur RH · Droit du travail français
        </p>
      </div>
    </div>
  );
}
