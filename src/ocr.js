// OCR pipeline: image files → extracted text via Tesseract.js
// PDFs are first rendered to canvas via PDF.js, then passed to Tesseract
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Point PDF.js at its bundled worker (Vite resolves this at build time)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).href;

// Render the first page of a PDF file to an HTMLCanvasElement
async function pdfToCanvas(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 }); // higher scale = better OCR accuracy
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas;
}

// Main export: run OCR on any supported file (PDF or image)
// Returns the raw extracted text string
export async function extractText(file, onProgress) {
  // For PDFs, render to canvas first
  let source = file;
  if (file.type === "application/pdf") {
    source = await pdfToCanvas(file);
  }

  // Create Tesseract worker supporting French + English
  const worker = await createWorker(["fra"], 1, {
    logger: m => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const { data } = await worker.recognize(source);
  await worker.terminate();
  return data.text;
}
