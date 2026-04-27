// Parse raw OCR text into structured form fields
// Handles: French contracts, CNI, passport, titre de séjour, Carte Vitale

// ── Date helpers ──────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, "0"); }

function toISODate(d, m, y) {
  const day = parseInt(d, 10), mon = parseInt(m, 10), yr = parseInt(y, 10);
  if (day < 1 || day > 31 || mon < 1 || mon > 12 || yr < 1900 || yr > 2100) return "";
  return `${yr}-${pad(mon)}-${pad(day)}`;
}

// MRZ dates are YYMMDD — pivot year 30: <30 → 20xx, >=30 → 19xx
function mrzDateToISO(yymmdd) {
  if (!yymmdd || yymmdd.length < 6) return "";
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const yyyy = yy < 30 ? "20" + pad(yy) : "19" + pad(yy);
  return `${yyyy}-${mm}-${dd}`;
}

// Parse any date string — separators can be / . - or spaces
function parseDate(str) {
  if (!str) return "";
  const m = str.match(/(\d{1,2})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{4})/);
  if (m) return toISODate(m[1], m[2], m[3]);
  return "";
}

// Collect all plausible dates from the text
function allDates(text) {
  const seen = new Set(), out = [];
  const add = (iso) => { if (iso && !seen.has(iso)) { seen.add(iso); out.push(iso); } };
  for (const m of text.matchAll(/\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})\b/g))
    add(toISODate(m[1], m[2], m[3]));
  for (const m of text.matchAll(/\b(\d{1,2})\s+(\d{1,2})\s+((?:19|20)\d{2})\b/g))
    if (parseInt(m[2], 10) <= 12) add(toISODate(m[1], m[2], m[3]));
  return out;
}

function cleanNumber(s) { return (s || "").replace(/\s/g, "").replace(",", "."); }

