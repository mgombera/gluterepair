import logo from "./logo.json";
// Practice facts used across the site. Clinical content lives in content/ (milestone 2).

export const PRACTICE = {
  doctor: "Mufaddal M. Gombera, MD",
  specialty: "Orthopedic Surgery and Sports Medicine",
  group: "Fondren Orthopedic Group",
  hospital: "Texas Orthopedic Hospital",
  address: "7401 Main Street, Houston, TX 77030",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=7401+Main+St+Houston+TX+77030",
  office: { label: "(713) 794-3457", tel: "+17137943457" },
  afterHours: { label: "(713) 799-2300", tel: "+17137992300" },
  preAdmit: { label: "(713) 395-6607", tel: "+17133956607" },
  email: "info@gomberamd.com",
  portalUrl: "https://15533-8.portal.athenahealth.com",
  consultUrl: "https://www.gomberamd.com/contact.html", // appointment request form
  logoUrl: logo.src, // local copy made by scripts/fetch-logo.mjs, or the gomberamd.com address
} as const;

export const SITE_URL = "https://gluterepair.com";
export const SITE_NAME = "gluterepair.com";

// Footer only (scope section 1). The last part links to gomberamd.com.
export const AUDIENCE_STATEMENT =
  "This site is for patients who are scheduled for gluteus tendon surgery with Dr. Gombera. To learn more or to be evaluated,";
export const AUDIENCE_LINK_TEXT = "request a consultation at gomberamd.com";
