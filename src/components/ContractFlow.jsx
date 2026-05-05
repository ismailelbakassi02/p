// 6-step wizard for generating a new employment contract (CDI or CDD)
import { useState, useRef } from "react";
import {
  NAVY, ACCENT, DARK, SMIC_HORAIRE, CCN_DATA,
  CDD_SUBTYPES, CDI_SUBTYPES, CLAUSES_LIST, AVANTAGES_LIST,
  DOCUMENT_TYPES, NATIONALITIES, EEA_LIST, initContract,
  isCDDUsageAutorise, getCDDRegleSummary,
} from "../constants.js";
import { generateContract } from "../templates.js";
import { Field, Sel, SearchSelect, CCNField, STitle, ToggleCard, StepBar, I, L } from "./UI.jsx";
import GouvSearch from "./GouvSearch.jsx";
import DocDisplay from "./DocDisplay.jsx";
import CompliancePanel from "./CompliancePanel.jsx";
import Icon from "./Icon.jsx";
import { getPreviewUrl } from "../ocr.js";
import { extractVitale, extractIdentite } from "../aiOcr.js";

const STEPS = ["Type", "Employeur", "Salarié", "Contrat", "Clauses", "Résumé"];

// ─── Document type dropdown ───────────────────────────────────────────────────
function DocTypeSelect({ form, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();
  const filtered = DOCUMENT_TYPES.filter(d => d.label.toLowerCase().includes(search.toLowerCase()));
  const selected = DOCUMENT_TYPES.find(d => d.value === form.typeDocument);

  return (
    <div style={{ marginBottom: "13px", gridColumn: "1/-1" }} ref={ref}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>
        Type de document d'identité
      </label>
      <div style={{ position: "relative" }}>
        <input
          value={open ? search : (selected?.label || "")}
          placeholder="Sélectionner le type de document…"
          onFocus={() => { setOpen(true); setSearch(""); }}
          onChange={e => setSearch(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box", paddingRight: "36px" }}
        />
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "12px", pointerEvents: "none" }}>▼</span>
        {open && (
          <div style={{ position: "absolute", zIndex: 200, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: "240px", overflowY: "auto" }}>
            {[
              { group: "Documents français & UE", items: filtered.filter(d => d.eea) },
              { group: "Documents étrangers / Titres de séjour", items: filtered.filter(d => !d.eea) },
            ].map(g => g.items.length > 0 && (
              <div key={g.group}>
                <div style={{ padding: "6px 14px", fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>{g.group}</div>
                {g.items.map(d => (
                  <div key={d.value} onClick={() => { onChange({ target: { name: "typeDocument", value: d.value } }); setOpen(false); }}
                    style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#0f172a", borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {d.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div style={{ marginTop: "6px", padding: "6px 12px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 600, background: selected.eea ? "#f0fdf4" : "#eff6ff", color: selected.eea ? "#166534" : NAVY, border: `1px solid ${selected.eea ? "#86efac" : "#bfdbfe"}` }}>
          <Icon name={selected.eea ? "CheckCircle" : "AlertTriangle"} size={13} strokeWidth={1.75} color={selected.eea ? "#166534" : NAVY} />{selected.eea ? " Document UE/EEE — Pas d'autorisation de travail requise" : " Document hors UE — Vérifier l'autorisation de travail"}
        </div>
      )}
    </div>
  );
}

// ─── Foreign worker alert ─────────────────────────────────────────────────────
function ForeignWorkerAlert() {
  return (
    <div style={{ gridColumn: "1/-1", background: "#fff1f2", border: "2px solid #f87171", borderRadius: "12px", padding: "16px 18px", marginBottom: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <Icon name="AlertOctagon" size={18} color="#b91c1c" strokeWidth={2} />
        <span style={{ fontWeight: 800, color: "#b91c1c", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Salarié étranger hors UE/EEE — Obligations légales</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
        {[
          { titre: "Carte « Salarié » / VLS-TS / « Travailleur temporaire »", regle: "Autorisation de travail obligatoire délivrée par la préfecture." },
          { titre: "Carte « Étudiant »", regle: "Travail autorisé jusqu'à 964h/an. Au-delà → autorisation obligatoire." },
          { titre: "Carte « Résident longue durée-UE » (obtenue en France)", regle: "Travail autorisé sans autorisation. Vérification authenticité préfecture obligatoire." },
          { titre: "Carte « Passeport talent »", regle: "Dispense d'autorisation. Vérification authenticité requise." },
          { titre: "Carte « Recherche d'emploi »", regle: "Autorisé si salaire ≥ 2 734,55 €." },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", border: "1.5px solid #fca5a5", borderRadius: "8px", padding: "8px 12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e3a5f", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}><Icon name="CreditCard" size={12} strokeWidth={1.75} color="#1e3a5f" /> {c.titre}</div>
            <div style={{ fontSize: "11.5px", color: "#374151", lineHeight: 1.5 }}>{c.regle}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#450a0a", borderRadius: "9px", padding: "11px 14px" }}>
        <p style={{ fontSize: "12px", fontWeight: 800, color: "#fca5a5", margin: "0 0 5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}><Icon name="Ban" size={13} strokeWidth={2} color="#fca5a5" /> Sanctions (Loi immigration jan. 2024)</p>
        <p style={{ fontSize: "12px", color: "#fecaca", margin: 0, lineHeight: 1.7 }}>
          Amende jusqu'à <strong style={{ color: "#fca5a5" }}>20 750 € par travailleur</strong> non autorisé.<br />
          Réduite à <strong style={{ color: "#fca5a5" }}>8 300 €</strong> si salaires versés.<br />
          Sanction étendue au <strong style={{ color: "#fca5a5" }}>donneur d'ordre</strong>.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ContractFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initContract);
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pappersFilledFrom, setPappersFilledFrom] = useState("");
  // Pièce d'identité OCR state (step 2 — zone 2)
  const [salImporting, setSalImporting] = useState(false);
  const [salStatus, setSalStatus] = useState(null);
  const [salFields, setSalFields] = useState([]);
  const [salPreviews, setSalPreviews] = useState([]); // [{url, name}]
  const [salProgress, setSalProgress] = useState({ done: 0, total: 0 });
  const [salDrag, setSalDrag] = useState(false);
  const salFileRef = useRef();
  const salAbortRef = useRef(null);
  // Carte Vitale OCR state (step 2 — zone 1)
  const [vitaleImporting, setVitaleImporting] = useState(false);
  const [vitaleStatus, setVitaleStatus] = useState(null); // null | "success" | "error" | "empty"
  const [vitalePreview, setVitalePreview] = useState(null); // {url, name}
  const [vitaleDrag, setVitaleDrag] = useState(false);
  const vitaleFileRef = useRef();
  const vitaleAbortRef = useRef(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const toggle = key => id => setForm(f => ({
    ...f, [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id],
  }));

  const subTypes = form.typeContrat === "CDD" ? CDD_SUBTYPES : CDI_SUBTYPES;
  const subTypeObj = subTypes.find(s => s.value === form.sousType) || subTypes[0];
  const clauseLabels = CLAUSES_LIST.filter(c => form.clauses.includes(c.id)).map(c => c.label);
  const avantageLabels = AVANTAGES_LIST.filter(a => form.avantages.includes(a.id)).map(a => a.label);

  // Detect if the employee is a non-EEA foreigner (triggers alert)
  const nat = (form.nationalite || "").toLowerCase();
  const isForeign = nat && nat !== "française" && nat !== "français";
  const docIsEEA = DOCUMENT_TYPES.find(d => d.value === form.typeDocument)?.eea === true;
  const isEEA = docIsEEA || EEA_LIST.some(e => nat.includes(e));

  // ── Carte Vitale — AI extraction (numSecu only) ──────────────────────────────
  const cancelVitaleOCR = () => {
    if (vitaleAbortRef.current) vitaleAbortRef.current.abort();
    setVitaleImporting(false);
    setVitaleStatus(null);
  };

  const importVitale = async (file) => {
    if (!file) return;
    if (vitaleAbortRef.current) vitaleAbortRef.current.abort();
    const controller = new AbortController();
    vitaleAbortRef.current = controller;
    if (vitalePreview?.url) URL.revokeObjectURL(vitalePreview.url);
    setVitalePreview({ url: getPreviewUrl(file), name: file.name });
    setVitaleImporting(true);
    setVitaleStatus(null);
    try {
      const result = await extractVitale(file, controller.signal);
      const numSecu = result.numSecu || "";
      if (numSecu) {
        setForm(f => ({ ...f, numSecu }));
        setVitaleStatus("success");
      } else {
        setVitaleStatus("empty");
      }
    } catch (e) {
      if (e.name !== "AbortError") setVitaleStatus("error");
    }
    setVitaleImporting(false);
  };

  // ── Pièce d'identité — AI extraction (recto + verso) ─────────────────────────
  const cancelSalOCR = () => {
    if (salAbortRef.current) salAbortRef.current.abort();
    setSalImporting(false);
    setSalStatus(null);
    setSalProgress({ done: 0, total: 0 });
  };

  const importSalaries = async (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 2);
    if (salAbortRef.current) salAbortRef.current.abort();
    const controller = new AbortController();
    salAbortRef.current = controller;

    salPreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
    setSalPreviews(arr.map(f => ({ url: getPreviewUrl(f), name: f.name })));
    setSalImporting(true);
    setSalStatus(null);
    setSalFields([]);
    setSalProgress({ done: 0, total: arr.length });

    const SAL_LABELS = {
      nom: "Nom", prenom: "Prénom", genre: "Genre",
      adresseSalarie: "Adresse", dateNaissance: "Date naissance",
      lieuNaissance: "Lieu naissance", nationalite: "Nationalité",
      titreSejour: "Titre séjour", typeDocument: "Type de document",
    };
    try {
      let merged = {};
      for (let idx = 0; idx < arr.length; idx++) {
        const result = await extractIdentite(arr[idx], controller.signal);
        Object.keys(SAL_LABELS).forEach(k => {
          if (result[k] && !merged[k]) merged[k] = result[k];
        });
        setSalProgress({ done: idx + 1, total: arr.length });
      }
      const updates = {}, filled = [];
      Object.keys(SAL_LABELS).forEach(k => {
        if (merged[k]) { updates[k] = merged[k]; filled.push(SAL_LABELS[k]); }
      });
      setForm(f => ({ ...f, ...updates }));
      setSalFields(filled);
      setSalStatus(filled.length > 0 ? "success" : "empty");
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("[importSalaries]", e.message);
        setSalStatus("error");
      }
    }
    setSalImporting(false);
    setSalProgress({ done: 0, total: 0 });
  };

  // ── CompliancePanel auto-fix handler ──────────────────────────────────────
  const handleAutoFix = (id) => {
    if (id === "mutuelle" || id === "prevoyance") {
      setForm(f => ({ ...f, avantages: [...(f.avantages || []).filter(a => a !== "mutuelle"), "mutuelle"] }));
    }
  };

  // ── Contract generation ─────────────────────────────────────────────────────
  const generate = () => {
    setLoading(true);
    try {
      const text = generateContract(form, subTypeObj.label, clauseLabels, avantageLabels);
      setContract(text);
      setGenerated(true);
    } catch {
      setContract("Erreur de génération.");
      setGenerated(true);
    }
    setLoading(false);
  };

  // ── Render generated document ───────────────────────────────────────────────
  if (generated) return (
    <DocDisplay
      text={contract}
      copied={copied}
      onCopy={() => { navigator.clipboard.writeText(contract); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      onBack={() => { setGenerated(false); setContract(""); }}
      onReset={() => { setGenerated(false); setContract(""); setStep(0); setForm(initContract); }}
    />
  );

  // ── Render form steps ───────────────────────────────────────────────────────
  return (
    <div>
      <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Progress bar */}
      <StepBar
        steps={STEPS}
        current={step}
        onStepClick={i => setStep(i)}
        stepWarnings={[
          false,
          !form.nomEntreprise || !form.siret,
          !form.nom || !form.prenom,
          !form.tauxHoraire || !form.heuresMensuelles,
          false,
          false,
        ]}
      />

      {/* ── Step 0: Type ── */}
      {step === 0 && (
        <div>
          <STitle num="01">Type de contrat</STitle>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {["CDI", "CDD"].map(t => {
              const active = form.typeContrat === t;
              return (
                <button key={t} onClick={() => setForm(f => ({ ...f, typeContrat: t, sousType: "standard" }))} style={{
                  flex: 1, padding: "20px 24px", borderRadius: "12px", cursor: "pointer",
                  border: `1.5px solid ${active ? NAVY : "#e8edf4"}`,
                  background: active ? DARK : "#fcfdfe",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: active ? `0 0 0 4px rgba(13,27,46,0.08), 0 4px 12px rgba(0,0,0,0.08)` : "0 1px 3px rgba(0,0,0,0.04)",
                  position: "relative", textAlign: "left",
                }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: active ? "#fff" : "#94a3b8", letterSpacing: "-0.03em", lineHeight: 1 }}>{t}</div>
                  <div style={{ fontSize: "12px", marginTop: "5px", color: active ? "rgba(255,255,255,0.5)" : "#cbd5e1", fontWeight: 500 }}>
                    {t === "CDI" ? "Durée indéterminée" : "Durée déterminée"}
                  </div>
                  {active && (
                    <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                      <Icon name="CheckCircle" size={16} strokeWidth={2} color={ACCENT} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Sous-type {form.typeContrat}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {subTypes.map(sub => {
              const isUsage = sub.value === "usage";
              const usageBlocked = isUsage && form.typeContrat === "CDD" && !isCDDUsageAutorise(form.convention);
              const isSelected = form.sousType === sub.value;
              return (
                <button key={sub.value}
                  onClick={() => !usageBlocked && setForm(f => ({ ...f, sousType: sub.value }))}
                  style={{
                    textAlign: "left", padding: "11px 16px", borderRadius: "10px",
                    cursor: usageBlocked ? "not-allowed" : "pointer",
                    border: `1px solid ${isSelected ? NAVY : usageBlocked ? "#fecaca" : "#e8edf4"}`,
                    background: isSelected ? "#f8fafc" : usageBlocked ? "#fff5f5" : "#fcfdfe",
                    display: "flex", alignItems: "center", gap: "12px",
                    transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: isSelected ? "0 0 0 3px rgba(30,58,95,0.07)" : "0 1px 2px rgba(0,0,0,0.03)",
                    opacity: usageBlocked ? 0.65 : 1,
                  }}>
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${isSelected ? NAVY : usageBlocked ? "#fca5a5" : "#d1d5db"}`,
                    background: isSelected ? NAVY : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.18s",
                  }}>
                    {isSelected && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: isSelected ? NAVY : usageBlocked ? "#b91c1c" : "#1e293b" }}>{sub.label}</span>
                    <span style={{ fontSize: "12px", color: usageBlocked ? "#fca5a5" : "#94a3b8", marginLeft: "8px", fontWeight: 400 }}>
                      {usageBlocked ? "Non autorisé — choisissez une CCN compatible d'abord" : sub.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CDD motif — required for Article 1 Engagement */}
          {form.typeContrat === "CDD" && (
            <div style={{ marginTop: "14px" }}>
              <label style={L}>
                Motif précis du CDD
                <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "999px", marginLeft: "6px", textTransform: "none" }}>obligatoire — risque requalification CDI</span>
              </label>
              <textarea
                name="motifCDD"
                value={form.motifCDD || ""}
                onChange={handleChange}
                placeholder={
                  form.sousType === "remplacement" ? "ex : Remplacement de M./Mme DUPONT, absent pour congé maladie du 01/01/2026 au 28/02/2026"
                  : form.sousType === "saisonnier"  ? "ex : Surcroît d'activité lié à la saison estivale"
                  : "ex : Accroissement temporaire d'activité lié à la réalisation d'une commande exceptionnelle"
                }
                rows={2}
                style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${form.motifCDD ? "#bfdbfe" : "#fca5a5"}`, borderRadius: "8px", fontSize: "13px", color: "#0f172a", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#f8fafc" }}
              />
            </div>
          )}

          {/* CCN — shown here so CDD d'usage blocking resolves immediately */}
          <div style={{ marginTop: "18px" }}>
            <CCNField form={form} onChange={v => {
              setForm(f => ({ ...f, convention: v, niveau: "", coefficient: "", tauxHoraire: "", salaireBrut: "" }));
            }} />
          </div>

          {/* CDD legal rules panel */}
          {form.typeContrat === "CDD" && (() => {
            const rs = getCDDRegleSummary(form.sousType, form.convention);
            const isUsage = form.sousType === "usage";
            const usageOk = !isUsage || isCDDUsageAutorise(form.convention);
            return (
              <div style={{ marginTop: "14px", background: isUsage && !usageOk ? "#fff1f2" : rs.hasDerogation ? "#f5f3ff" : "#fefce8", border: `1.5px solid ${isUsage && !usageOk ? "#fca5a5" : rs.hasDerogation ? "#c4b5fd" : "#fde68a"}`, borderRadius: "10px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                  <Icon name={isUsage && !usageOk ? "XCircle" : rs.hasDerogation ? "Info" : "Scale"} size={15} strokeWidth={1.75} color={isUsage && !usageOk ? "#b91c1c" : rs.hasDerogation ? "#5b21b6" : "#854d0e"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "12.5px", color: isUsage && !usageOk ? "#991b1b" : rs.hasDerogation ? "#5b21b6" : "#854d0e", marginBottom: "6px" }}>
                      {isUsage && !usageOk ? "CDD d'usage non autorisé — CCN incompatible" : rs.hasDerogation ? "Règles dérogatoires CCN applicables" : "Règles CDD — " + (CDD_SUBTYPES.find(s => s.value === form.sousType)?.label || "")}
                      <span style={{ fontSize: "10px", fontWeight: 500, marginLeft: "8px", color: "#94a3b8" }}>{rs.base}</span>
                    </div>
                    {(!isUsage || usageOk) && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <span style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", color: "#374151", fontWeight: 600 }}>{rs.duree}</span>
                        <span style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", color: "#374151", fontWeight: 600 }}>{rs.renouv}</span>
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>{isUsage && !usageOk ? "Sélectionnez d'abord une convention collective autorisée (HCR, restauration rapide, spectacle vivant, sport, animation, aide à domicile…)" : rs.note}</div>
                    {rs.hasDerogation && rs.noteBase && <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>Règle de base : {rs.noteBase}</div>}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Step 1: Employer ── */}
      {step === 1 && (
        <div>
          <STitle num="02">Informations employeur</STitle>
          {pappersFilledFrom && (
            <div style={{ marginBottom: "14px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#166534", fontWeight: 600 }}>
              <Icon name="CheckCircle" size={14} color="#166534" strokeWidth={1.75} /> Données pré-remplies depuis INSEE : <strong>{pappersFilledFrom}</strong>
              <button onClick={() => setPappersFilledFrom("")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <GouvSearch form={form} onFill={data => { setForm(f => ({ ...f, ...data })); setPappersFilledFrom(data.nomEntreprise); }} />
            <Sel label="Forme juridique" name="formeJuridique" form={form} onChange={handleChange} options={["SARL","SAS","SASU","EURL","SA","EI","EIRL","SNC"].map(v => ({ value: v, label: v }))} />
            <Field label="SIRET" name="siret" form={form} onChange={handleChange} placeholder="14 chiffres" />
            <Field label="Code APE" name="codeAPE" form={form} onChange={handleChange} placeholder="ex: 5610C" />
            <Field label="Adresse du siège social" name="adresseSiege" form={form} onChange={handleChange} placeholder="27 Rue Louis Plana 31500 Toulouse" colSpan />
            <Field label="Ville URSSAF" name="villeUrssaf" form={form} onChange={handleChange} placeholder="ex: Toulouse" />
            <Field label="Représentant légal" name="representant" form={form} onChange={handleChange} placeholder="ex: M. Dupont, Gérant" />
          </div>
        </div>
      )}

      {/* ── Step 2: Employee ── */}
      {step === 2 && (
        <div>
          <STitle num="03">Informations salarié</STitle>

          {/* ── Hidden file inputs ── */}
          <input ref={vitaleFileRef} type="file" style={{ display: "none" }}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.bmp,.tiff"
            onChange={e => { if (e.target.files?.[0]) importVitale(e.target.files[0]); e.target.value = ""; }} />
          <input ref={salFileRef} type="file" multiple style={{ display: "none" }}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.bmp,.tiff"
            onChange={e => { if (e.target.files?.length) importSalaries(e.target.files); e.target.value = ""; }} />

          {/* ── Two OCR upload zones side-by-side ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>

            {/* Zone 1 — Carte Vitale */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="CreditCard" size={13} strokeWidth={2} color="#374151" />
                Carte Vitale
                <span style={{ fontWeight: 500, color: "#94a3b8", fontSize: "10.5px" }}>— N° Sécu uniquement</span>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setVitaleDrag(true); }}
                onDragLeave={() => setVitaleDrag(false)}
                onDrop={e => { e.preventDefault(); setVitaleDrag(false); const f = e.dataTransfer?.files?.[0]; if (f) importVitale(f); }}
                onClick={() => !vitaleImporting && vitaleFileRef.current?.click()}
                style={{ borderRadius: "10px", padding: "12px 14px", border: `1.5px dashed ${vitaleDrag ? NAVY : vitaleImporting ? "#93c5fd" : vitaleStatus === "success" ? "#86efac" : "#cbd5e1"}`, background: vitaleDrag ? "#eff6ff" : vitaleImporting ? "#f0f9ff" : vitaleStatus === "success" ? "#f0fdf4" : "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: vitaleImporting ? "default" : "pointer", transition: "all 0.2s", minHeight: "80px", textAlign: "center" }}>
                {vitaleImporting ? (
                  <>
                    <Icon name="Loader2" size={18} color={NAVY} strokeWidth={1.75} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: "11.5px", color: NAVY, fontWeight: 600 }}>Lecture…</span>
                    <button onClick={e => { e.stopPropagation(); cancelVitaleOCR(); }} style={{ marginTop: "2px", background: "#ef4444", color: "#fff", border: "none", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Annuler</button>
                  </>
                ) : vitaleStatus === "success" ? (
                  <>
                    <Icon name="CheckCircle" size={18} color="#166534" strokeWidth={1.75} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534" }}>N° Sécu extrait</span>
                    <button onClick={e => { e.stopPropagation(); vitaleFileRef.current?.click(); }} style={{ background: "transparent", border: "1px solid #86efac", borderRadius: "6px", color: "#166534", fontSize: "10px", fontWeight: 600, cursor: "pointer", padding: "2px 8px" }}>Changer</button>
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} color="#94a3b8" strokeWidth={1.75} />
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Photo ou scan</span>
                  </>
                )}
              </div>
              {vitaleStatus === "error" && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#b91c1c", display: "flex", gap: "4px", alignItems: "center" }}>
                  <Icon name="XCircle" size={12} color="#b91c1c" strokeWidth={2} /> Lecture impossible
                </div>
              )}
              {vitaleStatus === "empty" && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#854d0e", display: "flex", gap: "4px", alignItems: "center" }}>
                  <Icon name="AlertTriangle" size={12} color="#854d0e" strokeWidth={2} /> N° Sécu non trouvé
                </div>
              )}
            </div>

            {/* Zone 2 — Pièce d'identité */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="ScanLine" size={13} strokeWidth={2} color="#374151" />
                Pièce d'identité
                <span style={{ fontWeight: 500, color: "#94a3b8", fontSize: "10.5px" }}>— recto + verso</span>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setSalDrag(true); }}
                onDragLeave={() => setSalDrag(false)}
                onDrop={e => { e.preventDefault(); setSalDrag(false); if (e.dataTransfer?.files?.length) importSalaries(e.dataTransfer.files); }}
                onClick={() => !salImporting && salFileRef.current?.click()}
                style={{ borderRadius: "10px", padding: "12px 14px", border: `1.5px dashed ${salDrag ? NAVY : salImporting ? "#93c5fd" : salStatus === "success" ? "#86efac" : "#cbd5e1"}`, background: salDrag ? "#eff6ff" : salImporting ? "#f0f9ff" : salStatus === "success" ? "#f0fdf4" : "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: salImporting ? "default" : "pointer", transition: "all 0.2s", minHeight: "80px", textAlign: "center" }}>
                {salImporting ? (
                  <>
                    <Icon name="Loader2" size={18} color={NAVY} strokeWidth={1.75} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: "11.5px", color: NAVY, fontWeight: 600 }}>
                      {salProgress.total > 1 ? `${salProgress.done}/${salProgress.total} fichiers…` : "Lecture…"}
                    </span>
                    <button onClick={e => { e.stopPropagation(); cancelSalOCR(); }} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Annuler</button>
                  </>
                ) : salStatus === "success" ? (
                  <>
                    <Icon name="CheckCircle" size={18} color="#166534" strokeWidth={1.75} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534" }}>{salFields.length} champs extraits</span>
                    <button onClick={e => { e.stopPropagation(); salFileRef.current?.click(); }} style={{ background: "transparent", border: "1px solid #86efac", borderRadius: "6px", color: "#166534", fontSize: "10px", fontWeight: 600, cursor: "pointer", padding: "2px 8px" }}>Changer</button>
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} color="#94a3b8" strokeWidth={1.75} />
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>CNI · Passeport · Titre de séjour</span>
                    <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>2 fichiers max (recto/verso)</span>
                  </>
                )}
              </div>
              {salStatus === "error" && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#b91c1c", display: "flex", gap: "4px", alignItems: "center" }}>
                  <Icon name="XCircle" size={12} color="#b91c1c" strokeWidth={2} /> Lecture impossible
                </div>
              )}
              {salStatus === "empty" && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#854d0e", display: "flex", gap: "4px", alignItems: "center" }}>
                  <Icon name="AlertTriangle" size={12} color="#854d0e" strokeWidth={2} /> Aucune information trouvée
                </div>
              )}
              {salStatus === "success" && salFields.length > 0 && (
                <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {salFields.map(f => <span key={f} style={{ background: "#dcfce7", color: "#166534", padding: "1px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 600 }}>{f}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Genre */}
          <Sel label="Genre" name="genre" form={form} onChange={handleChange}
            options={[{ value: "", label: "Non précisé" }, { value: "M", label: "Homme" }, { value: "F", label: "Femme" }]} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Nom" name="nom" form={form} onChange={handleChange} placeholder="ex: AHMED" />
            <Field label="Prénom" name="prenom" form={form} onChange={handleChange} placeholder="ex: Tofayl" />
            <Field label="Adresse complète" name="adresseSalarie" form={form} onChange={handleChange} placeholder="28 Rue Theron de Montauge 31200 Toulouse" colSpan />
            <Field label="Date de naissance" name="dateNaissance" form={form} onChange={handleChange} type="date" />
            <Field label="Lieu de naissance" name="lieuNaissance" form={form} onChange={handleChange} placeholder="ex: Sylhet (Bangladesh)" />
            <DocTypeSelect form={form} onChange={handleChange} />
            <SearchSelect label="Nationalité" name="nationalite" form={form} onChange={handleChange} options={NATIONALITIES} placeholder="Rechercher une nationalité…" />
            <Field label="N° Sécurité sociale" name="numSecu" form={form} onChange={handleChange} placeholder="ex: 1 95 09 75 015 023 72" colSpan />
            {form.numSecu && !/^[12]/.test(form.numSecu.replace(/\s+/g, "")) && (
              <div style={{ gridColumn: "1/-1", background: "#fff7ed", border: "1.5px solid #fb923c", borderRadius: "9px", padding: "9px 13px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="AlertTriangle" size={14} color="#c2410c" strokeWidth={2} />
                <span style={{ fontSize: "12px", color: "#c2410c", fontWeight: 700 }}>Format invalide — le numéro de sécurité sociale doit commencer par 1 (homme) ou 2 (femme).</span>
              </div>
            )}
            {isForeign && !isEEA && (
              <>
                <Field label="N° Titre de séjour" name="titreSejour" form={form} onChange={handleChange} placeholder="Numéro du titre de séjour valide" colSpan note="(obligatoire hors EEE)" />
                <ForeignWorkerAlert />
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Contract conditions ── */}
      {step === 3 && (() => {
        const ccn = CCN_DATA.find(c =>
          c.label === form.convention ||
          (form.convention && form.convention.includes("IDCC " + c.idcc))
        );
        const selectedNiveau = ccn?.niveaux.find(n => n.label === form.niveau);
        const minConvHoraire = selectedNiveau?.tauxHoraire || 0;
        const minApply = minConvHoraire || SMIC_HORAIRE;
        const taux = parseFloat(form.tauxHoraire);
        const sousMin = !isNaN(taux) && taux > 0 && taux < minApply;
        const sousSmicOnly = sousMin && taux < SMIC_HORAIRE;
        const sousConvOnly = sousMin && taux >= SMIC_HORAIRE && minConvHoraire > 0;

        return (
          <div>
            <STitle num="04">Conditions du contrat</STitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <Field label="Date de début" name="dateDebut" form={form} onChange={handleChange} type="date" />
              {form.typeContrat === "CDD" ? <Field label="Date de fin" name="dateFin" form={form} onChange={handleChange} type="date" /> : <div />}
              <Field label="Période d'essai (jours)" name="periodEssai" form={form} onChange={handleChange} placeholder={form.typeContrat === "CDD" ? "ex: 15" : "ex: 90"} />
              <Field label="Fonction / Poste" name="fonction" form={form} onChange={handleChange} placeholder="ex: Employé polyvalent" />

              {/* Niveau — dropdown from CCN grids when available, else manual */}
              {ccn && ccn.niveaux.length > 0 ? (
                <div style={{ gridColumn: "1/-1", marginBottom: "13px" }}>
                  <label style={L}>
                    Niveau / Classification
                    <span style={{ background: "#eff6ff", color: NAVY, fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "999px", marginLeft: "6px", textTransform: "none" }}>grille {ccn.label.split("(")[0].trim()}</span>
                  </label>
                  <select value={form.niveau || ""} style={{ ...I, cursor: "pointer" }}
                    onChange={e => {
                      const n = ccn.niveaux.find(x => x.label === e.target.value);
                      setForm(f => ({ ...f, niveau: n ? n.label : "" }));
                    }}>
                    <option value="">— Choisir le niveau —</option>
                    {ccn.niveaux.map(n => (
                      <option key={n.label} value={n.label}>{n.label}</option>
                    ))}
                  </select>
                  {selectedNiveau && (
                    <div style={{ marginTop: "6px", padding: "7px 12px", borderRadius: "7px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "12px", color: NAVY, fontWeight: 600 }}>
                      Minimum conventionnel : <strong>{selectedNiveau.tauxHoraire.toFixed(2)} €/h</strong> → <strong>{(selectedNiveau.tauxHoraire * (parseFloat(form.heuresMensuelles) || 151.67)).toFixed(2)} €/mois</strong>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {form.convention && (
                    <div style={{ gridColumn: "1/-1", background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "9px", padding: "10px 14px", marginBottom: "10px", fontSize: "12px", color: "#9a3412" }}>
                      Convention sans grille enregistrée — saisissez le niveau manuellement.
                    </div>
                  )}
                  <Field label="Niveau" name="niveau" form={form} onChange={handleChange} placeholder="ex: Niveau II" note="(optionnel)" />
                  <Field label="Coefficient" name="coefficient" form={form} onChange={handleChange} placeholder="ex: 180" note="(optionnel)" />
                </>
              )}

              {/* Heures / semaine — auto-computes heures mensuelles */}
              <div style={{ marginBottom: "13px" }}>
                <label style={L}>Heures / semaine</label>
                <input type="number" min="1" max="48" step="0.5" name="heuresParSemaine"
                  value={form.heuresParSemaine || ""} placeholder="35" style={I}
                  onFocus={e => e.target.style.borderColor = ACCENT}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  onChange={e => {
                    const h = parseFloat(e.target.value);
                    if (!isNaN(h) && h > 0) {
                      const hMens = Math.round(h * (52 / 12) * 100) / 100;
                      setForm(f => ({ ...f, heuresParSemaine: e.target.value, heuresMensuelles: String(hMens) }));
                    } else {
                      setForm(f => ({ ...f, heuresParSemaine: e.target.value, heuresMensuelles: "" }));
                    }
                  }} />
              </div>
              <Field label="Répartition des jours" name="repartitionJours" form={form} onChange={handleChange} placeholder="ex: lundi au vendredi" />

              {/* Heures mensuelles — auto display */}
              <div style={{ marginBottom: "13px" }}>
                <label style={L}>
                  Heures mensuelles
                  <span style={{ background: "#eff6ff", color: NAVY, fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "999px", marginLeft: "6px", textTransform: "none" }}>auto</span>
                </label>
                <div style={{ ...I, background: "#f0f9ff", borderColor: "#bfdbfe", color: form.heuresMensuelles ? NAVY : "#94a3b8", fontWeight: form.heuresMensuelles ? 700 : 400, cursor: "default", userSelect: "none" }}>
                  {form.heuresMensuelles ? form.heuresMensuelles + " h/mois" : "— Renseigner les heures/semaine"}
                </div>
              </div>

              {/* Taux horaire — min SMIC/CCN badge + warnings */}
              <div style={{ marginBottom: sousMin ? "6px" : "13px" }}>
                <label style={L}>
                  Taux horaire brut (€/h)
                  <span style={{ background: sousMin ? "#fee2e2" : "#eff6ff", color: sousMin ? "#b91c1c" : NAVY, fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "999px", marginLeft: "6px", textTransform: "none" }}>
                    {minConvHoraire ? `min. CCN : ${minConvHoraire.toFixed(2)} €/h` : `SMIC : ${SMIC_HORAIRE} €/h`}
                  </span>
                </label>
                <input type="number" step="0.01" min={minApply} name="tauxHoraire"
                  value={form.tauxHoraire || ""} placeholder={`min. ${minApply.toFixed(2)}`}
                  style={{ ...I, borderColor: sousMin ? "#f87171" : form.tauxHoraire ? "#bfdbfe" : "#e2e8f0" }}
                  onFocus={e => e.target.style.borderColor = ACCENT}
                  onBlur={e => e.target.style.borderColor = sousMin ? "#f87171" : form.tauxHoraire ? "#bfdbfe" : "#e2e8f0"}
                  onChange={e => setForm(f => ({ ...f, tauxHoraire: e.target.value }))} />
              </div>

              {/* Salary validation warnings */}
              {sousSmicOnly && (
                <div style={{ gridColumn: "1/-1", background: "#fff1f2", border: "2px solid #ef4444", borderRadius: "10px", padding: "12px 16px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon name="AlertOctagon" size={16} color="#b91c1c" strokeWidth={2} />
                    <strong style={{ color: "#b91c1c", fontSize: "13px" }}>ILLÉGAL — Inférieur au SMIC ({SMIC_HORAIRE} €/h)</strong>
                  </div>
                </div>
              )}
              {sousConvOnly && (
                <div style={{ gridColumn: "1/-1", background: "#fff7ed", border: "2px solid #fb923c", borderRadius: "10px", padding: "10px 14px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon name="AlertTriangle" size={15} color="#c2410c" strokeWidth={2} />
                    <span style={{ fontSize: "12.5px", color: "#c2410c", fontWeight: 700 }}>Sous le minimum conventionnel ({minConvHoraire.toFixed(2)} €/h) — risque URSSAF</span>
                  </div>
                </div>
              )}
              {!sousMin && form.tauxHoraire && (
                <div style={{ gridColumn: "1/-1", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "8px", padding: "8px 14px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon name="CheckCircle" size={14} color="#166534" strokeWidth={1.75} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>Taux conforme au minimum applicable</span>
                </div>
              )}

              {/* Salaire brut — saisie manuelle */}
              <div style={{ marginBottom: "13px" }}>
                <label style={L}>
                  Salaire brut mensuel (€)
                  {form.tauxHoraire && form.heuresMensuelles && (
                    <span style={{ background: "#f0f9ff", color: NAVY, fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "999px", marginLeft: "6px", textTransform: "none" }}>
                      suggestion : {(parseFloat(form.tauxHoraire) * parseFloat(form.heuresMensuelles)).toFixed(2)} €
                    </span>
                  )}
                </label>
                <input type="number" step="0.01" min="0" name="salaireBrut"
                  value={form.salaireBrut || ""}
                  placeholder={form.tauxHoraire && form.heuresMensuelles
                    ? (parseFloat(form.tauxHoraire) * parseFloat(form.heuresMensuelles)).toFixed(2)
                    : "ex: 1821.22"}
                  style={I}
                  onFocus={e => e.target.style.borderColor = ACCENT}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  onChange={e => setForm(f => ({ ...f, salaireBrut: e.target.value }))} />
              </div>

              <Field label="Lieu de signature" name="lieuSignature" form={form} onChange={handleChange} placeholder="ex: Toulouse" />
              <Field label="Date de signature" name="dateSignature" form={form} onChange={handleChange} type="date" />
            </div>
          </div>
        );
      })()}

      {/* ── Step 4: Clauses & benefits ── */}
      {step === 4 && (
        <div>
          <STitle num="05">Clauses & Avantages</STitle>
          <p style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "8px" }}>Clauses spéciales <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optionnel)</span></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "20px" }}>
            {CLAUSES_LIST.map(c => <ToggleCard key={c.id} item={c} selected={form.clauses} onToggle={toggle("clauses")} />)}
          </div>
          <p style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "8px" }}>Avantages en nature <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optionnel)</span></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            {AVANTAGES_LIST.map(a => <ToggleCard key={a.id} item={a} selected={form.avantages} onToggle={toggle("avantages")} />)}
          </div>
        </div>
      )}

      {/* ── Step 5: Summary & generate ── */}
      {step === 5 && (
        <div>
          <STitle num="06">Récapitulatif</STitle>
          <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
            <Icon name="ClipboardList" size={18} color={NAVY} strokeWidth={1.75} />
            <div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: "14px" }}>{form.typeContrat} – {subTypeObj.label}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{form.formeJuridique} {form.nomEntreprise} · {form.prenom} {form.nom}</div>
            </div>
          </div>

          {/* Compliance panel */}
          <CompliancePanel form={form} onAutoFix={handleAutoFix} />

          {[
            ["Poste", form.fonction],
            ["SIRET", form.siret],
            ["Début", form.dateDebut],
            ...(form.typeContrat === "CDD" ? [["Fin", form.dateFin]] : []),
            ["Salaire brut", form.salaireBrut ? `${form.salaireBrut} €/mois` : ""],
            ["Convention", form.convention],
            ...(form.niveau ? [["Niveau / Coeff.", `${form.niveau} / ${form.coefficient}`]] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>{v || "—"}</span>
            </div>
          ))}
          {clauseLabels.length > 0 && <div style={{ marginTop: "10px", padding: "9px 12px", background: "#fefce8", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e", display: "flex", alignItems: "center", gap: "7px" }}><Icon name="ClipboardList" size={13} color="#92400e" strokeWidth={1.75} /> {clauseLabels.join(", ")}</div>}
          {avantageLabels.length > 0 && <div style={{ marginTop: "7px", padding: "9px 12px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #86efac", fontSize: "12px", color: "#166534", display: "flex", alignItems: "center", gap: "7px" }}><Icon name="Gift" size={13} color="#166534" strokeWidth={1.75} /> {avantageLabels.join(", ")}</div>}
          <button onClick={generate} disabled={loading} style={{ marginTop: "20px", width: "100%", padding: "14px", background: loading ? "#e2e8f0" : ACCENT, border: "none", borderRadius: "10px", color: loading ? "#94a3b8" : DARK, fontSize: "14px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", transition: "all 0.2s" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>{loading ? <><Icon name="Loader2" size={15} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Génération en cours…</> : <><Icon name="Wand2" size={15} strokeWidth={1.75} /> Générer le contrat</>}</span>
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button onClick={prev} disabled={step === 0} style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "8px", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.3 : 1 }}>← Retour</button>
        {step < STEPS.length - 1 && <button onClick={next} style={{ padding: "10px 22px", background: NAVY, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Suivant →</button>}
      </div>
    </div>
  );
}
