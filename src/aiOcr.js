// AI-powered document field extraction via Claude vision API
// Runs entirely in the browser — no backend required
// API key is stored in .env as VITE_ANTHROPIC_KEY (never shown in UI)

// Proxied through Vite dev server (vite.config.js) — key is injected server-side, never in the browser bundle
const API_URL = "/api/claude";
const MODEL   = "claude-haiku-4-5-20251001";

// ── File → base64 ─────────────────────────────────────────────────────────────
async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── PDF first page → base64 JPEG (pdf.js CDN already in index.html) ──────────
async function pdfPageToBase64(file) {
  const lib = window.pdfjsLib;
  if (!lib) throw new Error("pdf.js not available");
  lib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf      = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const page     = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 });
  const canvas   = document.createElement("canvas");
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
}

// ── Prompts ───────────────────────────────────────────────────────────────────
const PROMPT_VITALE = `Analyse cette Carte Vitale française.
Retourne UNIQUEMENT un objet JSON valide avec ce champ :
{
  "numSecu": "numéro de sécurité sociale avec espaces au format X XX XX XX XXX XXX XX"
}
Si tu ne peux pas lire le numéro clairement, retourne {}.`;

const PROMPT_IDENTITE = `Analyse ce document d'identité français ou étranger.
Retourne UNIQUEMENT un objet JSON valide avec les champs que tu peux lire clairement :
{
  "nom": "NOM DE FAMILLE EN MAJUSCULES",
  "prenom": "premier prénom uniquement",
  "genre": "M ou F",
  "dateNaissance": "YYYY-MM-DD",
  "lieuNaissance": "ville et/ou pays de naissance",
  "nationalite": "nationalité en français (ex: Sénégalaise, Française, Afghane, Marocaine…)",
  "titreSejour": "numéro du document si c'est un titre de séjour ou carte de résident",
  "typeDocument": "l'une des valeurs suivantes uniquement : cni_fr | passeport_fr | passeport_etranger | cs_resident | cs_resident_ld | cs_travailleur_temporaire | cs_etudiant | cs_vie_privee | cs_passeport_talent | cs_saisonnier",
  "adresseSalarie": "adresse complète si elle figure sur le document (commence par un numéro de rue)"
}

Règles :
- dateNaissance : obligatoirement au format YYYY-MM-DD, date passée uniquement
- genre : déduis-le de M./Mme, ou du champ SEXE/SEX sur le document
- nationalite : donne la nationalité du titulaire, pas le pays émetteur (France ≠ Française pour un étranger)
- typeDocument : si c'est une CNI française → cni_fr ; passeport français → passeport_fr ; titre de séjour → cs_* selon le type indiqué
- Retourne UNIQUEMENT le JSON, sans texte, sans markdown.`;

// ── Core API call ─────────────────────────────────────────────────────────────
async function callClaude(base64, prompt, signal) {
  // No API key here — the Vite proxy (vite.config.js) injects it from .env server-side
  const resp = await fetch(API_URL, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
          { type: "text",  text: prompt },
        ],
      }],
    }),
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Claude API ${resp.status}: ${msg}`);
  }

  const data = await resp.json();
  const raw  = data.content?.[0]?.text || "{}";

  // Strip markdown code fences if present
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try { return JSON.parse(match[0]); } catch { return {}; }
}

// ── Public helpers ─────────────────────────────────────────────────────────────

// Carte Vitale → { numSecu }
export async function extractVitale(file, signal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const ext   = file.name.toLowerCase();
  const isPDF = file.type === "application/pdf" || ext.endsWith(".pdf");
  const b64   = isPDF ? await pdfPageToBase64(file) : await fileToBase64(file);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  return callClaude(b64, PROMPT_VITALE, signal);
}

// Pièce d'identité → { nom, prenom, genre, dateNaissance, … }
export async function extractIdentite(file, signal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const ext   = file.name.toLowerCase();
  const isPDF = file.type === "application/pdf" || ext.endsWith(".pdf");
  const b64   = isPDF ? await pdfPageToBase64(file) : await fileToBase64(file);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  return callClaude(b64, PROMPT_IDENTITE, signal);
}
