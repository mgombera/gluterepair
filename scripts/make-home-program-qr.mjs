// Make the navy myHealthTrack QR code (scope 6.5) and check that it decodes
// back to the practice link. Run by hand: node scripts/make-home-program-qr.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";

const URL_ = "https://mht.link/fondren2";
const NAVY = "#313E6B";
const out = fileURLToPath(new URL("../public/brand/myhealthtrack-qr.svg", import.meta.url));

const svg = await QRCode.toString(URL_, { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: NAVY, light: "#FFFFFF" } });
writeFileSync(out, svg.replace("<svg ", '<svg role="img" aria-label="QR code for myHealthTrack" '));

const png = PNG.sync.read(await QRCode.toBuffer(URL_, { errorCorrectionLevel: "M", margin: 2, scale: 8, color: { dark: NAVY, light: "#FFFFFF" } }));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
if (decoded !== URL_) throw new Error(`QR decodes to ${decoded}, expected ${URL_}`);
console.log(`Wrote ${out}; decodes to ${decoded}`);
