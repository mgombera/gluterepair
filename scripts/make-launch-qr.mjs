// Make the launch QR codes (scope section 10, milestone 8) and check each one
// decodes back to its address. Run by hand: node scripts/make-launch-qr.mjs
//
// One code per procedure for the clinic (/start?p=..., which preselects the
// procedure only, never a date), plus one for the site itself for the printed
// letters. Each comes as a PNG and a one-page letter-size print PDF, saved in
// docs/launch/. The PDF is printed by headless Chrome.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { procedureLabel } from "../src/lib/procedures.ts";

const DATE = "2026-11-19";
const SITE = "https://gluterepair.com";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "docs", "launch");
mkdirSync(outDir, { recursive: true });

const logo = `data:image/webp;base64,${readFileSync(join(root, "public", "brand", "gomberamd-logo.webp")).toString("base64")}`;

const CODES = [
  { name: "standard", url: `${SITE}/start?p=standard`, label: procedureLabel("standard") },
  { name: "max-transfer", url: `${SITE}/start?p=max-transfer`, label: procedureLabel("max-transfer") },
  { name: "site", url: SITE, label: null },
];

const opts = { errorCorrectionLevel: "M", margin: 4, color: { dark: "#000000", light: "#FFFFFF" } };
const tmp = mkdtempSync(join(tmpdir(), "launch-qr-"));

for (const c of CODES) {
  const base = join(outDir, `${DATE}-qr-${c.name}`);

  // PNG, large enough for any print size, and checked by decoding it.
  const buf = await QRCode.toBuffer(c.url, { ...opts, scale: 24 });
  writeFileSync(`${base}.png`, buf);
  const png = PNG.sync.read(buf);
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
  if (decoded !== c.url) throw new Error(`${c.name}: decodes to ${decoded}, expected ${c.url}`);

  // Print PDF: logo, site name, the procedure, the code and the address.
  const svg = await QRCode.toString(c.url, { ...opts, type: "svg" });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: letter; margin: 0.75in; }
    body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111; text-align: center; margin: 0; }
    img.logo { height: 56px; margin-top: 0.25in; }
    h1 { font-size: 34px; margin: 0.35in 0 0.1in; }
    p.proc { font-size: 26px; font-weight: 700; margin: 0 0 0.3in; }
    .qr svg { width: 4.25in; height: 4.25in; }
    p.scan { font-size: 22px; margin: 0.25in 0 0.1in; }
    p.addr { font-size: 26px; font-weight: 700; margin: 0; }
  </style></head><body>
    <img class="logo" src="${logo}" alt="">
    <h1>Gluteus Tendon Repair</h1>
    ${c.label ? `<p class="proc">${c.label}</p>` : `<p class="proc">Your recovery guide</p>`}
    <div class="qr">${svg}</div>
    <p class="scan">Scan with your phone camera, or type:</p>
    <p class="addr">gluterepair.com</p>
  </body></html>`;
  const htmlFile = join(tmp, `${c.name}.html`);
  writeFileSync(htmlFile, html);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${base}.pdf`, `file://${htmlFile}`], { stdio: "ignore" });
  console.log(`${c.name}: ${base}.png and .pdf, decodes to ${decoded}`);
}
