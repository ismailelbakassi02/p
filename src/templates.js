// Template functions — generate contract/avenant text from form data
// No AI required. Output uses the same markdown-like format as renderContract().

// Format YYYY-MM-DD → DD/MM/YYYY for display in the document
function fmt(dateStr) {
  if (!dateStr) return "___________";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const BLANK = "___________";
const v = (val) => val || BLANK; // show blank placeholder if field is empty

// ─── Full employment contract (CDD or CDI) ────────────────────────────────────
export function generateContract(form, subTypeLabel, clauseLabels, avantageLabels) {
  const isCDD = form.typeContrat === "CDD";
  const civility = "M./Mme";
  const fullName = `${v(form.nom)} ${v(form.prenom)}`.trim();
  const niveauLine = form.niveau || form.coefficient
    ? `\nNiveau : ${v(form.niveau)} – Coefficient : ${v(form.coefficient)}`
    : "";

  const title = isCDD
    ? "CONTRAT À DURÉE DÉTERMINÉE"
    : "CONTRAT À DURÉE INDÉTERMINÉE";

  const tempsLabel = Number(form.heuresParSemaine) < 35 ? "À TEMPS PARTIEL" : "À TEMPS PLEIN";

  let doc = `# ${title}
# ${tempsLabel}

Entre les soussignés :

**L'entreprise ${v(form.formeJuridique)} ${v(form.nomEntreprise)}**
SIRET : ${v(form.siret)}
Code APE : ${v(form.codeAPE)}
Dont le siège social est situé à : ${v(form.adresseSiege)}
Dont les cotisations de sécurité sociale sont versées à l'Urssaf de ${v(form.villeUrssaf)}
Représentée par : ${v(form.representant)}

D'une part,

Et,

**${civility} ${fullName}**
Résidant au ${v(form.adresseSalarie)}
De nationalité ${v(form.nationalite)}
Né(e) le ${fmt(form.dateNaissance)} à ${v(form.lieuNaissance)}
Numéro de sécurité sociale : ${v(form.numSecu)}${form.titreSejour ? `\nTitre de séjour n° : ${form.titreSejour}` : ""}

D'autre part,

Il a été convenu et arrêté ce qui suit :

## Article 1, ENGAGEMENT

`;

  if (isCDD) {
    doc += `Le présent contrat est conclu pour une durée déterminée et ce à partir du **${fmt(form.dateDebut)}** jusqu'au **${fmt(form.dateFin)}**. La déclaration nominative préalable à l'embauche a été remise à l'Urssaf de ${v(form.villeUrssaf)}. Conformément à la loi du 6 janvier 1978, ${civility} **${fullName}** a un droit d'accès et de rectification aux informations portées à ce document.
Le présent contrat est soumis à une période d'essai de ${v(form.periodEssai)} jours.`;
  } else {
    doc += `Le présent contrat est conclu pour une durée indéterminée, il débutera à partir du **${fmt(form.dateDebut)}**. La déclaration préalable d'embauche sera faite auprès de l'URSSAF. ${civility} **${fullName}** a un droit d'accès et de rectification aux informations portées à ce document.
Le présent contrat est soumis à une période d'essai de ${v(form.periodEssai)} jours.`;
  }

  doc += `

## Article 2, FONCTIONS-HORAIRES

${civility} **${fullName}** exercera la fonction de **${v(form.fonction)}**.${niveauLine} Il/Elle bénéficiera du statut collectif applicable dans l'entreprise au personnel de sa catégorie. L'horaire de travail est de **${v(form.heuresParSemaine)}h** par semaine, réparti **${v(form.repartitionJours)}**. Le Salarié s'engage pendant la durée du contrat à ne pas avoir d'activité professionnelle susceptible de concurrencer ${v(form.formeJuridique)} ${v(form.nomEntreprise)}.

## Article 3, REMUNERATIONS

En contrepartie de son activité, le Salarié percevra un salaire fixé au taux horaire brut de **${v(form.tauxHoraire)} euros** soit **${v(form.salaireBrut)} euros brut** pour ${v(form.heuresMensuelles)} heures de travail. Sera ajouté au salaire les indemnités de déplacement afférant à sa profession.

## Article 4, ABSENCES

Les absences devront être autorisées par la Direction et pour les absences imprévues, le salarié devra prévenir immédiatement l'entreprise et faire parvenir les justifications utiles dans les quarante-huit heures.

## Article 5, RETRAITE ET PREVOYANCE

Le Salarié sera affilié et cotisera à la caisse de retraite et prévoyance de l'entreprise.

## Article 6, CONVENTION COLLECTIVE

Le présent contrat sera régi par les dispositions de la convention ${v(form.convention)}.

## Article 7, CONGES PAYES – AVANTAGES SOCIAUX

Le Salarié bénéficiera des congés payés et avantages sociaux institués dans l'entreprise en faveur des salariés de catégorie, dans les conditions prévues par les articles L 223-1 et suivants du Code du Travail ou par la convention applicable. L'époque des congés payés légaux annuels sera déterminée par l'employeur.

## Article 8, RUPTURE DU CONTRAT

`;

  if (isCDD) {
    doc += `Le contrat prendra fin automatiquement à la date indiquée à l'Article 1 si ce dernier n'est pas renouvelé. Il pourra être mis fin au présent contrat pendant la période d'essai par l'une des parties, hormis faute grave ou force majeure, il sera respecté un préavis réciproque dans les conditions de la législation du travail et de la convention collective applicable.`;
  } else {
    doc += `Il pourra être mis fin au présent contrat à tout moment, hormis faute grave ou force majeure, il sera respecté un préavis réciproque à condition de respecter les conditions de fonds et de forme de la législation du travail et de la convention collective le régissant. Il sera notifié par pli recommandé avec demande d'avis de réception, à la date de présentation faisant courir le délai congé.`;
  }

  doc += `

## Article 9, OBLIGATIONS PROFESSIONNELLES

Le salarié s'engage à consacrer professionnellement tous ses soins à l'entreprise, à se conformer aux règles régissant le fonctionnement interne de celle-ci, à observer les instructions et consignes particulières de travail qui lui seront données, enfin à observer une discrétion absolue sur tout ce qui concerne l'activité de l'entreprise.`;

  // Optional clauses
  if (clauseLabels.length > 0) {
    let art = 10;
    for (const clause of clauseLabels) {
      doc += `\n\n## Article ${art}, ${clause.toUpperCase()}\n\nLe Salarié s'engage à respecter les obligations liées à la clause de ${clause.toLowerCase()} pendant toute la durée du contrat et après sa rupture, dans les conditions définies par la législation en vigueur et la convention collective applicable.`;
      art++;
    }
  }

  // Optional benefits
  if (avantageLabels.length > 0) {
    doc += `\n\n## Article ${10 + clauseLabels.length}, AVANTAGES EN NATURE\n\nLe Salarié bénéficiera des avantages en nature suivants : **${avantageLabels.join(", ")}**. Ces avantages sont évalués conformément au barème URSSAF en vigueur et soumis aux cotisations sociales correspondantes.`;
  }

  doc += `

---

*Pour toutes questions non visées aux présentes, les parties déclarent se référer aux dispositions conventionnelles, légales et réglementaires actuelles et à venir.*

Fait à ${v(form.lieuSignature)}, le ${fmt(form.dateSignature)}

En deux exemplaires originaux dont un pour chacune des parties.`;

  return doc;
}

// ─── Avenant templates ────────────────────────────────────────────────────────
export function generateAvenant(form, avenantTypeLabel) {
  const fullName = `${v(form.prenom)} ${v(form.nom)}`.trim();

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
Poste : ${v(form.poste)} – Contrat : ${v(form.typeContrat)} – Embauché(e) le ${fmt(form.dateEmbauche)}

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

Cette prolongation est soumise à l'accord exprès du salarié, conformément aux dispositions légales applicables.`;
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

Ce forfait est applicable aux cadres autonomes et doit être prévu par la convention collective. L'accord du salarié est requis.`;
      break;

    default:
      body = `## Article 1, MODIFICATION\n\nLes parties conviennent de modifier le contrat de travail selon les termes définis dans le présent avenant.`;
  }

  const footer = `

---

*Toutes autres dispositions du contrat de travail initial et de ses avenants précédents restent inchangées.*

Fait à ${v(form.lieuSignature)}, le ${fmt(form.dateSignature)}

En deux exemplaires originaux dont un pour chacune des parties.`;

  return header + body + footer;
}
