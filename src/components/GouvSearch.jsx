// Company autocomplete using the official French government API:
// https://recherche-entreprises.api.gouv.fr — free, no API key, INSEE/SIRENE data
import { useState, useRef, useEffect } from "react";
import { NAVY, NATURE_JURIDIQUE_MAP } from "../constants.js";
import { codeToForme, formeToSelect } from "../utils.jsx";
import { L, I } from "./UI.jsx";

export default function GouvSearch({ form, onFill }) {
  const [query, setQuery] = useState(form.nomEntreprise || "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef();
  const timer = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Debounced search — waits 350 ms after last keystroke
  const search = (q) => {
    clearTimeout(timer.current);
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      setError("");
      try {
        const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q)}&per_page=8&etat_administratif=A&minimal=true&include=siege,dirigeants`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setError("Erreur de connexion à l'API entreprises");
        setResults([]);
      }
      setSearching(false);
    }, 350);
  };

  // When user selects a result, extract and map all useful fields
  const select = (r) => {
    const siege = r.siege || {};
    const parts = [siege.numero_voie, siege.type_voie, siege.libelle_voie].filter(Boolean);
    const adresse = [...parts, siege.code_postal, siege.libelle_commune].filter(Boolean).join(" ");
    const formeRaw = codeToForme(r.nature_juridique || "");
    const formeSelect = formeToSelect(formeRaw);
    const rep = (r.dirigeants || [])[0];
    const repStr = rep ? [rep.qualite, rep.prenoms, rep.nom].filter(Boolean).join(" ").trim() : "";
    const naf = (siege.activite_principale || "").replace(".", "");

    onFill({
      nomEntreprise: r.nom_complet || r.nom_raison_sociale || "",
      formeJuridique: formeSelect,
      siret: siege.siret || "",
      codeAPE: naf,
      adresseSiege: adresse,
      villeUrssaf: siege.libelle_commune || "",
      representant: repStr,
    });
    setQuery(r.nom_complet || r.nom_raison_sociale || "");
    setOpen(false);
  };

  return (
    <div style={{ gridColumn: "1/-1", marginBottom: "13px" }} ref={ref}>
      <label style={L}>
        Nom de l'entreprise
        <span style={{ color: "#16a34a", fontWeight: 600, textTransform: "none", marginLeft: "8px", fontSize: "11px" }}>
          🏛 Données INSEE officielles — gratuit, sans clé
        </span>
      </label>

      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tapez le nom, SIREN ou SIRET de l'entreprise…"
          style={{ ...I, paddingRight: searching ? "40px" : "14px" }}
        />

        {/* Spinner while fetching */}
        {searching && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", border: "2px solid #e2e8f0", borderTopColor: NAVY, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        )}

        {/* Results dropdown */}
        {open && results.length > 0 && (
          <div style={{ position: "absolute", zIndex: 300, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", maxHeight: "300px", overflowY: "auto" }}>
            {results.map((r, i) => {
              const siege = r.siege || {};
              const forme = codeToForme(r.nature_juridique || "");
              const active = r.etat_administratif === "A";
              return (
                <div key={i} onClick={() => select(r)}
                  style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "12px", alignItems: "flex-start" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {/* Legal form badge */}
                  <div style={{ background: "#dcfce7", borderRadius: "8px", padding: "5px 9px", fontSize: "11px", fontWeight: 800, color: "#166534", flexShrink: 0, alignSelf: "center", minWidth: "40px", textAlign: "center" }}>
                    {forme || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "13.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.nom_complet || r.nom_raison_sociale}
                      {r.sigle && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "6px" }}>({r.sigle})</span>}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                      {siege.code_postal} {siege.libelle_commune}
                      {siege.siret && <span style={{ marginLeft: "8px", color: "#94a3b8" }}>SIRET {siege.siret}</span>}
                    </div>
                    {siege.activite_principale && <div style={{ fontSize: "11px", color: "#94a3b8" }}>APE {siege.activite_principale}</div>}
                  </div>
                  <span style={{ fontSize: "10px", background: active ? "#dcfce7" : "#fee2e2", color: active ? "#166534" : "#991b1b", padding: "2px 7px", borderRadius: "999px", fontWeight: 700, flexShrink: 0, alignSelf: "center" }}>
                    {active ? "Active" : "Cessée"}
                  </span>
                </div>
              );
            })}
            <div style={{ padding: "8px 16px", fontSize: "10px", color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>
              Source : <strong>INSEE / SIRENE</strong> via recherche-entreprises.api.gouv.fr
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ marginTop: "5px", fontSize: "11.5px", color: "#dc2626" }}>⚠ {error}</div>}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
}
