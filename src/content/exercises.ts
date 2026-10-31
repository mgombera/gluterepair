import type { Exercise } from "./types";

// Cues come only from the protocol text. Where a protocol gives no detail,
// cues are empty: the patient follows the video and the therapist.
// Sets and reps are not in the protocol and are intentionally absent.
// Angles go in therapistCues: patients see only the 90 degree sitting rule
// (decision 10/31/2026). Phase IV exercises come from fixmyhips.

const P: Exercise["source"] = ["pt-protocol"];
const IV: Exercise["source"] = ["fixmyhips", "pt-protocol"];

export const EXERCISES: Exercise[] = [
  // Phase I
  { id: "hamstring-sets", name: "Hamstring sets", source: P, cues: [], videoIds: ["v-hamstring-sets"] },
  { id: "seated-hamstring-stretch", name: "Seated hamstring stretch", source: P, cues: [], caution: "Keep within your 90 degree hip limit", videoIds: ["v-seated-hamstring-stretch"] },
  { id: "prone-lying", name: "Prone lying (lying on your stomach)", source: P, cues: ["Prone hangs", "Lie on your stomach 2 to 3 hours a day"], videoIds: ["v-prone-lying"] },
  { id: "ankle-pumps", name: "Ankle pumps", source: ["pt-protocol", "discharge"], cues: ["Perform continuously throughout the day"], videoIds: ["v-ankle-pumps"] },
  {
    id: "supine-prom",
    name: "Passive range of motion, lying on your back",
    source: P,
    therapistOnly: true,
    cues: [],
    therapistCues: [
      "Flexion to 75 degrees",
      "Abduction to 30 degrees",
      "External and internal rotation to 20 degrees, with the hip flexed",
      "30 repetitions in each plane of motion",
    ],
    videoIds: ["v-supine-prom"],
  },
  { id: "log-rolls", name: "Log rolls", source: P, cues: [], videoIds: [] },
  {
    id: "core-isometrics",
    name: "Isometrics",
    source: P,
    cues: ["Focus on the deep abdominals, obliques, gluteals and abductors"],
    videoIds: ["v-ta-bracing", "v-glute-sets", "v-abductor-isometric"],
  },
  {
    id: "circumduction",
    name: "Circumduction",
    source: P,
    therapistOnly: true,
    cues: [
      "Gently move the thigh in small circles, first clockwise, then counterclockwise",
      "Avoid rotation",
      "5 minutes in each direction",
    ],
    therapistCues: [
      "Hip flexed to 70 degrees, knee flexed to 90 degrees",
      "Repeat in neutral: hip abducted 20 degrees, knee extended",
    ],
    videoIds: ["v-circumduction", "v-circumduction-neutral"],
  },
  { id: "upright-bike", name: "Stationary bike, no resistance", source: P, cues: ["No resistance", "Keep the seat high", "No recumbent bike"], videoIds: ["v-upright-bike"] },
  { id: "cat-camel", name: "Quadruped cat and camel", source: P, cues: ["Be mindful of your range of motion limits"], videoIds: ["v-cat-camel"] },
  { id: "rockback", name: "Quadruped rockback", source: P, cues: ["With a slight backward pelvic tilt", "Be mindful of your range of motion limits"], videoIds: ["v-rockback"] },
  { id: "quadruped-hip-extension", name: "Quadruped hip extension", source: P, cues: ["Be mindful of your range of motion limits"], videoIds: ["v-quadruped-hip-extension"] },
  { id: "soft-tissue-mobilization", name: "Soft tissue mobilization", source: P, therapistOnly: true, cues: ["Start superficial, progress to deep"], videoIds: [] },
  { id: "scar-massage", name: "Scar massage at the incision", source: ["pt-protocol", "decisions"], cues: ["5 minutes"], caution: "Only once the incision is healed", videoIds: ["v-scar-massage"] },
  { id: "aquatic-therapy", name: "Aquatic therapy", source: P, cues: ["May begin after week 3, as long as the incision is well healed"], videoIds: [] },
  { id: "double-leg-bridge", name: "Double leg bridges", source: P, cues: [], videoIds: ["v-double-leg-bridge"] },
  { id: "stool-rotations", name: "Stool rotations", source: P, cues: ["Within your range of motion limits"], videoIds: [] },
  { id: "physioball-rollouts", name: "Physioball rollouts", source: P, cues: [], videoIds: ["v-physioball-rollouts"] },

  // Phase II
  { id: "clamshell", name: "Side-lying clamshells", source: P, cues: ["Progress to TheraBand resistance"], videoIds: ["v-clamshell"] },
  { id: "standing-abduction-isometric", name: "Standing hip abduction isometrics", source: P, cues: ["Against a foam roller or wall"], videoIds: ["v-standing-abduction-isometric"] },
  { id: "leg-press", name: "Leg press", source: P, cues: ["Low weight", "Both legs first (week 9), then one leg at a time (Phase III)"], videoIds: ["v-leg-press"] },
  { id: "quad-hamstring-strengthening", name: "Quadriceps and hamstring strengthening", source: P, cues: ["Advance as directed by your therapist"], therapistOnly: true, videoIds: [] },
  { id: "lateral-step-up", name: "Side step-ups", source: P, cues: [], videoIds: ["v-lateral-step-up"] },
  { id: "y-balance", name: "Y balance reaching", source: P, cues: [], videoIds: ["v-y-balance"] },
  { id: "balance-training", name: "Balance training", source: P, cues: ["Bosu ball, balance board, single leg stance"], videoIds: ["v-single-leg-stance"] },

  // Phase III
  { id: "pillar-bridge", name: "Half prone plank (pillar bridge)", source: P, cues: ["Progress to full plank or Bosu when appropriate"], videoIds: ["v-pillar-bridge"] },
  { id: "bodyweight-squat", name: "Double leg body weight squats", source: P, cues: [], videoIds: ["v-bodyweight-squat"] },
  { id: "single-leg-quarter-squat", name: "Single leg quarter squat", source: P, cues: [], videoIds: ["v-single-leg-quarter-squat"] },
  { id: "lunges", name: "Forward, lateral and reverse lunges", source: P, cues: [], videoIds: ["v-lunges", "v-lateral-lunge"] },
  { id: "glute-it-stretching", name: "Abductor, IT band and gluteus maximus stretching", source: P, cues: [], videoIds: ["v-glute-stretch", "v-it-band-stretch"] },
  { id: "elliptical", name: "Elliptical trainer", source: P, cues: ["Start with 5 minutes, increase 5 minutes each week"], videoIds: ["v-elliptical"] },
  { id: "resisted-bike", name: "Resisted biking", source: P, cues: ["Advance resistance as tolerated"], videoIds: [] },

  // Phase IV
  { id: "balance-squat-rotation", name: "Balance squats with rotations", source: IV, cues: [], videoIds: ["v-balance-squat-rotation"] },
  { id: "retro-walk-band", name: "Retro walking with resistance band", source: IV, cues: [], videoIds: ["v-retro-walk"] },
  { id: "lunge-trunk-rotation", name: "Lunge with trunk rotations", source: IV, cues: ["With a sport cord or physioball"], videoIds: ["v-lunge-trunk-rotation"] },
  { id: "running-progression", name: "Running progression", source: [...IV, "decisions"], cues: ["Not before 6 months", "Begin with single plane agilities"], videoIds: ["v-running-progression"] },
  { id: "quick-feet", name: "Quick feet", source: IV, cues: ["Not before 6 months"], videoIds: ["v-quick-feet"] },
  { id: "backpedal", name: "Backpedaling", source: IV, cues: ["Not before 6 months"], videoIds: ["v-backpedal"] },
  { id: "side-shuffle", name: "Side shuffles", source: IV, cues: ["Not before 6 months"], videoIds: ["v-side-shuffle"] },
  { id: "double-leg-plyometrics", name: "Double leg plyometrics", source: [...IV, "decisions"], cues: ["Not before 6 months", "For example broad jumps and 4-square hops"], videoIds: ["v-hopping", "v-four-square"] },
  { id: "z-w-cuts", name: "Z and W cuts", source: [...IV, "decisions"], cues: ["Not before 6 months"], videoIds: ["v-cutting"] },
  { id: "carioca", name: "Cariocas", source: IV, cues: ["Not before 6 months"], videoIds: ["v-carioca"] },
  { id: "single-leg-plyometrics", name: "Single leg plyometrics", source: [...IV, "decisions"], cues: ["Not before 6 months"], videoIds: ["v-single-leg-hop"] },
  { id: "sport-specific", name: "Return-to-sport and activity exercises", source: IV, cues: [], therapistOnly: true, videoIds: [] },
];

export const PT_OVERRIDE_NOTICE =
  "Your physical therapist has the final say. These are general suggestions from the standard protocol. If your therapist gives you different exercises, limits or timing, follow your therapist's plan. Stop any exercise that causes sharp pain.";

export const DATES_ARE_ESTIMATES =
  "Dates are estimates. You move on when your therapist confirms you meet the phase criteria.";

export function exerciseById(id: string): Exercise {
  const e = EXERCISES.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown exercise ${id}`);
  return e;
}
