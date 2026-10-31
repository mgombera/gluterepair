import type { ChecklistItem, InfoSection } from "./types";

// Pre-op checklist, surgery day and add-ons (scope 6.2 and 6.9).
// Sources: pre-op letter, discharge sheet, Dr. Gombera's decisions of
// 10/31/2026, and the fixmyhips logistics he kept ("Same as fixmyhips").
// The PreAdmit number is the decision's (713) 395-6607, not the letter's.

export const PREADMIT_WINDOW = { opensDaysBefore: 30, closesDaysBefore: 7 };

export const CHECKLIST: ChecklistItem[] = [
  {
    id: "pre-register",
    block: "now",
    title: "Pre-register online",
    detail:
      "Pre-registration must be completed no less than 7 days before surgery. At texasorthopedic.com, open the Menu, go to Patients and Visitors, choose Online Pre-Registration, then under MyHealthOne choose Create your account or Sign in. You can also complete it at your PreAdmit visit.",
    dueOffsetDays: -7,
    link: { label: "Open texasorthopedic.com", href: "https://www.texasorthopedic.com" },
    source: ["preop-letter"],
  },
  {
    id: "preadmit",
    block: "now",
    title: "Complete PreAdmit testing (mandatory)",
    detail:
      "PreAdmit is required for clearance to receive anesthesia. It is on the 3rd floor of Texas Orthopedic Hospital, where the nursing and anesthesiology teams will interview you and order any tests needed, such as blood tests or an EKG. Complete it within 30 days of surgery and at least one week before. Call (713) 395-6607 to schedule, or walk in 8 a.m. to 5 p.m., Monday through Friday.",
    dueOffsetDays: -7,
    link: { label: "Call PreAdmit (713) 395-6607", href: "tel:+17133956607" },
    source: ["preop-letter", "decisions"],
  },
  {
    id: "anesthesia-history",
    block: "now",
    title: "Tell the anesthesia team your history",
    detail:
      "If you are prone to nausea or vomiting after anesthesia, or have had complications with anesthesia, let the anesthesia team know.",
    source: ["fixmyhips"],
  },
  {
    id: "cold-therapy",
    block: "week-before",
    title: "Get an ice machine or ice packs",
    detail:
      "Icing starts right after surgery: 30 to 45 minutes every 2 hours until your first post-op visit. An ice machine is optional and may or may not be covered by your insurance, so check with your insurance company. Ice packs work if you do not get a machine.",
    source: ["discharge", "decisions", "fixmyhips"],
  },
  {
    id: "driver",
    block: "week-before",
    title: "Arrange a ride home and help at home",
    detail:
      "You will typically spend one night in the hospital, and you cannot drive while taking narcotic pain medication, so arrange a ride home.",
    source: ["preop-letter", "discharge"],
    derived: true,
  },
  {
    id: "time-off",
    block: "week-before",
    title: "Plan time off work",
    detail:
      "For most office jobs, plan 1 to 2 weeks off. Recovery is generally complete, and heavy lifting possible, at 4 to 6 months.",
    source: ["preop-letter", "decisions"],
  },
  {
    id: "biologics",
    block: "week-before",
    title: "Optional: decide on a biologic add-on",
    detail:
      "PRP, stem cell or connective tissue matrix treatment can be added during surgery. It is not covered by insurance. Call the office for pricing before surgery day.",
    source: ["fixmyhips", "decisions"],
  },
  {
    id: "home-setup",
    block: "week-before",
    title: "Set up your home for crutches or a walker",
    detail:
      "You will walk with crutches or a walker, putting only 20 lb on the operated leg, for at least 4 weeks. Have a place ready to keep your leg raised to chest level.",
    source: ["decisions", "discharge"],
    derived: true,
  },
  {
    id: "fasting",
    block: "night-before",
    title: "Nothing to eat or drink after midnight",
    detail:
      "PreAdmit will tell you which medications to stop and when. Make sure they know if you take a GLP-1 medication (such as Ozempic, Wegovy, Mounjaro or Zepbound) or any blood thinner.",
    dueOffsetDays: -1,
    source: ["fixmyhips", "decisions"],
  },
  {
    id: "arrival-call",
    block: "night-before",
    title: "Expect a call with your arrival time",
    detail:
      "The office calls the day before surgery with your arrival time. If you have not heard from us by 3 p.m. that day, call (713) 794-3457.",
    dueOffsetDays: -1,
    link: { label: "Call the office", href: "tel:+17137943457" },
    source: ["fixmyhips", "decisions"],
  },
  {
    id: "pack",
    block: "night-before",
    title: "Pack for one night",
    detail:
      "You will typically spend one night in the hospital, so pack for one night.",
    dueOffsetDays: -1,
    source: ["preop-letter"],
    derived: true,
  },
];

export const SURGERY_DAY: InfoSection[] = [
  {
    id: "arrive",
    title: "Arrive in the morning",
    points: [
      "You come to Texas Orthopedic Hospital in the morning, have surgery, and typically spend one night in the hospital.",
      "Your arrival time comes by phone the day before. No call by 3 p.m.? Call (713) 794-3457.",
    ],
    source: ["preop-letter", "fixmyhips"],
  },
  {
    id: "consent",
    title: "Sign the consent",
    points: [
      'A nurse will have you sign the operative permit. It will read "Hip Gluteus Repair." Additional procedures may be included depending on what is found in or around your hip.',
    ],
    source: ["preop-letter"],
  },
  {
    id: "anesthesia",
    title: "Anesthesia",
    points: [
      "The surgery is almost always performed under general anesthesia, sometimes with an additional regional anesthetic block.",
      "You will meet the anesthesia team at PreAdmit and again on the day of surgery.",
    ],
    source: ["preop-letter"],
  },
  {
    id: "surgery",
    title: "Surgery",
    points: [
      "A small incision is made on the outer part of your hip.",
      "The irritated bursa is removed if present, and a small window (fasciotomy) is made in the IT band so the gluteus tendon can be seen directly.",
      "Small anchors are used to sew the tendon back down to the bone. This secures the repair and lets the tendon heal.",
      "Surgery usually lasts 40 to 80 minutes, sometimes more.",
      "At the end, medication may be injected to reduce pain. The incision is closed with buried sutures, so no stitches need to be removed.",
    ],
    source: ["preop-letter"],
  },
  {
    id: "after",
    title: "After surgery",
    points: [
      "Ice starts right away.",
      "You will walk with crutches or a walker, putting only 20 lb on the operated leg, and wear the brace when walking.",
      "Most patients spend one night in the hospital.",
    ],
    source: ["discharge", "decisions", "preop-letter"],
  },
];

export const BIOLOGICS: InfoSection = {
  id: "biologics",
  title: "Biologic add-ons: PRP, stem cell and connective tissue matrix",
  points: [
    "Stem cells are used to repair diseased or damaged tissues.",
    "Stem cell, connective tissue matrix or PRP injections may not heal the tendon on their own, but there is emerging evidence they can augment and strengthen your surgical repair.",
    "These treatments can be done during your surgery.",
    "They are currently not covered by insurance.",
    "Call for pricing: (713) 794-3457, or email info@gomberamd.com.",
  ],
  source: ["fixmyhips", "decisions"],
};
