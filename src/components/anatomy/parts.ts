// Parts of the gluteus model. Patient text for each comes from ANATOMY in
// content/learn.ts (approved 11/01/2026); the ids match.

export type PartId = "greater-trochanter" | "gluteus-medius" | "gluteus-minimus" | "footprint" | "bursa" | "it-band" | "anchors";
export type ViewId = "side" | "back" | "front";
export type Stage = "before" | "after";

/** Parts in list order. */
export const PARTS: PartId[] = ["greater-trochanter", "gluteus-medius", "gluteus-minimus", "footprint", "bursa", "it-band", "anchors"];

/** What each part looks like in each stage of the model (not clinical text). */
export const STAGE_NOTE: Record<Stage, Record<PartId, string>> = {
  before: {
    "greater-trochanter": "The bone the tendons attach to.",
    "gluteus-medius": "Shown torn away from the bone and pulled up. The torn end is red.",
    "gluteus-minimus": "Shown torn with the gluteus medius. It lies under the gluteus medius, which fades so you can see it.",
    footprint: "Shown bare (orange) where the tendons tore away.",
    bursa: "Shown irritated (pink) over the bone.",
    "it-band": "Shown whole, over the outside of the hip.",
    anchors: "Not placed yet. Switch to After repair to see them.",
  },
  after: {
    "greater-trochanter": "The bone the tendons attach to.",
    "gluteus-medius": "Shown sewn back down onto the footprint. The gluteus minimus lies under it and in front of it.",
    "gluteus-minimus": "Shown sewn back down at the front of the bone, next to the gluteus medius. The gluteus medius fades so you can see it.",
    footprint: "Covered again by the repaired tendon.",
    bursa: "Removed, so it no longer shows.",
    "it-band": "Shown with the small window (fasciotomy) made to reach the tendon.",
    anchors: "Two anchors in the inner row and two in the outer row (white), with crossing sutures (blue) over both tendons.",
  },
};

export const VIEWS: { id: ViewId; label: string }[] = [
  { id: "side", label: "Side" },
  { id: "back", label: "Back" },
  { id: "front", label: "Front" },
];
