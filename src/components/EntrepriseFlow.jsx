// 6-step wizard: enterprise creation intake & fiche de synthèse generation via Anthropic
import { useState, useRef } from "react";
import { NAVY, DARK, ACCENT, NATIONALITIES } from "../constants.js";
import { anthropicHeaders, renderContract } from "../utils.jsx";
import { Field, Sel, STitle, ToggleCard, SearchSelect, StepBar } from "./UI.jsx";
import ApiKeyBanner from "./ApiKeyBanner.jsx";
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, UnderlineType, BorderStyle,
} from "docx";

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMES_JURIDIQUES = [
  { value: "micro",  label: "Micro-entreprise", icon: "🧾", desc: "Régime simplifié, franchise TVA" },
  { value: "ei",     label: "EI",               icon: "🤝", desc: "Individuelle, 0 € capital min." },
  { value: "eurl",   label: "EURL",             icon: "📁", desc: "SARL à associé unique" },
  { value: "sarl",   label: "SARL",             icon: "🤝", desc: "2 à 100 associés, resp. limitée" },
  { value: "sasu",   label: "SASU",             icon: "⚡", desc: "SAS à associé unique" },
  { value: "sas",    label: "SAS",              icon: "🌐", desc: "Flexibilité statutaire maximale" },
  { value: "sci",    label: "SCI",              icon: "🏠", desc: "Gestion de patrimoine immobilier" },
];

const REGIMES_FISCAL = [
  { value: "",       label: "— Sélectionner —" },
  { value: "ir",     label: "IR – Impôt sur le revenu" },
  { value: "is",     label: "IS – Impôt sur les sociétés" },
  { value: "micro",  label: "Micro-fiscal (auto-entrepreneur)" },
];

const REGIMES_TVA = [
  { value: "",             label: "— Sélectionner —" },
  { value: "franchise",    label: "Franchise en base de TVA" },
  { value: "reel_simplifie", label: "Réel simplifié" },
  { value: "reel_normal",  label: "Réel normal" },
];

const DOMICILIATION_TYPES = [
  { value: "domicile",      label: "Domicile du dirigeant" },
  { value: "commercial",    label: "Local commercial" },
  { value: "domiciliation", label: "Société de domiciliation" },
  { value: "pepiniere",     label: "Pépinière / Coworking" },
];

const JUSTIFICATIFS_ENT = [
  { id: "id_dirigeant",        label: "Pièce d'identité dirigeant",             icon: "🪪" },
  { id: "id_associes",         label: "Pièce d'identité associés",              icon: "🪪" },
  { id: "domicile",            label: "Justificatif domicile dirigeant",         icon: "🏠" },
  { id: "domiciliation_siege", label: "Justificatif domiciliation siège",        icon: "📍" },
  { id: "statuts",             label: "Projet de statuts",                       icon: "📄" },
  { id: "depot_capital",       label: "Attestation dépôt capital",              icon: "🏦" },
  { id: "non_condamnation",    label: "Déclaration non-condamnation",            icon: "✅" },
  { id: "activite_regl",       label: "Justificatif activité réglementée",       icon: "⚖️" },
  { id: "bail",                label: "Bail commercial / Contrat domiciliation", icon: "📑" },
  { id: "rib",                 label: "RIB",                                     icon: "💳" },
];

const ACCOMPAGNEMENT_ENT = [
  { id: "forme_juridique",   label: "Choix forme juridique",       icon: "🏛️" },
  { id: "regime_fiscal",     label: "Choix régime fiscal",         icon: "💶" },
  { id: "redaction_statuts", label: "Rédaction des statuts",       icon: "📝" },
  { id: "domiciliation",     label: "Domiciliation",               icon: "📍" },
  { id: "depot_capital",     label: "Dépôt du capital",            icon: "🏦" },
  { id: "annonce_legale",    label: "Annonce légale (JAL)",        icon: "📰" },
  { id: "depot_inpi",        label: "Dépôt INPI / Guichet unique", icon: "🗂️" },
  { id: "conseil_global",    label: "Conseil global projet",       icon: "🤝" },
];

const ENT_STEPS = ["Client", "Projet", "Dirigeant", "Siège & Capital", "Documents", "Accompagnement"];

const initEntreprise = {
  // Step 1 – Client
  clientPrenom: "", clientNom: "", clientEmail: "", clientTelephone: "",
  // Step 2 – Projet
  nomEntreprise: "", activite: "", formeJuridique: "sas", regimeFiscal: "", regimeTVA: "",
  // Step 3 – Dirigeant & associés
  dirNom: "", dirPrenom: "", dirDateNaissance: "", dirLieuNaissance: "",
  dirNationalite: "Française", dirAdresse: "",
  plusieursAssocies: false, associes: [],
  // Step 4 – Siège & capital
  typeDomiciliation: "domicile", adresseSiege: "", capitalSocial: "", capitalBanque: "",
  // Step 5 – Activité réglementée & pièces
  activiteReglementee: "non", precisionReglementee: "", justificatifs: [],
  // Step 6 – Accompagnement
  accompagnement: [], commentaires: "",
};

