// Patient poster: the torn and the repaired gluteus tendon, from the approved
// 3D model (renders in docs/3d/renders/2026-11-22-poster-*.png, made by
// docs/3d/scripts/poster-render.py). One US letter page, printed to PDF by
// headless Chrome. Run by hand: node scripts/make-poster.mjs, then copy the
// PDF to "public/print/Gluteus Tendon Tear and Repair Poster.pdf" (print
// center, approved 11/22/2026).
//
// All wording is the approved site text (content/learn.ts DIAGNOSIS and
// ANATOMY, content/before.ts SURGERY_DAY), shortened for print.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

// src/lib/site.ts imports a JSON file without an import attribute (fine for
// Next.js); tell Node to load .json files as JSON.
registerHooks({
  load(url, context, next) {
    return url.endsWith(".json") ? next(url, { ...context, importAttributes: { type: "json" } }) : next(url, context);
  },
});
const { procedureLabel } = await import("../src/lib/procedures.ts");
const { PRACTICE, SITE_NAME } = await import("../src/lib/site.ts");

const DATE = "2026-11-22";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = fileURLToPath(new URL("..", import.meta.url));
const b64 = (f) => readFileSync(join(root, f)).toString("base64");
const font = `data:font/woff2;base64,${b64("node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")}`;
const img = (stage) => `data:image/png;base64,${b64(`docs/3d/renders/${DATE}-poster-${stage}.png`)}`;
const qr = `data:image/png;base64,${b64("docs/launch/2026-11-19-qr-site.png")}`;

// Render size in pixels; callout points are percentages of it.
const W = 2773;
const H = 2347;

// [label lines, point x%, point y%, label x%, label y%, side]
const TORN = [
  [["Gluteus medius"], 53.8, 24.4, 30, 17, "left"],
  [["Torn tendon end"], 53.8, 56.7, 30, 49, "left"],
  [["Irritated bursa"], 44.3, 67.1, 30, 64, "left"],
  [["Greater trochanter"], 50, 80, 30, 82, "left"],
  [["Gluteus", "minimus"], 67.7, 33.5, 82, 26, "right"],
  [["Bare", "footprint"], 57, 67.6, 82, 60, "right"],
];
const REPAIRED = [
  [["Gluteus medius"], 52.3, 31.6, 30, 24, "left"],
  [["Anchors", "in the bone"], 44.8, 62.4, 30, 54, "left"],
  [["Crossing sutures"], 48.5, 71.6, 30, 75, "left"],
  [["Gluteus", "minimus"], 63.8, 46.2, 82, 38, "right"],
  [["Tendon sewn", "back onto", "the bone"], 57, 68, 82, 62, "right"],
];

function callouts(list) {
  const fs = 96; // label size in render pixels
  return list
    .map(([lines, px, py, lx, ly, side]) => {
      const [x1, y1, x2, y2] = [(px * W) / 100, (py * H) / 100, (lx * W) / 100, (ly * H) / 100];
      const end = side === "left" ? x2 + 40 : x2 - 40; // short level tail before the text
      const anchor = side === "left" ? "end" : "start";
      const tx = side === "left" ? x2 + 10 : x2 - 10;
      const top = y2 - ((lines.length - 1) * fs * 1.15) / 2 + fs * 0.35;
      const text = lines.map((l, i) => `<tspan x="${tx}" y="${top + i * fs * 1.15}">${l}</tspan>`).join("");
      return `<polyline points="${x1},${y1} ${end},${y2} ${x2 + (side === "left" ? 30 : -30)},${y2}" />
        <circle cx="${x1}" cy="${y1}" r="20" />
        <text text-anchor="${anchor}" font-size="${fs}">${text}</text>`;
    })
    .join("\n");
}

