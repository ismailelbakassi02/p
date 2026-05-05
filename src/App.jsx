import { useState } from "react";
import { DARK, ACCENT } from "./constants.js";
import ContractFlow from "./components/ContractFlow.jsx";
import AvenantFlow from "./components/AvenantFlow.jsx";
import EntrepriseFlow from "./components/EntrepriseFlow.jsx";
import Icon from "./components/Icon.jsx";

const TABS = [
  { v: "contrat",    icon: "FileText",  label: "Contrat de travail",    sub: "CDI · CDD" },
  { v: "avenant",    icon: "FilePen",   label: "Avenant",               sub: "Modification contractuelle" },
  { v: "entreprise", icon: "Building2", label: "Création d'entreprise", sub: "Dossier & synthèse" },
];


export default function App() {
  const [mode, setMode] = useState("contrat");
  const active = TABS.find(t => t.v === mode);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Fixed top header ──────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "60px", zIndex: 200,
        background: DARK, borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
      }}>
        {/* Logo zone — same width as sidebar */}
        <div style={{
          width: "256px", flexShrink: 0, height: "100%",
          display: "flex", alignItems: "center", gap: "11px",
          padding: "0 20px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: "31px", height: "31px", background: ACCENT, borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
         <img 
  src="https://media.licdn.com/dms/image/v2/C4D0BAQGOks2Gg3V83Q/company-logo_200_200/company-logo_200_200/0/1630559268393/audit_action__logo?e=2147483647&v=beta&t=LNiQddj_ul9Xh3rzVs1-yeQDjxcbxkBwf_F_feAgp5w" 
  width={32} 
  height={32} 
  style={{ objectFit: "contain" }}
         />         
 </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>RH Génère</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.32)", fontWeight: 500, marginTop: "2px" }}>Documents RH automatisés</div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{ flex: 1, padding: "0 28px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Générateur</span>
          <Icon name="ChevronRight" size={12} strokeWidth={2} color="rgba(255,255,255,0.2)" />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{active.label}</span>
        </div>

      </header>

      {/* ── Fixed sidebar ─────────────────────────────────────────────────── */}
      <aside style={{
        position: "fixed", top: "60px", left: 0, bottom: 0, width: "256px", zIndex: 100,
        background: "#0a1628",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column",
      }}>
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {TABS.map(({ v, icon, label, sub }) => {
            const isActive = mode === v;
            return (
              <button key={v} onClick={() => setMode(v)} style={{
                display: "flex", alignItems: "center", gap: "12px",
                width: "100%", padding: "11px 14px",
                marginBottom: "2px", borderRadius: "10px",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                boxShadow: isActive ? `inset 3px 0 0 ${ACCENT}` : "none",
                color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                cursor: "pointer", textAlign: "left",
                border: "none", outline: "none",
                transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; } }}
              >
                <Icon name={icon} size={16} strokeWidth={isActive ? 2 : 1.75} color={isActive ? ACCENT : "rgba(255,255,255,0.35)"} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", fontWeight: isActive ? 600 : 400, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: isActive ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.2)", marginTop: "1px", fontWeight: 400 }}>{sub}</div>
                </div>
                {isActive && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main style={{ marginLeft: "256px", paddingTop: "60px", minHeight: "100vh" }}>
        <div style={{ width: "70%", margin: "0 auto", padding: "10px 0 20px" }}>

          {/* Form card */}
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)",
          }}>
            <div style={{ padding: "clamp(24px, 3vw, 36px) clamp(22px, 3vw, 36px)" }}>
              {mode === "contrat"    && <ContractFlow    key="contract"    />}
              {mode === "avenant"    && <AvenantFlow     key="avenant"     />}
              {mode === "entreprise" && <EntrepriseFlow  key="entreprise"  />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