// ── Nationality code → French label ───────────────────────────────────────────
const NAT_CODE = {
  AFG:"Afghane", ALB:"Albanaise", DZA:"Algérienne", AGO:"Angolaise",
  ARG:"Argentine", ARM:"Arménienne", AUS:"Australienne", AUT:"Autrichienne",
  AZE:"Azerbaïdjanaise", BHS:"Bahamienne", BGD:"Bangladaise", BEL:"Belge",
  BEN:"Béninoise", BOL:"Bolivienne", BIH:"Bosniaque", BRA:"Brésilienne",
  BGR:"Bulgare", BFA:"Burkinabè", BDI:"Burundaise", KHM:"Cambodgienne",
  CMR:"Camerounaise", CAN:"Canadienne", CAF:"Centrafricaine", CHL:"Chilienne",
  CHN:"Chinoise", COL:"Colombienne", COM:"Comorienne", COD:"Congolaise (RDC)",
  COG:"Congolaise (Brazzaville)", CIV:"Ivoirienne", HRV:"Croate", CUB:"Cubaine",
  CYP:"Chypriote", CZE:"Tchèque", DNK:"Danoise", DJI:"Djiboutienne",
  DOM:"Dominicaine", ECU:"Équatorienne", EGY:"Égyptienne", SLV:"Salvadorienne",
  GNQ:"Équato-Guinéenne", ERI:"Érythréenne", EST:"Estonienne", ETH:"Éthiopienne",
  FIN:"Finlandaise", FRA:"Française", GAB:"Gabonaise", GEO:"Géorgienne",
  DEU:"Allemande", GHA:"Ghanéenne", GRC:"Grecque", GTM:"Guatémaltèque",
  GIN:"Guinéenne", GNB:"Guinéenne-Bissauenne", HTI:"Haïtienne", HND:"Hondurienne",
  HUN:"Hongroise", IND:"Indienne", IDN:"Indonésienne", IRN:"Iranienne",
  IRQ:"Irakienne", IRL:"Irlandaise", ISR:"Israélienne", ITA:"Italienne",
  JAM:"Jamaïcaine", JPN:"Japonaise", JOR:"Jordanienne", KAZ:"Kazakhe",
  KEN:"Kényane", XKX:"Kosovare", KWT:"Koweïtienne", KGZ:"Kirghize",
  LAO:"Laotienne", LVA:"Lettone", LBN:"Libanaise", LBR:"Libérienne",
  LBY:"Libyenne", LTU:"Lituanienne", LUX:"Luxembourgeoise", MDG:"Malgache",
  MWI:"Malawite", MYS:"Malaisienne", MDV:"Maldivienne", MLI:"Malienne",
  MLT:"Maltaise", MRT:"Mauritanienne", MEX:"Mexicaine", MDA:"Moldave",
  MCO:"Monégasque", MNG:"Mongole", MNE:"Monténégrine", MAR:"Marocaine",
  MOZ:"Mozambicaine", NAM:"Namibienne", NPL:"Népalaise", NLD:"Néerlandaise",
  NZL:"Néo-Zélandaise", NIC:"Nicaraguayenne", NER:"Nigérienne", NGA:"Nigériane",
  PRK:"Coréenne (Nord)", NOR:"Norvégienne", OMN:"Omanaise", PAK:"Pakistanaise",
  PAN:"Panaméenne", PRY:"Paraguayenne", PER:"Péruvienne", PHL:"Philippine",
  POL:"Polonaise", PRT:"Portugaise", QAT:"Qatarienne", ROU:"Roumaine",
  RUS:"Russe", RWA:"Rwandaise", SAU:"Saoudienne", SEN:"Sénégalaise",
  SRB:"Serbe", SLE:"Sierra-Léonaise", SVK:"Slovaque", SVN:"Slovène",
  SOM:"Somalienne", ZAF:"Sud-Africaine", KOR:"Coréenne (Sud)", ESP:"Espagnole",
  LKA:"Sri-Lankaise", SDN:"Soudanaise", SWE:"Suédoise", CHE:"Suisse",
  SYR:"Syrienne", TWN:"Taïwanaise", TJK:"Tadjike", TZA:"Tanzanienne",
  THA:"Thaïlandaise", TLS:"Timoraise", TGO:"Togolaise", TUN:"Tunisienne",
  TUR:"Turque", TKM:"Turkmène", UGA:"Ougandaise", UKR:"Ukrainienne",
  ARE:"Émiratie", GBR:"Britannique", USA:"Américaine", URY:"Uruguayenne",
  UZB:"Ouzbèke", VEN:"Vénézuélienne", VNM:"Vietnamienne", YEM:"Yéménite",
  ZMB:"Zambienne", ZWE:"Zimbabwéenne",
};

function codeToNat(code) {
  return NAT_CODE[code?.toUpperCase()] || code || "";
}

