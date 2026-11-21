import type { ProtocolId } from "./types";

// Print center (scope 6.10). Four sheets for each procedure. Each sheet is generated from the site's content
// until Dr. Gombera supplies his own edited PDF. To substitute a PDF:
//   1. Put the file in public/print/. His own PDFs keep his file names
//      (11/21/2026), spaces included; links encode them with pdfHref().
//   2. Set `pdf` below: `all` for one file for every procedure, or one entry
//      per procedure (a procedure entry wins over `all`).
// With a PDF set, the print center offers the PDF and the generated page is
// still available as "Print the web version".

export type PrintSheetId = "checklist" | "protocol" | "care" | "red-flags";

export type PrintSheet = {
  id: PrintSheetId;
  title: string;
  summary: string;
  /** Which of Dr. Gombera's documents this sheet corresponds to. */
  matches: string;
  pdf: Partial<Record<ProtocolId | "all", string>>;
};

export const PRINT_SHEETS: PrintSheet[] = [
  {
    id: "checklist",
    title: "Before surgery checklist",
    summary: "PreAdmit, fasting, medications and packing a small bag, with your deadlines if you added a date.",
    matches: "Pre-op letter",
    pdf: {},
  },
  {
    id: "protocol",
    title: "Physical therapy protocol",
    summary: "Your four phases, restrictions, goals and when to move on. Bring it to your therapist.",
    matches: "PT protocol: Open Gluteus Tendon Repair",
    // His PDF is the Open Gluteus Tendon Repair protocol. Gluteus Maximus
    // Transfer patients keep the generated sheet with their longer weight
    // bearing and brace (his decision, 11/21/2026).
    pdf: { standard: "/print/Open Glute Repair PT Protocol.pdf" },
  },
  {
    id: "care",
    title: "Home care sheet",
    summary: "Dressing, showering, ice, brace, activity, driving, work and medications.",
    matches: "Discharge sheet",
    pdf: { all: "/print/OPEN Glute Post Op Instructions.pdf" },
  },
  {
    id: "red-flags",
    title: "When to call card",
    summary: "Warning signs and phone numbers. Keep it on the fridge.",
    matches: "Discharge sheet, warning signs",
    pdf: {},
  },
];

/** Dr. Gombera's letters offered as PDFs only, with no generated version. */
export type PrintLetter = { id: string; title: string; summary: string; matches: string; pdf: string };

export const PRINT_LETTERS: PrintLetter[] = [
  {
    id: "faq",
    title: "What to expect (FAQ)",
    summary: "Dr. Gombera's letter: the surgery, going home, PreAdmit, recovery, risks and pain medication.",
    matches: "Pre-op letter",
    pdf: "/print/OPEN Glute Repair FAQ.pdf",
  },
];

/** A link to a file in public/print, with spaces and other characters encoded. */
export function pdfHref(path: string): string {
  return encodeURI(path);
}

export function printSheet(id: string): PrintSheet | undefined {
  return PRINT_SHEETS.find((s) => s.id === id);
}

/** Dr. Gombera's PDF for this sheet and procedure, or null to use the generated page. */
export function pdfFor(sheet: PrintSheet, procedure: ProtocolId): string | null {
  return sheet.pdf[procedure] ?? sheet.pdf.all ?? null;
}
