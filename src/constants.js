// ─── SMIC 2025 ────────────────────────────────────────────────────────────────
export const SMIC_HORAIRE = 12.02; // brut €/h (base 151.67 h/mois = 1 821.22 €)

// ─── CCN salary grids (minima horaires bruts 2024-2025) ──────────────────────
export const CCN_DATA = [
  {
    label: "Restauration rapide (IDCC 1501)", idcc: "1501",
    niveaux: [
      { label:"Niveau I — Echelon 1",          coeff:"115", tauxHoraire: 12.02 },
      { label:"Niveau I — Echelon 2",          coeff:"120", tauxHoraire: 12.02 },
      { label:"Niveau II — Echelon 1",         coeff:"130", tauxHoraire: 12.10 },
      { label:"Niveau II — Echelon 2",         coeff:"140", tauxHoraire: 12.30 },
      { label:"Niveau III — Echelon 1",        coeff:"150", tauxHoraire: 12.60 },
      { label:"Niveau III — Echelon 2",        coeff:"160", tauxHoraire: 13.10 },
      { label:"Niveau IV — Agent de maîtrise", coeff:"175", tauxHoraire: 13.80 },
      { label:"Niveau V — Cadre",              coeff:"200", tauxHoraire: 15.50 },
    ]
  },
  {
    label: "Hôtels, cafés, restaurants (IDCC 1979)", idcc: "1979",
    niveaux: [
      { label:"Niveau I — Echelon 1",          coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau I — Echelon 2",          coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau II — Echelon 1",         coeff:"", tauxHoraire: 12.15 },
      { label:"Niveau II — Echelon 2",         coeff:"", tauxHoraire: 12.40 },
      { label:"Niveau III — Echelon 1",        coeff:"", tauxHoraire: 12.80 },
      { label:"Niveau III — Echelon 2",        coeff:"", tauxHoraire: 13.30 },
      { label:"Niveau IV — Agent de maîtrise", coeff:"", tauxHoraire: 14.50 },
      { label:"Niveau V — Cadre",              coeff:"", tauxHoraire: 17.00 },
    ]
  },
  {
    label: "Commerce de détail alimentaire (IDCC 2216)", idcc: "2216",
    niveaux: [
      { label:"Niveau 1A",        coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 1B",        coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 2A",        coeff:"", tauxHoraire: 12.05 },
      { label:"Niveau 2B",        coeff:"", tauxHoraire: 12.20 },
      { label:"Niveau 3A",        coeff:"", tauxHoraire: 12.50 },
      { label:"Niveau 3B",        coeff:"", tauxHoraire: 13.00 },
      { label:"Niveau 4 — AM",    coeff:"", tauxHoraire: 14.20 },
      { label:"Niveau 5 — Cadre", coeff:"", tauxHoraire: 16.50 },
    ]
  },
  {
    label: "Bâtiment — ouvriers (IDCC 1597)", idcc: "1597",
    niveaux: [
      { label:"Ouvrier — Niveau I Echelon 1",        coeff:"150", tauxHoraire: 12.10 },
      { label:"Ouvrier — Niveau I Echelon 2",        coeff:"155", tauxHoraire: 12.30 },
      { label:"Ouvrier — Niveau II Echelon 1",       coeff:"160", tauxHoraire: 12.60 },
      { label:"Ouvrier — Niveau II Echelon 2",       coeff:"170", tauxHoraire: 13.00 },
      { label:"Ouvrier — Niveau III Echelon 1",      coeff:"185", tauxHoraire: 13.60 },
      { label:"Ouvrier — Niveau III Echelon 2",      coeff:"210", tauxHoraire: 14.50 },
      { label:"Ouvrier — Niveau IV (chef d'équipe)", coeff:"230", tauxHoraire: 15.50 },
    ]
  },
  {
    label: "Bâtiment — ETAM (IDCC 2609)", idcc: "2609",
    niveaux: [
      { label:"Position A",          coeff:"200", tauxHoraire: 13.00 },
      { label:"Position B",          coeff:"210", tauxHoraire: 13.50 },
      { label:"Position C",          coeff:"230", tauxHoraire: 14.20 },
      { label:"Position D",          coeff:"250", tauxHoraire: 15.00 },
      { label:"Position E",          coeff:"275", tauxHoraire: 16.50 },
      { label:"Position F",          coeff:"310", tauxHoraire: 18.50 },
      { label:"Cadre — Position G",  coeff:"360", tauxHoraire: 22.00 },
    ]
  },
  {
    label: "Métallurgie (IDCC 3248)", idcc: "3248",
    niveaux: [
      { label:"Technicien A1",        coeff:"", tauxHoraire: 12.02 },
      { label:"Technicien A2",        coeff:"", tauxHoraire: 12.10 },
      { label:"Technicien B1",        coeff:"", tauxHoraire: 12.50 },
      { label:"Technicien B2",        coeff:"", tauxHoraire: 13.00 },
      { label:"Technicien C1",        coeff:"", tauxHoraire: 13.60 },
      { label:"Technicien C2",        coeff:"", tauxHoraire: 14.50 },
      { label:"Ingénieur / Cadre D",  coeff:"", tauxHoraire: 16.00 },
      { label:"Ingénieur / Cadre E",  coeff:"", tauxHoraire: 19.00 },
      { label:"Ingénieur / Cadre F",  coeff:"", tauxHoraire: 23.00 },
    ]
  },
  {
    label: "Transport routier (IDCC 16)", idcc: "0016",
    niveaux: [
      { label:"Groupe 2 — Conducteur VL",              coeff:"138M", tauxHoraire: 12.10 },
      { label:"Groupe 3 — Conducteur PL (< 19T)",      coeff:"150M", tauxHoraire: 12.40 },
      { label:"Groupe 4 — Conducteur SPL",             coeff:"150M", tauxHoraire: 12.65 },
      { label:"Groupe 5 — Conducteur SPL longue dist.", coeff:"150M", tauxHoraire: 13.00 },
      { label:"Groupe 6 — AM / Chef d'équipe",         coeff:"",     tauxHoraire: 14.20 },
      { label:"Groupe 7 — Cadre",                      coeff:"",     tauxHoraire: 16.50 },
    ]
  },
  {
    label: "Aide à domicile (IDCC 2941)", idcc: "2941",
    niveaux: [
      { label:"Employé — Catégorie A (TAD, AVS)",        coeff:"", tauxHoraire: 12.02 },
      { label:"Employé — Catégorie B (AVS expérimentée)",coeff:"", tauxHoraire: 12.20 },
      { label:"Employé — Catégorie C (auxiliaire de vie)",coeff:"",tauxHoraire: 12.60 },
      { label:"Agent de maîtrise — Catégorie D",         coeff:"", tauxHoraire: 14.00 },
      { label:"Cadre — Catégorie E",                     coeff:"", tauxHoraire: 17.00 },
    ]
  },
  {
    label: "Coiffure (IDCC 2596)", idcc: "2596",
    niveaux: [
      { label:"Niveau 1 — Apprenti / débutant",                coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 2 — BP coiffure débutant",               coeff:"", tauxHoraire: 12.05 },
      { label:"Niveau 3 — Coiffeur(se) qualifié(e)",           coeff:"", tauxHoraire: 12.30 },
      { label:"Niveau 4 — Coiffeur(se) hautement qualifié(e)", coeff:"", tauxHoraire: 12.80 },
      { label:"Niveau 5 — Responsable technique",              coeff:"", tauxHoraire: 13.80 },
      { label:"Niveau 6 — Gérant / Cadre",                     coeff:"", tauxHoraire: 15.50 },
    ]
  },
  {
    label: "Nettoyage industriel (IDCC 3043)", idcc: "3043",
    niveaux: [
      { label:"AS1 — Agent de service",        coeff:"", tauxHoraire: 12.13 },
      { label:"AS2 — Agent qualifié",          coeff:"", tauxHoraire: 12.22 },
      { label:"AQS — Agent qualifié spécialisé",coeff:"",tauxHoraire: 12.35 },
      { label:"Chef d'équipe",                 coeff:"", tauxHoraire: 13.20 },
      { label:"Agent de maîtrise",             coeff:"", tauxHoraire: 14.50 },
      { label:"Cadre",                         coeff:"", tauxHoraire: 17.00 },
    ]
  },
  {
    label: "Sécurité privée (IDCC 1351)", idcc: "1351",
    niveaux: [
      { label:"Employé — Echelon 1 (ADS coeff 140)",  coeff:"140", tauxHoraire: 12.20 },
      { label:"Employé — Echelon 2 (coeff 150)",       coeff:"150", tauxHoraire: 12.40 },
      { label:"Employé — Echelon 3 (coeff 160)",       coeff:"160", tauxHoraire: 12.65 },
      { label:"Agent de maîtrise — Echelon 4 (170)",   coeff:"170", tauxHoraire: 13.20 },
      { label:"Agent de maîtrise — Echelon 5 (190)",   coeff:"190", tauxHoraire: 14.00 },
      { label:"Cadre — Echelon 6",                     coeff:"",    tauxHoraire: 17.00 },
    ]
  },
  {
    label: "Commerce de gros (IDCC 573)", idcc: "0573",
    niveaux: [
      { label:"Niveau I — Echelon 1",          coeff:"100", tauxHoraire: 12.02 },
      { label:"Niveau I — Echelon 2",          coeff:"110", tauxHoraire: 12.02 },
      { label:"Niveau II — Echelon 1",         coeff:"120", tauxHoraire: 12.20 },
      { label:"Niveau II — Echelon 2",         coeff:"135", tauxHoraire: 12.50 },
      { label:"Niveau III — Agent de maîtrise",coeff:"150", tauxHoraire: 13.50 },
      { label:"Niveau IV — Cadre",             coeff:"200", tauxHoraire: 16.00 },
    ]
  },
  {
    label: "Immobilier (IDCC 1527)", idcc: "1527",
    niveaux: [
      { label:"Employé — Echelon E1",          coeff:"", tauxHoraire: 12.02 },
      { label:"Employé — Echelon E2",          coeff:"", tauxHoraire: 12.10 },
      { label:"Technicien / AM1",              coeff:"", tauxHoraire: 13.50 },
      { label:"Technicien / AM2",              coeff:"", tauxHoraire: 14.50 },
      { label:"Cadre — C1",                    coeff:"", tauxHoraire: 16.50 },
      { label:"Cadre — C2",                    coeff:"", tauxHoraire: 20.00 },
    ]
  },
  {
    label: "Bureaux d'études techniques / Syntec (IDCC 1486)", idcc: "1486",
    niveaux: [
      { label:"ETAM — Position 1.1 (coeff 215)", coeff:"215", tauxHoraire: 12.10 },
      { label:"ETAM — Position 1.2 (coeff 225)", coeff:"225", tauxHoraire: 12.40 },
      { label:"ETAM — Position 2.1 (coeff 250)", coeff:"250", tauxHoraire: 13.00 },
      { label:"ETAM — Position 2.2 (coeff 275)", coeff:"275", tauxHoraire: 13.80 },
      { label:"ETAM — Position 2.3 (coeff 310)", coeff:"310", tauxHoraire: 14.80 },
      { label:"Cadre — Position 3.1 (coeff 400)",coeff:"400", tauxHoraire: 18.00 },
      { label:"Cadre — Position 3.2 (coeff 450)",coeff:"450", tauxHoraire: 22.00 },
      { label:"Cadre — Position 3.3 (coeff 600)",coeff:"600", tauxHoraire: 28.00 },
    ]
  },
  {
    label: "Banques (IDCC 2120)", idcc: "2120",
    niveaux: [
      { label:"Technicien — Niveau 1", coeff:"", tauxHoraire: 13.00 },
      { label:"Technicien — Niveau 2", coeff:"", tauxHoraire: 14.00 },
      { label:"Technicien — Niveau 3", coeff:"", tauxHoraire: 15.50 },
      { label:"Cadre — Niveau 4",      coeff:"", tauxHoraire: 19.00 },
      { label:"Cadre — Niveau 5",      coeff:"", tauxHoraire: 24.00 },
    ]
  },
  {
    label: "Assurances (IDCC 1672)", idcc: "1672",
    niveaux: [
      { label:"Classe 1 — Employé", coeff:"", tauxHoraire: 12.50 },
      { label:"Classe 2",           coeff:"", tauxHoraire: 13.50 },
      { label:"Classe 3 — AM",      coeff:"", tauxHoraire: 15.00 },
      { label:"Classe 4 — Cadre",   coeff:"", tauxHoraire: 18.00 },
      { label:"Classe 5",           coeff:"", tauxHoraire: 23.00 },
    ]
  },
  {
    label: "Grande distribution (IDCC 2343)", idcc: "2343",
    niveaux: [
      { label:"Niveau 1A — Echelon 1", coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 1A — Echelon 2", coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 1B",             coeff:"", tauxHoraire: 12.05 },
      { label:"Niveau 2A",             coeff:"", tauxHoraire: 12.20 },
      { label:"Niveau 2B",             coeff:"", tauxHoraire: 12.50 },
      { label:"Niveau 3 — AM",         coeff:"", tauxHoraire: 13.80 },
      { label:"Niveau 4 — Cadre",      coeff:"", tauxHoraire: 16.00 },
    ]
  },
  {
    label: "Pharmacie (IDCC 1555)", idcc: "1555",
    niveaux: [
      { label:"Employé — Groupe 2",           coeff:"", tauxHoraire: 12.02 },
      { label:"Préparateur — Groupe 3",        coeff:"", tauxHoraire: 12.50 },
      { label:"Préparateur breveté — Groupe 4",coeff:"", tauxHoraire: 13.50 },
      { label:"AM — Groupe 5",                 coeff:"", tauxHoraire: 15.00 },
      { label:"Pharmacien adjoint — Groupe 6", coeff:"", tauxHoraire: 19.00 },
    ]
  },
  {
    label: "Médico-social (IDCC 413)", idcc: "0413",
    niveaux: [
      { label:"Groupe 1 — Employé",          coeff:"", tauxHoraire: 12.02 },
      { label:"Groupe 2 — Technicien",       coeff:"", tauxHoraire: 13.00 },
      { label:"Groupe 3 — AM",               coeff:"", tauxHoraire: 14.50 },
      { label:"Groupe 4 — Cadre",            coeff:"", tauxHoraire: 17.00 },
      { label:"Groupe 5 — Cadre supérieur",  coeff:"", tauxHoraire: 22.00 },
    ]
  },
  {
    label: "Agriculture (IDCC 7024)", idcc: "7024",
    niveaux: [
      { label:"Palier 1",         coeff:"", tauxHoraire: 12.02 },
      { label:"Palier 2",         coeff:"", tauxHoraire: 12.02 },
      { label:"Palier 3",         coeff:"", tauxHoraire: 12.10 },
      { label:"Palier 4",         coeff:"", tauxHoraire: 12.30 },
      { label:"Palier 5",         coeff:"", tauxHoraire: 12.60 },
      { label:"Palier 6 — AM",    coeff:"", tauxHoraire: 13.50 },
      { label:"Palier 7 — Cadre", coeff:"", tauxHoraire: 16.00 },
    ]
  },
  {
    label: "Spectacle vivant (IDCC 3090)", idcc: "3090",
    niveaux: [
      { label:"Groupe 1 — Technicien",         coeff:"", tauxHoraire: 12.50 },
      { label:"Groupe 2 — Technicien qualifié", coeff:"", tauxHoraire: 13.50 },
      { label:"Groupe 3 — AM",                 coeff:"", tauxHoraire: 15.00 },
      { label:"Groupe 4 — Cadre artistique",    coeff:"", tauxHoraire: 18.00 },
    ]
  },
  {
    label: "Commerce et réparation auto (IDCC 1090)", idcc: "1090",
    niveaux: [
      { label:"Employé — Niveau 1",          coeff:"", tauxHoraire: 12.02 },
      { label:"Employé — Niveau 2",          coeff:"", tauxHoraire: 12.10 },
      { label:"Technicien — Niveau 3",        coeff:"", tauxHoraire: 12.60 },
      { label:"Technicien qualifié — Niveau 4",coeff:"",tauxHoraire: 13.30 },
      { label:"AM — Niveau 5",               coeff:"", tauxHoraire: 14.50 },
      { label:"Cadre — Niveau 6",            coeff:"", tauxHoraire: 17.00 },
    ]
  },
  {
    label: "Restauration collective (IDCC 1266)", idcc: "1266",
    niveaux: [
      { label:"Niveau I — Echelon 1",  coeff:"155", tauxHoraire: 12.02 },
      { label:"Niveau I — Echelon 2",  coeff:"160", tauxHoraire: 12.02 },
      { label:"Niveau II — Echelon 1", coeff:"170", tauxHoraire: 12.20 },
      { label:"Niveau II — Echelon 2", coeff:"180", tauxHoraire: 12.50 },
      { label:"Niveau III — AM",       coeff:"195", tauxHoraire: 13.20 },
      { label:"Niveau IV — Cadre",     coeff:"250", tauxHoraire: 16.00 },
    ]
  },
  {
    label: "Textile / Habillement (IDCC 1483)", idcc: "1483",
    niveaux: [
      { label:"Niveau 1A",        coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 1B",        coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 2A",        coeff:"", tauxHoraire: 12.10 },
      { label:"Niveau 2B",        coeff:"", tauxHoraire: 12.40 },
      { label:"Niveau 3 — AM",    coeff:"", tauxHoraire: 13.50 },
      { label:"Niveau 4 — Cadre", coeff:"", tauxHoraire: 16.50 },
    ]
  },
  {
    label: "Santé — Cliniques privées (IDCC 651)", idcc: "0651",
    niveaux: [
      { label:"Personnel non qualifié — Cat. A",  coeff:"", tauxHoraire: 12.02 },
      { label:"Personnel qualifié — Cat. B",       coeff:"", tauxHoraire: 12.40 },
      { label:"Infirmier — Cat. C",                coeff:"", tauxHoraire: 14.00 },
      { label:"Infirmier spécialisé — Cat. D",     coeff:"", tauxHoraire: 16.00 },
      { label:"Cadre de santé — Cat. E",           coeff:"", tauxHoraire: 18.50 },
      { label:"Médecin / Cadre supérieur",         coeff:"", tauxHoraire: 28.00 },
    ]
  },
  {
    label: "Boulangerie-pâtisserie artisanale (IDCC 194)", idcc: "194",
    niveaux: [
      { label:"Ouvrier — Echelon 1",          coeff:"", tauxHoraire: 12.02 },
      { label:"Ouvrier — Echelon 2",          coeff:"", tauxHoraire: 12.15 },
      { label:"Ouvrier — Echelon 3",          coeff:"", tauxHoraire: 12.40 },
      { label:"Ouvrier qualifié",             coeff:"", tauxHoraire: 12.80 },
      { label:"Ouvrier hautement qualifié",   coeff:"", tauxHoraire: 13.50 },
      { label:"Chef de production / AM",      coeff:"", tauxHoraire: 15.00 },
      { label:"Cadre",                        coeff:"", tauxHoraire: 18.00 },
    ]
  },
  {
    label: "Animation (IDCC 1321)", idcc: "1321",
    niveaux: [
      { label:"Groupe A — Animateur",           coeff:"", tauxHoraire: 12.02 },
      { label:"Groupe B — Animateur qualifié",  coeff:"", tauxHoraire: 12.30 },
      { label:"Groupe C — Coordinateur",        coeff:"", tauxHoraire: 13.00 },
      { label:"Groupe D — Responsable secteur", coeff:"", tauxHoraire: 14.50 },
      { label:"Groupe E — Directeur",           coeff:"", tauxHoraire: 17.00 },
    ]
  },
  {
    label: "Sport (IDCC 1109)", idcc: "1109",
    niveaux: [
      { label:"Groupe 2 — Animateur sportif",     coeff:"", tauxHoraire: 12.02 },
      { label:"Groupe 3 — Éducateur sportif",     coeff:"", tauxHoraire: 12.40 },
      { label:"Groupe 4 — Éducateur qualifié",    coeff:"", tauxHoraire: 13.00 },
      { label:"Groupe 5 — Responsable technique", coeff:"", tauxHoraire: 14.50 },
      { label:"Groupe 6 — Directeur technique",   coeff:"", tauxHoraire: 17.00 },
      { label:"Groupe 7 — Cadre dirigeant",       coeff:"", tauxHoraire: 21.00 },
    ]
  },
  {
    label: "Ambulances (IDCC 1747)", idcc: "1747",
    niveaux: [
      { label:"Catégorie A — Auxiliaire ambulancier",  coeff:"", tauxHoraire: 12.02 },
      { label:"Catégorie B — Ambulancier DEA",          coeff:"", tauxHoraire: 12.30 },
      { label:"Catégorie C — Ambulancier chef",         coeff:"", tauxHoraire: 12.80 },
      { label:"Catégorie D — Agent de régulation",      coeff:"", tauxHoraire: 13.50 },
      { label:"Catégorie E — AM / Responsable",         coeff:"", tauxHoraire: 15.00 },
    ]
  },
  {
    label: "Travaux publics — Ouvriers (IDCC 272)", idcc: "272",
    niveaux: [
      { label:"Ouvrier — Niveau I Echelon 1",       coeff:"100", tauxHoraire: 12.10 },
      { label:"Ouvrier — Niveau I Echelon 2",       coeff:"105", tauxHoraire: 12.30 },
      { label:"Ouvrier — Niveau II Echelon 1",      coeff:"110", tauxHoraire: 12.60 },
      { label:"Ouvrier — Niveau II Echelon 2",      coeff:"115", tauxHoraire: 13.00 },
      { label:"Ouvrier qualifié — Niveau III",      coeff:"125", tauxHoraire: 13.60 },
      { label:"Ouvrier très qualifié — Niveau IV",  coeff:"140", tauxHoraire: 14.50 },
      { label:"Chef d'équipe",                      coeff:"155", tauxHoraire: 15.50 },
    ]
  },
  {
    label: "Cabinets médicaux (IDCC 1131)", idcc: "1131",
    niveaux: [
      { label:"Employé — Echelon 1",      coeff:"", tauxHoraire: 12.02 },
      { label:"Employé — Echelon 2",      coeff:"", tauxHoraire: 12.20 },
      { label:"Employé qualifié — Ech. 3",coeff:"", tauxHoraire: 12.60 },
      { label:"Technicien — Echelon 4",   coeff:"", tauxHoraire: 13.50 },
      { label:"Assistant médical / AM",   coeff:"", tauxHoraire: 15.00 },
      { label:"Cadre administratif",      coeff:"", tauxHoraire: 18.00 },
    ]
  },
  {
    label: "Cabinets dentaires (IDCC 1576)", idcc: "1576",
    niveaux: [
      { label:"Groupe A — Employé",           coeff:"", tauxHoraire: 12.02 },
      { label:"Groupe B — Assistant dentaire",coeff:"", tauxHoraire: 12.40 },
      { label:"Groupe C — Assistant qualifié",coeff:"", tauxHoraire: 13.00 },
      { label:"Groupe D — AM / Coordinateur", coeff:"", tauxHoraire: 14.50 },
      { label:"Groupe E — Cadre",             coeff:"", tauxHoraire: 17.50 },
    ]
  },
  {
    label: "Gardiens, concierges (IDCC 1043)", idcc: "1043",
    niveaux: [
      { label:"Catégorie A — Employé d'immeuble", coeff:"", tauxHoraire: 12.02 },
      { label:"Catégorie B — Gardien non logé",   coeff:"", tauxHoraire: 12.15 },
      { label:"Catégorie C — Gardien logé",       coeff:"", tauxHoraire: 12.30 },
      { label:"Catégorie D — Gardien chef",       coeff:"", tauxHoraire: 13.00 },
    ]
  },
  {
    label: "Hôtellerie de plein air (IDCC 1975)", idcc: "1975",
    niveaux: [
      { label:"Niveau I — Echelon 1",  coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau I — Echelon 2",  coeff:"", tauxHoraire: 12.10 },
      { label:"Niveau II — Echelon 1", coeff:"", tauxHoraire: 12.30 },
      { label:"Niveau II — Echelon 2", coeff:"", tauxHoraire: 12.60 },
      { label:"Niveau III — AM",       coeff:"", tauxHoraire: 13.50 },
      { label:"Niveau IV — Cadre",     coeff:"", tauxHoraire: 16.00 },
    ]
  },
  {
    label: "Notariat (IDCC 1315)", idcc: "1315",
    niveaux: [
      { label:"Echelon A1 — Débutant",     coeff:"", tauxHoraire: 12.02 },
      { label:"Echelon A2",                coeff:"", tauxHoraire: 12.30 },
      { label:"Echelon B1 — Clerc qualifié",coeff:"",tauxHoraire: 13.00 },
      { label:"Echelon B2",                coeff:"", tauxHoraire: 13.80 },
      { label:"Echelon C — Notaire assistant",coeff:"",tauxHoraire: 16.00 },
      { label:"Echelon D — Cadre",         coeff:"", tauxHoraire: 20.00 },
    ]
  },
  {
    label: "Particuliers employeurs (IDCC 2720)", idcc: "2720",
    niveaux: [
      { label:"Niveau A — Employé de maison débutant",    coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau B — Employé qualifié",              coeff:"", tauxHoraire: 12.20 },
      { label:"Niveau C — Employé expérimenté",           coeff:"", tauxHoraire: 12.60 },
      { label:"Niveau D — Employé hautement qualifié",    coeff:"", tauxHoraire: 13.50 },
      { label:"Niveau E — Responsable de maison",         coeff:"", tauxHoraire: 15.00 },
    ]
  },
  {
    label: "Pressing, laverie, teinturerie (IDCC 1120)", idcc: "1120",
    niveaux: [
      { label:"Niveau 1 — Employé",         coeff:"", tauxHoraire: 12.02 },
      { label:"Niveau 2 — Employé qualifié", coeff:"", tauxHoraire: 12.20 },
      { label:"Niveau 3 — Technicien",       coeff:"", tauxHoraire: 12.60 },
      { label:"Niveau 4 — AM",              coeff:"", tauxHoraire: 13.50 },
      { label:"Niveau 5 — Cadre",           coeff:"", tauxHoraire: 16.00 },
    ]
  },
  {
    label: "Organismes de formation (IDCC 675)", idcc: "675",
    niveaux: [
      { label:"Groupe A — Formateur débutant",      coeff:"", tauxHoraire: 12.02 },
      { label:"Groupe B — Formateur",               coeff:"", tauxHoraire: 12.50 },
      { label:"Groupe C — Formateur senior",         coeff:"", tauxHoraire: 14.00 },
      { label:"Groupe D — Responsable pédagogique", coeff:"", tauxHoraire: 16.50 },
      { label:"Groupe E — Directeur pédagogique",   coeff:"", tauxHoraire: 21.00 },
    ]
  },
  { label: "Autre / Saisir manuellement", idcc: "", niveaux: [] },
];

// ─── Contract type options ───────────────────────────────────────────────────

export const CDD_SUBTYPES = [
  { value: "standard",       label: "CDD Standard",                       desc: "Accroissement d'activité, motif précis" },
  { value: "remplacement",   label: "Remplacement salarié absent",         desc: "Même motif — durée de l'absence" },
  { value: "attente_cdi",    label: "Attente d'embauche en CDI",           desc: "Poste à pourvoir, salarié CDI non encore arrivé" },
  { value: "travaux_urgents",label: "Travaux urgents de sécurité",         desc: "Risque grave et imminent" },
  { value: "export",         label: "Commande exceptionnelle à l'export",  desc: "Augmentation temporaire de carnet de commandes" },
  { value: "etranger",       label: "Exécution à l'étranger",              desc: "Mission hors territoire français" },
  { value: "suppression",    label: "Suppression de poste définitive",     desc: "En attente de suppression effective" },
  { value: "accroissement",  label: "Accroissement temporaire d'activité", desc: "Pic d'activité ponctuel et précis" },
  { value: "saisonnier",     label: "Emploi saisonnier",                   desc: "Récoltes, stations balnéaires, tourisme, ski…" },
  { value: "senior",         label: "CDD Senior (56 ans ou +)",            desc: "Favoriser le retour à l'emploi — Art. D.1242-2" },
  { value: "etudiant",       label: "Étudiant / Vacances scolaires",       desc: "Planning obligatoire joint au contrat" },
  { value: "usage",          label: "CDD d'usage (CDDU)",                  desc: "Secteurs listés par décret ou CCN uniquement" },
];

export const CDI_SUBTYPES = [
  { value: "standard",     label: "Standard",                   desc: "Temps plein ou partiel classique" },
  { value: "chantier",     label: "Chantier ou d'opération",    desc: "BTP / IT – lié à la fin du projet" },
  { value: "interimaire",  label: "CDI Intérimaire",            desc: "Via agence pour missions récurrentes" },
  { value: "intermittent", label: "CDI Intermittent",           desc: "Travail discontinu – spectacle, tourisme…" },
  { value: "cve",          label: "CVE – Senior 55+",           desc: "Contrat de Valorisation d'Expérience" },
];

// ─── CDD rules engine (Art. L.1242-1 et s. Code du travail) ─────────────────
export const CDD_REGLES = {
  standard:        { dureeMaxMois: 18,   renouvMax: 2,    base: "Art. L.1243-13",
                     note: "Durée initiale + renouvellements ≤ 18 mois. Avenant écrit obligatoire avant échéance." },
  remplacement:    { dureeMaxMois: 18,   renouvMax: 2,    base: "Art. L.1242-2 1°",
                     note: "Durée liée à l'absence du salarié remplacé. Terme imprécis autorisé." },
  attente_cdi:     { dureeMaxMois: 9,    renouvMax: 0,    base: "Art. L.1242-3",
                     note: "9 mois maximum, sans renouvellement. Uniquement pour pourvoir un poste avant l'arrivée du titulaire CDI." },
  travaux_urgents: { dureeMaxMois: 9,    renouvMax: 0,    base: "Art. L.1242-3",
                     note: "9 mois maximum, sans renouvellement. Uniquement pour travaux présentant un risque grave et imminent." },
  export:          { dureeMaxMois: 24,   renouvMax: 2,    base: "Art. L.1242-8-1",
                     note: "24 mois maximum pour commande exceptionnelle à l'export nécessitant des moyens exorbitants." },
  etranger:        { dureeMaxMois: 24,   renouvMax: 2,    base: "Art. L.1242-8-1",
                     note: "24 mois maximum pour tout contrat dont l'exécution est prévue hors de France." },
  suppression:     { dureeMaxMois: 24,   renouvMax: 2,    base: "Art. L.1242-8-1",
                     note: "24 mois maximum. Le poste doit être supprimé de façon définitive." },
  accroissement:   { dureeMaxMois: 18,   renouvMax: 2,    base: "Art. L.1242-2 2°, L.1243-13",
                     note: "18 mois maximum, 2 renouvellements max. Le motif d'accroissement doit être réel, précis et temporaire." },
  saisonnier:      { dureeMaxMois: null, renouvMax: null, base: "Art. L.1242-2 3°, L.1244-2",
                     note: "Pas de durée légale maximale fixée. Clause de reconduction d'une saison sur l'autre possible si prévue au contrat ou CCN." },
  senior:          { dureeMaxMois: 36,   renouvMax: null, base: "Art. D.1242-2",
                     note: "36 mois maximum, renouvelable sans limite dans la limite de 36 mois au total. Salarié de 57 ans ou plus inscrit à France Travail depuis 3 mois." },
  etudiant:        { dureeMaxMois: null, renouvMax: null, base: "Art. L.1242-2",
                     note: "Durée limitée aux vacances scolaires ou universitaires. Planning des cours obligatoirement joint au contrat." },
  usage:           { dureeMaxMois: null, renouvMax: null, base: "Art. L.1242-2 3°, D.1242-1",
                     note: "Pas de durée légale maximale ni de limite de renouvellement. La succession de CDDU sans interruption peut entraîner requalification en CDI (Cass. soc.)." },
};

// ─── CCN derogations (extended durations / renewals) ─────────────────────────
export const CCN_DEROGATIONS = {
  "1486": {
    standard:     { dureeMaxMois: 24, renouvMax: 2, note: "Syntec : CDD standard jusqu'à 24 mois (accord de branche)." },
    accroissement:{ dureeMaxMois: 24, renouvMax: 2, note: "Syntec : accroissement jusqu'à 24 mois." },
  },
  "1979": {
    usage: { dureeMaxMois: null, renouvMax: null, note: "HCR : CDDU autorisé. Vigilance Cass. soc. sur la succession sans interruption." },
  },
  "3090": {
    usage: { dureeMaxMois: null, renouvMax: null, note: "Spectacle vivant : CDDU autorisé sans durée maximale fixe." },
  },
  "1501": {
    usage:        { dureeMaxMois: null, renouvMax: null, note: "Restauration rapide : CDDU autorisé pour extras." },
    accroissement:{ dureeMaxMois: 18,   renouvMax: 3,    note: "Restauration rapide : jusqu'à 3 renouvellements pour accroissement." },
  },
  "2941": {
    usage: { dureeMaxMois: null, renouvMax: null, note: "Aide à domicile : CDDU autorisé pour interventions ponctuelles." },
  },
  "7024": {
    saisonnier: { dureeMaxMois: null, renouvMax: null, note: "Agriculture : CDD saisonnier sans durée max. Clause de reconduction saisonnière autorisée." },
  },
};

// ─── CDDU authorized sectors (Art. L.1242-2 3°, D.1242-1) ───────────────────
export const CCN_USAGE_AUTORISE = new Set([
  "1979","1501","1266","1975","3090","3097","1700","1109","1321",
  "1557","2941","3168","2494","2720","2717","9001","1762","717",
  "7024","2078","514","1870","2335","3220",
]);

// ─── CCN compliance obligations (mutuelle / prévoyance) ──────────────────────
export const CCN_COMPLIANCE = {
  "1501": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1979": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1597": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "2609": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "3248": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "0016": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "2941": { mutuelle:true, prevoyanceCadre:false, prevoyanceMinima:null },
  "2596": { mutuelle:true, prevoyanceCadre:false, prevoyanceMinima:null },
  "3043": { mutuelle:true, prevoyanceCadre:false, prevoyanceMinima:null },
  "1351": { mutuelle:true, prevoyanceCadre:false, prevoyanceMinima:null },
  "0573": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1527": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1486": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "2120": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1672": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "2343": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1555": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "0413": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "7024": { mutuelle:true, prevoyanceCadre:false, prevoyanceMinima:null },
  "3090": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1090": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1266": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
  "1483": { mutuelle:true, prevoyanceCadre:false, prevoyanceMinima:null },
  "0651": { mutuelle:true, prevoyanceCadre:true,  prevoyanceMinima:"1.50% T1" },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

export function extractIDCC(convention) {
  if (!convention) return "";
  const m = convention.match(/IDCC\s*(\d+)/i);
  return m ? m[1] : "";
}

export function isCDDUsageAutorise(convention) {
  const idcc = extractIDCC(convention);
  if (!idcc) return false;
  return CCN_USAGE_AUTORISE.has(idcc);
}

export function getCDDRegles(sousType, convention) {
  const idcc = extractIDCC(convention);
  const base = { ...(CDD_REGLES[sousType] || CDD_REGLES.standard) };
  if (idcc && CCN_DEROGATIONS[idcc]?.[sousType]) {
    const derog = CCN_DEROGATIONS[idcc][sousType];
    return { ...base, ...derog, noteBase: base.note, hasDerogation: true };
  }
  return { ...base, hasDerogation: false };
}

export function getCDDRegleSummary(sousType, convention) {
  const r = getCDDRegles(sousType, convention);
  const duree = r.dureeMaxMois === null  ? "Pas de durée maximale légale fixée"
    : r.dureeMaxMois === 9               ? "9 mois maximum"
    : r.dureeMaxMois === 18              ? "18 mois maximum (renouvellements inclus)"
    : r.dureeMaxMois === 24              ? "24 mois maximum (renouvellements inclus)"
    : r.dureeMaxMois === 36              ? "36 mois maximum (renouvellements inclus)"
    : r.dureeMaxMois + " mois maximum";
  const renouv = r.renouvMax === null    ? "Pas de limite de renouvellements (vigilance jurisprudence)"
    : r.renouvMax === 0                  ? "Sans renouvellement possible"
    : r.renouvMax === 2                  ? "2 renouvellements maximum"
    : r.renouvMax === 3                  ? "3 renouvellements maximum (dérogation CCN)"
    : r.renouvMax + " renouvellement(s) maximum";
  return { duree, renouv, note: r.note, base: r.base, hasDerogation: r.hasDerogation, noteBase: r.noteBase };
}

// ─── Extended CCN list (200+ IDCC — for autocomplete search) ─────────────────
export const EXTENDED_CCN = [
  {idcc:"16",   label:"Transports routiers et activités auxiliaires"},
  {idcc:"44",   label:"Industries chimiques"},
  {idcc:"86",   label:"Entreprises de propreté et services associés"},
  {idcc:"176",  label:"Industrie pharmaceutique"},
  {idcc:"184",  label:"Entreprises d'architecture"},
  {idcc:"194",  label:"Boulangerie-pâtisserie artisanale"},
  {idcc:"247",  label:"Travaux publics (ETAM)"},
  {idcc:"272",  label:"Travaux publics (ouvriers)"},
  {idcc:"292",  label:"Prévention et sécurité"},
  {idcc:"303",  label:"Imprimeries de labeur"},
  {idcc:"413",  label:"Établissements et services pour personnes inadaptées"},
  {idcc:"454",  label:"Boulangerie-pâtisserie industrielle"},
  {idcc:"493",  label:"Hospitalisation privée à but non lucratif"},
  {idcc:"507",  label:"Librairie"},
  {idcc:"509",  label:"Travail mécanique du bois"},
  {idcc:"514",  label:"Centres équestres"},
  {idcc:"530",  label:"Vins, cidres, jus de fruits"},
  {idcc:"567",  label:"Confiserie, chocolaterie, biscuiterie"},
  {idcc:"573",  label:"Commerce de gros"},
  {idcc:"600",  label:"Banques AFB"},
  {idcc:"609",  label:"Fleuristes, vente et services des animaux"},
  {idcc:"637",  label:"Charcuterie de détail"},
  {idcc:"651",  label:"Hospitalisation privée (cliniques)"},
  {idcc:"675",  label:"Organismes de formation"},
  {idcc:"700",  label:"Commerces de détail non alimentaires"},
  {idcc:"706",  label:"Édition de musique"},
  {idcc:"707",  label:"Édition"},
  {idcc:"717",  label:"Transports aériens (personnels au sol)"},
  {idcc:"804",  label:"Entreprises de services numériques"},
  {idcc:"823",  label:"Industries alimentaires diverses"},
  {idcc:"897",  label:"Entreprises de courtage d'assurances"},
  {idcc:"935",  label:"Services de l'automobile"},
  {idcc:"940",  label:"Pompes funèbres"},
  {idcc:"979",  label:"Hospitalisation à but lucratif"},
  {idcc:"993",  label:"Prestataires de services"},
  {idcc:"1000", label:"Pâtisserie"},
  {idcc:"1010", label:"Boucherie, boucherie-charcuterie"},
  {idcc:"1043", label:"Gardiens, concierges"},
  {idcc:"1059", label:"Appareils ménagers (réparation)"},
  {idcc:"1063", label:"Droit privé des musées"},
  {idcc:"1090", label:"Commerce et réparation automobile"},
  {idcc:"1109", label:"Sport"},
  {idcc:"1111", label:"Industrie textile"},
  {idcc:"1115", label:"Ameublement (fabrication)"},
  {idcc:"1120", label:"Pressing, laverie, teinturerie"},
  {idcc:"1131", label:"Cabinets médicaux"},
  {idcc:"1147", label:"Industrie de la plasturgie"},
  {idcc:"1266", label:"Restauration collective"},
  {idcc:"1315", label:"Notariat"},
  {idcc:"1321", label:"Animation"},
  {idcc:"1351", label:"Sécurité privée"},
  {idcc:"1480", label:"Presse"},
  {idcc:"1483", label:"Textile / Habillement"},
  {idcc:"1486", label:"Bureaux d'études techniques / Syntec"},
  {idcc:"1501", label:"Restauration rapide"},
  {idcc:"1527", label:"Immobilier"},
  {idcc:"1555", label:"Pharmacie"},
  {idcc:"1576", label:"Cabinets dentaires"},
  {idcc:"1597", label:"Bâtiment (ouvriers)"},
  {idcc:"1672", label:"Assurances"},
  {idcc:"1700", label:"Production audiovisuelle"},
  {idcc:"1747", label:"Ambulances"},
  {idcc:"1762", label:"Transport aérien (PNC)"},
  {idcc:"1870", label:"Parcs de loisirs"},
  {idcc:"1975", label:"Hôtellerie de plein air"},
  {idcc:"1979", label:"Hôtels, cafés, restaurants (HCR)"},
  {idcc:"2120", label:"Banques"},
  {idcc:"2216", label:"Commerce de détail alimentaire"},
  {idcc:"2272", label:"Missions locales"},
  {idcc:"2335", label:"Musées et patrimoine"},
  {idcc:"2343", label:"Grande distribution"},
  {idcc:"2494", label:"Aide et soins à domicile"},
  {idcc:"2596", label:"Coiffure"},
  {idcc:"2609", label:"Bâtiment (ETAM)"},
  {idcc:"2717", label:"Assistants maternels"},
  {idcc:"2720", label:"Particuliers employeurs"},
  {idcc:"2941", label:"Aide à domicile"},
  {idcc:"3043", label:"Nettoyage industriel"},
  {idcc:"3090", label:"Spectacle vivant"},
  {idcc:"3097", label:"Spectacle vivant (artistes)"},
  {idcc:"3168", label:"Services à la personne"},
  {idcc:"3220", label:"Portage salarial"},
  {idcc:"3248", label:"Métallurgie"},
  {idcc:"7024", label:"Agriculture"},
];

// ─── Clauses & benefits ──────────────────────────────────────────────────────

export const CLAUSES_LIST = [
  { id: "rupture",        label: "Clause de rupture",         icon: "XCircle" },
  { id: "confidentialite",label: "Confidentialité",           icon: "Lock" },
  { id: "non_divulgation",label: "Non-divulgation",           icon: "EyeOff" },
  { id: "non_concurrence",label: "Non-concurrence",           icon: "Ban" },
  { id: "objectifs",      label: "Objectifs",                 icon: "Target" },
  { id: "mobilite",       label: "Mobilité géographique",     icon: "MapPin" },
  { id: "astreinte",      label: "Astreinte",                 icon: "Bell" },
  { id: "exclusivite",    label: "Exclusivité",               icon: "Star" },
  { id: "dedit_formation",label: "Dédit-formation",           icon: "BookOpen" },
];

// Mutuelle is mandatory by law (Loi ANI 2016) — not an optional benefit
export const AVANTAGES_LIST = [
  { id: "vehicule",   label: "Véhicule de société",          icon: "Car" },
  { id: "repas",      label: "Panier repas / Tickets resto", icon: "Utensils" },
  { id: "logement",   label: "Logement de fonction",         icon: "Home" },
  { id: "telephone",  label: "Téléphone professionnel",      icon: "Smartphone" },
  { id: "ordinateur", label: "Ordinateur / Matériel",        icon: "Laptop" },
];

// ─── Avenant types ────────────────────────────────────────────────────────────

export const AVENANT_TYPES = [
  { value: "renouvellement_cdd",  label: "Renouvellement CDD",                  icon: "CalendarDays", desc: "Prolongation d'un CDD existant" },
  { value: "augmentation_salaire",label: "Augmentation de salaire / primes",    icon: "TrendingUp",   desc: "Modification de la rémunération ou primes" },
  { value: "augmentation_duree",  label: "Modification durée / horaires",       icon: "Clock",        desc: "Changement du temps de travail" },
  { value: "changement_poste",    label: "Changement de poste / qualification", icon: "Briefcase",    desc: "Nouvelle fonction ou qualification" },
  { value: "mutation",            label: "Mutation / Lieu de travail",          icon: "MapPin",       desc: "Changement de lieu d'affectation" },
  { value: "clauses",             label: "Ajout / suppression de clauses",      icon: "FileEdit",     desc: "Non-concurrence, confidentialité, exclusivité…" },
  { value: "periode_essai",       label: "Prolongation période d'essai",        icon: "Timer",        desc: "CDI uniquement – prolongation de la période d'essai" },
  { value: "avantages_nature",    label: "Modification avantages en nature",    icon: "Gift",         desc: "Ajout, retrait ou modification d'avantages" },
  { value: "forfait_jours",       label: "Passage au forfait jours",            icon: "Calendar",     desc: "Cadres autonomes – passage en jours/an" },
];

// ─── Conventions collectives (derived from CCN_DATA) ─────────────────────────

export const CONVENTIONS = CCN_DATA.map(c => c.label);

// ─── Document types ───────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  { value: "cni_fr",              label: "Carte nationale d'identité française (CNI)",                        eea: true },
  { value: "passeport_fr",        label: "Passeport français",                                                eea: true },
  { value: "cni_ue",              label: "Carte d'identité UE / EEE / Suisse",                                eea: true },
  { value: "passeport_ue",        label: "Passeport UE / EEE / Suisse",                                       eea: true },
  { value: "passeport_etranger",  label: "Passeport étranger (hors UE)",                                      eea: false },
  { value: "cs_salarie",          label: "Carte de séjour — Salarié",                                         eea: false },
  { value: "cs_travailleur_temp", label: "Carte de séjour — Travailleur temporaire",                          eea: false },
  { value: "cs_etudiant",         label: "Carte de séjour — Étudiant",                                        eea: false },
  { value: "cs_resident",         label: "Carte de séjour — Résident",                                        eea: false },
  { value: "cs_resident_ld",      label: "Carte de séjour — Résident longue durée-UE",                        eea: false },
  { value: "cs_passeport_talent", label: "Carte de séjour — Passeport talent",                                eea: false },
  { value: "cs_recherche_emploi", label: "Carte de séjour — Recherche d'emploi / création d'entreprise",     eea: false },
  { value: "vls_ts",              label: "VLS-TS (Visa Long Séjour valant Titre de Séjour)",                  eea: false },
  { value: "titre_voyage",        label: "Titre de voyage (réfugié / apatride)",                              eea: false },
  { value: "autre",               label: "Autre document",                                                    eea: false },
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
  typeContrat: "CDI", sousType: "standard", motifCDD: "",
  genre: "",
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
  genre: "",
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

export const NAVY   = "#1e3a5f";   // medium navy — borders, secondary text
export const DARK   = "#0D1B2E";   // deep navy — header background, badge backgrounds
export const ACCENT = "#00E676";   // bright green — CTAs, active states, progress

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