const figure = (stage, list) => `<div class="fig">
  <img src="${img(stage)}" alt="">
  <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${callouts(list)}</svg>
</div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(${font}) format("woff2"); font-weight: 100 900; }
@page { size: letter; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { width: 8.5in; height: 11in; background: #1d2440; color: #e9edf6; font-family: Inter, sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0.5in 0.5in 0.4in; display: flex; flex-direction: column; }
h1 { margin: 0; font-size: 25pt; font-weight: 700; letter-spacing: 0.02em; line-height: 1.15; color: #f4f6fb; }
.by { margin: 4pt 0 0; font-size: 10pt; color: #aeb7cf; }
.panel { display: flex; align-items: center; gap: 0.25in; margin-top: 0.22in; }
.panel.flip { flex-direction: row-reverse; }
.fig { position: relative; width: 4.6in; flex: none; }
.fig img { display: block; width: 100%;
  /* the render's background is transparent; fade the cut edges of the
     bones at the top and bottom into the page */
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 90%, transparent); }
.fig svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.fig polyline { fill: none; stroke: #ffffff; stroke-width: 7; stroke-linejoin: round; }
.fig circle { fill: #ffffff; }
.fig text { fill: #ffffff; font-family: Inter, sans-serif; font-weight: 600; }
.text { flex: 1; }
h2 { margin: 0 0 2pt; font-size: 17pt; font-weight: 700; letter-spacing: 0.03em; color: #8fd8c8; }
.sub { margin: 0 0 8pt; font-size: 11pt; font-weight: 600; color: #cdd4e6; }
.text p { margin: 0 0 7pt; font-size: 10.5pt; line-height: 1.42; color: #e2e7f2; }
footer { margin-top: auto; display: flex; align-items: center; gap: 0.2in; border-top: 1px solid #3a4470; padding-top: 0.14in; }
footer img { width: 0.85in; height: 0.85in; background: #fff; padding: 3pt; border-radius: 4pt; }
.site { font-size: 10pt; color: #cdd4e6; line-height: 1.35; }
.site strong { display: block; font-size: 15pt; color: #ffffff; }
.doc { margin-left: auto; text-align: right; font-size: 9.5pt; line-height: 1.4; color: #cdd4e6; }
.doc strong { color: #ffffff; font-size: 10.5pt; }
.credit { margin: 6pt 0 0; font-size: 7.5pt; color: #8f98b3; }
</style></head><body>
<h1>UNDERSTANDING GLUTEUS TENDON<br>TEARS &amp; REPAIR</h1>
<p class="by">${PRACTICE.doctor} &middot; ${PRACTICE.specialty}</p>

<section class="panel">
  ${figure("before", TORN)}
  <div class="text">
    <h2>THE TORN TENDON</h2>
    <p>The gluteus medius and minimus are muscles on the outside of the hip. They move the leg out to the side and help you stand upright and walk without a limp.</p>
    <p>In a tear, the tendon pulls away from the greater trochanter, often called the "lateral hip bone," and leaves the bone bare. It is sometimes called the rotator cuff tear of the hip.</p>
    <p>A tear can cause lasting pain that feels like trochanteric bursitis. It can also cause weakness and limping.</p>
  </div>
</section>

<section class="panel flip">
  ${figure("after", REPAIRED)}
  <div class="text">
    <h2>THE REPAIR</h2>
    <p class="sub">${procedureLabel("standard")}</p>
    <p>A small incision is made on the outer part of your hip. The irritated bursa is removed if present, and a small window is made in the IT band to reach the tendon.</p>
    <p>Small anchors in the bone hold sutures that sew the tendon back down and press it flat onto the bone. This secures the repair and lets the tendon heal.</p>
    <p>This surgery has a high success rate in treating pain, and may restore strength to the gluteus muscle.</p>
  </div>
</section>

<footer>
  <img src="${qr}" alt="">
  <div class="site">Your recovery guide online<strong>${SITE_NAME}</strong>Scan with your phone camera</div>
  <div class="doc"><strong>${PRACTICE.doctor}</strong><br>${PRACTICE.group}<br>Office ${PRACTICE.office.label}</div>
</footer>
<p class="credit">Images from Dr. Gombera's 3D hip model. The IT band is hidden to show the tendons. Bone shapes: HuBMAP Visible Human Male (CC BY 4.0).</p>
</body></html>`;

const tmp = mkdtempSync(join(tmpdir(), "poster-"));
const htmlFile = join(tmp, "poster.html");
writeFileSync(htmlFile, html);
const out = join(root, "docs", "launch", `${DATE}-gluteus-tendon-poster.pdf`);
execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${out}`, `file://${htmlFile}`], { stdio: "ignore" });
console.log("wrote", out);
