import { NAVY, SMIC_HORAIRE, CCN_DATA, CCN_COMPLIANCE } from "../constants.js";
import Icon from "./Icon.jsx";

function calcSalaireMin(form) {
  const hMens = parseFloat(form.heuresMensuelles) || 151.67;
  const smicMensuel = Math.round(SMIC_HORAIRE * hMens * 100) / 100;
  const ccnData = CCN_DATA.find(c =>
    c.label === form.convention ||
    (form.convention && form.convention.includes("IDCC " + c.idcc))
  );
  const niveauData = ccnData?.niveaux.find(n => n.label === form.niveau);
  const minConvHoraire = niveauData?.tauxHoraire || 0;
  const minConvMensuel = minConvHoraire > 0 ? Math.round(minConvHoraire * hMens * 100) / 100 : 0;
  const minApply = Math.max(smicMensuel, minConvMensuel);
  return { smicMensuel, minConvMensuel, minApply, minConvHoraire, ccnData, niveauData };
}

export function useCompliance(form) {
  const checks = [];
  const { smicMensuel, minConvMensuel, minApply, minConvHoraire, ccnData } = calcSalaireMin(form);
  const taux = parseFloat(form.tauxHoraire);
  const isCadre = ["cadre","directeur","manager","responsable"].some(k =>
    (form.niveau || "").toLowerCase().includes(k) ||
    (form.fonction || "").toLowerCase().includes(k)
  );
  const ccnCompliance = CCN_COMPLIANCE[ccnData?.idcc || ""] || null;
  // Mutuelle is always included in Article 5 (obligatoire Loi ANI 2016)
  const hasMutuelle = true;
  const needsMutuelle = ccnCompliance?.mutuelle ?? true;
  const needsPrevoyance = isCadre && (ccnCompliance?.prevoyanceCadre ?? true);

  const entrepriseOk = !!(form.nomEntreprise && form.siret);
  checks.push({
    id: "entreprise", label: "Entreprise active", ok: entrepriseOk,
    msg: entrepriseOk ? `${form.formeJuridique} ${form.nomEntreprise} · ${form.siret}` : "Nom et SIRET requis",
    blocker: false,
  });

  const ccnOk = !!form.convention;
  checks.push({
    id: "ccn", label: "Convention collective", ok: ccnOk,
    msg: ccnOk ? form.convention.split("(")[0].trim() : "Aucune CCN sélectionnée",
    blocker: false,
  });

  const niveauOk = !!form.niveau;
  checks.push({
    id: "niveau", label: "Niveau / Classification", ok: niveauOk,
    msg: niveauOk ? `${form.niveau}${form.coefficient ? " (coeff " + form.coefficient + ")" : ""}` : "Niveau non renseigné",
    blocker: false,
  });

  const sousSmicHoraire = !isNaN(taux) && taux > 0 && taux < SMIC_HORAIRE;
  const sousConvHoraire = !isNaN(taux) && taux > 0 && minConvHoraire > 0 && taux < minConvHoraire;
  const salaireOk = !isNaN(taux) && taux >= Math.max(SMIC_HORAIRE, minConvHoraire || 0);
  let salaireMsg = "Taux horaire non renseigné";
  if (form.tauxHoraire) {
    if (sousSmicHoraire) salaireMsg = `${taux.toFixed(2)}€/h < SMIC (${SMIC_HORAIRE}€/h) — ILLÉGAL`;
    else if (sousConvHoraire) salaireMsg = `${taux.toFixed(2)}€/h < min. CCN (${minConvHoraire.toFixed(2)}€/h)`;
    else salaireMsg = `✓ ${taux.toFixed(2)}€/h · min. retenu : ${Math.max(SMIC_HORAIRE, minConvHoraire || 0).toFixed(2)}€/h`;
  }
  checks.push({
    id: "salaire", label: "Conformité salaire", ok: salaireOk,
    msg: salaireMsg,
    detail: form.tauxHoraire && !sousSmicHoraire && !sousConvHoraire
      ? `SMIC : ${smicMensuel.toFixed(2)}€/mois${minConvMensuel > 0 ? " · CCN : " + minConvMensuel.toFixed(2) + "€/mois" : ""} · Appliqué : ${minApply.toFixed(2)}€/mois`
      : null,
    blocker: sousSmicHoraire,
  });

  checks.push({
    id: "mutuelle", label: "Mutuelle collective", ok: true,
    msg: !ccnOk ? "CCN requise"
       : "Incluse dans Article 5 — obligatoire (Loi ANI 2016)",
    blocker: false,
    autofix: false,
  });

  checks.push({
    id: "prevoyance", label: "Prévoyance cadre", ok: !needsPrevoyance || hasMutuelle,
    msg: !isCadre ? "Non applicable (non-cadre)"
       : `Incluse dans Article 5${ccnCompliance?.prevoyanceMinima ? " · " + ccnCompliance.prevoyanceMinima : ""}`
       ,
    blocker: false,
    autofix: false,
  });

  const blockers = checks.filter(c => c.blocker);
  const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);

  return { checks, blockers, score, canGenerate: blockers.length === 0, needsMutuelle, hasMutuelle };
}

export default function CompliancePanel({ form, onAutoFix }) {
  const { checks, score, canGenerate } = useCompliance(form);
  const color  = score === 100 ? "#166534" : score >= 60 ? "#d97706" : "#dc2626";
  const bg     = score === 100 ? "#f0fdf4" : score >= 60 ? "#fffbeb" : "#fff1f2";
  const border = score === 100 ? "#86efac" : score >= 60 ? "#fde68a" : "#fca5a5";

  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: "14px", padding: "16px 18px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <div style={{ position: "relative", width: "50px", height: "50px", flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "50px", height: "50px" }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3.5"
              strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color }}>{score}%</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "13.5px" }}>
            {score === 100 ? "Dossier conforme" : canGenerate ? "Vérifications recommandées" : "Blocage — contrat non générable"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
            {checks.filter(c => c.ok).length}/{checks.length} contrôles validés
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {checks.map(c => (
          <div key={c.id} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.75)", borderRadius: "8px", border: `1px solid ${c.ok ? "#e2e8f0" : c.blocker ? "#fca5a5" : "#fde68a"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ flexShrink: 0, display: "flex" }}>
                <Icon name={c.ok ? "CheckCircle" : c.blocker ? "XCircle" : "AlertTriangle"} size={14} strokeWidth={1.75} color={c.ok ? "#16a34a" : c.blocker ? "#b91c1c" : "#d97706"} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
                <div style={{ fontSize: "11.5px", color: c.ok ? "#374151" : c.blocker ? "#b91c1c" : "#92400e", fontWeight: c.ok ? 400 : 600, marginTop: "1px" }}>{c.msg}</div>
                {c.detail && <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>{c.detail}</div>}
              </div>
              {c.autofix && onAutoFix && (
                <button onClick={() => onAutoFix(c.id)} style={{ background: "#d97706", color: "#fff", border: "none", padding: "3px 9px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  + Ajouter
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {form.tauxHoraire && (
        <div style={{ marginTop: "10px", padding: "8px 10px", background: "rgba(255,255,255,0.6)", borderRadius: "8px", fontSize: "10.5px", color: "#374151", borderLeft: "3px solid " + color }}>
          <strong style={{ color }}>Règle appliquée :</strong> Salaire le plus favorable entre SMIC et minimum conventionnel (Art. L.2241-1)
        </div>
      )}
    </div>
  );
}
