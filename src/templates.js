// Template functions — generate contract/avenant text from form data
// No AI required. Output uses the same markdown-like format as renderContract().

// Format YYYY-MM-DD → DD/MM/YYYY for display in the document
function fmt(dateStr) {
  if (!dateStr) return "___________";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// Today's date in DD/MM/YYYY format — used as default when signature date is blank
function today() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${now.getFullYear()}`;
}

const BLANK = "___________";
const v = (val) => val || BLANK; // show blank placeholder if field is empty

// ─── Gender helpers ───────────────────────────────────────────────────────────
// genre: "M" | "F" | "" (unknown → neutral double form)
function g(genre) {
  const M = genre === "M", F = genre === "F";
  return {
    civ:       M ? "M."              : F ? "Mme"               : "M./Mme",
    civFull:   M ? "Monsieur"        : F ? "Madame"             : "Monsieur / Madame",
    ne:        M ? "Né"              : F ? "Née"                : "Né(e)",
    embauche:  M ? "Embauché"        : F ? "Embauchée"          : "Embauché(e)",
    engage:    M ? "engagé"          : F ? "engagée"            : "engagé(e)",
    affilie:   M ? "affilié"         : F ? "affiliée"           : "affilié(e)",
    amene:     M ? "amené"           : F ? "amenée"             : "amené(e)",
    tenu:      M ? "tenu"            : F ? "tenue"              : "tenu(e)",
    il:        M ? "Il"              : F ? "Elle"                : "Il/Elle",
    le_art:    M ? "le"              : F ? "la"                  : "le/la",
    Le_art:    M ? "Le"              : F ? "La"                  : "Le/La",
    sal:       M ? "salarié"         : F ? "salariée"            : "salarié(e)",
    Sal:       M ? "Salarié"         : F ? "Salariée"            : "Salarié(e)",
    du_sal:    M ? "du salarié"      : F ? "de la salariée"      : "du/de la salarié(e)",
  };
}

// ─── Job title → statut ───────────────────────────────────────────────────────
function getStatut(niveau, genre) {
  const n = (niveau || "").toLowerCase();
  if (/cadre/.test(n)) return "Cadre";
  if (/agent de ma[iî]trise|\bam\b/.test(n)) return "Agent de maîtrise";
  if (niveau) return genre === "M" ? "Employé" : genre === "F" ? "Employée" : "Employé(e)";
  return "";
}

// ─── Auto-generate job missions ───────────────────────────────────────────────
function getJobMissions(fonction) {
  const f = (fonction || "").toLowerCase();
  if (/serv(eur|euse|ice)/.test(f)) return [
    "L'accueil et le placement des clients ;",
    "La prise de commandes et le conseil à la clientèle ;",
    "Le service en salle et le suivi des tables ;",
    "La présentation et le service des boissons et des plats ;",
    "La mise en place et le dressage des tables avant le service ;",
    "Le débarrassage et le nettoyage de la salle après le service ;",
    "L'encaissement et la gestion des additions ;",
    "Le respect des règles d'hygiène et de sécurité alimentaire en vigueur.",
  ];
  if (/cuisini(er|[eè]re)|chef de partie|plongeur|commis/.test(f)) return [
    "La préparation et la réalisation des plats selon les fiches techniques ;",
    "La gestion des stocks et des approvisionnements de sa partie ;",
    "Le respect des normes d'hygiène HACCP et de sécurité alimentaire ;",
    "L'entretien et la propreté de son poste de travail ;",
    "Le contrôle de la qualité et de la présentation des plats ;",
    "La participation à la mise en place avant le service.",
  ];
  if (/caissier|caissière|caissiere/.test(f)) return [
    "L'accueil et l'orientation des clients ;",
    "L'enregistrement des achats et l'encaissement ;",
    "La gestion de la caisse (ouverture, clôture, rapprochement) ;",
    "Le respect des procédures de contrôle interne ;",
    "La participation à la mise en rayon selon les besoins ;",
    "Le maintien de la propreté de son espace de travail.",
  ];
  if (/vendeur|vendeuse|commercial/.test(f)) return [
    "L'accueil et le conseil aux clients ;",
    "La présentation et la mise en valeur des produits ;",
    "La réalisation des ventes et l'atteinte des objectifs ;",
    "La gestion des encaissements ;",
    "La participation aux opérations de réassort et d'inventaire ;",
    "Le maintien de la propreté et de l'organisation de l'espace de vente.",
  ];
  if (/réceptionniste|receptionniste|accueil/.test(f)) return [
    "L'accueil physique et téléphonique des clients et visiteurs ;",
    "La gestion des réservations et du planning d'occupation ;",
    "Les opérations d'arrivée et de départ (check-in / check-out) ;",
    "L'encaissement et la facturation ;",
    "La transmission des informations aux autres services ;",
    "Le respect des standards de qualité de l'établissement.",
  ];
  if (/aide.soignant|auxiliaire de vie|\bavs\b/.test(f)) return [
    "L'aide aux personnes dans les actes essentiels de la vie quotidienne ;",
    "Les soins d'hygiène et de confort selon les prescriptions ;",
    "La surveillance de l'état général des personnes accompagnées ;",
    "La participation à l'animation et à la vie sociale ;",
    "La transmission des informations à l'équipe soignante ;",
    "Le respect des protocoles d'hygiène et de sécurité.",
  ];
  if (/nettoyage|agent de propr/.test(f)) return [
    "Le nettoyage et l'entretien des locaux conformément aux consignes ;",
    "L'utilisation des équipements et produits d'entretien ;",
    "Le respect des protocoles d'hygiène et de sécurité ;",
    "La gestion des déchets selon les consignes de tri sélectif ;",
    "Le signalement de toute anomalie ou dégradation constatée.",
  ];
  return [
    "L'exécution de toutes les tâches relevant de sa catégorie professionnelle ;",
    "La participation active aux activités courantes de l'entreprise ;",
    "Le respect des procédures internes et des consignes de sécurité ;",
    "La contribution au bon fonctionnement de l'établissement ;",
    "Toute autre mission relevant de sa qualification et de ses compétences.",
  ];
}

// ─── Format number with French comma decimal ──────────────────────────────────
function fmtNum(val) {
  if (!val) return BLANK;
  const n = parseFloat(val);
  return isNaN(n) ? String(val) : n.toFixed(2).replace(".", ",");
}

// ─── Full employment contract (CDD or CDI) ────────────────────────────────────
export function generateContract(form, subTypeLabel, clauseLabels, avantageLabels) {
  const isCDD = form.typeContrat === "CDD";
  const G = g(form.genre);
  const fullName = `${v(form.nom)} ${v(form.prenom)}`.trim();

  const title = isCDD ? "CONTRAT À DURÉE DÉTERMINÉE" : "CONTRAT À DURÉE INDÉTERMINÉE";
  const tempsLabel = Number(form.heuresParSemaine) < 35 ? "À TEMPS PARTIEL" : "À TEMPS PLEIN";

  // Classification line for Article 2
  const classificationLine = form.niveau
    ? `${form.niveau} – Coefficient : ${form.coefficient || BLANK}`
    : (form.coefficient ? `Coefficient : ${form.coefficient}` : BLANK);

  // Statut derived from niveau
  const statut = getStatut(form.niveau, form.genre);
  const statutStr = statut ? `, statut ${statut}` : "";

  // Job missions
  const missions = getJobMissions(form.fonction);

  // Salary formatting (French style)
  const tauxFmt = fmtNum(form.tauxHoraire);
  const salBrutFmt = fmtNum(form.salaireBrut);
  const heuresMFmt = form.heuresMensuelles || BLANK;

  // Rupture clause — CDI only, activated by selecting "Clause de rupture" in step 4
  const hasRuptureClause = !isCDD && clauseLabels.some(c => c.toLowerCase().includes("rupture"));
  // Filter out rupture from article generation (handled inline in Article 1)
  const filteredClauseLabels = clauseLabels.filter(c => !c.toLowerCase().includes("rupture"));

  // Article numbering:
  // CDI: no standalone Rupture article → Obligations = Art 8, optional clauses start at Art 9
  // CDD: Rupture = Art 8 → Obligations = Art 9, optional clauses start at Art 10
  const obligationsArt = isCDD ? 9 : 8;
  const firstOptionalArt = isCDD ? 10 : 9;

  let doc = `# ${title}
# ${tempsLabel}

Entre les soussignés :

**L'entreprise ${v(form.formeJuridique)} ${v(form.nomEntreprise)}**
SIRET : ${v(form.siret)} — Code APE : ${v(form.codeAPE)}
Dont le siège social est situé à : ${v(form.adresseSiege)}
Dont les cotisations de sécurité sociale sont versées à l'URSSAF de ${v(form.villeUrssaf)}
Représentée par : ${v(form.representant)}
Ci-après dénommée « l'Employeur »,

D'une part,

Et,

**${G.civFull} ${fullName}**
Demeurant au : ${v(form.adresseSalarie)}
De nationalité : ${v(form.nationalite)} — ${G.ne} le : ${fmt(form.dateNaissance)} à ${v(form.lieuNaissance)}
Numéro de sécurité sociale : ${v(form.numSecu)}${form.titreSejour ? `\nTitre de séjour n° : ${form.titreSejour}` : ""}
Ci-après dénommé(e) « le/la Salarié(e) »,

D'autre part,

Il a été convenu et arrêté ce qui suit :

## Article 1 – ENGAGEMENT

`;

  if (isCDD) {
    const motif = form.motifCDD ? form.motifCDD : subTypeLabel || "accroissement temporaire d'activité";
    doc += `Le présent contrat est conclu pour une durée déterminée en raison de : **${motif}**.

Le contrat prend effet à compter du **${fmt(form.dateDebut)}** jusqu'au **${fmt(form.dateFin)}**. La déclaration nominative préalable à l'embauche a été effectuée auprès de l'URSSAF de ${v(form.villeUrssaf)}.

Le présent contrat est soumis à une période d'essai d'une durée de **${v(form.periodEssai)} jours**.

Conformément à la réglementation en vigueur relative à la protection des données personnelles (RGPD), ${G.civFull} ${fullName} dispose d'un droit d'accès et de rectification aux informations le/la concernant détenues par l'entreprise.`;
  } else {
    doc += `La société ${v(form.formeJuridique)} ${v(form.nomEntreprise)} engage ${G.civFull} ${fullName} dans le cadre d'un contrat de travail à durée indéterminée (CDI), régi par les dispositions du Code du travail et de la convention collective applicable à l'entreprise.

Le présent contrat prendra effet à compter du **${fmt(form.dateDebut)}**.

Le présent contrat est soumis à une période d'essai d'une durée de **${v(form.periodEssai)} jours**, durant laquelle chacune des parties pourra y mettre fin en respectant le délai de prévenance légal en vigueur.`;

    if (hasRuptureClause) {
      doc += `

Il pourra être mis fin au présent contrat à tout moment par l'une ou l'autre des parties, sous réserve du respect des conditions de fond et de forme prévues par le Code du travail et la convention collective applicable, et moyennant l'observation d'un préavis réciproque, sauf cas de faute grave, faute lourde ou force majeure. La rupture du contrat sera notifiée par lettre recommandée avec accusé de réception.`;
    }

    doc += `

Conformément à la réglementation en vigueur relative à la protection des données personnelles (RGPD), ${G.civFull} ${fullName} dispose d'un droit d'accès et de rectification aux informations le/la concernant détenues par l'entreprise.`;
  }

  doc += `

## Article 2 – FONCTIONS, HORAIRES ET ATTRIBUTIONS

${G.civFull} ${fullName} est ${G.engage} en qualité de **${v(form.fonction)}**${statutStr}, conformément à la classification conventionnelle suivante : **${classificationLine}**.

${G.il} bénéficiera de l'ensemble des dispositions de la convention collective nationale applicable au sein de l'entreprise, ainsi que du statut collectif en vigueur pour le personnel relevant de sa catégorie.

La durée du travail est fixée à **${v(form.heuresParSemaine)} heures** par semaine, réparties **${v(form.repartitionJours)}**, selon les horaires définis par la Direction et susceptibles d'être modifiés en fonction des nécessités du service, après information préalable ${G.du_sal}.

Dans le cadre de ses fonctions, ${G.le_art} ${G.sal} aura notamment pour missions principales :
${missions.map(m => `• ${m}`).join("\n")}

Cette liste n'est pas exhaustive. ${G.Le_art} ${G.Sal} pourra être ${G.amene} à effectuer toute autre tâche connexe ou complémentaire à sa fonction, à la demande de l'employeur et selon les besoins de l'entreprise, dès lors que celles-ci sont compatibles avec ses compétences et sa qualification professionnelle.

${G.Le_art} ${G.Sal} s'engage, pendant toute la durée du présent contrat, à n'exercer aucune activité professionnelle, salariée ou non salariée, susceptible de porter atteinte aux intérêts de la société ${v(form.formeJuridique)} ${v(form.nomEntreprise)} ou de lui faire concurrence, directe ou indirecte.

## Article 3 – RÉMUNÉRATION

En contrepartie de l'exécution de ses fonctions, ${G.civFull} ${fullName} percevra une rémunération mensuelle brute de **${salBrutFmt} euros**, correspondant à un horaire mensuel de **${heuresMFmt} heures** sur la base d'un taux horaire brut de **${tauxFmt} euros**.

${G.Le_art} ${G.Sal} pourra être ${G.amene} à effectuer des heures supplémentaires à la demande de l'employeur, lesquelles seront rémunérées ou compensées conformément aux dispositions légales et aux stipulations de la convention collective applicable en vigueur.

Cette rémunération sera versée mensuellement à terme échu, et comprendra les avantages et indemnités auxquels ${G.le_art} ${G.sal} peut prétendre en application de la convention collective applicable.

## Article 4 – ABSENCES

En cas d'absence, ${G.le_art} ${G.sal} est ${G.tenu} d'en informer l'employeur dans les plus brefs délais et de fournir les justificatifs nécessaires dans les délais légaux en vigueur.

Toute absence non justifiée dans ces délais pourra être considérée comme une absence injustifiée et pourra entraîner les conséquences prévues par le Code du travail.

## Article 5 – RETRAITE ET PRÉVOYANCE

${G.Le_art} ${G.Sal} sera ${G.affilie} et cotisera aux régimes de retraite complémentaire et de prévoyance applicables à l'entreprise, conformément aux obligations légales et aux dispositions de la convention collective applicable en vigueur.

${G.Le_art} ${G.Sal} bénéficiera à ce titre de l'ensemble des garanties prévues par lesdits régimes, notamment en matière de remboursement de frais de santé (mutuelle d'entreprise obligatoire), d'incapacité, d'invalidité et de décès.

## Article 6 – CONVENTION COLLECTIVE

Le présent contrat est régi par les dispositions de la convention ${v(form.convention)}. ${G.Le_art} ${G.Sal} peut consulter cette convention au sein de l'entreprise.

## Article 7 – CONGÉS PAYÉS ET AVANTAGES SOCIAUX

${G.Le_art} ${G.Sal} bénéficiera des congés payés légaux dans les conditions prévues par le Code du travail, soit 2,5 jours ouvrables par mois de travail effectif, représentant 30 jours ouvrables par an.

Les dates de prise de congés seront fixées en accord avec l'employeur, conformément aux dispositions légales et aux stipulations de la convention collective applicable en vigueur.

${G.Le_art} ${G.Sal} bénéficiera également de l'ensemble des avantages sociaux accordés aux salariés de sa catégorie au sein de l'entreprise, dans les conditions prévues par la convention collective applicable.

`;

  if (isCDD) {
    doc += `## Article 8 – RUPTURE DU CONTRAT

Le contrat prendra fin automatiquement à la date indiquée à l'Article 1. Il pourra être mis fin au présent contrat pendant la période d'essai par l'une des parties, hormis faute grave ou force majeure, avec respect d'un préavis réciproque dans les conditions de la législation du travail et de la convention collective applicable.

`;
  }

  doc += `## Article ${obligationsArt} – OBLIGATIONS PROFESSIONNELLES

${G.Le_art} ${G.sal} s'engage à consacrer professionnellement tous ses soins à l'entreprise, à se conformer aux règles régissant le fonctionnement interne de celle-ci, à observer les instructions et consignes particulières de travail qui lui seront données, et à observer une discrétion absolue sur tout ce qui concerne l'activité de l'entreprise.

Pour toutes questions non visées aux présentes, les parties déclarent se référer aux dispositions conventionnelles, légales et réglementaires actuelles et à venir.`;

  // Optional clauses ("rupture" already handled in Article 1 — excluded here)
  if (filteredClauseLabels.length > 0) {
    let art = firstOptionalArt;
    for (const clause of filteredClauseLabels) {
      doc += `\n\n## Article ${art} – ${clause.toUpperCase()}\n\n${G.Le_art} ${G.Sal} s'engage à respecter les obligations liées à la clause de ${clause.toLowerCase()} pendant toute la durée du contrat et après sa rupture, dans les conditions définies par la législation en vigueur et la convention collective applicable.`;
      art++;
    }
  }

  // Optional benefits
  if (avantageLabels.length > 0) {
    const benefitArt = firstOptionalArt + filteredClauseLabels.length;
    doc += `\n\n## Article ${benefitArt} – AVANTAGES EN NATURE\n\n${G.Le_art} ${G.Sal} bénéficiera des avantages en nature suivants : **${avantageLabels.join(", ")}**. Ces avantages sont évalués conformément au barème URSSAF en vigueur et soumis aux cotisations sociales correspondantes.`;
  }

  doc += `

---

Fait à ${v(form.lieuSignature)}, le ${form.dateSignature ? fmt(form.dateSignature) : today()} — En deux exemplaires originaux dont un pour chacune des parties.

L'Employeur${" ".repeat(40)}Le/La Salarié(e)
(Lu et approuvé)${" ".repeat(33)}(Lu et approuvé)
${v(form.representant)}`;

  return doc;
}

