// Parse raw OCR text into structured form fields
// Handles: French contracts, CNI, passport, titre de séjour, Carte Vitale

// ── Date helpers ──────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, "0"); }

function toISODate(d, m, y) {
  const day = parseInt(d, 10), mon = parseInt(m, 10), yr = parseInt(y, 10);
  if (day < 1 || day > 31 || mon < 1 || mon > 12 || yr < 1900 || yr > 2100) return "";
  return `${yr}-${pad(mon)}-${pad(day)}`;
}

// MRZ dates are YYMMDD.
// Context-aware pivot: birth dates live in the past (>15 years ago),
// expiry dates live in the near future (≤30 years ahead).
function mrzDateToISO(yymmdd, isExpiry = false) {
  if (!yymmdd || yymmdd.length < 6) return "";
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  if (isNaN(yy)) return "";
  const currentYear = new Date().getFullYear();
  const y20 = 2000 + yy;
  const y19 = 1900 + yy;
  if (isExpiry) {
    // Prefer 2000+yy when it falls in a reasonable validity window
    if (y20 >= currentYear - 5 && y20 <= currentYear + 30) return `${y20}-${mm}-${dd}`;
    return `${y19}-${mm}-${dd}`;
  } else {
    // Birth date: must be in the past (person already born)
    if (y20 <= currentYear - 15) return `${y20}-${mm}-${dd}`;
    if (y19 <= currentYear - 15) return `${y19}-${mm}-${dd}`;
    return `${y20}-${mm}-${dd}`;
  }
}

// Parse any date string — separators can be / . - or spaces
function parseDate(str) {
  if (!str) return "";
  // Normalize common OCR digit confusables before parsing
  const s = str.replace(/[oO]/g, "0").replace(/[iIl|]/g, "1");
  const m = s.match(/(\d{1,2})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{4})/);
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

// ── OCR artifact normalization ────────────────────────────────────────────────

// Normalize a string that is expected to be purely numeric
// (NIR, document numbers, etc.)
function normDigits(s) {
  return (s || "")
    .replace(/[oO]/g,    "0")
    .replace(/[iIl|]/g,  "1")
    .replace(/[sS]/g,    "5")   // only in ambiguous digit contexts
    .replace(/[bB]/g,    "8");
}

// Normalize a MRZ line: remove spaces, uppercase, fix common confusables
function normMRZLine(line) {
  return line
    .replace(/\s+/g, "")          // OCR often inserts spaces within MRZ
    .toUpperCase()
    .replace(/O/g, "0")           // O → 0 everywhere in MRZ
    .replace(/[^A-Z0-9<]/g, "<"); // any unknown char → filler
}

// ── Extract NIR / Numéro de Sécurité Sociale ─────────────────────────────────
// More robust than a single regex: normalises OCR artefacts first, then matches
function findNIR(text) {
  // Work on a copy with digit artefacts fixed
  const t = text.replace(/[oO]/g, "0").replace(/[iIl|]/g, "1");
  // Pattern: starts with 1 or 2, followed by exactly 14 more digits (optional spaces between)
  const m = t.match(/\b([12](?:\s*\d){14})\b/);
  if (!m) return "";
  const digits = m[1].replace(/\s/g, "");
  if (digits.length !== 15) return "";
  // Return with canonical French spacing: X XX XX XX XXX XXX XX
  return `${digits[0]} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 10)} ${digits.slice(10, 13)} ${digits.slice(13, 15)}`;
}

// ── Nationality code → French label ──────────────────────────────────────────
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

// Reverse OCR confusables in 3-letter all-alpha fields (nationality, country codes)
// In letter-only positions: 0→O, 5→S, 1→I, 8→B
function fixAlpha3(s) {
  return (s || "").replace(/0/g, "O").replace(/5/g, "S").replace(/1/g, "I").replace(/8/g, "B");
}

