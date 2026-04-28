// 6-step wizard for generating a new employment contract (CDI or CDD)
import { useState, useRef } from "react";
import {
  NAVY, ACCENT, DARK, CDD_SUBTYPES, CDI_SUBTYPES, CLAUSES_LIST, AVANTAGES_LIST,
  DOCUMENT_TYPES, NATIONALITIES, EEA_LIST, initContract,
} from "../constants.js";
import { generateContract } from "../templates.js";
import { parseText } from "../parser.js";
import { Field, Sel, SearchSelect, CCNField, STitle, ToggleCard, StepBar } from "./UI.jsx";
import GouvSearch from "./GouvSearch.jsx";
import DocDisplay from "./DocDisplay.jsx";
import Icon from "./Icon.jsx";

const OCR_KEY = "K83007226988957";

// ── OCR.Space: send any image or PDF as base64, get plain text back ───────────
async function ocrSpaceExtract(file) {
  const mimeType = file.type || "image/jpeg";
  const reader = new FileReader();
  const base64 = await new Promise((res, rej) => {
    reader.onload = () => res(reader.result); // keep full data-URL prefix for OCR.Space
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  const form = new FormData();
  form.append("base64Image", base64);
  form.append("apikey", OCR_KEY);
  form.append("language", "auto");   // Engine 2 auto-detects; works for FR/EN mixed ID docs
  form.append("OCREngine", "2");
  form.append("scale", "true");
  form.append("detectOrientation", "true");
  if (mimeType === "application/pdf") form.append("filetype", "PDF");

  const res = await fetch("/ocr-proxy/parse/image", {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] || "OCR error");
  const text = data.ParsedResults?.map(r => r.ParsedText).join("\n").trim() || "";
  console.log("[OCR raw text]\n", text);   // ← inspect this in DevTools to tune the parser
  return text;
}

// ── pdf.js (CDN): extract embedded text from text-based PDFs ─────────────────
async function extractPDFText(file) {
  const lib = window.pdfjsLib;
  if (!lib) return "";
  lib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let i = 1; i <= Math.min(pdf.numPages, 4); i++) {
    const page = await pdf.getPage(i);
    const c = await page.getTextContent();
    text += c.items.map(x => x.str).join(" ") + "\n";
  }
  return text.trim();
}

// ── mammoth (CDN): extract text from DOCX ────────────────────────────────────
async function extractDOCXText(file) {
  const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.trim();
}

// ── Route any file to the right text extractor ────────────────────────────────
async function fileToText(file) {
  const ext = file.name.toLowerCase();
  const isPDF = file.type === "application/pdf" || ext.endsWith(".pdf");
  const isDOCX = ext.endsWith(".docx");
  const isImage = file.type.startsWith("image/");

  if (isPDF) {
    const embedded = await extractPDFText(file);
    if (embedded.length > 40) return embedded;
    return ocrSpaceExtract(file); // scanned PDF — OCR page images
  }
  if (isImage) return ocrSpaceExtract(file);
  if (isDOCX)  return extractDOCXText(file);
  return file.text(); // TXT and everything else
}

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
  // Full-contract import state (top zone)
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importedFields, setImportedFields] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pappersFilledFrom, setPappersFilledFrom] = useState("");
  // Employee-doc import state (step 2)
  const [salImporting, setSalImporting] = useState(false);
  const [salStatus, setSalStatus] = useState(null);
  const [salFields, setSalFields] = useState([]);
  const [salFileName, setSalFileName] = useState("");
  const [salDrag, setSalDrag] = useState(false);
  const fileRef = useRef();
  const salFileRef = useRef();

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

  const LABELS = {
    typeContrat:"Type de contrat",formeJuridique:"Forme juridique",
    nomEntreprise:"Nom entreprise",siret:"SIRET",codeAPE:"Code APE",
    adresseSiege:"Adresse siège",villeUrssaf:"Ville URSSAF",representant:"Représentant",
    nom:"Nom salarié",prenom:"Prénom",adresseSalarie:"Adresse salarié",
    nationalite:"Nationalité",titreSejour:"Titre de séjour",
    dateNaissance:"Date naissance",lieuNaissance:"Lieu naissance",numSecu:"N° Sécu",
    dateDebut:"Date début",dateFin:"Date fin",periodEssai:"Période d'essai",
    fonction:"Fonction",niveau:"Niveau",coefficient:"Coefficient",
    heuresParSemaine:"Heures/semaine",repartitionJours:"Répartition jours",
    tauxHoraire:"Taux horaire",salaireBrut:"Salaire brut",heuresMensuelles:"Heures mensuelles",
    convention:"Convention collective",lieuSignature:"Lieu signature",dateSignature:"Date signature",
  };

  // ── Full-contract import (top zone) — OCR + local parser, all fields ─────────
  const importFromPDF = async (file) => {
    if (!file) return;
    setImportFileName(file.name);
    setImporting(true);
    setImportStatus(null);
    setImportedFields([]);
    try {
      const text = await fileToText(file);
      const parsed = parseText(text);
      const updates = {};
      const filled = [];
      Object.entries(parsed).forEach(([k, v]) => {
        if (v && initContract.hasOwnProperty(k)) {
          updates[k] = v;
          if (LABELS[k]) filled.push(LABELS[k]);
        }
      });
      setForm(f => ({ ...f, ...updates }));
      setImportedFields(filled);
      setImportStatus(filled.length > 0 ? "success" : "empty");
    } catch (e) {
      console.error("[importFromPDF]", e.message);
      setImportStatus("error");
    }
    setImporting(false);
  };

  // ── Employee-doc import (step 2) — OCR + local parser, salarié fields only ───
  const importSalarie = async (file) => {
    if (!file) return;
    setSalFileName(file.name);
    setSalImporting(true);
    setSalStatus(null);
    setSalFields([]);
    const SAL_LABELS = {
      nom: "Nom", prenom: "Prénom", adresseSalarie: "Adresse",
      dateNaissance: "Date naissance", lieuNaissance: "Lieu naissance",
      numSecu: "N° Sécu", nationalite: "Nationalité", titreSejour: "Titre séjour",
    };
    try {
      const text = await fileToText(file);
      const parsed = parseText(text);
      const updates = {};
      const filled = [];
      Object.keys(SAL_LABELS).forEach(k => {
        if (parsed[k]) { updates[k] = parsed[k]; filled.push(SAL_LABELS[k]); }
      });
      setForm(f => ({ ...f, ...updates }));
      setSalFields(filled);
      setSalStatus(filled.length > 0 ? "success" : "empty");
    } catch (e) {
      console.error("[importSalarie]", e.message);
      setSalStatus("error");
    }
    setSalImporting(false);
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
      onReset={() => { setGenerated(false); setContract(""); setStep(0); setForm(initContract); }}
    />
  );

  // ── Render form steps ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Full-contract import zone */}
      <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) importFromPDF(f); e.target.value = ""; }} />

      {importStatus !== "success" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer?.files?.[0]; if (f) importFromPDF(f); }}
          onClick={() => !importing && fileRef.current?.click()}
          style={{ marginBottom: "18px", borderRadius: "12px", padding: "14px 18px", border: `2px dashed ${dragOver ? NAVY : importing ? "#93c5fd" : "#cbd5e1"}`, background: dragOver ? "#eff6ff" : importing ? "#f0f9ff" : "#f8fafc", transition: "all 0.2s", cursor: importing ? "default" : "pointer", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flexShrink: 0, color: importing ? NAVY : "#94a3b8", display: "flex" }}>
            <Icon name={importing ? "Loader2" : "FileUp"} size={26} strokeWidth={1.5} style={importing ? { animation: "slide 1.4s ease-in-out infinite" } : {}} />
          </div>
          <div style={{ flex: 1 }}>
            {importing ? (
              <>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: "13px" }}>Lecture du contrat en cours…</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{importFileName} — extraction des données par l'IA…</div>
                <div style={{ marginTop: "8px", height: "4px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", background: NAVY, borderRadius: "4px", animation: "slide 1.4s ease-in-out infinite" }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>Importer un contrat existant <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optionnel)</span></div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>PDF · DOCX · TXT · JPG · PNG — pré-remplit tous les champs</div>
              </>
            )}
          </div>
          {!importing && <div style={{ background: NAVY, color: "#fff", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>Choisir fichier</div>}
        </div>
      )}

      {importStatus === "error" && (
        <div style={{ marginBottom: "16px", background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="XCircle" size={18} color="#b91c1c" strokeWidth={1.75} />
          <div><div style={{ fontWeight: 700, color: "#b91c1c", fontSize: "13px" }}>Impossible de lire ce fichier</div><div style={{ fontSize: "12px", color: "#64748b" }}>Vérifiez que le fichier est lisible et non protégé.</div></div>
          <button onClick={() => setImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={16} strokeWidth={2} /></button>
        </div>
      )}
      {importStatus === "empty" && (
        <div style={{ marginBottom: "16px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="AlertTriangle" size={18} color="#854d0e" strokeWidth={1.75} />
          <div style={{ fontSize: "12.5px", color: "#854d0e" }}>Aucune information reconnue dans ce document. Remplissez le formulaire manuellement.</div>
          <button onClick={() => setImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={16} strokeWidth={2} /></button>
        </div>
      )}

      {importStatus === "success" && (
        <div style={{ marginBottom: "16px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Icon name="CheckCircle" size={16} color="#166534" strokeWidth={1.75} />
            <span style={{ fontWeight: 700, color: "#166534", fontSize: "13px" }}>{importedFields.length} champs pré-remplis depuis «&nbsp;{importFileName}&nbsp;»</span>
            <button onClick={() => { setImportStatus(null); setImportedFields([]); }} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={16} strokeWidth={2} /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {importedFields.map(f => <span key={f} style={{ background: "#dcfce7", color: "#166534", padding: "2px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>{f}</span>)}
          </div>
          <button onClick={() => fileRef.current?.click()} style={{ marginTop: "10px", background: "transparent", border: "1px solid #86efac", borderRadius: "6px", color: "#166534", fontSize: "11px", fontWeight: 600, cursor: "pointer", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Icon name="Upload" size={11} strokeWidth={1.75} /> Importer un autre fichier
          </button>
        </div>
      )}

      <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>

      {/* Progress bar */}
      <StepBar steps={STEPS} current={step} />

      {/* ── Step 0: Type ── */}
      {step === 0 && (
        <div>
          <STitle num="01">Type de contrat</STitle>
          <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
            {["CDI", "CDD"].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, typeContrat: t, sousType: "standard" }))} style={{ flex: 1, padding: "18px", borderRadius: "12px", cursor: "pointer", border: `2px solid ${form.typeContrat === t ? NAVY : "#e2e8f0"}`, background: form.typeContrat === t ? "#eff6ff" : "#fafafa", transition: "all 0.15s" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: form.typeContrat === t ? NAVY : "#94a3b8" }}>{t}</div>
                <div style={{ fontSize: "11px", marginTop: "3px", color: form.typeContrat === t ? "#3b82f6" : "#94a3b8", fontWeight: 600 }}>{t === "CDI" ? "Durée indéterminée" : "Durée déterminée"}</div>
              </button>
            ))}
          </div>
          <p style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "10px" }}>Sous-type {form.typeContrat}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {subTypes.map(sub => (
              <button key={sub.value} onClick={() => setForm(f => ({ ...f, sousType: sub.value }))} style={{ textAlign: "left", padding: "11px 14px", borderRadius: "9px", cursor: "pointer", border: `1.5px solid ${form.sousType === sub.value ? NAVY : "#e2e8f0"}`, background: form.sousType === sub.value ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.15s" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: form.sousType === sub.value ? NAVY : "#374151" }}>{sub.label}</span>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8", marginLeft: "8px" }}>{sub.desc}</span>
                </div>
                {sub.maxDuration && form.sousType === sub.value && <span style={{ fontSize: "10px", background: "#fef9c3", color: "#854d0e", padding: "2px 8px", borderRadius: "999px", fontWeight: 700, whiteSpace: "nowrap" }}>{sub.maxDuration}</span>}
                {form.sousType === sub.value && <Icon name="Check" size={15} strokeWidth={2.5} color={NAVY} />}
              </button>
            ))}
          </div>
          {form.typeContrat === "CDD" && (
            <div style={{ marginTop: "14px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "11px 14px", fontSize: "12px", color: "#854d0e" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}><Icon name="AlertTriangle" size={13} color="#854d0e" strokeWidth={1.75} /> Un CDD peut être renouvelé deux fois sans dépasser 18 mois au total.</span>
            </div>
          )}
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

          {/* Employee document import zone */}
          <input ref={salFileRef} type="file" style={{ display: "none" }}
            accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.heic,.bmp,.tiff"
            onChange={e => { const f = e.target.files?.[0]; if (f) importSalarie(f); e.target.value = ""; }} />
          <div
            onDragOver={e => { e.preventDefault(); setSalDrag(true); }}
            onDragLeave={() => setSalDrag(false)}
            onDrop={e => { e.preventDefault(); setSalDrag(false); const f = e.dataTransfer?.files?.[0]; if (f) importSalarie(f); }}
            onClick={() => !salImporting && salFileRef.current?.click()}
            style={{ marginBottom: "14px", borderRadius: "12px", padding: "13px 16px", border: `2px dashed ${salDrag ? NAVY : salImporting ? "#93c5fd" : "#cbd5e1"}`, background: salDrag ? "#eff6ff" : salImporting ? "#f0f9ff" : "#f8fafc", display: "flex", alignItems: "center", gap: "12px", cursor: salImporting ? "default" : "pointer", transition: "all 0.2s" }}>
            <div style={{ color: salImporting ? NAVY : "#94a3b8", display: "flex" }}>
              <Icon name={salImporting ? "Loader2" : "CreditCard"} size={22} strokeWidth={1.5} style={salImporting ? { animation: "slide 1.4s ease-in-out infinite" } : {}} />
            </div>
            <div style={{ flex: 1 }}>
              {salImporting ? (
                <>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: "13px" }}>Lecture en cours…</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{salFileName}</div>
                  <div style={{ marginTop: "7px", height: "3px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "60%", background: NAVY, borderRadius: "3px", animation: "slide 1.4s ease-in-out infinite" }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Importer pièce d'identité ou contrat <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optionnel)</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                    PDF · DOCX · TXT · JPG · PNG · WEBP · HEIC — pré-remplit nom, prénom, adresse, date de naissance, n° sécu…
                  </div>
                </>
              )}
            </div>
            {!salImporting && <div style={{ background: NAVY, color: "#fff", padding: "7px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>Choisir fichier</div>}
          </div>
          {salStatus === "success" && (
            <div style={{ marginBottom: "14px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                <Icon name="CheckCircle" size={16} color="#166534" strokeWidth={1.75} />
                <span style={{ fontWeight: 700, color: "#166534", fontSize: "13px" }}>{salFields.length} champs pré-remplis depuis «&nbsp;{salFileName}&nbsp;»</span>
                <button onClick={() => setSalStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {salFields.map(f => <span key={f} style={{ background: "#dcfce7", color: "#166534", padding: "2px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>{f}</span>)}
              </div>
            </div>
          )}
          {salStatus === "error" && (
            <div style={{ marginBottom: "14px", background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
              <Icon name="XCircle" size={18} color="#b91c1c" strokeWidth={1.75} />
              <div><div style={{ fontWeight: 700, color: "#b91c1c", fontSize: "13px" }}>Lecture impossible</div><div style={{ fontSize: "12px", color: "#64748b" }}>Fichier protégé ou format non supporté.</div></div>
              <button onClick={() => setSalStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
            </div>
          )}
          {salStatus === "empty" && (
            <div style={{ marginBottom: "14px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
              <Icon name="AlertTriangle" size={18} color="#854d0e" strokeWidth={1.75} />
              <div style={{ fontSize: "12.5px", color: "#854d0e" }}>Aucune information salarié trouvée dans ce document.</div>
              <button onClick={() => setSalStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Nom" name="nom" form={form} onChange={handleChange} placeholder="ex: AHMED" />
            <Field label="Prénom" name="prenom" form={form} onChange={handleChange} placeholder="ex: Tofayl" />
            <Field label="Adresse complète" name="adresseSalarie" form={form} onChange={handleChange} placeholder="28 Rue Theron de Montauge 31200 Toulouse" colSpan />
            <Field label="Date de naissance" name="dateNaissance" form={form} onChange={handleChange} type="date" />
            <Field label="Lieu de naissance" name="lieuNaissance" form={form} onChange={handleChange} placeholder="ex: Sylhet (Bangladesh)" />
            <DocTypeSelect form={form} onChange={handleChange} />
            <SearchSelect label="Nationalité" name="nationalite" form={form} onChange={handleChange} options={NATIONALITIES} placeholder="Rechercher une nationalité…" />
            <Field label="N° Sécurité sociale" name="numSecu" form={form} onChange={handleChange} placeholder="ex: 7 95 09 75 015 023 72" colSpan />
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
      {step === 3 && (
        <div>
          <STitle num="04">Conditions du contrat</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Date de début" name="dateDebut" form={form} onChange={handleChange} type="date" />
            {form.typeContrat === "CDD" ? <Field label="Date de fin" name="dateFin" form={form} onChange={handleChange} type="date" /> : <div />}
            <Field label="Période d'essai (jours)" name="periodEssai" form={form} onChange={handleChange} placeholder={form.typeContrat === "CDD" ? "ex: 15" : "ex: 90"} />
            <Field label="Fonction / Poste" name="fonction" form={form} onChange={handleChange} placeholder="ex: Employé polyvalent" />
            <Field label="Niveau" name="niveau" form={form} onChange={handleChange} placeholder="ex: Niveau II" note="(optionnel)" />
            <Field label="Coefficient" name="coefficient" form={form} onChange={handleChange} placeholder="ex: 180" note="(optionnel)" />
            <Field label="Heures / semaine" name="heuresParSemaine" form={form} onChange={handleChange} placeholder="35" />
            <Field label="Répartition des jours" name="repartitionJours" form={form} onChange={handleChange} placeholder="ex: lundi au vendredi" />
            <Field label="Taux horaire brut (€)" name="tauxHoraire" form={form} onChange={handleChange} placeholder="ex: 11.88" />
            <Field label="Salaire brut mensuel (€)" name="salaireBrut" form={form} onChange={handleChange} placeholder="ex: 1 801,84" />
            <Field label="Heures mensuelles" name="heuresMensuelles" form={form} onChange={handleChange} placeholder="151,67" />
            <CCNField form={form} onChange={handleChange} />
            <Field label="Lieu de signature" name="lieuSignature" form={form} onChange={handleChange} placeholder="ex: Toulouse" />
            <Field label="Date de signature" name="dateSignature" form={form} onChange={handleChange} type="date" />
          </div>
        </div>
      )}

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
          {[
            ["Poste", form.fonction],
            ["SIRET", form.siret],
            ["Début", form.dateDebut],
            ...(form.typeContrat === "CDD" ? [["Fin", form.dateFin]] : []),
            ["Salaire brut", `${form.salaireBrut} €/mois`],
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
