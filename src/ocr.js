// OCR pipeline — Tesseract.js (browser-native, no auth, no backend)
// PDF embedded text via pdf.js CDN; scanned PDFs rendered to canvas → Tesseract OCR
// DOCX via mammoth CDN; images directly via Tesseract OCR

import { createWorker, PSM } from 'tesseract.js';

let _workerPromise = null;
let _idleTimer = null;

async function getWorker() {
  clearTimeout(_idleTimer);
  if (!_workerPromise) {
    _workerPromise = (async () => {
      const w = await createWorker('fra+eng', 1, { logger: () => {} });
      // SPARSE_TEXT: best for identity cards — reads scattered fields without forcing layout
      await w.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      return w;
    })();
  }
  return _workerPromise;
}

function scheduleIdle() {
  clearTimeout(_idleTimer);
  _idleTimer = setTimeout(async () => {
    if (_workerPromise) {
      try { (await _workerPromise).terminate(); } catch {}
      _workerPromise = null;
    }
  }, 60_000);
}

// ── Otsu threshold ────────────────────────────────────────────────────────────
function otsuThreshold(grey) {
  const hist = new Array(256).fill(0);
  for (let i = 0; i < grey.length; i++) hist[grey[i]]++;
  const total = grey.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, maxVar = 0, threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (!wB) continue;
    const wF = total - wB; if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) ** 2;
    if (variance > maxVar) { maxVar = variance; threshold = t; }
  }
  return threshold;
}

// ── Preprocess an image DataURL into a clean greyscale DataURL for Tesseract ──
// invert=true flips polarity (for dark-background cards like Vitale)
function preprocessCanvas(img, invert) {
  // Scale up small images — max 3× to keep memory reasonable
  const scale = Math.max(1, Math.min(3, 2400 / Math.max(img.width, img.height)));
  const w = Math.round(img.width  * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled  = true;
  ctx.imageSmoothingQuality  = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  const px = ctx.getImageData(0, 0, w, h);
  const d  = px.data;

  // Greyscale
  const grey = new Uint8Array(w * h);
  for (let i = 0; i < d.length; i += 4)
    grey[i >> 2] = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);

  // Adaptive contrast around Otsu threshold
  const otsu = otsuThreshold(grey);
  const contrast = 1.8;

  for (let i = 0; i < d.length; i += 4) {
    let val = grey[i >> 2];
    val = Math.min(255, Math.max(0, (val - otsu) * contrast + otsu));
    if (invert) val = 255 - val;
    d[i] = d[i + 1] = d[i + 2] = val;
  }

  ctx.putImageData(px, 0, 0);
  return { canvas, grey, otsu };
}

// Build a DataURL from a canvas, choosing the right inversion automatically
async function enhanceImage(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      // First pass — normal orientation, no inversion
      const { canvas: c0, grey, otsu } = preprocessCanvas(img, false);

      // Count dark pixels to detect dark-background cards (Vitale green, etc.)
      let darkCount = 0;
      for (let i = 0; i < grey.length; i++) if (grey[i] < otsu) darkCount++;
      const dominantlyDark = darkCount > grey.length * 0.52;

      if (dominantlyDark) {
        // Re-render with inversion (white-on-dark → dark-on-white for Tesseract)
        const { canvas: c1 } = preprocessCanvas(img, true);
        resolve(c1.toDataURL('image/jpeg', 0.95));
      } else {
        resolve(c0.toDataURL('image/jpeg', 0.95));
      }
    };
    img.onerror = () => resolve(dataUrl); // fallback: use original
    img.src = dataUrl;
  });
}

// Also produce an inverted variant for a second OCR attempt
async function enhanceImageInverted(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const { canvas } = preprocessCanvas(img, true);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Rotate a dataUrl by 0/90/180/270 degrees on a canvas
async function rotateDataUrl(dataUrl, deg) {
  if (deg === 0) return dataUrl;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const swap = deg === 90 || deg === 270;
      const canvas = document.createElement('canvas');
      canvas.width  = swap ? img.height : img.width;
      canvas.height = swap ? img.width  : img.height;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = dataUrl;
  });
}