// ── MRZ parser ────────────────────────────────────────────────────────────────
// Supports TD1 (3×30 — carte de séjour, CNI) and TD3 (2×44 — passport)
function parseMRZ(text) {
  const rawLines  = text.split("\n").map(l =>
    l.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9<]/g, "<")
  );
  const normLines = text.split("\n").map(l => normMRZLine(l));

  // Identify MRZ line indices using normalized version (O→0 helps flag digit-heavy lines)
  const mrzIdxs = [];
  normLines.forEach((l, i) => {
    if (l.length >= 20 && /^[A-Z0-9<]+$/.test(l)) mrzIdxs.push(i);
  });
  if (mrzIdxs.length < 2) return null;

  // nLines: normalized (O→0) — for date/check/nat numeric fields
  // rLines: raw (no O→0) — for name fields (O is a letter in names)
  const nLines = mrzIdxs.map(i => normLines[i]);
  const rLines = mrzIdxs.map(i => rawLines[i]);

  // TD1: 3 lines, each ~30 chars (titre de séjour, CNI)
  if (nLines.length >= 3) {
    const l1n = nLines[nLines.length - 3];
    const l2n = nLines[nLines.length - 2];
    const l3r = rLines[rLines.length - 1]; // raw: names must not have O→0

    // Line 3 (raw): SURNAME<<GIVENNAME<<<
    const nameParts = l3r.split("<<");
    const surname   = (nameParts[0] || "").replace(/</g, " ").trim();
    const givenName = (nameParts[1] || "").split("<").filter(Boolean).join(" ").trim();

    // Line 2 (normalized): dates and nationality
    // Allow [A-Z0-9]{6} for dates (OCR can read digits as letters), then normDigits()
    // Allow [A-Z0-9<] for check digits (OCR artifacts), [A-Z0-9]{3} for nat (then fixAlpha3)
    const l2m = l2n.match(/^([A-Z0-9]{6})[A-Z0-9<]([A-Z<])([A-Z0-9]{6})[A-Z0-9<]([A-Z0-9]{3})/);
    const birthDate  = l2m ? mrzDateToISO(normDigits(l2m[1]), false) : "";
    const sex        = l2m ? (l2m[2] === "M" || l2m[2] === "F" ? l2m[2] : "") : "";
    const expiryDate = l2m ? mrzDateToISO(normDigits(l2m[3]), true)  : "";
    const natCode    = l2m ? fixAlpha3(l2m[4]) : "";

    // Line 1: doc type (2) + country (3) + document number (9) + check
    const docNumMatch = l1n.match(/[A-Z0-9]{2}[A-Z0-9]{3}([A-Z0-9]{9})/);
    const docNumber   = docNumMatch ? docNumMatch[1].replace(/</g, "") : "";

    // Personal number — TD1: optional field in line 1 positions 15-29
    let personalNum = "";
    if (l1n.length >= 29) {
      const optField = l1n.slice(15, 30).replace(/</g, "");
      if (/^\d{6,}$/.test(optField)) personalNum = optField;
    }
    if (!personalNum && l2n.length >= 29) {
      const raw = l2n.slice(18, 28).replace(/</g, "");
      if (/^\d{6,}$/.test(raw)) personalNum = raw;
    }

    return { surname, givenName, birthDate, sex, expiryDate, natCode, docNumber, personalNum };
  }

  // TD3: 2 lines, each ~44 chars (passport)
  if (nLines.length >= 2) {
    const l1n = nLines[nLines.length - 2];
    const l1r = rLines[rLines.length - 2]; // raw for name
    const l2n = nLines[nLines.length - 1];

    const nameParts = l1r.slice(5).split("<<");
    const surname   = (nameParts[0] || "").replace(/</g, " ").trim();
    const givenName = (nameParts[1] || "").split("<").filter(Boolean).join(" ").trim();

    const l2m = l2n.match(/^([A-Z0-9<]{9})[A-Z0-9<]([A-Z0-9]{3})([A-Z0-9]{6})[A-Z0-9<]([A-Z<])([A-Z0-9]{6})/);
    const docNumber  = l2m ? l2m[1].replace(/</g, "") : "";
    const natCode    = l2m ? fixAlpha3(l2m[2]) : "";
    const birthDate  = l2m ? mrzDateToISO(normDigits(l2m[3]), false) : "";
    const sex        = l2m ? (l2m[4] === "M" || l2m[4] === "F" ? l2m[4] : "") : "";
    const expiryDate = l2m ? mrzDateToISO(normDigits(l2m[5]), true)  : "";

    return { surname, givenName, birthDate, sex, expiryDate, natCode, docNumber, personalNum: "" };
  }

  return null;
}

