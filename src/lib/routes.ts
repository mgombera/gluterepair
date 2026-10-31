// Every public route in the site map (scope section 3). Used by navigation,
// placeholder pages, the sitemap and the route test. /start, /proof and
// /walkthrough are internal and stay out of this list.

export type Mode = "before" | "after" | "general";

export type RouteInfo = {
  path: string;
  title: string;
  summary: string;
  mode: Mode;
  milestone: number; // milestone that delivers the real page (scope section 10)
};

export const ROUTES: RouteInfo[] = [
  { path: "/", title: "Home", summary: "Enter your surgery date and procedure to see what applies to you today.", mode: "general", milestone: 3 },
  { path: "/before", title: "Before Surgery", summary: "Your countdown, getting-ready checklist and PreAdmit deadline.", mode: "before", milestone: 4 },
  { path: "/before/surgery-day", title: "Surgery Day", summary: "What happens on the day, from the arrival call to your night in the hospital.", mode: "before", milestone: 4 },
  { path: "/before/diagnosis", title: "Your Diagnosis", summary: "Gluteus medius and minimus tears, why surgery is recommended, your other options and the risks.", mode: "before", milestone: 4 },
  { path: "/before/add-ons", title: "Add-ons", summary: "Biologic options you can add to your surgery. Call for pricing.", mode: "before", milestone: 4 },
  { path: "/after", title: "Recovery Dashboard", summary: "Your day, phase and week, this week's exercises and what comes next.", mode: "after", milestone: 5 },
  { path: "/after/timeline", title: "Recovery Timeline", summary: "Every phase of your protocol and what it takes to move on.", mode: "after", milestone: 5 },
  { path: "/after/care", title: "Home Care", summary: "Dressing, showering, ice, brace, activity, driving, work and medications.", mode: "after", milestone: 5 },
  { path: "/after/exercises", title: "Exercise Library", summary: "Every exercise in your protocol, by phase and week.", mode: "after", milestone: 5 },
  { path: "/anatomy", title: "Your Hip Tendons", summary: "See the torn tendons and the repair in 3D.", mode: "general", milestone: 6 },
  { path: "/videos", title: "Videos", summary: "Videos about your surgery and your exercises.", mode: "general", milestone: 6 },
  { path: "/faq", title: "FAQ", summary: "Answers to common questions before and after surgery.", mode: "general", milestone: 6 },
  { path: "/red-flags", title: "When to Call", summary: "What is normal after surgery, what needs a call right away, and the numbers to use.", mode: "general", milestone: 6 },
  { path: "/about", title: "About Dr. Gombera", summary: "Your surgeon, his training and his practice.", mode: "general", milestone: 6 },
  { path: "/contact", title: "Contact", summary: "Office, after hours, PreAdmit, email, the patient portal and the address.", mode: "general", milestone: 6 },
  { path: "/privacy", title: "Privacy", summary: "What this site stores and what it never collects.", mode: "general", milestone: 6 },
  { path: "/print", title: "Print Center", summary: "Printable checklist, protocol, home care and when-to-call sheets for your procedure.", mode: "general", milestone: 7 },
];

export const PRIMARY_NAV = [
  { href: "/anatomy", label: "Your Hip Tendons" },
  { href: "/videos", label: "Videos" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function routeInfo(path: string): RouteInfo {
  const r = ROUTES.find((x) => x.path === path);
  if (!r) throw new Error(`Unknown route ${path}`);
  return r;
}