// Identity-document heuristic: does the OCR text contain useful field content?
function documentScore(text) {
  const t = text.toUpperCase();
  let score = 0;
  if (/NOMS?|PRENOM|SURNAME|FORENAME/.test(t)) score += 3;
  if (/NAISSANCE|BIRTH/.test(t))                score += 3;
  if (/SEJOUR|RESIDENT|VITALE|PASSEPORT/.test(t))score += 2;
  if (/NATIONALIT/.test(t))                      score += 2;
  if (/SEXE|SEX/.test(t))                        score += 1;
  if (/\b[MF]\s+[A-Z]{2,}/.test(t))             score += 2;
  if (/\d{1,2}[\s\/]\d{1,2}[\s\/]\d{4}/.test(t))score += 2;
  if (/[12]\s*\d{2}\s*\d{2}/.test(t))            score += 3; // NIR fragment
  if (/[A-Z<]{10,}/.test(t))                     score += 2; // MRZ-like line
  if (text.trim().length < 30)                   score -= 5;
  return score;
}

async function imageOCR(dataUrl, signal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const worker = await getWorker();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const enhanced = await enhanceImage(dataUrl);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const { data: { text: text0, confidence: conf0 } } = await worker.recognize(enhanced);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const score0 = documentScore(text0);

  // Good result — return immediately
  if (conf0 >= 65 || score0 >= 7) {
    scheduleIdle();
    return text0 || "";
  }

  // Try an inverted version (picks up light-on-dark text if enhanceImage didn't invert)
  const inverted = await enhanceImageInverted(dataUrl);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const { data: { text: textInv } } = await worker.recognize(inverted);
  const scoreInv = documentScore(textInv);

  let best = scoreInv > score0
    ? { text: textInv, score: scoreInv }
    : { text: text0,   score: score0   };

  if (best.score >= 7) { scheduleIdle(); return best.text; }

  // Still low — try other orientations
  for (const deg of [90, 180, 270]) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const rotated = await rotateDataUrl(enhanced, deg);
    const { data: { text } } = await worker.recognize(rotated);
    const score = documentScore(text);
    if (score > best.score) best = { text, score };
    if (score >= 7) break;
  }

  scheduleIdle();
  return best.text || "";
}

async function renderPDFPageToDataUrl(pdf, pageNum = 1) {
  const page = await pdf.getPage(pageNum);
  // Scale 3.0 for sharp text on identity documents
  const viewport = page.getViewport({ scale: 3.0 });
  const canvas = document.createElement("canvas");
  canvas.width  = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.95);
}

// signal: optional AbortSignal — throws AbortError if cancelled mid-way
export async function fileToText(file, signal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const ext      = file.name.toLowerCase();
  const isPDF    = file.type === "application/pdf" || ext.endsWith(".pdf");
  const isImage  = file.type.startsWith("image/");
  const isDOCX   = ext.endsWith(".docx");

  if (isPDF) {
    const lib = window.pdfjsLib;
    if (lib) {
      lib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      try {
        const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
        // Try embedded text first (fast, accurate for text-based PDFs)
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 4); i++) {
          if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
          const page = await pdf.getPage(i);
          const c = await page.getTextContent();
          text += c.items.map(x => x.str).join(" ") + "\n";
        }
        if (text.trim().length > 40) return text.trim();
        // Scanned PDF — render at high resolution then OCR
        const pagesToOCR = Math.min(pdf.numPages, 2);
        let ocrText = "";
        for (let i = 1; i <= pagesToOCR; i++) {
          if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
          const dataUrl = await renderPDFPageToDataUrl(pdf, i);
          ocrText += (await imageOCR(dataUrl, signal)) + "\n";
        }
        return ocrText.trim();
      } catch (e) {
        if (e.name === "AbortError") throw e;
        /* fall through */
      }
    }
    return "";
  }

  if (isImage) {
    const dataUrl = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    return await imageOCR(dataUrl, signal);
  }

  if (isDOCX && window.mammoth) {
    const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return r.value.trim();
  }

  return file.text();
}

// Returns an object-URL for image files so the caller can display a preview.
// Caller must call URL.revokeObjectURL(url) when done.
export function getPreviewUrl(file) {
  if (!file || !file.type.startsWith("image/")) return null;
  return URL.createObjectURL(file);
}
