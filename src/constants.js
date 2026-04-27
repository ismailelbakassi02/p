// ─── Contract type options ───────────────────────────────────────────────────

export const CDD_SUBTYPES = [
  { value: "standard",      label: "Standard",                          desc: "Temps plein ou partiel",            maxDuration: "Max 18 mois" },
  { value: "remplacement",  label: "Remplacement salarié absent",       desc: "Illimité si même motif",            maxDuration: "18–24 mois" },
  { value: "accroissement", label: "Accroissement temporaire d'activité", desc: "Max 2 renouvellements",           maxDuration: "Max 18 mois" },
  { value: "saisonnier",    label: "Emploi saisonnier",                 desc: "Récoltes, stations balnéaires…",    maxDuration: "Max 9 mois" },
  { value: "etudiant",      label: "Étudiant",                          desc: "Planning joint au contrat",         maxDuration: "À définir" },
  { value: "usage",         label: "CDD d'usage",                       desc: "Autorisé par convention collective", maxDuration: "Selon CCN" },
];

export const CDI_SUBTYPES = [
  { value: "standard",     label: "Standard",                   desc: "Temps plein ou partiel classique" },
  { value: "chantier",     label: "Chantier ou d'opération",    desc: "BTP / IT – lié à la fin du projet" },
  { value: "interimaire",  label: "CDI Intérimaire",            desc: "Via agence pour missions récurrentes" },
  { value: "intermittent", label: "CDI Intermittent",           desc: "Travail discontinu – spectacle, tourisme…" },
  { value: "cve",          label: "CVE – Senior 55+",           desc: "Contrat de Valorisation d'Expérience" },
];

// ─── Clauses & benefits ──────────────────────────────────────────────────────

export const CLAUSES_LIST = [
  { id: "confidentialite",  label: "Confidentialité",         icon: "🔒" },
  { id: "non_divulgation",  label: "Non-divulgation",         icon: "🤫" },
  { id: "non_concurrence",  label: "Non-concurrence",         icon: "🚫" },
  { id: "objectifs",        label: "Objectifs",               icon: "🎯" },
  { id: "mobilite",         label: "Mobilité géographique",   icon: "🗺" },
  { id: "astreinte",        label: "Astreinte",               icon: "📟" },
  { id: "exclusivite",      label: "Exclusivité",             icon: "⭐" },
  { id: "dedit_formation",  label: "Dédit-formation",         icon: "📚" },
];

export const AVANTAGES_LIST = [
  { id: "vehicule",   label: "Véhicule de société",          icon: "🚗" },
  { id: "repas",      label: "Panier repas / Tickets resto", icon: "🍽️" },
  { id: "logement",   label: "Logement de fonction",         icon: "🏠" },
  { id: "telephone",  label: "Téléphone professionnel",      icon: "📱" },
  { id: "ordinateur", label: "Ordinateur / Matériel",        icon: "💻" },
  { id: "mutuelle",   label: "Mutuelle / Prévoyance",        icon: "🏥" },
];

// ─── Avenant types ────────────────────────────────────────────────────────────

export const AVENANT_TYPES = [
  { value: "renouvellement_cdd",  label: "Renouvellement CDD",                  icon: "📅", desc: "Prolongation d'un CDD existant" },
  { value: "augmentation_salaire",label: "Augmentation de salaire / primes",    icon: "💶", desc: "Modification de la rémunération ou primes" },
  { value: "augmentation_duree",  label: "Modification durée / horaires",       icon: "⏱️", desc: "Changement du temps de travail" },
  { value: "changement_poste",    label: "Changement de poste / qualification", icon: "📋", desc: "Nouvelle fonction ou qualification" },
  { value: "mutation",            label: "Mutation / Lieu de travail",          icon: "📍", desc: "Changement de lieu d'affectation" },
  { value: "clauses",             label: "Ajout / suppression de clauses",      icon: "📝", desc: "Non-concurrence, confidentialité, exclusivité…" },
  { value: "periode_essai",       label: "Prolongation période d'essai",        icon: "⏳", desc: "CDI uniquement – prolongation de la période d'essai" },
  { value: "avantages_nature",    label: "Modification avantages en nature",    icon: "🎁", desc: "Ajout, retrait ou modification d'avantages" },
  { value: "forfait_jours",       label: "Passage au forfait jours",            icon: "📆", desc: "Cadres autonomes – passage en jours/an" },
];

// ─── Conventions collectives ─────────────────────────────────────────────────

