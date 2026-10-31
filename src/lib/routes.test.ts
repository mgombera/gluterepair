import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PRIMARY_NAV, ROUTES } from "./routes";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

const srcDir = join(__dirname, "..");
const appDir = join(srcDir, "app");

// Every page.tsx under src/app, as a route path.
function pagePaths(dir = appDir, base = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...pagePaths(full, `${base}/${name}`));
    else if (name === "page.tsx") out.push(base || "/");
  }
  return out;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css|json)$/.test(name) ? [full] : [];
  });
}

const INTERNAL = ["/start", "/proof", "/walkthrough"];

describe("site map", () => {
  it("has a page file for every route", () => {
    for (const r of ROUTES) {
      const file = join(appDir, r.path === "/" ? "" : r.path, "page.tsx");
      expect(existsSync(file), `${r.path} -> ${file}`).toBe(true);
    }
  });

  it("has no pages outside the site map", () => {
    const known = new Set([...ROUTES.map((r) => r.path), ...INTERNAL]);
    for (const p of pagePaths()) expect(known.has(p), p).toBe(true);
  });

  it("matches the gluterepair site map (scope section 3)", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(paths).toContain("/anatomy");
    expect(paths).toContain("/red-flags");
    expect(paths).not.toContain("/hip");
    expect(paths).not.toContain("/before/prehab");
    expect(paths).not.toContain("/after/when-to-call");
  });

  it("has unique paths", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("only links to real routes from the main nav", () => {
    const paths = new Set(ROUTES.map((r) => r.path));
    for (const n of PRIMARY_NAV) expect(paths.has(n.href)).toBe(true);
  });

  it("uses no em dashes in route copy", () => {
    for (const r of ROUTES) expect(r.title + r.summary).not.toMatch(/—/);
  });
});

describe("search", () => {
  it("lists every public route on gluterepair.com and no internal page", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toHaveLength(ROUTES.length);
    for (const u of urls) expect(u.startsWith("https://gluterepair.com")).toBe(true);
    for (const p of INTERNAL) expect(urls).not.toContain(`https://gluterepair.com${p}`);
  });

  it("points robots at the gluterepair.com sitemap", () => {
    expect(robots().sitemap).toBe("https://gluterepair.com/sitemap.xml");
  });
});

describe("shell copy", () => {
  // The fixmyhips name must not survive anywhere a patient can see it. The
  // content files and their tests are rewritten in milestone 2.
  const shell = [
    ...sourceFiles(appDir),
    join(srcDir, "components", "SiteHeader.tsx"),
    join(srcDir, "components", "SiteFooter.tsx"),
    join(srcDir, "components", "Placeholder.tsx"),
    join(srcDir, "lib", "site.ts"),
    join(srcDir, "lib", "theme.ts"),
    join(srcDir, "lib", "routes.ts"),
  ];

  it("never mentions fixmyhips or uses an em dash", () => {
    for (const f of shell) {
      const text = readFileSync(f, "utf8");
      expect(text, f).not.toMatch(/fix ?my ?hips/i);
      expect(text, f).not.toMatch(/—/);
    }
  });

  it("uses no condensed font", () => {
    expect(readFileSync(join(appDir, "globals.css"), "utf8")).not.toMatch(/condensed/i);
  });
});