// ── MRZ parser ────────────────────────────────────────────────────────────────
// Supports TD1 (3×30 — carte de séjour, CNI) and TD3 (2×44 — passport)
function parseMRZ(text) {
  const lines = text.split("\n").map(l => l.replace(/\s/g, "").toUpperCase());

  // Collect lines that look like MRZ (all A-Z, 0-9, or <, length ≥ 20)
  const mrzLines = lines.filter(l => l.length >= 20 && /^[A-Z0-9<]+$/.test(l));
  if (mrzLines.length < 2) return null;

  // TD1: 3 lines, each ~30 chars (titre de séjour, CNI)
  if (mrzLines.length >= 3) {
    const l1 = mrzLines[mrzLines.length - 3];
    const l2 = mrzLines[mrzLines.length - 2];
    const l3 = mrzLines[mrzLines.length - 1];

    // Line 3 carries the name: SURNAME<<GIVENNAME<<<
    const nameParts = l3.split("<<");
    const surname   = nameParts[0]?.replace(/</g, " ").trim() || "";
    const givenName = nameParts[1]?.split("<").filter(Boolean).join(" ").trim() || "";

    // Line 2: YYMMDD + check + sex + YYMMDD (expiry) + check + nationality
    const l2m = l2.match(/^(\d{6})\d([MFX<])(\d{6})\d([A-Z]{3})/);
    const birthDate  = l2m ? mrzDateToISO(l2m[1]) : "";
    const sex        = l2m ? l2m[2] : "";
    const expiryDate = l2m ? mrzDateToISO(l2m[3]) : "";
    const natCode    = l2m ? l2m[4] : "";

    // Line 1: doc type (2) + country (3) + document number (9) + check + ...
    // Strip non-alpha-numeric prefix chars to find the 9-char doc number
    const docNumMatch = l1.match(/[A-Z]{2}[A-Z]{3}([A-Z0-9]{9})/);
    const docNumber   = docNumMatch ? docNumMatch[1].replace(/</g, "") : "";

    // Personal number — often in line 2, positions 29+ (TD1 optional field)
    const personalNum = l2.length >= 29 ? l2.slice(18, 28).replace(/</g, "") : "";

    return { surname, givenName, birthDate, sex, expiryDate, natCode, docNumber, personalNum };
  }

  // TD3: 2 lines, each ~44 chars (passport)
  if (mrzLines.length >= 2) {
    const l1 = mrzLines[mrzLines.length - 2];
    const l2 = mrzLines[mrzLines.length - 1];

    const nameParts = l1.slice(5).split("<<");
    const surname   = nameParts[0]?.replace(/</g, " ").trim() || "";
    const givenName = nameParts[1]?.split("<").filter(Boolean).join(" ").trim() || "";

    const l2m = l2.match(/^([A-Z0-9<]{9})\d([A-Z]{3})(\d{6})\d([MFX<])(\d{6})/);
    const docNumber  = l2m ? l2m[1].replace(/</g, "") : "";
    const natCode    = l2m ? l2m[2] : "";
    const birthDate  = l2m ? mrzDateToISO(l2m[3]) : "";
    const sex        = l2m ? l2m[4] : "";
    const expiryDate = l2m ? mrzDateToISO(l2m[5]) : "";

    return { surname, givenName, birthDate, sex, expiryDate, natCode, docNumber, personalNum: "" };
  }

  return null;
}

// ── Carte Vitale extraction ───────────────────────────────────────────────────
function parseCarteVitale(text) {
  // NIR: 15 digits starting with 1 or 2
  const nirMatch = text.match(/\b([12]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{3}\s*\d{2})\b/);
  const numSecu  = nirMatch ? nirMatch[1].replace(/\s/g, "") : "";

  // Issue date
  const dates = allDates(text);
  const issueDate = dates[0] || "";

  // Name — usually on one of the first lines, all caps
  const nameMatch = text.match(/([A-ZÀ-Ÿ]{2,}\s+[A-ZÀ-Ÿa-zà-ÿ]{2,})/);
  const fullName  = nameMatch ? nameMatch[1].trim() : "";
  const nameParts = fullName.split(/\s+/);
  const nom    = nameParts.find(p => p === p.toUpperCase() && p.length > 1) || "";
  const prenom = nameParts.find(p => p !== nom) || "";

  return { numSecu, dateSignature: issueDate, nom, prenom };
}

