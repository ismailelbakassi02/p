// Displays the AI-generated contract with copy, DOCX download, and reset actions
import { useState } from "react";
import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  UnderlineType, BorderStyle,
} from "docx";
import { NAVY, DARK, ACCENT } from "../constants.js";
import { renderContract } from "../utils.jsx";
import Icon from "./Icon.jsx";

// ─── Convert markdown-like contract text → docx Paragraph array ──────────────
function contractToDocxParagraphs(text) {
  const paragraphs = [];

  for (const line of text.split("\n")) {
    // # Title → centered bold uppercase
    if (line.startsWith("# ")) {
      paragraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({
          text: line.replace(/^# /, "").toUpperCase(),
          bold: true, size: 28, font: "Times New Roman",
        })],
      }));
      continue;
    }

    // ## Article heading → bold underlined
    if (line.startsWith("## ")) {
      paragraphs.push(new Paragraph({
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1e3a5f", space: 4 } },
        children: [new TextRun({
          text: line.replace(/^## /, "").toUpperCase(),
          bold: true, size: 22, font: "Times New Roman",
          underline: { type: UnderlineType.SINGLE },
        })],
      }));
      continue;
    }

    // --- separator → thin horizontal rule via border paragraph
    if (/^(-{3}|\*{3}|_{3})$/.test(line.trim())) {
      paragraphs.push(new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0", space: 6 } },
        spacing: { before: 120, after: 120 },
        children: [],
      }));
      continue;
    }

    // **entire line bold** → bold label
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      paragraphs.push(new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [new TextRun({
          text: line.trim().replace(/^\*\*|\*\*$/g, "").toUpperCase(),
          bold: true, size: 22, font: "Times New Roman",
        })],
      }));
      continue;
    }

    // Empty line → small spacer
    if (line.trim() === "") {
      paragraphs.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
      continue;
    }

    // Normal line — parse inline **bold** spans
    const runs = [];
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    for (const part of parts) {
      if (part.startsWith("**") && part.endsWith("**")) {
        runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 22, font: "Times New Roman" }));
      } else {
        runs.push(new TextRun({ text: part, size: 22, font: "Times New Roman" }));
      }
    }
    paragraphs.push(new Paragraph({ spacing: { after: 40 }, children: runs }));
  }

  // Signature block at the bottom
  paragraphs.push(new Paragraph({ spacing: { before: 480 }, children: [] }));
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: "L'Employeur", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: "\t\t\t\t\t", size: 22 }),
      new TextRun({ text: "Le/La Salarié(e)", bold: true, size: 22, font: "Times New Roman" }),
    ],
  }));
  paragraphs.push(new Paragraph({ spacing: { before: 720 }, children: [] })); // space for signatures

  return paragraphs;
}

// ─── Trigger browser download of a Blob ──────────────────────────────────────
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DocDisplay({ text, onCopy, onReset, copied }) {
  const [downloading, setDownloading] = useState(false);

  const downloadDocx = async () => {
    setDownloading(true);
    try {
      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: "Times New Roman", size: 22 },
            },
          },
        },
        sections: [{
          properties: {
            page: {
              margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 }, // ~2cm margins
            },
          },
          children: contractToDocxParagraphs(text),
        }],
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, "contrat.docx");
    } catch (e) {
      console.error("DOCX generation failed:", e);
    }
    setDownloading(false);
  };

  return (
    <div>
      {/* Action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon name="FileText" size={16} color={NAVY} strokeWidth={1.75} />
          Document généré
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onCopy} style={{ padding: "8px 14px", border: `1.5px solid ${copied ? ACCENT : "#e2e8f0"}`, borderRadius: "6px", background: copied ? "rgba(0,230,118,0.08)" : "transparent", color: copied ? "#065f46" : "#64748b", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon name={copied ? "Check" : "Copy"} size={13} strokeWidth={copied ? 2.5 : 1.75} />
            {copied ? "Copié" : "Copier"}
          </button>
          <button onClick={downloadDocx} disabled={downloading} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: downloading ? "#e2e8f0" : ACCENT, color: downloading ? "#94a3b8" : DARK, fontSize: "12px", fontWeight: 800, cursor: downloading ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "7px" }}>
            <Icon name={downloading ? "Loader2" : "Download"} size={13} strokeWidth={1.75} style={downloading ? { animation: "docSpin 1s linear infinite" } : {}} />
            {downloading ? "Génération…" : "Télécharger .docx"}
          </button>
        </div>
      </div>

      {/* Contract preview */}
      <div style={{ background: "#fff", borderRadius: "10px", padding: "32px 36px", maxHeight: "520px", overflowY: "auto", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ textAlign: "center", marginBottom: "18px", paddingBottom: "12px", borderBottom: `3px solid ${NAVY}` }}>
          <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.3em", color: NAVY, textTransform: "uppercase" }}>Document officiel</div>
        </div>
        {renderContract(text)}
        <div style={{ marginTop: "36px", paddingTop: "18px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "36px" }}>
          {["L'Employeur", "Le/La Salarié(e)"].map(l => (
            <div key={l} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: "48px", borderBottom: "1px solid #94a3b8", marginBottom: "5px" }} />
              <p style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes docSpin { to { transform: rotate(360deg); } }`}</style>
      <button onClick={onReset} style={{ marginTop: "10px", width: "100%", padding: "13px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#64748b", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
        <Icon name="RotateCcw" size={13} strokeWidth={1.75} />
        Recommencer
      </button>
    </div>
  );
}
