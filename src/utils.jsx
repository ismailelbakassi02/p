import { NATURE_JURIDIQUE_MAP } from "./constants.js";

// Convert a markdown-ish contract string into React elements for display
export function renderContract(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# "))
      return <h1 key={i} style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", textAlign: "center", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{line.replace(/^# /, "")}</h1>;
    if (line.startsWith("## "))
      return <h2 key={i} style={{ fontSize: "12px", fontWeight: 800, color: "#1e3a5f", margin: "18px 0 4px", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "2px solid #1e3a5f", paddingBottom: "3px" }}>{line.replace(/^## /, "")}</h2>;
    if (/^(-{3}|\*{3}|_{3})$/.test(line.trim()))
      return <hr key={i} style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />;
    if (/^\*\*[^*]+\*\*$/.test(line.trim()))
      return <p key={i} style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", margin: "14px 0 2px", textTransform: "uppercase" }}>{line.trim().replace(/^\*\*|\*\*$/g, "")}</p>;
    if (line.trim() === "")
      return <div key={i} style={{ height: "5px" }} />;
    return (
      <p key={i} style={{ fontSize: "13px", color: "#374151", lineHeight: "1.8", margin: "1px 0" }}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} style={{ fontWeight: 700, color: "#0f172a" }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
}

// Map INSEE nature_juridique code to a short label (SARL, SAS…)
export function codeToForme(code = "") {
  return NATURE_JURIDIQUE_MAP[code] || "";
}

// Map a raw forme label to the select option value
export function formeToSelect(raw = "") {
  const MAP = { EI:"EI", EIRL:"EIRL", SARL:"SARL", EURL:"EURL", SAS:"SAS", SASU:"SASU", SA:"SA", SNC:"SNC" };
  for (const [k, v] of Object.entries(MAP)) {
    if (raw.toUpperCase().includes(k)) return v;
  }
  return "SARL";
}

// Anthropic API headers — reads key from localStorage if set
export function anthropicHeaders() {
  const key = localStorage.getItem("anthropic_api_key") || "";
  const h = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  };
  if (key) h["x-api-key"] = key;
  return h;
}