export const CONVENTIONS = [
  "Restauration rapide (IDCC 1501)",
  "Hôtels, cafés, restaurants (IDCC 1979)",
  "Commerce de détail alimentaire (IDCC 2216)",
  "Bâtiment – ouvriers (IDCC 1597)",
  "Bâtiment – ETAM (IDCC 2609)",
  "Métallurgie (IDCC 3248)",
  "Transport routier (IDCC 16)",
  "Aide à domicile (IDCC 2941)",
  "Coiffure (IDCC 2596)",
  "Nettoyage industriel (IDCC 3043)",
  "Sécurité privée (IDCC 1351)",
  "Commerce de gros (IDCC 573)",
  "Immobilier (IDCC 1527)",
  "Bureaux d'études techniques / Syntec (IDCC 1486)",
  "Banques (IDCC 2120)",
  "Assurances (IDCC 1672)",
  "Grande distribution (IDCC 2343)",
  "Pharmacie (IDCC 1555)",
  "Médico-social (IDCC 413)",
  "Agriculture (IDCC 7024)",
  "Spectacle vivant (IDCC 3090)",
  "Autre / Saisir manuellement",
];

// ─── Document types ───────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  { value: "cni_fr",              label: "🇫🇷 Carte nationale d'identité française (CNI)",                         eea: true },
  { value: "passeport_fr",        label: "🇫🇷 Passeport français",                                                 eea: true },
  { value: "cni_ue",              label: "🇪🇺 Carte d'identité UE / EEE / Suisse",                                 eea: true },
  { value: "passeport_ue",        label: "🇪🇺 Passeport UE / EEE / Suisse",                                        eea: true },
  { value: "passeport_etranger",  label: "🌍 Passeport étranger (hors UE)",                                        eea: false },
  { value: "cs_salarie",          label: "🪪 Carte de séjour « Salarié »",                                         eea: false },
  { value: "cs_travailleur_temp", label: "🪪 Carte de séjour « Travailleur temporaire »",                          eea: false },
  { value: "cs_etudiant",         label: "🪪 Carte de séjour « Étudiant »",                                        eea: false },
  { value: "cs_resident",         label: "🪪 Carte de séjour « Résident »",                                        eea: false },
  { value: "cs_resident_ld",      label: "🪪 Carte de séjour « Résident longue durée-UE »",                        eea: false },
  { value: "cs_passeport_talent", label: "🪪 Carte de séjour « Passeport talent »",                                eea: false },
  { value: "cs_recherche_emploi", label: "🪪 Carte de séjour « Recherche d'emploi / création d'entreprise »",     eea: false },
  { value: "vls_ts",              label: "🪪 VLS-TS (Visa Long Séjour valant Titre de Séjour)",                    eea: false },
  { value: "titre_voyage",        label: "📄 Titre de voyage (réfugié / apatride)",                                eea: false },
  { value: "autre",               label: "📄 Autre document",                                                      eea: false },
];

// ─── Nationalities ────────────────────────────────────────────────────────────

const EEA_LIST = [
  "belge","espagnole","italienne","allemande","portugaise","néerlandaise",
  "polonaise","roumaine","bulgare","hongroise","tchèque","slovaque",
  "autrichienne","suédoise","danoise","finlandaise","grecque","croate",
  "slovène","lituanienne","lettone","estonienne","luxembourgeoise",
  "maltaise","chypriote","irlandaise","britannique","suisse","norvégienne","islandaise",
];
export { EEA_LIST };

const RAW_NATIONALITIES = [
  "Française",
  // EU
  "Allemande","Autrichienne","Belge","Bulgare","Chypriote","Croate","Danoise",
  "Espagnole","Estonienne","Finlandaise","Grecque","Hongroise","Irlandaise",
  "Italienne","Lettone","Lituanienne","Luxembourgeoise","Maltaise",
  "Néerlandaise","Polonaise","Portugaise","Roumaine","Slovaque","Slovène",
  "Suédoise","Tchèque",
  // Non-EU Europe
  "Albanaise","Andorrane","Biélorusse","Bosniaque","Britannique","Islandaise",
  "Kosovare","Liechtensteinoise","Macédonienne","Moldave","Monégasque",
  "Monténégrine","Norvégienne","Russe","Saint-Marinaise","Serbe","Suisse",
  "Ukrainienne","Vatikanaise",
  // North Africa
  "Algérienne","Égyptienne","Libyenne","Marocaine","Mauritanienne","Tunisienne",
  // West Africa
  "Béninoise","Burkinabè","Cap-Verdienne","Gambienne","Ghanéenne","Guinéenne",
  "Ivoirienne","Libérienne","Malienne","Nigériane","Nigérienne","Sénégalaise",
  "Sierra-Léonaise","Togolaise",
  // Central Africa
  "Camerounaise","Centrafricaine","Comorienne","Congolaise (Brazzaville)",
  "Congolaise (RDC)","Gabonaise","Rwandaise","Tchadienne",
  // East Africa
  "Burundaise","Djiboutienne","Érythréenne","Éthiopienne","Kényane","Malgache",
  "Mauricienne","Mozambicaine","Ougandaise","Seychelloise","Somalienne",
  "Tanzanienne","Zimbabwéenne",
  // Southern Africa
  "Angolaise","Botswanaise","Namibienne","Sud-Africaine","Zambienne",
  // Middle East
  "Bahreïnie","Émiratie","Irakienne","Iranienne","Israélienne","Jordanienne",
  "Koweïtienne","Libanaise","Omanaise","Palestinienne","Qatarienne",
  "Saoudienne","Syrienne","Yéménite",
  // Central Asia
  "Afghane","Azerbaïdjanaise","Arménienne","Géorgienne","Kazakhe","Kirghize",
  "Ouzbèke","Tadjike","Turkmène","Turque",
  // South Asia
  "Bangladaise","Bhoutanaise","Indienne","Népalaise","Pakistanaise","Sri-Lankaise",
  // Southeast Asia
  "Birmane","Cambodgienne","Indonésienne","Laotienne","Malaisienne",
  "Philippine","Singapourienne","Thaïlandaise","Vietnamienne",
  // East Asia
  "Chinoise","Coréenne (Nord)","Coréenne (Sud)","Japonaise","Mongole","Taïwanaise",
  // Oceania
  "Australienne","Néo-Zélandaise","Papouasienne",
  // Americas
  "Américaine","Canadienne","Mexicaine",
  "Argentine","Bolivienne","Brésilienne","Chilienne","Colombienne",
  "Équatorienne","Paraguayenne","Péruvienne","Uruguayenne","Vénézuélienne",
  "Cubaine","Haïtienne","Jamaïcaine",
  // Special
  "Apatride","Réfugiée (titre de voyage)","Autre",
];