// ── Name extraction (text-based, no MRZ) ─────────────────────────────────────
function extractName(t) {
  let nom = "", prenom = "";

  // "NOM : DUPONT" or "NOM DE FAMILLE : DUPONT" — same line with colon
  const r1 = t.match(/\bNOM(?:\s+DE\s+FAMILLE)?\s*[:\-]\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-]{1,40}?)(?:\s*\n|\s{2,}|$)/im);
  if (r1) nom = r1[1].trim().split(/\s+/)[0];

  // "NOM DUPONT" — no colon (OCR artifact, label immediately before value)
  if (!nom) {
    const r2 = t.match(/^NOM\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-]{1,30})$/im);
    if (r2) nom = r2[1].trim();
  }

  // "NOM\nDUPONT" — label on its own line
  if (!nom) {
    const r3 = t.match(/^NOM(?:\s+DE\s+FAMILLE)?\s*\n\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-]+)/im);
    if (r3) nom = r3[1].trim();
  }

  // PRÉNOM(S)
  const p1 = t.match(/\bPR[EÉ]NOMS?\s*[:\-]\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\-\s]{1,50}?)(?=\n|Né|Date|N°|$)/im);
  if (p1) prenom = p1[1].trim().split(/\s+/)[0];

  if (!prenom) {
    const p2 = t.match(/^PR[EÉ]NOMS?\s*\n\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\-\s]+)/im);
    if (p2) prenom = p2[1].trim().split(/\s+/)[0];
  }

  // "M. DUPONT Jean" / "Mme DUPONT Jeanne"
  if (!nom || !prenom) {
    const r4 = t.match(/(?:M\.|Mme\.?|Monsieur|Madame)\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-]+)\s+([A-ZÀ-Ÿa-zà-ÿ][a-zà-ÿ\-]+)/);
    if (r4) { if (!nom) nom = r4[1]; if (!prenom) prenom = r4[2]; }
  }

  return { nom, prenom };
}

