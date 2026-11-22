import type { Video } from "./types";
import titles from "./video-titles.json";

// Video registry: Dr. Gombera's own videos only (decision 11/01/2026). The
// site is educational and shows no exercise videos. A video renders only with
// an approvedOn date (MM/DD/YYYY). He added these two on 11/22/2026; the
// summaries are written from each video's YouTube description.
// Titles and channels are filled by scripts/fetch-video-titles.mjs (YouTube oEmbed).

const RAW: Video[] = [
  {
    id: "gluteus-tendon-tear",
    youtubeId: "BpZXnE8FFTE",
    source: "dr-gombera",
    topics: ["overview"],
    summary:
      "Dr. Gombera explains the three gluteal muscles, how their tendons keep the hip stable, and how tears develop over time. He also covers treatment without surgery and when a torn tendon is reattached to the bone with sutures and anchors.",
    approvedOn: "11/22/2026",
  },
  {
    id: "day-in-the-or",
    youtubeId: "W8p10IP0ToU",
    source: "dr-gombera",
    topics: ["surgery"],
    summary:
      "Go behind the scenes on a surgery day with Dr. Gombera and his team at Fondren Orthopaedic Group, from preparing for each case to the operating room.",
    approvedOn: "11/22/2026",
  },
];

const T = titles as Record<string, { title?: string; channel?: string }>;

export const VIDEOS: Video[] = RAW.map((v) => ({ ...v, ...T[v.youtubeId] }));

/** The one video notice: once at the top of the videos page and once under each video. */
export const VIDEO_NOTICE = "These videos are only a suggestion and are not formal medical advice.";

export const VIDEOS_COMING = "Dr. Gombera's videos about this surgery are coming soon.";

export function approvedVideos(): Video[] {
  return VIDEOS.filter((v) => Boolean(v.approvedOn));
}
