import type { InfoSection } from "./types";

// Red flags and outcomes (scope 6.8). Sources: discharge sheet, pre-op letter.

export const USUALLY_NORMAL: InfoSection = {
  id: "normal",
  title: "Usually normal",
  points: [
    "Some swelling and numbness",
    "Bleeding, swelling or bruising around the hip",
    "Swelling in the groin, buttock and thigh, and bruising on the outer leg",
    "A small amount of drainage from the incision",
    "A low-grade temperature",
    "More pain on day 1 or 2 after surgery",
    "Stiffness and discomfort for a few days",
  ],
  source: ["discharge", "preop-letter"],
};

export const CALL_NOW: InfoSection = {
  id: "call",
  title: "Call us if you have",
  points: [
    "Painful swelling or numbness",
    "Pain that will not let up",
    "Fever over 101°F, or chills",
    "Continuous drainage or bleeding from the incision",
    "Difficulty breathing",
    "Excessive nausea or vomiting",
    "Calf pain",
  ],
  source: ["discharge"],
};

export const CALL_NUMBERS = {
  office: "For questions or problems, call the office at (713) 794-3457.",
  afterHours: "After hours and on weekends, reach the on-call physician at (713) 799-2300.",
  emergency: "If you have an emergency that needs immediate attention, go to the nearest emergency room.",
  afterHoursUse: "Please keep after-hours and weekend calls for emergencies; we will handle less urgent problems during the week.",
};

export const OUTCOMES: InfoSection = {
  id: "outcomes",
  title: "Results and risks",
  points: [
    "This surgery is successful about 85 to 90 percent of the time. It is most successful at relieving pain.",
    "Returning to vigorous work or sport depends on the damage to your hip, how well it heals, how well you rehabilitate and how demanding your activity is.",
    "Complications are rare (less than 1 percent), and most are temporary. For example, the infection rate after hip surgery is less than 1 in 1,000.",
    "Possible complications include re-tear of the repair, infection, fracture, increased pain, impotence, bleeding, nerve injury, abandoned procedure, blood clot in the leg, instrument breakage, avascular necrosis of the femoral head, delayed wound healing, worsening symptoms, arthritis, stiffness, need for further surgery, and the risks of anesthesia itself.",
  ],
  source: ["preop-letter"],
};