// ── Carte Vitale extraction ───────────────────────────────────────────────────
function parseCarteVitale(text) {
  // Use the robust NIR extractor (handles OCR artefacts)
  const numSecu = findNIR(text);

  // Issue date
  const dates = allDates(text);
  const issueDate = dates[0] || "";

  // Name — usually on the right side of the card, all caps
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

  // Titre de séjour / Carte de résident:
  // "NOMS Prénoms / SURNAMES Forenames\nTRAORE*\nSalimah"
  const tsM = t.match(/(?:SURNAMES?\s+Forenames?|NOMS?\s+Pr[eé]noms?)[^\n]*\n[ \t]*([^\n]+?)\s*\n[ \t]*([^\n]+)/i);
  if (tsM) {
    // Strip asterisk from surname (appears in some titre de séjour formats)
    const rawNom    = tsM[1].replace(/\*/g, "").replace(/[^A-ZÀ-ŸÀ-ÿa-z\s\-]/gi, "").trim();
    const rawPrenom = tsM[2].replace(/[^A-ZÀ-ŸÀ-ÿa-z\s\-]/gi, "").trim();
    if (rawNom && rawPrenom) {
      nom    = rawNom.toUpperCase();
      prenom = rawPrenom.split(/\s+/)[0];
      return { nom, prenom };
    }
  }

  // "TRAORE*\nSalimah" — all-caps surname with asterisk, then given name on next line
  if (!nom) {
    const m = t.match(/\b([A-ZÀ-Ÿ]{2,30})\s*\*\s*\n[ \t]*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\-]{1,30})/);
    if (m) { nom = m[1]; prenom = m[2].split(/\s+/)[0]; }
  }

  // "NOM : DUPONT" or "NOM DE FAMILLE : DUPONT"
  const r1 = t.match(/\bNOM(?:\s+DE\s+FAMILLE)?\s*[:\-]\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-]{1,40}?)(?:\s*\n|\s{2,}|$)/im);
  if (r1) nom = r1[1].trim().split(/\s+/)[0];

  if (!nom) {
    const r2 = t.match(/^NOM\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\-]{1,30})$/im);
    if (r2) nom = r2[1].trim();
  }

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
  const isCarteVitale = /carte\s+vitale|vitale|assurance\s+maladie/i.test(t);
  const isTitreSejour = /titre\s+de\s+s[eé]jour|carte\s+de\s+r[eé]sident|r[eé]sident\s+permanent|carte\s+de\s+s[eé]jour/i.test(t);
  const isPasseport   = /passeport|passport/i.test(t);

  function detectTypeDocument() {
    if (/carte\s+de\s+r[eé]sident\s+(?:longue\s+dur[eé]e|ld)/i.test(t)) return "cs_resident_ld";
    if (/carte\s+de\s+r[eé]sident/i.test(t))                              return "cs_resident";
    if (/passeport\s+talent/i.test(t))                                    return "cs_passeport_talent";
    if (/[eé]tudiant/i.test(t) && isTitreSejour)                          return "cs_etudiant";
    if (/travailleur\s+saisonnier/i.test(t))                              return "cs_saisonnier";
    if (/vie\s+priv[eé]e|vie\s+familiale/i.test(t))                       return "cs_vie_privee";
    if (isTitreSejour)                                                     return "cs_travailleur_temporaire";
    if (/passeport/i.test(t) && /france|français/i.test(t))               return "passeport_fr";
    if (/passeport/i.test(t))                                              return "passeport_etranger";
    if (/carte\s+(?:nationale\s+d.identit[eé]|d.identit[eé])\s*(?:fran[cç]aise|france)?/i.test(t)) return "cni_fr";
    return "";
  }

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
      // "DATE DE NAISSANCE / BIRTH DATE" header then date on next line
      /(?:date\s+de\s+naissance|birth\s+date)[^\n]*\n[ \t]*[^\n]*?(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
      // "F SEN 01 01 1988" — sex + nat code + space-separated date
      /\b[MFX<]\s+[A-Z]{3}\s+(\d{1,2}\s+\d{1,2}\s+(?:19|20)\d{2})\b/,
      // "F Utopia 01/01/2000" — spelled-out nationality, slash-separated date
      /\b[MFX<]\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,20}\s+(\d{1,2}\/\d{1,2}\/(?:19|20)\d{2})\b/,
      // "DATE DE NAISSANCE\n01 01 1988" — date on next line (space-separated)
      /date\s+de\s+naissance[^\n]*\n[ \t]*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
      /(?:n[eé](?:e)?\s+le\s*[:\-]?|date\s+de\s+naissance\s*[:\-]?)\s*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
      /birth\s+date[^\n]*\n[ \t]*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
      /naiss[^\n]*\n\s*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i,
    ];
    for (const p of birthPats) {
      const m = t.match(p);
      if (m) { dateNaissance = parseDate(m[1]); if (dateNaissance) break; }
    }
    // Last resort: first date that could plausibly be a birth date (15–100 years ago)
    if (!dateNaissance) {
      const currentYear = new Date().getFullYear();
      const dates = allDates(t);
      dateNaissance = dates.find(d => {
        const yr = parseInt(d.slice(0, 4));
        return yr >= currentYear - 100 && yr <= currentYear - 15;
      }) || "";
    }
  }

  // ── Place of birth ───────────────────────────────────────────────────────
  const placePats = [
    /lieu\s+de\s+naissance[^\n]*\n[ \t]*([A-ZÀ-Ÿa-zà-ÿ][^\n]{2,40})/i,
    /n[eé](?:e)?\s+le\s+[\d\/\.\-\s]+[àa]\s*[:\-]?\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\(\)\-]+?)(?=\n|$)/i,
    /lieu\s+de\s+naissance\s*[:\-]?\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s\(\)\-]+?)(?=\n|$)/i,
  ];
  let lieuNaissance = "";
  for (const p of placePats) {
    const m = t.match(p);
    if (m) { lieuNaissance = m[1].trim().replace(/\s{2,}/g, " "); break; }
  }

  // ── Nationality ──────────────────────────────────────────────────────────
  let nationalite = "";
  if (mrz?.natCode) nationalite = codeToNat(mrz.natCode);

  // Titre de séjour inline: "NATIONALITÉ / NAT." label then 3-letter code
  if (!nationalite) {
    const m = t.match(/\bNAT(?:IONALIT[EÉ])?\.\s+([A-Z]{3})\b/);
    if (m) nationalite = codeToNat(m[1]);
  }
  // "M AFG 22 10 1996" or "F SEN 01 01 1988"
  if (!nationalite) {
    const m3 = t.match(/\b[MF]\s+([A-Z]{3})\s+\d{1,2}[\s\/]\d{1,2}[\s\/](?:19|20)\d{2}\b/);
    if (m3) nationalite = codeToNat(m3[1]);
  }
  if (!nationalite) {
    // Spelled-out nationality: "F Utopia 01/01/2000"
    const msp = t.match(/\b[MF]\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,20}?)\s+\d{1,2}[\/\s]\d{1,2}[\/\s](?:19|20)\d{2}\b/);
    if (msp) {
      const raw = msp[1].trim();
      nationalite = NAT_CODE[raw.toUpperCase()] || raw;
    }
  }
  if (!nationalite) {
    // Require explicit colon/slash separator to avoid matching "République Française" boilerplate
    const natM = t.match(/\bNATIONALIT[EÉ](?:Y)?\s*[:\-\/]\s*([A-ZÀ-Ÿa-zà-ÿ]{3,})/i);
    if (natM) {
      const raw = natM[1].trim();
      // Skip if it looks like the issuing country header, not the holder's nationality
      if (!/^(FRANÇAISE?|FRANCE|REPUBLIC|REPUBLIQUE)$/i.test(raw)) {
        nationalite = raw;
      }
    }
  }

  // ── Titre de séjour number / document number ─────────────────────────────
  let titreSejour = mrz?.docNumber || "";
  if (!titreSejour) {
    const m = t.match(/TITRE\s+DE\s+S[EÉ]JOUR\s+([A-Z0-9]{6,12})\b/i);
    if (m) titreSejour = m[1];
  }
  if (!titreSejour) {
    const tsM = t.match(/(?:n[°o]?\s*(?:du\s+)?titre|titre\s+de\s+s[eé]jour\s*n[°o]?|carte\s+de\s+s[eé]jour\s*n[°o]?|num[eé]ro\s+de\s+carte)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]{3,})/i);
    if (tsM) titreSejour = tsM[1];
  }

  // ── Social security / NIR ─────────────────────────────────────────────────
  // Use the robust findNIR function first
  let numSecu = findNIR(t);
  // Fallback: explicit label-based extraction
  if (!numSecu) {
    const secuM = t.match(/(?:s[eé]curit[eé]\s+sociale|n[°o]\s*s[eé]cu[^\d]*|NIR\s*[:\-]?)\s*[:\-]?\s*([12oO][0-9oOiIlL\s]{17,22}[0-9oOiIlL]{2})/i);
    if (secuM) {
      const raw = normDigits(secuM[1].replace(/\s+/g, " ").trim());
      const digits = raw.replace(/\s/g, "");
      if (digits.length === 15) numSecu = `${digits[0]} ${digits.slice(1,3)} ${digits.slice(3,5)} ${digits.slice(5,7)} ${digits.slice(7,10)} ${digits.slice(10,13)} ${digits.slice(13,15)}`;
      else numSecu = secuM[1].replace(/\s+/g, " ").trim();
    }
  }
  // Personal number from titre de séjour MRZ
  if (!numSecu && mrz?.personalNum && mrz.personalNum.length >= 6) {
    numSecu = mrz.personalNum;
  }
  // Numéro personnel label on front of card
  if (!numSecu) {
    const m = t.match(/(?:NUM[EÉ]RO\s+PERSONNEL|PERSONAL\s+NUMBER)[^\n]*\n?\s*(\d{6,15})/i);
    if (m) numSecu = normDigits(m[1]);
  }

  // ── Employee address ─────────────────────────────────────────────────────
  let adresseSalarie = "";
  const addrCardM = t.match(/adresse[^\n]*\n[ \t]*(\d+[^\n]+)\n[ \t]*(\d{5}[^\n]+)/i);
  if (addrCardM) {
    adresseSalarie = `${addrCardM[1].trim()} ${addrCardM[2].trim()}`.replace(/\s{2,}/g, " ");
  }
  if (!adresseSalarie) {
    const addrM = t.match(/(?:r[eé]sidant\s+au|demeurant\s+(?:au|[àa])?|adresse\s*[:\-]?)\s*([^\n]{10,})/i);
    if (addrM) adresseSalarie = addrM[1].trim();
  }
  // Reject garbage — a real street address must start with a digit (house number)
  if (adresseSalarie && !/^\d+\s+[A-ZÀ-Ÿa-zà-ÿ]/.test(adresseSalarie)) {
    adresseSalarie = "";
  }

  // ── Validity / expiry date ────────────────────────────────────────────────
  let validUntil = mrz?.expiryDate || "";
  if (!validUntil) {
    const expM = t.match(/(?:valable\s+jusqu.au|expir[ea]s?\s*[:\-]?|valid\s+until\s*[:\-]?|fin\s+de\s+validit[eé]\s*[:\-]?)\s*(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/i);
    if (expM) validUntil = parseDate(expM[1]);
  }

  // ── Contract fields ───────────────────────────────────────────────────────
  const typeContrat = /\bCDD\b/.test(T) ? "CDD" : /\bCDI\b/.test(T) ? "CDI" : "";

  const siretM = t.match(/(?:SIRET\s*[:\s]?\s*)(\d[\d\s]{12,16}\d)/i);
  const siret  = siretM ? normDigits(siretM[1]).replace(/\s/g, "").slice(0, 14) : "";

  const apeM    = t.match(/(?:APE|NAF|code\s+APE)\s*[:\s]*([0-9]{4}[A-Z])/i);
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

  const heurSM = t.match(/(\d+)\s*h(?:eures?)?\s*(?:par\s*semaine|hebdomadaire)/i);
  const heuresParSemaine = heurSM ? heurSM[1] : "";

  const heurMM = t.match(/(\d+[.,]\d+)\s*h(?:eures?)?\s*(?:par\s*mois|mensuell)/i);
  const heuresMensuelles = heurMM ? cleanNumber(heurMM[1]) : "";

  const tauxM = t.match(/taux\s+horaire\s+(?:brut\s+)?(?:de\s+)?[:\-]?\s*(\d+[.,]\d+)/i);
  const tauxHoraire = tauxM ? cleanNumber(tauxM[1]) : "";

  const salM = t.match(/(\d[\d\s]+[.,]\d{2})\s*(?:€|euros?)\s*(?:brut|mensuel)/i);
  const salaireBrut = salM ? cleanNumber(salM[1]) : "";

  const ccnM = t.match(/convention\s+(?:collective\s+)?(?:nationale\s+)?(?:de\s+la\s+)?([^\.\n]+?)(?:\s+IDCC\s*(\d+))?[\.\n]/i);
  const convention = ccnM ? ccnM[1].trim() + (ccnM[2] ? ` (IDCC ${ccnM[2]})` : "") : "";

  const lieuSigM = t.match(/[Ff]ait\s+[àa]\s+([A-ZÀ-Ÿa-zà-ÿ\-]+)/);
  const lieuSignature = lieuSigM ? lieuSigM[1] : "";

  const dateSigM = t.match(/[Ff]ait\s+[àa]\s+[^,]+,?\s+le\s+(\d{1,2}[\s\/\.\-]\d{1,2}[\s\/\.\-](?:19|20)\d{2})/);
  const dateSignature = dateSigM ? parseDate(dateSigM[1]) : "";

  const typeDocument = detectTypeDocument();

  const result = {
    typeContrat, nomEntreprise, formeJuridique, siret, codeAPE,
    adresseSiege, villeUrssaf,
    nom, prenom, adresseSalarie, nationalite, titreSejour, typeDocument,
    dateNaissance, lieuNaissance, numSecu,
    dateDebut, dateFin, periodEssai, fonction,
    heuresParSemaine, heuresMensuelles, tauxHoraire, salaireBrut,
    convention, lieuSignature, dateSignature,
    _validUntil: validUntil,
  };

  return Object.fromEntries(Object.entries(result).filter(([, v]) => v !== ""));
}