// ── Main export ───────────────────────────────────────────────────────────────
export function parseText(text) {
  if (!text) return {};

  const t = text;
  const T = text.toUpperCase();

  // ── Detect document type ─────────────────────────────────────────────────
  const isCarteVitale    = /carte\s+vitale|vitale|assurance\s+maladie/i.test(t);
  const isTitreSejour    = /titre\s+de\s+s[eé]jour|carte\s+de\s+r[eé]sident|r[eé]sident\s+permanent|carte\s+de\s+s[eé]jour/i.test(t);
  const isPasseport      = /passeport|passport/i.test(t);

  // ── Carte Vitale ─────────────────────────────────────────────────────────
  if (isCarteVitale) {
    return parseCarteVitale(t);
  }

  // ── MRZ-first path (titre de séjour, CNI, passeport) ────────────────────
  const mrz = parseMRZ(t);

  let nom = "", prenom = "";

  if (mrz?.surname)   nom    = mrz.surname;
  if (mrz?.givenName) prenom = mrz.givenName;

  // Fill from text labels if MRZ missed them
  const nameFromText = extractName(t);
  if (!nom)    nom    = nameFromText.nom;
  if (!prenom) prenom = nameFromText.prenom;

  // ── Date of birth ────────────────────────────────────────────────────────
  let dateNaissance = mrz?.birthDate || "";
  if (!dateNaissance) {
    const birthPats = [
      /(?:n[eé](?:e)?\s+le\s*[:\-]?|date\s+de\s+naissance\s*[:\-]?)\s*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
      /naiss[^\n]*\n\s*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
    ];
    for (const p of birthPats) {
      const m = t.match(p);
      if (m) { dateNaissance = parseDate(m[1]); if (dateNaissance) break; }
    }
    // Last resort: first plausible date in text
    if (!dateNaissance) {
      const dates = allDates(t);
      if (dates.length) dateNaissance = dates[0];
    }
  }

  // ── Place of birth ───────────────────────────────────────────────────────
  const placePats = [
    /n[eé](?:e)?\s+le\s+[\d\/\.\-\s]+[àa]\s*[:\-]?\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\(\)\-]+?)(?=\n|$)/i,
    /lieu\s+de\s+naissance\s*[:\-]?\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\(\)\-]+?)(?=\n|$)/i,
    /lieu\s+de\s+naissance\s*\n\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\(\)\-]+?)(?=\n|$)/i,
  ];
  let lieuNaissance = "";
  for (const p of placePats) {
    const m = t.match(p);
    if (m) { lieuNaissance = m[1].trim().replace(/\s{2,}/g, " "); break; }
  }

  // ── Nationality ──────────────────────────────────────────────────────────
  let nationalite = "";
  if (mrz?.natCode) {
    nationalite = codeToNat(mrz.natCode);
  }
  if (!nationalite) {
    const natM = t.match(/(?:nationalit[eé]|de\s+nationalit[eé])\s*[:\-\s]\s*([A-ZÀ-Ÿa-zà-ÿ]+(?:\s+[A-ZÀ-Ÿa-zà-ÿ]+)?)/i);
    if (natM) nationalite = natM[1].trim();
  }

  // ── Titre de séjour number / document number ─────────────────────────────
  let titreSejour = mrz?.docNumber || "";
  if (!titreSejour) {
    const tsM = t.match(/(?:n[°o]?\s*(?:du\s+)?titre|titre\s+de\s+s[eé]jour\s*n[°o]?|carte\s+de\s+s[eé]jour\s*n[°o]?|num[eé]ro\s+de\s+carte)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]{3,})/i);
    if (tsM) titreSejour = tsM[1];
  }

  // ── Social security / NIR ─────────────────────────────────────────────────
  const secuM = t.match(/(?:s[eé]curit[eé]\s+sociale|n[°o]\s*s[eé]cu[^\d]*|NIR\s*[:\-]?|num[eé]ro\s+personnel)\s*[:\-]?\s*([12]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{3}\s*\d{0,2})/i);
  let numSecu = secuM ? secuM[1].replace(/\s+/g, " ").trim() : "";
  // Also try MRZ personal number for titre de séjour
  if (!numSecu && mrz?.personalNum && mrz.personalNum.length >= 6) {
    numSecu = mrz.personalNum;
  }

  // ── Employee address ─────────────────────────────────────────────────────
  const addrM = t.match(/(?:r[eé]sidant\s+au|demeurant\s+(?:au|[àa])?|adresse\s*[:\-]?)\s*([^\n]{10,})/i);
  const adresseSalarie = addrM ? addrM[1].trim() : "";

  // ── Validity / expiry date ────────────────────────────────────────────────
  let validUntil = mrz?.expiryDate || "";
  if (!validUntil) {
    const expM = t.match(/(?:valable\s+jusqu.au|expir[ea]s?\s*[:\-]?|valid\s+until\s*[:\-]?|fin\s+de\s+validit[eé]\s*[:\-]?)\s*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i);
    if (expM) validUntil = parseDate(expM[1]);
  }

  // ── Contract fields ───────────────────────────────────────────────────────
  const typeContrat = /\bCDD\b/.test(T) ? "CDD" : /\bCDI\b/.test(T) ? "CDI" : "";

  const siretM = t.match(/(?:SIRET\s*[:\s]?\s*)(\d[\d\s]{12,16}\d)/i);
  const siret  = siretM ? siretM[1].replace(/\s/g, "").slice(0, 14) : "";

  const apeM   = t.match(/(?:APE|NAF|code\s+APE)\s*[:\s]*([0-9]{4}[A-Z])/i);
  const codeAPE = apeM ? apeM[1] : "";

  const companyM = t.match(/(?:l.entreprise|soci[eé]t[eé])\s+((?:SARL|SAS|SASU|EURL|SA|EI|EIRL|SNC)\s+[A-ZÀ-Ÿa-zà-ÿ\s]+)/i);
  const nomEntreprise = companyM ? companyM[1].trim() : "";
  const formeM = nomEntreprise.match(/^(SARL|SASU|SAS|EURL|SA|EI|EIRL|SNC)/i);
  const formeJuridique = formeM ? formeM[1].toUpperCase() : "";

  const siegeM = t.match(/si[eè]ge\s+social\s+(?:est\s+)?situ[eé]\s+[àa]\s*[:\s]*([^\n]+)/i);
  const adresseSiege = siegeM ? siegeM[1].trim() : "";

  const urssafM = t.match(/Urssaf\s+(?:de\s+)?([A-ZÀ-Ÿa-zà-ÿ\-]+)/i);
  const villeUrssaf = urssafM ? urssafM[1].trim() : "";

  const dates = allDates(t);

  const dDebutM = t.match(/(?:[àa]\s+partir\s+du|d[eé]butera?|embauche|prise\s+de\s+poste)\s+(?:le\s+|du\s+)?(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i);
  const dateDebut = dDebutM ? parseDate(dDebutM[1]) : (dates[0] || "");

  const dFinM = t.match(/(?:jusqu.au|fin\s+le|se\s+termine\s+le)\s+(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i);
  const dateFin = dFinM ? parseDate(dFinM[1]) : (dates[1] || "");

  const essaiM = t.match(/p[eé]riode\s+d.essai\s+de\s+(\d+)\s*(jours?|semaines?|mois)/i);
  let periodEssai = "";
  if (essaiM) {
    const v = parseInt(essaiM[1]);
    const u = essaiM[2].toLowerCase();
    periodEssai = u.includes("semain") ? String(v * 7) : u.includes("mois") ? String(v * 30) : String(v);
  }

  const fonctionM = t.match(/(?:fonction\s+(?:de\s+|d.)?|poste\s+(?:de\s+|d.')?|exercera\s+la\s+fonction\s+d.)([^\.\n,]+)/i);
  const fonction  = fonctionM ? fonctionM[1].trim() : "";

  const heurSM  = t.match(/(\d+)\s*h(?:eures?)?\s*(?:par\s*semaine|hebdomadaire)/i);
  const heuresParSemaine = heurSM ? heurSM[1] : "";

  const heurMM  = t.match(/(\d+[.,]\d+)\s*h(?:eures?)?\s*(?:par\s*mois|mensuell)/i);
  const heuresMensuelles = heurMM ? cleanNumber(heurMM[1]) : "";

  const tauxM   = t.match(/taux\s+horaire\s+(?:brut\s+)?(?:de\s+)?[:\-]?\s*(\d+[.,]\d+)/i);
  const tauxHoraire = tauxM ? cleanNumber(tauxM[1]) : "";

  const salM    = t.match(/(\d[\d\s]+[.,]\d{2})\s*(?:€|euros?)\s*(?:brut|mensuel)/i);
  const salaireBrut = salM ? cleanNumber(salM[1]) : "";

  const ccnM    = t.match(/convention\s+(?:collective\s+)?(?:nationale\s+)?(?:de\s+la\s+)?([^\.\n]+?)(?:\s+IDCC\s*(\d+))?[\.\n]/i);
  const convention = ccnM ? ccnM[1].trim() + (ccnM[2] ? ` (IDCC ${ccnM[2]})` : "") : "";

  const lieuSigM = t.match(/[Ff]ait\s+[àa]\s+([A-ZÀ-Ÿa-zà-ÿ\-]+)/);
  const lieuSignature = lieuSigM ? lieuSigM[1] : "";

  const dateSigM = t.match(/[Ff]ait\s+[àa]\s+[^,]+,?\s+le\s+(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/);
  const dateSignature = dateSigM ? parseDate(dateSigM[1]) : "";

  const result = {
    typeContrat, nomEntreprise, formeJuridique, siret, codeAPE,
    adresseSiege, villeUrssaf,
    nom, prenom, adresseSalarie, nationalite, titreSejour,
    dateNaissance, lieuNaissance, numSecu,
    dateDebut, dateFin, periodEssai, fonction,
    heuresParSemaine, heuresMensuelles, tauxHoraire, salaireBrut,
    convention, lieuSignature, dateSignature,
    // Extra fields used downstream (filtered out if empty)
    _validUntil: validUntil,
  };

  return Object.fromEntries(Object.entries(result).filter(([, v]) => v !== ""));
}
