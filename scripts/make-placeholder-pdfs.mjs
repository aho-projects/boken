#!/usr/bin/env node
// Generates minimal valid PDF placeholders so all /downloads/*.pdf links work.
// Replace each file under public/downloads/ with the real content when ready.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public", "downloads");
mkdirSync(outDir, { recursive: true });

const files = [
  ["naturfag-ute-intro.pdf", "Naturfag ute — Intro powerpoint"],
  ["naturfag-ute-oppgaver.pdf", "Naturfag ute — Felt-oppgaver"],
  ["sketchnoting-intro.pdf", "Sketchnoting — Intro"],
  ["sketchnoting-oppgaver.pdf", "Sketchnoting — Oppgaver"],
  ["ut-og-titte-intro.pdf", "Ut og titte — Intro"],
  ["ut-og-titte-oppgaver.pdf", "Ut og titte — Oppgaver"],
  ["isberg-intro.pdf", "Isberg — Intro"],
  ["isberg-oppgaver.pdf", "Isberg — Oppgaver"],
  ["bytte-perspektiv-intro.pdf", "Bytte perspektiv — Intro"],
  ["bytte-perspektiv-oppgaver.pdf", "Bytte perspektiv — Oppgaver"],
  ["hjemmelagde-kilden-intro.pdf", "Den hjemmelagde kilden — Intro"],
  ["hjemmelagde-kilden-oppgaver.pdf", "Den hjemmelagde kilden — Oppgaver"],
  ["boken-a4.pdf", "Boken — Hele boka som A4-ark"],
  ["boken-grunnbok.pdf", "Boken — Grunnboka"],
  ["boken-lomme.pdf", "Boken — Lomme-oppskrift"],
  ["boken-utbrettbar.pdf", "Boken — Utbrettbar side"],
  ["larer-guide.pdf", "Lærer-guide"],
];

function buildPdf(title) {
  const line1 = `(${title.replace(/[()\\]/g, "\\$&")})`;
  const line2 = "(Placeholder — kommer snart. Erstatt denne filen i public/downloads/.)";
  const content = `BT /F1 22 Tf 60 740 Td ${line1} Tj 0 -36 Td /F1 14 Tf ${line2} Tj ET`;
  const lengthVal = Buffer.byteLength(content, "binary");
  const objs = [
    "%PDF-1.4\n%\xC2\xA0\n",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${lengthVal} >>\nstream\n${content}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  let buf = "";
  const offsets = [];
  for (let i = 0; i < objs.length; i++) {
    if (i > 0) offsets.push(Buffer.byteLength(buf, "binary"));
    buf += objs[i];
  }
  const xrefStart = Buffer.byteLength(buf, "binary");
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (const o of offsets) xref += String(o).padStart(10, "0") + " 00000 n \n";
  buf += xref;
  buf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(buf, "binary");
}

for (const [name, title] of files) {
  const path = resolve(outDir, name);
  writeFileSync(path, buildPdf(title));
  console.log(" wrote", name);
}
console.log(`\nGenerated ${files.length} placeholder PDFs in ${outDir}`);