// ─── OCR.Space pipeline (same as ContractFlow) ────────────────────────────────
const OCR_KEY = "K83007226988957";

async function ocrSpaceExtract(file) {
  const reader = new FileReader();
  const base64 = await new Promise((res, rej) => {
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
  const form = new FormData();
  form.append("base64Image", base64);
  form.append("apikey", OCR_KEY);
  form.append("language", "auto");
  form.append("OCREngine", "2");
  form.append("scale", "true");
  form.append("detectOrientation", "true");
  if (file.type === "application/pdf") form.append("filetype", "PDF");
  const res = await fetch("/ocr-proxy/parse/image", { method: "POST", body: form });
  const data = await res.json();
  if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] || "OCR error");
  return data.ParsedResults?.map(r => r.ParsedText).join("\n").trim() || "";
}

async function fileToText(file) {
  const ext = file.name.toLowerCase();
  const isPDF = file.type === "application/pdf" || ext.endsWith(".pdf");
  const isDOCX = ext.endsWith(".docx");
  const isImage = file.type.startsWith("image/");
  if (isPDF) {
    const lib = window.pdfjsLib;
    if (lib) {
      lib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      try {
        const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const c = await page.getTextContent();
          text += c.items.map(x => x.str).join(" ") + "\n";
        }
        if (text.trim().length > 40) return text.trim();
      } catch { /* fall through to OCR */ }
    }
    return ocrSpaceExtract(file);
  }
  if (isImage) return ocrSpaceExtract(file);
  if (isDOCX && window.mammoth) {
    const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return r.value.trim();
  }
  return file.text();
}

// Simple name/dob extractor from OCR text for dirigeant ID pre-fill
function parseIdentiteText(text) {
  const t = text.replace(/\n/g, " ");
  const result = {};

  // MRZ: IDFRAXXX<<<<<<<<NOM<<PRENOM or passport P<FRAXXX
  const mrzLine = text.split("\n").find(l => /^[A-Z<]{30,44}$/.test(l.trim()));
  if (mrzLine) {
    // Try to find NOM<<PRENOM pattern
    const namePart = mrzLine.replace(/[^A-Z<]/g, "");
    const dd = namePart.split("<<");
    if (dd.length >= 2) {
      result.dirNom = dd[0].replace(/</g, " ").trim();
      result.dirPrenom = dd[1].replace(/</g, " ").trim().split(" ")[0];
    }
  }

  // "Nom : DUPONT" or "NOM DUPONT"
  if (!result.dirNom) {
    const m = t.match(/(?:nom|NOM|Name)\s*[:\s]+([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜ][A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜ\s\-]{1,30}?)(?:\s{2,}|,|\n|Prénom|PRENOM)/i);
    if (m) result.dirNom = m[1].trim();
  }

  // "Prénom : Jean" or "PRENOMS JEAN"
  if (!result.dirPrenom) {
    const m = t.match(/(?:pr[ée]noms?|PRENOMS?|Given|First)\s*[:\s]+([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜa-zéèàùâêîôûäëïöü][A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜa-zéèàùâêîôûäëïöü\s\-]{1,30}?)(?:\s{2,}|,|\n|Né|NÉ|Date)/i);
    if (m) result.dirPrenom = m[1].trim().split(" ")[0];
  }

  // Date of birth
  const dobM = t.match(/(?:né[e]?\s+le|date\s+de\s+naissance|born|DOB)\s*[:\s]*((?:\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{4}|\d{2}\s+\d{2}\s+\d{4}))/i);
  if (dobM) {
    const raw = dobM[1].trim();
    const parts = raw.match(/(\d{1,2})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{4})/);
    if (parts) {
      const d = parts[1].padStart(2, "0"), m2 = parts[2].padStart(2, "0");
      result.dirDateNaissance = `${parts[3]}-${m2}-${d}`;
    }
  }

  // Lieu de naissance
  const lieuM = t.match(/(?:né[e]?\s+[àa]\s+|lieu\s+de\s+naissance\s*[:\s]+)([A-ZÀÙÉÈÂÊÎÔÛa-zàùéèâêîôû\s\-]+?)(?:\s{2,}|\n|le\s+|\d)/i);
  if (lieuM) result.dirLieuNaissance = lieuM[1].trim();

  return result;
}

