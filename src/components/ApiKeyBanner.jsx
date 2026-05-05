import { useState } from "react";
import { NAVY, DARK, ACCENT } from "../constants.js";
import Icon from "./Icon.jsx";

export default function ApiKeyBanner({ onKey }) {
  const stored = localStorage.getItem("anthropic_api_key") || "";
  const [key, setKey] = useState(stored);
  const [show, setShow] = useState(!stored);
  const [visible, setVisible] = useState(false);

  const save = () => {
    if (!key.trim()) return;
    localStorage.setItem("anthropic_api_key", key.trim());
    setShow(false);
    onKey && onKey(key.trim());
  };

  const clear = () => {
    localStorage.removeItem("anthropic_api_key");
    setKey("");
    setShow(true);
  };

  if (!show) return (
    <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "rgba(0,230,118,0.07)", border: `1.5px solid ${ACCENT}`, borderRadius: "10px", fontSize: "12px" }}>
      <Icon name="ShieldCheck" size={15} color="#065f46" strokeWidth={1.75} />
      <span style={{ color: "#065f46", fontWeight: 700 }}>Clé API Anthropic configurée</span>
      <button onClick={clear} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "11px", textDecoration: "underline" }}>Modifier</button>
    </div>
  );

  return (
    <div style={{ marginBottom: "18px", padding: "16px 18px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#854d0e", fontSize: "13px", marginBottom: "6px" }}>
        <Icon name="KeyRound" size={15} color="#854d0e" strokeWidth={1.75} />
        Clé API Anthropic requise
      </div>
      <div style={{ fontSize: "12px", color: "#92400e", marginBottom: "12px" }}>
        La génération utilise l'IA Claude. Entrez votre clé API (stockée localement uniquement).
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type={visible ? "text" : "password"}
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && save()}
            placeholder="sk-ant-…"
            style={{ width: "100%", background: "#fff", border: "1.5px solid #fde68a", borderRadius: "8px", padding: "9px 36px 9px 12px", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
          />
          <button onClick={() => setVisible(v => !v)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
            <Icon name={visible ? "EyeOff" : "Eye"} size={15} strokeWidth={1.75} />
          </button>
        </div>
        <button onClick={save} style={{ padding: "9px 18px", background: DARK, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}
