// 3-step wizard for generating an amendment (avenant) to an existing contract
import { useState, useRef } from "react";
import {
  NAVY, ACCENT, DARK, AVENANT_TYPES, CLAUSES_LIST, AVANTAGES_LIST, initAvenant,
} from "../constants.js";
import { generateAvenant } from "../templates.js";
import { parseText } from "../parser.js";
import { Field, Sel, Toggle, STitle, StepBar } from "./UI.jsx";
import DocDisplay from "./DocDisplay.jsx";
import Icon from "./Icon.jsx";
import { fileToText, getPreviewUrl } from "../ocr.js";

const AVN_STEPS = ["Type", "Société & Salarié", "Modifications"];

export default function AvenantFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initAvenant);
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  // Contract import state
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // null | "success" | "error" | "empty"
  const [importedFields, setImportedFields] = useState([]);
  const [importPreviews, setImportPreviews] = useState([]); // [{url, name}]
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const importAbortRef = useRef(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleToggle = (name, val) => setForm(f => ({ ...f, [name]: val }));

  const cancelImportOCR = () => {
    if (importAbortRef.current) importAbortRef.current.abort();
    setImporting(false);
    setImportStatus(null);
    setImportProgress({ done: 0, total: 0 });
  };

  // Parser field → avenant form field mapping — accepts multiple files, merges results
  const importFromContract = async (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    if (importAbortRef.current) importAbortRef.current.abort();
    const controller = new AbortController();
    importAbortRef.current = controller;

    importPreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
    setImportPreviews(arr.map(f => ({ url: getPreviewUrl(f), name: f.name })));
    setImporting(true);
    setImportStatus(null);
    setImportedFields([]);
    setImportProgress({ done: 0, total: arr.length });
    const FIELD_MAP = {
      nomEntreprise: { key: "raisonSociale",  label: "Raison sociale" },
      adresseSiege:  { key: "adresseSociete", label: "Adresse société" },
      siret:         { key: "siret",          label: "SIRET" },
      nom:           { key: "nom",            label: "Nom salarié" },
      prenom:        { key: "prenom",         label: "Prénom salarié" },
      fonction:      { key: "poste",          label: "Poste" },
      typeContrat:   { key: "typeContrat",    label: "Type contrat" },
      dateDebut:     { key: "dateEmbauche",   label: "Date d'embauche" },
      salaireBrut:   { key: "salaireActuel",  label: "Salaire actuel" },
    };
    try {
      let merged = {};
      for (let idx = 0; idx < arr.length; idx++) {
        const text = await fileToText(arr[idx], controller.signal);
        const parsed = parseText(text);
        Object.keys(FIELD_MAP).forEach(src => {
          if (parsed[src] && !merged[src]) merged[src] = parsed[src];
        });
        setImportProgress({ done: idx + 1, total: arr.length });
      }
      const updates = {}, filled = [];
      Object.entries(FIELD_MAP).forEach(([src, { key, label }]) => {
        if (merged[src]) { updates[key] = merged[src]; filled.push(label); }
      });
      setForm(f => ({ ...f, ...updates }));
      setImportedFields(filled);
      setImportStatus(filled.length > 0 ? "success" : "empty");
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("[importFromContract]", e.message);
        setImportStatus("error");
      }
    }
    setImporting(false);
    setImportProgress({ done: 0, total: 0 });
  };
  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const avenantType = AVENANT_TYPES.find(a => a.value === form.typeAvenant) || AVENANT_TYPES[0];

  const generate = () => {
    setLoading(true);
    try {
      setDoc(generateAvenant(form, avenantType.label));
      setGenerated(true);
    } catch {
      setDoc("Erreur de génération.");
      setGenerated(true);
    }
    setLoading(false);
  };

  if (generated) return (
    <DocDisplay
      text={doc}
      copied={copied}
      onCopy={() => { navigator.clipboard.writeText(doc); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      onBack={() => { setGenerated(false); setDoc(""); }}
      onReset={() => { setGenerated(false); setDoc(""); setStep(0); setForm(initAvenant); }}
    />
  );

  // Helper for clause/avantage multi-select toggle
  const toggleList = (key, label) => setForm(f => ({
    ...f,
    [key]: f[key].includes(label) ? f[key].filter(x => x !== label) : [...f[key], label],
  }));

  return (
    <div>
      <StepBar
        steps={AVN_STEPS}
        current={step}
        onStepClick={i => setStep(i)}
        stepWarnings={[
          !form.typeAvenant,
          !form.raisonSociale || !form.nom || !form.prenom,
          false,
        ]}
      />

      {/* ── Step 0: Avenant type ── */}
      {step === 0 && (
        <div>
          <STitle num="01">Type d'avenant</STitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {AVENANT_TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({ ...f, typeAvenant: t.value }))} style={{ textAlign: "left", padding: "13px 16px", borderRadius: "10px", cursor: "pointer", border: `1.5px solid ${form.typeAvenant === t.value ? NAVY : "#e2e8f0"}`, background: form.typeAvenant === t.value ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }}>
                <Icon name={t.icon} size={18} strokeWidth={1.75} color={form.typeAvenant === t.value ? NAVY : "#94a3b8"} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: form.typeAvenant === t.value ? NAVY : "#374151" }}>{t.label}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.desc}</div>
                </div>
                {form.typeAvenant === t.value && <Icon name="Check" size={15} strokeWidth={2.5} color={NAVY} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: Company & employee info ── */}
      {step === 1 && (
        <div>
          <STitle num="02">Société & Salarié</STitle>

          {/* Contract upload zone */}
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,image/*" style={{ display: "none" }}
            onChange={e => { if (e.target.files?.length) importFromContract(e.target.files); e.target.value = ""; }} />

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer?.files?.length) importFromContract(e.dataTransfer.files); }}
            onClick={() => !importing && fileRef.current?.click()}
            style={{ marginBottom: "16px", borderRadius: "12px", padding: "13px 18px", border: `2px dashed ${dragOver ? NAVY : importing ? "#93c5fd" : "#cbd5e1"}`, background: dragOver ? "#eff6ff" : importing ? "#f0f9ff" : "#f8fafc", transition: "all 0.2s", cursor: importing ? "default" : "pointer", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ flexShrink: 0, color: importing ? NAVY : "#94a3b8", display: "flex" }}>
              <Icon name={importing ? "Loader2" : "FileUp"} size={24} strokeWidth={1.5} style={importing ? { animation: "avn-slide 1.4s ease-in-out infinite" } : {}} />
            </div>
            <div style={{ flex: 1 }}>
              {importing ? (
                <>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: "13px" }}>
                    Lecture du contrat… {importProgress.total > 1 ? `(${importProgress.done}/${importProgress.total} fichiers)` : ""}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{importPreviews.map(p => p.name).join(", ")}</div>
                  <div style={{ marginTop: "7px", height: "3px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: NAVY, borderRadius: "3px", transition: "width 0.4s",
                      width: importProgress.total > 1 ? `${Math.round((importProgress.done / importProgress.total) * 100)}%` : "60%",
                      animation: importProgress.total <= 1 ? "avn-slide 1.4s ease-in-out infinite" : "none" }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Importer le contrat existant <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optionnel)</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                    PDF · DOCX · TXT · Image — pré-remplit société, salarié, poste et salaire
                  </div>
                </>
              )}
            </div>
            {importing
              ? <button onClick={e => { e.stopPropagation(); cancelImportOCR(); }} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "7px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Icon name="X" size={13} strokeWidth={2.5} /> Annuler
                </button>
              : <div style={{ background: NAVY, color: "#fff", padding: "7px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {importPreviews.length > 0 ? "Modifier" : "Choisir fichiers"}
                </div>
            }
          </div>

          {importStatus === "success" && (
            <div style={{ marginBottom: "14px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                <Icon name="CheckCircle" size={15} color="#166534" strokeWidth={1.75} />
                <span style={{ fontWeight: 700, color: "#166534", fontSize: "13px" }}>
                  {importedFields.length} champs pré-remplis depuis {importPreviews.length === 1 ? `« ${importPreviews[0]?.name} »` : `${importPreviews.length} documents`}
                </span>
                <button onClick={() => setImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {importedFields.map(f => <span key={f} style={{ background: "#dcfce7", color: "#166534", padding: "2px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>{f}</span>)}
              </div>
            </div>
          )}
          {importStatus === "empty" && (
            <div style={{ marginBottom: "14px", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon name="AlertTriangle" size={16} color="#854d0e" strokeWidth={1.75} />
              <div style={{ fontSize: "12.5px", color: "#854d0e" }}>Aucune information reconnue dans ce contrat. Remplissez manuellement.</div>
              <button onClick={() => setImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
            </div>
          )}
          {importStatus === "error" && (
            <div style={{ marginBottom: "14px", background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon name="XCircle" size={16} color="#b91c1c" strokeWidth={1.75} />
              <div><div style={{ fontWeight: 700, color: "#b91c1c", fontSize: "13px" }}>Lecture impossible</div><div style={{ fontSize: "12px", color: "#64748b" }}>Fichier protégé ou format non supporté.</div></div>
              <button onClick={() => setImportStatus(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><Icon name="X" size={15} strokeWidth={2} /></button>
            </div>
          )}
          {importPreviews.length > 0 && importStatus !== null && (
            <div style={{ marginBottom: "14px", display: "grid", gridTemplateColumns: importPreviews.length === 1 ? "1fr" : "1fr 1fr", gap: "8px" }}>
              {importPreviews.map((p, i) => p.url
                ? <div key={i} style={{ borderRadius: "10px", overflow: "hidden", border: "1.5px solid #e2e8f0", background: "#f1f5f9" }}>
                    <img src={p.url} alt={p.name} style={{ width: "100%", maxHeight: "180px", objectFit: "contain", display: "block" }} />
                  </div>
                : <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon name="FileText" size={20} color={NAVY} strokeWidth={1.5} />
                    <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  </div>
              )}
            </div>
          )}

          <p style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Société</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Raison sociale" name="raisonSociale" form={form} onChange={handleChange} placeholder="ex: SARL RANIA" colSpan />
            <Field label="Adresse" name="adresseSociete" form={form} onChange={handleChange} placeholder="Adresse complète" colSpan />
            <Field label="SIRET" name="siret" form={form} onChange={handleChange} placeholder="14 chiffres" />
            <Field label="Représentant" name="representant" form={form} onChange={handleChange} placeholder="ex: M. Dupont, Gérant" />
          </div>
          <div style={{ height: "1px", background: "#e2e8f0", margin: "14px 0" }} />
          <p style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Salarié</p>
          <Sel label="Genre" name="genre" form={form} onChange={handleChange}
            options={[{ value: "", label: "Non précisé" }, { value: "M", label: "Homme" }, { value: "F", label: "Femme" }]} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Nom" name="nom" form={form} onChange={handleChange} />
            <Field label="Prénom" name="prenom" form={form} onChange={handleChange} />
            <Field label="Poste occupé" name="poste" form={form} onChange={handleChange} placeholder="ex: Employé polyvalent" />
            <Sel label="Type de contrat" name="typeContrat" form={form} onChange={handleChange} options={[{ value: "CDI", label: "CDI" }, { value: "CDD", label: "CDD" }]} />
            <Field label="Date d'embauche" name="dateEmbauche" form={form} onChange={handleChange} type="date" colSpan />
          </div>
        </div>
      )}

      {/* ── Step 2: Modification details ── */}
      {step === 2 && (
        <div>
          <STitle num="03">{avenantType.label}</STitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>

            {/* Renouvellement CDD */}
            {form.typeAvenant === "renouvellement_cdd" && <>
              <Field label="Début CDD initial" name="dateDebutCDD" form={form} onChange={handleChange} type="date" />
              <Field label="Fin initiale CDD" name="dateFinInitiale" form={form} onChange={handleChange} type="date" />
              <Field label="Nb de jours renouvelés" name="nbJoursRenouvellement" form={form} onChange={handleChange} placeholder="ex: 90" />
              <Field label="Nouvelle date de fin" name="nouvelleDateFin" form={form} onChange={handleChange} type="date" />
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Type de renouvellement</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[{ v: "premier", t: "1er renouvellement" }, { v: "second", t: "2e renouvellement (dernier)" }].map(({ v, t }) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, typeRenouvellement: v }))} style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${form.typeRenouvellement === v ? NAVY : "#e2e8f0"}`, background: form.typeRenouvellement === v ? "#eff6ff" : "#fafafa", color: form.typeRenouvellement === v ? NAVY : "#64748b" }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: "1/-1", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "9px", padding: "10px 14px", fontSize: "12px", color: "#854d0e", display: "flex", alignItems: "center", gap: "7px" }}><Icon name="AlertTriangle" size={13} color="#854d0e" strokeWidth={1.75} /> Maximum 2 renouvellements. Durée totale ≤ 18 mois.</div>
            </>}

            {/* Augmentation salaire */}
            {form.typeAvenant === "augmentation_salaire" && <>
              <Field label="Salaire actuel" name="salaireActuel" form={form} onChange={handleChange} placeholder="ex: 1 600 € brut/mois" />
              <Field label="Nouveau salaire" name="nouveauSalaire" form={form} onChange={handleChange} placeholder="ex: 1 800 € brut/mois" />
              <Field label="Valeur de l'augmentation" name="valeurAugmentation" form={form} onChange={handleChange} placeholder="ex: 200 € ou 12,5%" />
              <Sel label="Type d'augmentation" name="typeAugmentation" form={form} onChange={handleChange} options={[{ value: "montant", label: "Montant fixe (€)" }, { value: "pourcentage", label: "Pourcentage (%)" }]} />
              <Field label="Date d'effet" name="dateEffetSalaire" form={form} onChange={handleChange} type="date" colSpan />
              <Toggle label="Primes ou variables impactés ?" name="primesImpactees" form={form} onToggle={handleToggle} />
              {form.primesImpactees && <Field label="Détail des primes" name="detailPrimes" form={form} onChange={handleChange} placeholder="Préciser" colSpan />}
            </>}

            {/* Modification durée */}
            {form.typeAvenant === "augmentation_duree" && <>
              <Field label="Rémunération actuelle" name="salaireActuel" form={form} onChange={handleChange} placeholder="ex: 950 € brut/mois" />
              <Field label="Durée actuelle" name="dureeActuelle" form={form} onChange={handleChange} placeholder="ex: 20h/semaine" />
              <Field label="Nouvelle durée" name="nouvelleduree" form={form} onChange={handleChange} placeholder="ex: 35h/semaine" />
              <Field label="Date d'effet" name="dateEffetDuree" form={form} onChange={handleChange} type="date" />
              <Toggle label="Rémunération modifiée ?" name="remunerationModifiee" form={form} onToggle={handleToggle} />
              {form.remunerationModifiee && <Field label="Nouvelle rémunération" name="nouvelleRemunerationDuree" form={form} onChange={handleChange} placeholder="ex: 1 801 € brut/mois" colSpan />}
              <Toggle label="Modification des horaires ?" name="modifHoraires" form={form} onToggle={handleToggle} />
              {form.modifHoraires && <Field label="Nouveaux horaires" name="nouveauxHoraires" form={form} onChange={handleChange} placeholder="ex: Lun–Ven 9h–17h" colSpan />}
            </>}

            {/* Changement poste */}
            {form.typeAvenant === "changement_poste" && <>
              <Field label="Ancien poste" name="ancienPoste" form={form} onChange={handleChange} placeholder="ex: Employé polyvalent" />
              <Field label="Nouveau poste" name="nouveauPoste" form={form} onChange={handleChange} placeholder="ex: Chef de rang" />
            </>}

            {/* Mutation */}
            {form.typeAvenant === "mutation" && <>
              <Field label="Ancien lieu de travail" name="ancienLieu" form={form} onChange={handleChange} placeholder="ex: Toulouse" />
              <Field label="Nouveau lieu de travail" name="nouveauLieu" form={form} onChange={handleChange} placeholder="ex: Bordeaux" />
            </>}

            {/* Clauses */}
            {form.typeAvenant === "clauses" && <>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Action</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "13px" }}>
                  {[{ v: "ajout", icon: "Plus", t: "Ajout" }, { v: "suppression", icon: "Minus", t: "Suppression" }].map(({ v, icon, t }) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, actionClauses: v }))} style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${form.actionClauses === v ? NAVY : "#e2e8f0"}`, background: form.actionClauses === v ? "#eff6ff" : "#fafafa", color: form.actionClauses === v ? NAVY : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Icon name={icon} size={13} strokeWidth={2} />{t}</button>
                  ))}
                </div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Clauses concernées</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "13px" }}>
                  {CLAUSES_LIST.map(c => {
                    const on = form.clausesSelectionnees.includes(c.label);
                    return (
                      <button key={c.id} onClick={() => toggleList("clausesSelectionnees", c.label)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", border: `1.5px solid ${on ? NAVY : "#e2e8f0"}`, background: on ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon name={c.icon} size={14} strokeWidth={1.75} color={on ? NAVY : "#94a3b8"} />
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: on ? NAVY : "#374151" }}>{c.label}</span>
                        {on && <Icon name="Check" size={13} strokeWidth={2.5} color={NAVY} style={{ marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Précisions / détails" name="detailClauses" form={form} onChange={handleChange} placeholder="ex: zone géographique, contrepartie non-concurrence…" colSpan />
            </>}

            {/* Période d'essai */}
            {form.typeAvenant === "periode_essai" && <>
              <Field label="Durée d'essai actuelle" name="dureeEssaiActuelle" form={form} onChange={handleChange} placeholder="ex: 2 mois" />
              <Field label="Nouvelle durée d'essai" name="dureeEssaiNouvelle" form={form} onChange={handleChange} placeholder="ex: 3 mois" />
              <Field label="Motif de la prolongation" name="motifProlongation" form={form} onChange={handleChange} placeholder="ex: absence du salarié" colSpan />
              <div style={{ gridColumn: "1/-1", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "9px", padding: "10px 14px", fontSize: "12px", color: "#854d0e", display: "flex", alignItems: "center", gap: "7px" }}>
                <Icon name="AlertTriangle" size={13} color="#854d0e" strokeWidth={1.75} /> La prolongation ne peut dépasser la durée maximale légale. Accord du salarié requis.
              </div>
            </>}

            {/* Avantages en nature */}
            {form.typeAvenant === "avantages_nature" && <>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Action</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "13px" }}>
                  {[{ v: "ajout", icon: "Plus", t: "Ajout" }, { v: "retrait", icon: "Minus", t: "Retrait" }, { v: "modification", icon: "Pencil", t: "Modification" }].map(({ v, icon, t }) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, actionAvantages: v }))} style={{ flex: 1, padding: "9px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${form.actionAvantages === v ? NAVY : "#e2e8f0"}`, background: form.actionAvantages === v ? "#eff6ff" : "#fafafa", color: form.actionAvantages === v ? NAVY : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Icon name={icon} size={13} strokeWidth={2} />{t}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "13px" }}>
                  {AVANTAGES_LIST.map(a => {
                    const on = form.avantagesSelectionnees.includes(a.label);
                    return (
                      <button key={a.id} onClick={() => toggleList("avantagesSelectionnees", a.label)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", border: `1.5px solid ${on ? NAVY : "#e2e8f0"}`, background: on ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon name={a.icon} size={14} strokeWidth={1.75} color={on ? NAVY : "#94a3b8"} />
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: on ? NAVY : "#374151" }}>{a.label}</span>
                        {on && <Icon name="Check" size={13} strokeWidth={2.5} color={NAVY} style={{ marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Évaluation / détails (barème URSSAF)" name="detailAvantages" form={form} onChange={handleChange} placeholder="ex: véhicule 10% salaire brut…" colSpan />
            </>}

            {/* Forfait jours */}
            {form.typeAvenant === "forfait_jours" && <>
              <Field label="Nombre de jours / an" name="nbJoursForfait" form={form} onChange={handleChange} placeholder="ex: 218" />
              <Field label="Salaire annuel forfait (€)" name="salaireForait" form={form} onChange={handleChange} placeholder="ex: 35 000 €" />
              <Field label="Conditions particulières" name="conditionsForfait" form={form} onChange={handleChange} placeholder="ex: autonomie, décompte en jours…" colSpan />
              <div style={{ gridColumn: "1/-1", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "9px", padding: "10px 14px", fontSize: "12px", color: "#854d0e", display: "flex", alignItems: "center", gap: "7px" }}>
                <Icon name="AlertTriangle" size={13} color="#854d0e" strokeWidth={1.75} /> Forfait jours : cadres autonomes uniquement. CCN requise. Accord du salarié obligatoire.
              </div>
            </>}

            {/* Common footer fields for all types */}
            <div style={{ height: "1px", background: "#e2e8f0", gridColumn: "1/-1", margin: "6px 0" }} />
            <Field label="Date d'effet de l'avenant" name="dateEffetAvenant" form={form} onChange={handleChange} type="date" />
            <Field label="Lieu de signature" name="lieuSignature" form={form} onChange={handleChange} placeholder="ex: Toulouse" />
            <Field label="Date de signature" name="dateSignature" form={form} onChange={handleChange} type="date" colSpan />
          </div>

          <button onClick={generate} disabled={loading} style={{ marginTop: "18px", width: "100%", padding: "14px", background: loading ? "#e2e8f0" : ACCENT, border: "none", borderRadius: "10px", color: loading ? "#94a3b8" : DARK, fontSize: "14px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", transition: "all 0.2s" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>{loading ? <><Icon name="Loader2" size={15} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Génération en cours…</> : <><Icon name="Wand2" size={15} strokeWidth={1.75} /> Générer l'avenant</>}</span>
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes avn-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button onClick={prev} disabled={step === 0} style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "8px", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.3 : 1 }}>← Retour</button>
        {step < 2 && <button onClick={next} style={{ padding: "10px 22px", background: NAVY, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Suivant →</button>}
      </div>
    </div>
  );
}