// ─── Local FormeCard (not in shared UI) ───────────────────────────────────────
function FormeCard({ item, selected, onSelect }) {
  const active = selected === item.value;
  return (
    <button
      onClick={() => onSelect(item.value)}
      style={{
        padding: "12px 10px", border: `1.5px solid ${active ? NAVY : "#e2e8f0"}`,
        borderRadius: "10px", cursor: "pointer", background: active ? "#eff6ff" : "#fafafa",
        transition: "all 0.15s", textAlign: "center", width: "100%",
      }}>
      <div style={{ fontSize: "22px", marginBottom: "4px" }}>{item.icon}</div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: active ? NAVY : "#0f172a" }}>{item.label}</div>
      <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px", lineHeight: 1.3 }}>{item.desc}</div>
      {active && <div style={{ marginTop: "5px", color: NAVY, fontWeight: 800, fontSize: "12px" }}>✓</div>}
    </button>
  );
}

// ─── DOCX generation ──────────────────────────────────────────────────────────
function ficheToDocxParagraphs(text) {
  const out = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("# ")) {
      out.push(new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 120 },
        children: [new TextRun({ text: line.replace(/^# /, "").toUpperCase(), bold: true, size: 28, font: "Times New Roman" })],
      })); continue;
    }
    if (line.startsWith("## ")) {
      out.push(new Paragraph({
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1e3a5f", space: 4 } },
        children: [new TextRun({ text: line.replace(/^## /, "").toUpperCase(), bold: true, size: 22, font: "Times New Roman", underline: { type: UnderlineType.SINGLE } })],
      })); continue;
    }
    if (/^(-{3}|\*{3}|_{3})$/.test(line.trim())) {
      out.push(new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0", space: 6 } }, spacing: { before: 120, after: 120 }, children: [] })); continue;
    }
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      out.push(new Paragraph({ spacing: { before: 160, after: 40 }, children: [new TextRun({ text: line.trim().replace(/^\*\*|\*\*$/g, "").toUpperCase(), bold: true, size: 22, font: "Times New Roman" })] })); continue;
    }
    if (line.trim() === "") {
      out.push(new Paragraph({ spacing: { after: 60 }, children: [] })); continue;
    }
    const runs = [];
    for (const part of line.split(/(\*\*[^*]+\*\*)/g)) {
      if (part.startsWith("**") && part.endsWith("**"))
        runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 22, font: "Times New Roman" }));
      else runs.push(new TextRun({ text: part, size: 22, font: "Times New Roman" }));
    }
    out.push(new Paragraph({ spacing: { after: 40 }, children: runs }));
  }
  return out;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── FicheDisplay ─────────────────────────────────────────────────────────────
function FicheDisplay({ text, onReset }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDocx = async () => {
    setDownloading(true);
    try {
      const doc = new Document({
        styles: { default: { document: { run: { font: "Times New Roman", size: 22 } } } },
        sections: [{
          properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
          children: ficheToDocxParagraphs(text),
        }],
      });
      downloadBlob(await Packer.toBlob(doc), "fiche-creation-entreprise.docx");
    } catch (e) { console.error("DOCX error:", e); }
    setDownloading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "16px" }}>✦ Fiche de synthèse générée</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleCopy} style={{ padding: "8px 14px", border: `1.5px solid ${copied ? "#16a34a" : NAVY}`, borderRadius: "6px", background: copied ? "#f0fdf4" : "transparent", color: copied ? "#16a34a" : NAVY, fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "✓ Copié !" : "Copier texte"}
          </button>
          <button onClick={handleDocx} disabled={downloading} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: downloading ? "#e2e8f0" : NAVY, color: downloading ? "#94a3b8" : "#fff", fontSize: "12px", fontWeight: 700, cursor: downloading ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}>
            {downloading ? "⏳ Génération…" : "⬇ Télécharger .docx"}
          </button>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: "10px", padding: "32px 36px", maxHeight: "520px", overflowY: "auto", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ textAlign: "center", marginBottom: "18px", paddingBottom: "12px", borderBottom: `3px solid ${NAVY}` }}>
          <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.3em", color: NAVY, textTransform: "uppercase" }}>Fiche de synthèse — Création d'entreprise</div>
        </div>
        {renderContract(text)}
      </div>
      <button onClick={onReset} style={{ marginTop: "10px", width: "100%", padding: "13px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#64748b", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
        ↺ Nouveau dossier
      </button>
    </div>
  );
}

