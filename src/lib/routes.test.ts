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
    expect(paths).toContain("/after/home-program");
    expect(paths).toContain("/after/when-to-call");
    expect(paths).not.toContain("/hip");
    expect(paths).not.toContain("/before/prehab"); // no gluteus prehab protocol (11/01/2026)
    expect(paths).not.toContain("/after/exercises"); // educational only (11/01/2026)
    expect(paths).not.toContain("/red-flags");
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
  // internal /proof page names it as a source for Dr. Gombera's review.
  const shell = [
    ...sourceFiles(appDir).filter((f) => !f.includes(join("app", "proof"))),
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

  it("titles the header Gluteus Tendon Repair with the gomberamd.com logo", () => {
    const header = readFileSync(join(srcDir, "components", "SiteHeader.tsx"), "utf8");
    expect(readFileSync(join(srcDir, "lib", "site.ts"), "utf8")).toMatch(/SITE_TITLE = "Gluteus Tendon Repair"/);
    expect(header).toMatch(/\{SITE_TITLE\}/);
    expect(header).toMatch(/PRACTICE\.logoUrl/);
  });

  it("keeps When to call under After surgery only, with no header or footer link", () => {
    for (const f of ["SiteFooter.tsx", "SiteHeader.tsx"]) {
      expect(readFileSync(join(srcDir, "components", f), "utf8"), f).not.toMatch(/red-flags|when-to-call/);
    }
    const tabs = readFileSync(join(srcDir, "app", "after", "layout.tsx"), "utf8");
    const order = ["/after\"", "/after/care", "/after/timeline", "/after/home-program", "/after/when-to-call"].map((h) => tabs.indexOf(h));
    expect(order.every((n, i) => n > 0 && (i === 0 || n > order[i - 1]))).toBe(true);
  });

  it("has a Home button in the header", () => {
    expect(readFileSync(join(srcDir, "components", "SiteHeader.tsx"), "utf8")).toMatch(/aria-label="Home"/);
  });

  it("redirects removed pages permanently", async () => {
    const redirects = await (await import("../../next.config")).default.redirects!();
    for (const [from, to] of [["/after/exercises", "/after/timeline"], ["/red-flags", "/after/when-to-call"]]) {
      expect(redirects).toContainEqual({ source: from, destination: to, permanent: true });
    }
  });

  it("uses no condensed font", () => {
    expect(readFileSync(join(appDir, "globals.css"), "utf8")).not.toMatch(/condensed/i);
  });
});
