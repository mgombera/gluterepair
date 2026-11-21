import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PRINT_LETTERS, PRINT_SHEETS, pdfFor, pdfHref } from "./print";

describe("print center", () => {
  it("has the four sheets from the scope", () => {
    expect(PRINT_SHEETS.map((s) => s.id)).toEqual(["checklist", "protocol", "care", "red-flags"]);
  });

  it("uses the generated page until a PDF is supplied", () => {
    for (const s of PRINT_SHEETS) expect(pdfFor({ ...s, pdf: {} }, "standard")).toBeNull();
  });

  it("prefers a procedure PDF over the all-procedures PDF", () => {
    const s = { ...PRINT_SHEETS[1], pdf: { all: "/print/a.pdf", "max-transfer": "/print/m.pdf" } };
    expect(pdfFor(s, "max-transfer")).toBe("/print/m.pdf");
    expect(pdfFor(s, "standard")).toBe("/print/a.pdf");
  });

  it("only points at files in public/print and uses no em dashes", () => {
    for (const s of PRINT_SHEETS) {
      for (const f of Object.values(s.pdf)) expect(f).toMatch(/^\/print\/.+\.pdf$/);
      expect(s.title + s.summary).not.toMatch(/—/);
    }
  });

  it("finds every PDF it points at in public/print", () => {
    for (const s of PRINT_SHEETS) {
      for (const f of Object.values(s.pdf)) expect(existsSync(join(__dirname, "../../public", f!)), f).toBe(true);
    }
  });

  it("uses his PDFs: FAQ and post-op sheet for everyone, a PT protocol for each procedure", () => {
    expect(PRINT_LETTERS.map((l) => l.pdf)).toEqual(["/print/OPEN Glute Repair FAQ.pdf"]);
    expect(pdfFor(PRINT_SHEETS[2], "max-transfer")).toBe("/print/OPEN Glute Post Op Instructions.pdf");
    expect(pdfFor(PRINT_SHEETS[1], "standard")).toBe("/print/Open Glute Repair PT Protocol.pdf");
    expect(pdfFor(PRINT_SHEETS[1], "max-transfer")).toBe("/print/Glute Max Transfer PT Protocol.pdf");
    for (const l of PRINT_LETTERS) expect(existsSync(join(__dirname, "../../public", l.pdf)), l.pdf).toBe(true);
  });

  it("encodes spaces in PDF links", () => {
    expect(pdfHref("/print/OPEN Glute Repair FAQ.pdf")).toBe("/print/OPEN%20Glute%20Repair%20FAQ.pdf");
  });
});

describe("printed sheets", () => {
  const view = readFileSync(join(__dirname, "../components/print/PrintSheetView.tsx"), "utf8");

  it("carries the required notices and the reviewed-by line", () => {
    for (const n of ["PROTOCOL_NOTICE", "PT_OVERRIDE_NOTICE", "MEDICATION_NOTICE", "DATES_ARE_ESTIMATES"]) expect(view).toContain(`{${n}}`);
    expect(view).toContain("Content reviewed by Dr. Gombera.");
  });

  it("uses this site's name and practice details, not fixmyhips", () => {
    expect(view).not.toMatch(/fix ?my ?hips/i);
    expect(view).toContain("{SITE_NAME}");
    expect(view).toContain("PRACTICE.address");
  });

  it("has a page for every sheet", () => {
    expect(existsSync(join(__dirname, "../app/print/[id]/page.tsx"))).toBe(true);
  });
});