// ─── Anthropic API call ───────────────────────────────────────────────────────
async function generateFiche(form) {
  const forme = FORMES_JURIDIQUES.find(f => f.value === form.formeJuridique)?.label || form.formeJuridique;
  const regimeFiscalLabel = REGIMES_FISCAL.find(r => r.value === form.regimeFiscal)?.label || "Non précisé";
  const regimeTVALabel = REGIMES_TVA.find(r => r.value === form.regimeTVA)?.label || "Non précisé";
  const domicLabel = DOMICILIATION_TYPES.find(d => d.value === form.typeDomiciliation)?.label || form.typeDomiciliation;

  const assocText = form.plusieursAssocies && form.associes.length
    ? form.associes.map((a, i) =>
        `  Associé ${i + 1} : ${a.prenom || "?"} ${a.nom || "?"}, nationalité ${a.nationalite || "?"}, né(e) le ${a.dateNaissance || "?"} à ${a.lieuNaissance || "?"}, parts : ${a.parts || "?"}%`
      ).join("\n")
    : "  Associé unique (le dirigeant)";

  const justifFournis = JUSTIFICATIFS_ENT.filter(j => form.justificatifs.includes(j.id)).map(j => j.label);
  const justifManquants = JUSTIFICATIFS_ENT.filter(j => !form.justificatifs.includes(j.id)).map(j => j.label);
  const accompList = ACCOMPAGNEMENT_ENT.filter(a => form.accompagnement.includes(a.id)).map(a => a.label);

  const prompt = `Tu es un expert-comptable et juriste spécialisé en droit des sociétés français. Génère une fiche de synthèse complète et professionnelle pour le dossier de création d'entreprise ci-dessous. Réponds uniquement en markdown professionnel.

---

## DOSSIER CLIENT

**Client :** ${form.clientPrenom} ${form.clientNom}
**Email :** ${form.clientEmail || "—"} | **Tél :** ${form.clientTelephone || "—"}

---

## PROJET DE CRÉATION

- **Dénomination sociale :** ${form.nomEntreprise || "À définir"}
- **Activité principale :** ${form.activite || "Non précisée"}
- **Forme juridique choisie :** ${forme}
- **Régime fiscal envisagé :** ${regimeFiscalLabel}
- **Régime TVA envisagé :** ${regimeTVALabel}

---

## DIRIGEANT

- **Identité :** ${form.dirPrenom} ${form.dirNom}
- **Date de naissance :** ${form.dirDateNaissance || "—"} | **Lieu :** ${form.dirLieuNaissance || "—"}
- **Nationalité :** ${form.dirNationalite}
- **Adresse :** ${form.dirAdresse || "—"}

## ASSOCIÉS
${assocText}

---

## SIÈGE SOCIAL & CAPITAL

- **Type de domiciliation :** ${domicLabel}
- **Adresse du siège :** ${form.adresseSiege || "À définir"}
- **Capital social :** ${form.capitalSocial ? form.capitalSocial + " €" : "Non précisé"}
- **Banque pour le dépôt :** ${form.capitalBanque || "Non précisée"}

---

## ACTIVITÉ RÉGLEMENTÉE

- **Activité réglementée :** ${form.activiteReglementee === "oui" ? "Oui" : "Non"}
${form.activiteReglementee === "oui" ? `- **Précision :** ${form.precisionReglementee || "À préciser"}` : ""}

---

## PIÈCES JUSTIFICATIVES

**Pièces fournies (${justifFournis.length}) :** ${justifFournis.join(", ") || "Aucune"}
**Pièces manquantes (${justifManquants.length}) :** ${justifManquants.join(", ") || "Aucune"}

---

## ACCOMPAGNEMENT SOUHAITÉ

${accompList.join(", ") || "Non précisé"}

---

## COMMENTAIRES CLIENT

${form.commentaires || "Aucun commentaire."}

---

## INSTRUCTIONS DE GÉNÉRATION

Génère une fiche de synthèse professionnelle structurée avec :

# [Titre de la fiche incluant nom de la société et forme juridique]

## 1. Synthèse du projet
Résume le projet en 3-5 lignes, en précisant le contexte et la viabilité apparente.

## 2. Analyse de la forme juridique
Justifie le choix de ${forme} pour ce projet spécifique. Mentionne les avantages, inconvénients, et alternatives à envisager si pertinentes. Inclus les implications en termes de responsabilité, fiscalité et gouvernance.

## 3. Régimes fiscal et social recommandés
Analyse les régimes fiscal (${regimeFiscalLabel}) et TVA (${regimeTVALabel}) au regard de l'activité et de la forme choisie. Formule des recommandations si des optimisations sont possibles.

## 4. Étapes de constitution et délais estimés
Liste les étapes clés avec délais estimés (rédaction statuts, dépôt capital, INPI/guichet unique, publication JAL, immatriculation…).

## 5. Points d'attention juridiques et fiscaux
Identifie les risques et points de vigilance spécifiques à ce dossier (activité réglementée, capital minimal, clauses statutaires, pacte d'actionnaires si associés multiples…).

## 6. Checklist des documents
Récapitule les pièces fournies (✅) et manquantes (❌) avec les actions à entreprendre pour compléter le dossier.

## 7. Plan d'accompagnement
Détaille les prestations à réaliser par le cabinet selon les besoins exprimés : ${accompList.join(", ") || "à définir"}.

## 8. Prochaines étapes et calendrier
Propose un calendrier prévisionnel avec les actions immédiates (J+1 à J+30) et les étapes suivantes jusqu'à l'immatriculation.

---
Style : professionnel, concis, orienté conseil. Utilise **gras** pour les éléments clés. Format markdown, pas d'HTML.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: anthropicHeaders(),
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erreur API ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EntrepriseFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initEntreprise);
  const [fiche, setFiche] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // OCR state for dirigeant ID import
  const [dirImporting, setDirImporting] = useState(false);
  const [dirImportStatus, setDirImportStatus] = useState(null); // null | "success" | "error" | "empty"
  const [dirImportedFields, setDirImportedFields] = useState([]);
  const [dirFileName, setDirFileName] = useState("");
  const [dirDragOver, setDirDragOver] = useState(false);
  const dirFileRef = useRef();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const prev = () => setStep(s => Math.max(0, s - 1));
  const next = () => setStep(s => Math.min(ENT_STEPS.length - 1, s + 1));

  const toggleList = (key, id) => setForm(f => ({
    ...f,
    [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id],
  }));

  // Associés management
  const addAssocie = () => setForm(f => ({
    ...f,
    associes: [...f.associes, { nom: "", prenom: "", nationalite: "Française", dateNaissance: "", lieuNaissance: "", parts: "" }],
  }));
  const removeAssocie = i => setForm(f => ({ ...f, associes: f.associes.filter((_, idx) => idx !== i) }));
  const setAssocieField = (i, key, val) => setForm(f => {
    const arr = [...f.associes];
    arr[i] = { ...arr[i], [key]: val };
    return { ...f, associes: arr };
  });

  // OCR import for dirigeant ID
  const importDirigeant = async (file) => {
    if (!file) return;
    setDirFileName(file.name);
    setDirImporting(true);
    setDirImportStatus(null);
    setDirImportedFields([]);
    const FIELD_LABELS = { dirNom: "Nom", dirPrenom: "Prénom", dirDateNaissance: "Date naissance", dirLieuNaissance: "Lieu naissance" };
    try {
      const text = await fileToText(file);
      const parsed = parseIdentiteText(text);
      const updates = {};
      const filled = [];
      Object.entries(parsed).forEach(([k, v]) => {
        if (v && initEntreprise.hasOwnProperty(k)) {
          updates[k] = v;
          if (FIELD_LABELS[k]) filled.push(FIELD_LABELS[k]);
        }
      });
      setForm(f => ({ ...f, ...updates }));
      setDirImportedFields(filled);
      setDirImportStatus(filled.length > 0 ? "success" : "empty");
    } catch (e) {
      console.error("[importDirigeant]", e.message);
      setDirImportStatus("error");
    }
    setDirImporting(false);
  };

  const handleGenerate = async () => {
    setGenError("");
    setGenerating(true);
    try {
      const text = await generateFiche(form);
      setFiche(text);
    } catch (e) {
      setGenError(e.message);
    }
    setGenerating(false);
  };

  const handleReset = () => {
    setFiche(""); setForm(initEntreprise); setStep(0); setGenError("");
    setDirImportStatus(null); setDirImportedFields([]);
  };

  // ── Generated view ──────────────────────────────────────────────────────────
  if (fiche) return <FicheDisplay text={fiche} onReset={handleReset} />;

  // ── Form view ───────────────────────────────────────────────────────────────
  return (
    <div>
      <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>

      {/* Progress bar */}
      <StepBar steps={ENT_STEPS} current={step} />

      {/* ── Step 0: Client ── */}
      {step === 0 && (
        <div>
          <STitle num="01">Informations client</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Prénom" name="clientPrenom" form={form} onChange={handleChange} placeholder="Jean" />
            <Field label="Nom" name="clientNom" form={form} onChange={handleChange} placeholder="Dupont" />
            <Field label="Email" name="clientEmail" form={form} onChange={handleChange} placeholder="jean.dupont@email.com" type="email" colSpan />
            <Field label="Téléphone" name="clientTelephone" form={form} onChange={handleChange} placeholder="06 12 34 56 78" colSpan />
          </div>
        </div>
      )}

      {/* ── Step 1: Projet ── */}
      {step === 1 && (
        <div>
          <STitle num="02">Projet de création</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Dénomination sociale envisagée" name="nomEntreprise" form={form} onChange={handleChange} placeholder="Ex : Tech Solutions" colSpan />
            <Field label="Activité principale" name="activite" form={form} onChange={handleChange} placeholder="Description de l'activité (NAF si connu)" colSpan />
            <Sel label="Régime fiscal envisagé" name="regimeFiscal" form={form} onChange={handleChange} options={REGIMES_FISCAL} colSpan />
            <Sel label="Régime TVA envisagé" name="regimeTVA" form={form} onChange={handleChange} options={REGIMES_TVA} colSpan />
          </div>

          <p style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "10px", marginTop: "4px" }}>Forme juridique</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "4px" }}>
            {FORMES_JURIDIQUES.slice(0, 4).map(f => (
              <FormeCard key={f.value} item={f} selected={form.formeJuridique} onSelect={v => setForm(x => ({ ...x, formeJuridique: v }))} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {FORMES_JURIDIQUES.slice(4).map(f => (
              <FormeCard key={f.value} item={f} selected={form.formeJuridique} onSelect={v => setForm(x => ({ ...x, formeJuridique: v }))} />
            ))}
          </div>

          {/* Capital minimum hint */}
          {["micro","ei"].includes(form.formeJuridique) && (
            <div style={{ marginTop: "12px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#166534", fontWeight: 500 }}>
              ✓ Aucun capital minimum requis pour la {FORMES_JURIDIQUES.find(f => f.value === form.formeJuridique)?.label}.
            </div>
          )}
          {["sarl","eurl"].includes(form.formeJuridique) && (
            <div style={{ marginTop: "12px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#854d0e" }}>
              ⚠️ Capital minimum symbolique (1 €) — recommandé : 1 000 € à 10 000 € selon l'activité.
            </div>
          )}
          {["sas","sasu"].includes(form.formeJuridique) && (
            <div style={{ marginTop: "12px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#854d0e" }}>
              ⚠️ Capital minimum symbolique (1 €) — grande flexibilité statutaire. Prévoir un capital adapté aux besoins.
            </div>
          )}
          {form.formeJuridique === "sci" && (
            <div style={{ marginTop: "12px", background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: NAVY }}>
              ℹ️ SCI : recommandée pour la gestion de patrimoine immobilier en famille ou entre associés.
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Dirigeant & associés ── */}
      {step === 2 && (
        <div>
          <STitle num="03">Dirigeant & associés</STitle>

          {/* OCR import for dirigeant ID */}
          <input ref={dirFileRef} type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.bmp,.tiff,.docx,.txt"
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) importDirigeant(f); e.target.value = ""; }}
          />
          <div
            onDragOver={e => { e.preventDefault(); setDirDragOver(true); }}
            onDragLeave={() => setDirDragOver(false)}
            onDrop={e => { e.preventDefault(); setDirDragOver(false); const f = e.dataTransfer?.files?.[0]; if (f) importDirigeant(f); }}
            onClick={() => !dirImporting && dirFileRef.current?.click()}
            style={{ marginBottom: "14px", borderRadius: "12px", padding: "13px 16px", border: `2px dashed ${dirDragOver ? NAVY : dirImporting ? "#93c5fd" : "#cbd5e1"}`, background: dirDragOver ? "#eff6ff" : dirImporting ? "#f0f9ff" : "#f8fafc", display: "flex", alignItems: "center", gap: "12px", cursor: dirImporting ? "default" : "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: "24px" }}>{dirImporting ? "⏳" : "🪪"}</div>
            <div style={{ flex: 1 }}>
              {dirImporting ? (
                <>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: "13px" }}>Lecture de la pièce d'identité…</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{dirFileName}</div>
                  <div style={{ marginTop: "7px", height: "3px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "60%", background: NAVY, borderRadius: "3px", animation: "slide 1.4s ease-in-out infinite" }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Importer pièce d'identité du dirigeant <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optionnel)</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                    CNI · Passeport · Titre de séjour · PDF — pré-remplit nom, prénom, date et lieu de naissance
                  </div>
                </>
              )}
            </div>
            {!dirImporting && <div style={{ background: NAVY, color: "#fff", padding: "7px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>Choisir fichier</div>}
          </div>

          {dirImportStatus === "success" && (
            <div style={{ marginBottom: "14px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                <span>✅</span>
                <span style={{ fontWeight: 700, color: "#166534", fontSize: "13px" }}>{dirImportedFields.length} champs pré-remplis depuis «&nbsp;{dirFileName}&nbsp;»</span>
                <button onClick={() => setDirImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}>×</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {dirImportedFields.map(f => <span key={f} style={{ background: "#dcfce7", color: "#166534", padding: "2px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>{f}</span>)}
              </div>
            </div>
          )}
          {dirImportStatus === "error" && (
            <div style={{ marginBottom: "14px", background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span>❌</span>
              <div><div style={{ fontWeight: 700, color: "#b91c1c", fontSize: "13px" }}>Lecture impossible</div><div style={{ fontSize: "12px", color: "#64748b" }}>Fichier protégé ou format non supporté.</div></div>
              <button onClick={() => setDirImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
          )}
          {dirImportStatus === "empty" && (
            <div style={{ marginBottom: "14px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span>⚠️</span>
              <div style={{ fontSize: "12.5px", color: "#854d0e" }}>Aucune information du dirigeant trouvée dans ce document. Remplissez manuellement.</div>
              <button onClick={() => setDirImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
          )}

          {/* Dirigeant fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Nom du dirigeant" name="dirNom" form={form} onChange={handleChange} placeholder="DUPONT" />
            <Field label="Prénom" name="dirPrenom" form={form} onChange={handleChange} placeholder="Jean" />
            <Field label="Date de naissance" name="dirDateNaissance" form={form} onChange={handleChange} type="date" />
            <Field label="Lieu de naissance" name="dirLieuNaissance" form={form} onChange={handleChange} placeholder="Paris (75)" />
            <SearchSelect label="Nationalité" name="dirNationalite" form={form} onChange={handleChange} options={NATIONALITIES} placeholder="Rechercher une nationalité…" />
            <div />
            <Field label="Adresse du dirigeant" name="dirAdresse" form={form} onChange={handleChange} placeholder="12 rue de la Paix, 75001 Paris" colSpan />
          </div>

          {/* Associés supplémentaires */}
          <div style={{ marginTop: "8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
            <p style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", margin: 0 }}>Associés supplémentaires</p>
            <button
              onClick={() => setForm(f => ({ ...f, plusieursAssocies: !f.plusieursAssocies, associes: [] }))}
              style={{ padding: "5px 14px", border: `1.5px solid ${form.plusieursAssocies ? NAVY : "#e2e8f0"}`, borderRadius: "20px", background: form.plusieursAssocies ? NAVY : "transparent", color: form.plusieursAssocies ? "#fff" : "#64748b", fontSize: "11px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
              {form.plusieursAssocies ? "Oui ✓" : "Non"}
            </button>
          </div>

          {form.plusieursAssocies && (
            <div>
              {form.associes.map((a, i) => (
                <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: NAVY, background: "#eff6ff", padding: "3px 10px", borderRadius: "999px" }}>Associé {i + 1}</span>
                    <button onClick={() => removeAssocie(i)} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "1px solid #fca5a5", borderRadius: "6px", cursor: "pointer", fontWeight: 700, padding: "3px 10px" }}>✕ Supprimer</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    <div style={{ marginBottom: "13px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Prénom</label>
                      <input value={a.prenom} onChange={e => setAssocieField(i, "prenom", e.target.value)} placeholder="Prénom" style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: "13px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Nom</label>
                      <input value={a.nom} onChange={e => setAssocieField(i, "nom", e.target.value)} placeholder="Nom" style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: "13px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Date de naissance</label>
                      <input type="date" value={a.dateNaissance} onChange={e => setAssocieField(i, "dateNaissance", e.target.value)} style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: "13px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Lieu de naissance</label>
                      <input value={a.lieuNaissance} onChange={e => setAssocieField(i, "lieuNaissance", e.target.value)} placeholder="Ville" style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: "13px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Nationalité</label>
                      <select value={a.nationalite} onChange={e => setAssocieField(i, "nationalite", e.target.value)} style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: "13px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Parts (%)</label>
                      <input type="number" min="0" max="100" value={a.parts} onChange={e => setAssocieField(i, "parts", e.target.value)} placeholder="Ex : 50" style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addAssocie} style={{ width: "100%", padding: "11px", border: `1.5px dashed ${NAVY}`, borderRadius: "8px", background: "transparent", color: NAVY, fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                + Ajouter un associé
              </button>
              {form.associes.length > 0 && (
                <div style={{ marginTop: "8px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "8px", padding: "8px 12px", fontSize: "11.5px", color: "#854d0e" }}>
                  ℹ️ Total des parts associés : {form.associes.reduce((s, a) => s + (parseFloat(a.parts) || 0), 0).toFixed(0)}% (le dirigeant détient le solde)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Siège & Capital ── */}
      {step === 3 && (
        <div>
          <STitle num="04">Siège social</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Sel label="Type de domiciliation" name="typeDomiciliation" form={form} onChange={handleChange} options={DOMICILIATION_TYPES} colSpan />
            <Field label="Adresse du siège social" name="adresseSiege" form={form} onChange={handleChange} placeholder="12 rue de la Paix, 75001 Paris" colSpan />
          </div>
          {form.typeDomiciliation === "domicile" && (
            <div style={{ marginBottom: "16px", background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: NAVY }}>
              ℹ️ Domiciliation au domicile du dirigeant : autorisée pour une durée maximale de 5 ans (sous conditions selon le bail ou le règlement de copropriété).
            </div>
          )}
          {form.typeDomiciliation === "domiciliation" && (
            <div style={{ marginBottom: "16px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#166534" }}>
              ✓ Contrat de domiciliation obligatoire — prévoir un justificatif à joindre au dossier.
            </div>
          )}

          <STitle num="05" style={{ marginTop: "8px" }}>Capital social</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Montant du capital (€)" name="capitalSocial" form={form} onChange={handleChange} placeholder="Ex : 1000" type="number" />
            <Field label="Banque de dépôt" name="capitalBanque" form={form} onChange={handleChange} placeholder="BNP, Crédit Agricole, LCL…" />
          </div>
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", fontSize: "12px", color: "#374151" }}>
            <strong style={{ color: NAVY }}>Rappel capital minimum selon la forme :</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px", marginTop: "8px" }}>
              {[["Micro / EI", "0 €"], ["EURL / SARL", "1 € (min. légal)"], ["SASU / SAS", "1 € (min. légal)"], ["SA", "37 000 €"]].map(([f, v]) => (
                <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#64748b" }}>{f}</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Documents & réglementation ── */}
      {step === 4 && (
        <div>
          <STitle num="06">Activité réglementée</STitle>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {[{ v: "non", label: "Non réglementée" }, { v: "oui", label: "Réglementée" }].map(({ v, label }) => (
              <button key={v} onClick={() => setForm(f => ({ ...f, activiteReglementee: v }))}
                style={{ flex: 1, padding: "10px", border: `1.5px solid ${form.activiteReglementee === v ? NAVY : "#e2e8f0"}`, borderRadius: "8px", background: form.activiteReglementee === v ? "#eff6ff" : "#fafafa", color: form.activiteReglementee === v ? NAVY : "#64748b", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {v === "oui" ? "⚖️ " : "✓ "}{label}
              </button>
            ))}
          </div>
          {form.activiteReglementee === "oui" && (
            <>
              <Field label="Préciser l'activité réglementée" name="precisionReglementee" form={form} onChange={handleChange} placeholder="Ex : Professions de santé, juridiques, immobilières, sécurité, transport…" colSpan />
              <div style={{ marginBottom: "16px", background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "10px", padding: "11px 14px", fontSize: "12px", color: "#b91c1c" }}>
                ⚠️ Une activité réglementée nécessite des autorisations spécifiques avant immatriculation (diplôme, agrément, carte professionnelle, assurance RC Pro obligatoire…).
              </div>
            </>
          )}

          <STitle num="07">Pièces justificatives reçues</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            {JUSTIFICATIFS_ENT.map(j => (
              <ToggleCard key={j.id} item={j} selected={form.justificatifs} onToggle={id => toggleList("justificatifs", id)} />
            ))}
          </div>
          {form.justificatifs.length > 0 && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "12px", color: "#166534" }}>
              ✅ {form.justificatifs.length}/{JUSTIFICATIFS_ENT.length} pièces reçues
            </div>
          )}
        </div>
      )}

      {/* ── Step 5: Accompagnement & generate ── */}
      {step === 5 && (
        <div>
          <STitle num="08">Accompagnement souhaité</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "16px" }}>
            {ACCOMPAGNEMENT_ENT.map(a => (
              <ToggleCard key={a.id} item={a} selected={form.accompagnement} onToggle={id => toggleList("accompagnement", id)} />
            ))}
          </div>

          <STitle num="09">Commentaires & remarques</STitle>
          <textarea
            name="commentaires"
            value={form.commentaires}
            onChange={handleChange}
            placeholder="Informations complémentaires, contraintes particulières, délais souhaités, questions du client…"
            rows={4}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#0f172a", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#f8fafc" }}
          />

          {/* Récapitulatif rapide */}
          <div style={{ marginTop: "14px", background: "#eff6ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>📋</span>
              <span style={{ fontWeight: 700, color: NAVY, fontSize: "14px" }}>
                {FORMES_JURIDIQUES.find(f => f.value === form.formeJuridique)?.label || "?"} — {form.nomEntreprise || "Dénomination à définir"}
              </span>
            </div>
            {[
              ["Client", `${form.clientPrenom} ${form.clientNom}`.trim() || "—"],
              ["Dirigeant", `${form.dirPrenom} ${form.dirNom}`.trim() || "—"],
              ["Activité", form.activite || "—"],
              ["Capital", form.capitalSocial ? `${form.capitalSocial} €` : "—"],
              ["Siège", form.adresseSiege || "—"],
              ["Pièces reçues", `${form.justificatifs.length}/${JUSTIFICATIFS_ENT.length}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #dbeafe", fontSize: "12.5px" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>{k}</span>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <ApiKeyBanner />

          {genError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 14px", color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>
              ⚠️ {genError}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ width: "100%", padding: "14px", border: "none", borderRadius: "10px", background: generating ? "#e2e8f0" : ACCENT, color: generating ? "#94a3b8" : DARK, fontSize: "14px", fontWeight: 800, cursor: generating ? "not-allowed" : "pointer", letterSpacing: "0.03em", transition: "all 0.2s" }}>
            {generating ? "⏳ Génération de la fiche en cours…" : "✦ Générer la fiche de synthèse"}
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button onClick={prev} disabled={step === 0} style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "8px", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.3 : 1 }}>
          ← Retour
        </button>
        {step < ENT_STEPS.length - 1 && (
          <button onClick={next} style={{ padding: "10px 22px", background: NAVY, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}