const SPECIAL = ["Apatride","Réfugiée (titre de voyage)","Autre"];

export const NATIONALITIES = RAW_NATIONALITIES.sort((a, b) => {
  if (SPECIAL.includes(a) && !SPECIAL.includes(b)) return 1;
  if (!SPECIAL.includes(a) && SPECIAL.includes(b)) return -1;
  if (a === "Française") return -1;
  if (b === "Française") return 1;
  return a.localeCompare(b, "fr");
});

// ─── Initial form states ──────────────────────────────────────────────────────

export const initContract = {
  typeContrat: "CDI", sousType: "standard",
  nomEntreprise: "", formeJuridique: "SARL", siret: "", codeAPE: "",
  adresseSiege: "", villeUrssaf: "", representant: "",
  nom: "", prenom: "", adresseSalarie: "", typeDocument: "",
  nationalite: "Française", titreSejour: "",
  dateNaissance: "", lieuNaissance: "", numSecu: "",
  dateDebut: "", dateFin: "", periodEssai: "",
  fonction: "", niveau: "", coefficient: "",
  heuresParSemaine: "35", repartitionJours: "du lundi au vendredi",
  tauxHoraire: "", salaireBrut: "", heuresMensuelles: "151.67",
  convention: "", lieuSignature: "", dateSignature: "",
  clauses: [], avantages: [],
};

export const initAvenant = {
  typeAvenant: "renouvellement_cdd",
  raisonSociale: "", adresseSociete: "", siret: "", representant: "",
  nom: "", prenom: "", poste: "", typeContrat: "CDD", dateEmbauche: "",
  dateDebutCDD: "", dateFinInitiale: "",
  nbJoursRenouvellement: "", nouvelleDateFin: "", typeRenouvellement: "premier",
  salaireActuel: "", baseContractuelle: "", nouveauSalaire: "",
  typeAugmentation: "montant", valeurAugmentation: "", dateEffetSalaire: "",
  primesImpactees: false, detailPrimes: "",
  dureeActuelle: "", nouvelleduree: "", dateEffetDuree: "",
  remunerationModifiee: false, nouvelleRemunerationDuree: "",
  modifHoraires: false, nouveauxHoraires: "",
  ancienPoste: "", nouveauPoste: "", ancienLieu: "", nouveauLieu: "",
  actionClauses: "ajout", clausesSelectionnees: [], detailClauses: "",
  dureeEssaiActuelle: "", dureeEssaiNouvelle: "", motifProlongation: "",
  actionAvantages: "ajout", avantagesSelectionnees: [], detailAvantages: "",
  nbJoursForfait: "218", salaireForait: "", conditionsForfait: "",
  dateEffetAvenant: "", lieuSignature: "", dateSignature: "",
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const NAVY = "#1e3a5f";

// ─── Nature juridique code → label mapping (INSEE) ───────────────────────────

export const NATURE_JURIDIQUE_MAP = {
  "5306":"SARL","5307":"SARL","5308":"EURL","5385":"EURL",
  "5410":"SA","5415":"SA","5418":"SA","5419":"SA","5420":"SA",
  "5499":"SARL","5670":"SAS","5680":"SAS","5685":"SAS","5699":"SAS",
  "5710":"SAS","5720":"SASU","5750":"SAS","5785":"SASU","5790":"SAS",
  "1000":"EI","1100":"EI","1200":"EI","1300":"EI","1400":"EI",
  "5191":"SNC","5192":"SNC","5193":"SNC","5199":"SNC",
  "5202":"SCS","5203":"SCS",
  "3110":"ASSO.","3120":"ASSO.","3130":"ASSO.",
  "6010":"GIE","6020":"GIE","6030":"GIE",
};
