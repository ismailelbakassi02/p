// 3-step wizard for generating an amendment (avenant) to an existing contract
import { useState } from "react";
import {
  NAVY, AVENANT_TYPES, CLAUSES_LIST, AVANTAGES_LIST, initAvenant,
} from "../constants.js";
import { generateAvenant } from "../templates.js";
import { Field, Sel, Toggle, STitle } from "./UI.jsx";
import DocDisplay from "./DocDisplay.jsx";

export default function AvenantFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initAvenant);
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleToggle = (name, val) => setForm(f => ({ ...f, [name]: val }));
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
      {/* ── Step 0: Avenant type ── */}
      {step === 0 && (
        <div>
          <STitle num="01">Type d'avenant</STitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {AVENANT_TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({ ...f, typeAvenant: t.value }))} style={{ textAlign: "left", padding: "13px 16px", borderRadius: "10px", cursor: "pointer", border: `1.5px solid ${form.typeAvenant === t.value ? NAVY : "#e2e8f0"}`, background: form.typeAvenant === t.value ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }}>
                <span style={{ fontSize: "20px" }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: form.typeAvenant === t.value ? NAVY : "#374151" }}>{t.label}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.desc}</div>
                </div>
                {form.typeAvenant === t.value && <span style={{ marginLeft: "auto", color: NAVY, fontWeight: 800, fontSize: "16px" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: Company & employee info ── */}
      {step === 1 && (
        <div>
          <STitle num="02">Société & Salarié</STitle>
          <p style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Société</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Raison sociale" name="raisonSociale" form={form} onChange={handleChange} placeholder="ex: SARL RANIA" colSpan />
            <Field label="Adresse" name="adresseSociete" form={form} onChange={handleChange} placeholder="Adresse complète" colSpan />
            <Field label="SIRET" name="siret" form={form} onChange={handleChange} placeholder="14 chiffres" />
            <Field label="Représentant" name="representant" form={form} onChange={handleChange} placeholder="ex: M. Dupont, Gérant" />
          </div>
          <div style={{ height: "1px", background: "#e2e8f0", margin: "14px 0" }} />
          <p style={{ fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Salarié</p>
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
              <div style={{ gridColumn: "1/-1", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "9px", padding: "10px 14px", fontSize: "12px", color: "#854d0e" }}>⚠️ Maximum 2 renouvellements. Durée totale ≤ 18 mois.</div>
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
                  {[{ v: "ajout", t: "✓ Ajout" }, { v: "suppression", t: "✕ Suppression" }].map(({ v, t }) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, actionClauses: v }))} style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${form.actionClauses === v ? NAVY : "#e2e8f0"}`, background: form.actionClauses === v ? "#eff6ff" : "#fafafa", color: form.actionClauses === v ? NAVY : "#64748b" }}>{t}</button>
                  ))}
                </div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Clauses concernées</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "13px" }}>
                  {CLAUSES_LIST.map(c => {
                    const on = form.clausesSelectionnees.includes(c.label);
                    return (
                      <button key={c.id} onClick={() => toggleList("clausesSelectionnees", c.label)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", border: `1.5px solid ${on ? NAVY : "#e2e8f0"}`, background: on ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{c.icon}</span>
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: on ? NAVY : "#374151" }}>{c.label}</span>
                        {on && <span style={{ marginLeft: "auto", color: NAVY, fontWeight: 800 }}>✓</span>}
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
              <div style={{ gridColumn: "1/-1", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "9px", padding: "10px 14px", fontSize: "12px", color: "#854d0e" }}>
                ⚠️ La prolongation ne peut dépasser la durée maximale légale. Accord du salarié requis.
              </div>
            </>}

            {/* Avantages en nature */}
            {form.typeAvenant === "avantages_nature" && <>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "5px" }}>Action</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "13px" }}>
                  {[{ v: "ajout", t: "✓ Ajout" }, { v: "retrait", t: "✕ Retrait" }, { v: "modification", t: "✏️ Modification" }].map(({ v, t }) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, actionAvantages: v }))} style={{ flex: 1, padding: "9px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${form.actionAvantages === v ? NAVY : "#e2e8f0"}`, background: form.actionAvantages === v ? "#eff6ff" : "#fafafa", color: form.actionAvantages === v ? NAVY : "#64748b" }}>{t}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "13px" }}>
                  {AVANTAGES_LIST.map(a => {
                    const on = form.avantagesSelectionnees.includes(a.label);
                    return (
                      <button key={a.id} onClick={() => toggleList("avantagesSelectionnees", a.label)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", border: `1.5px solid ${on ? NAVY : "#e2e8f0"}`, background: on ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{a.icon}</span>
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: on ? NAVY : "#374151" }}>{a.label}</span>
                        {on && <span style={{ marginLeft: "auto", color: NAVY, fontWeight: 800 }}>✓</span>}
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
              <div style={{ gridColumn: "1/-1", background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "9px", padding: "10px 14px", fontSize: "12px", color: "#854d0e" }}>
                ⚠️ Forfait jours : cadres autonomes uniquement. CCN requise. Accord du salarié obligatoire.
              </div>
            </>}

            {/* Common footer fields for all types */}
            <div style={{ height: "1px", background: "#e2e8f0", gridColumn: "1/-1", margin: "6px 0" }} />
            <Field label="Date d'effet de l'avenant" name="dateEffetAvenant" form={form} onChange={handleChange} type="date" />
            <Field label="Lieu de signature" name="lieuSignature" form={form} onChange={handleChange} placeholder="ex: Toulouse" />
            <Field label="Date de signature" name="dateSignature" form={form} onChange={handleChange} type="date" colSpan />
          </div>

          <button onClick={generate} disabled={loading} style={{ marginTop: "18px", width: "100%", padding: "14px", background: loading ? "#e2e8f0" : NAVY, border: "none", borderRadius: "10px", color: loading ? "#94a3b8" : "#fff", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "⏳ Génération en cours…" : "✦ Générer l'avenant"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button onClick={prev} disabled={step === 0} style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "8px", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.3 : 1 }}>← Retour</button>
        {step < 2 && <button onClick={next} style={{ padding: "10px 22px", background: NAVY, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Suivant →</button>}
      </div>
    </div>
  );
}