// ─── Avenant templates ────────────────────────────────────────────────────────
export function generateAvenant(form, avenantTypeLabel) {
  const fullName = `${v(form.prenom)} ${v(form.nom)}`.trim();
  const G = g(form.genre);

  const header = `# AVENANT AU CONTRAT DE TRAVAIL
# ${avenantTypeLabel.toUpperCase()}

Entre les soussignés :

**${v(form.raisonSociale)}**
SIRET : ${v(form.siret)}
Adresse : ${v(form.adresseSociete)}
Représentée par : ${v(form.representant)}

D'une part,

Et,

**${fullName}**
Poste : ${v(form.poste)} – Contrat : ${v(form.typeContrat)} – ${G.embauche} le ${fmt(form.dateEmbauche)}

D'autre part,

Il a été convenu et arrêté ce qui suit :

`;

  let body = "";

  switch (form.typeAvenant) {
    case "renouvellement_cdd":
      body = `## Article 1, RENOUVELLEMENT DU CONTRAT À DURÉE DÉTERMINÉE

Par le présent avenant, les parties conviennent de renouveler le contrat à durée déterminée initialement conclu du **${fmt(form.dateDebutCDD)}** au **${fmt(form.dateFinInitiale)}** pour une durée supplémentaire de **${v(form.nbJoursRenouvellement)} jours**, soit jusqu'au **${fmt(form.nouvelleDateFin)}**.

Il s'agit du **${form.typeRenouvellement === "premier" ? "1er" : "2e et dernier"}** renouvellement. Toutes les autres dispositions du contrat initial demeurent inchangées.

*Rappel légal : un CDD ne peut être renouvelé que deux fois, dans la limite de 18 mois au total (durée initiale + renouvellements), sauf exceptions prévues par la loi.*`;
      break;

    case "augmentation_salaire":
      body = `## Article 1, MODIFICATION DE LA RÉMUNÉRATION

À compter du **${fmt(form.dateEffetSalaire)}**, le salaire brut mensuel de ${fullName} est modifié comme suit :

- Ancienne rémunération : **${v(form.salaireActuel)}**
- Nouvelle rémunération : **${v(form.nouveauSalaire)}**
- Augmentation : **${v(form.valeurAugmentation)}** (${form.typeAugmentation === "montant" ? "montant fixe" : "pourcentage"})${form.primesImpactees && form.detailPrimes ? `\n- Primes impactées : ${form.detailPrimes}` : ""}

Toutes les autres dispositions du contrat de travail demeurent inchangées.`;
      break;

    case "augmentation_duree":
      body = `## Article 1, MODIFICATION DE LA DURÉE DU TRAVAIL

À compter du **${fmt(form.dateEffetDuree)}**, la durée de travail de ${fullName} est modifiée comme suit :

- Durée actuelle : **${v(form.dureeActuelle)}**
- Nouvelle durée : **${v(form.nouvelleduree)}**${form.remunerationModifiee ? `\n- Nouvelle rémunération : **${v(form.nouvelleRemunerationDuree)}**` : ""}${form.modifHoraires ? `\n- Nouveaux horaires : ${v(form.nouveauxHoraires)}` : ""}

Toutes les autres dispositions du contrat demeurent inchangées.`;
      break;

    case "changement_poste":
      body = `## Article 1, MODIFICATION DU POSTE

À compter du **${fmt(form.dateEffetAvenant)}**, le poste occupé par ${fullName} est modifié comme suit :

- Ancien poste : **${v(form.ancienPoste)}**
- Nouveau poste : **${v(form.nouveauPoste)}**

Les conditions de rémunération et les autres dispositions du contrat demeurent inchangées, sauf accord particulier conclu séparément.`;
      break;

    case "mutation":
      body = `## Article 1, MUTATION – CHANGEMENT DE LIEU DE TRAVAIL

À compter du **${fmt(form.dateEffetAvenant)}**, le lieu habituel de travail de ${fullName} est modifié :

- Ancien lieu : **${v(form.ancienLieu)}**
- Nouveau lieu : **${v(form.nouveauLieu)}**

Toutes les autres dispositions du contrat demeurent inchangées.`;
      break;

    case "clauses":
      body = `## Article 1, ${form.actionClauses === "ajout" ? "AJOUT" : "SUPPRESSION"} DE CLAUSE(S)

Par le présent avenant, les parties conviennent de l'${form.actionClauses === "ajout" ? "ajout" : "la suppression"} des clauses suivantes : **${form.clausesSelectionnees.join(", ")}**.${form.detailClauses ? `\n\nPrécisions : ${form.detailClauses}` : ""}

Toutes les autres dispositions du contrat demeurent inchangées.`;
      break;

    case "periode_essai":
      body = `## Article 1, PROLONGATION DE LA PÉRIODE D'ESSAI

Par le présent avenant, les parties conviennent de prolonger la période d'essai de ${fullName} dans les conditions suivantes :

- Durée initiale : **${v(form.dureeEssaiActuelle)}**
- Nouvelle durée totale : **${v(form.dureeEssaiNouvelle)}**
- Motif : ${v(form.motifProlongation)}

Cette prolongation est soumise à l'accord exprès ${G.du_sal}, conformément aux dispositions légales applicables.`;
      break;

    case "avantages_nature":
      body = `## Article 1, ${form.actionAvantages === "ajout" ? "AJOUT" : form.actionAvantages === "retrait" ? "SUPPRESSION" : "MODIFICATION"} D'AVANTAGES EN NATURE

Par le présent avenant, les parties conviennent de la modification des avantages en nature suivants : **${form.avantagesSelectionnees.join(", ")}**.${form.detailAvantages ? `\n\nÉvaluation et précisions : ${form.detailAvantages}` : ""}

Ces avantages sont évalués conformément au barème URSSAF et soumis aux cotisations sociales correspondantes.`;
      break;

    case "forfait_jours":
      body = `## Article 1, PASSAGE AU FORFAIT EN JOURS

À compter du **${fmt(form.dateEffetAvenant)}**, le temps de travail de ${fullName} est organisé sous forme d'un forfait annuel en jours, dans les conditions suivantes :

- Nombre de jours par an : **${v(form.nbJoursForfait)} jours**
- Rémunération annuelle forfaitaire : **${v(form.salaireForait)}**${form.conditionsForfait ? `\n- Conditions particulières : ${form.conditionsForfait}` : ""}

Ce forfait est applicable aux cadres autonomes et doit être prévu par la convention collective. L'accord ${G.du_sal} est requis.`;
      break;

    default:
      body = `## Article 1, MODIFICATION\n\nLes parties conviennent de modifier le contrat de travail selon les termes définis dans le présent avenant.`;
  }

  const footer = `

---

*Toutes autres dispositions du contrat de travail initial et de ses avenants précédents restent inchangées.*

Fait à ${v(form.lieuSignature)}, le ${form.dateSignature ? fmt(form.dateSignature) : today()}

En deux exemplaires originaux dont un pour chacune des parties.`;

  return header + body + footer;
}
