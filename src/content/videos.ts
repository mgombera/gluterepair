import type { Video } from "./types";
import titles from "./video-titles.json";

// Video registry: Dr. Gombera's own videos only (decision 11/01/2026). The
// site is educational and shows no exercise videos. He has no gluteus repair
// video yet, so the list is empty and the Videos page says they are coming.
// A video renders only with an approvedOn date (MM/DD/YYYY).
// Titles and channels are filled by scripts/fetch-video-titles.mjs (YouTube oEmbed).

const RAW: Video[] = [];

const T = titles as Record<string, { title?: string; channel?: string }>;

export const VIDEOS: Video[] = RAW.map((v) => ({ ...v, ...T[v.youtubeId] }));

/** The one video notice: once at the top of the videos page and once under each video. */
export const VIDEO_NOTICE = "These videos are only a suggestion and are not formal medical advice.";

export const VIDEOS_COMING = "Dr. Gombera's videos about this surgery are coming soon.";

export function approvedVideos(): Video[] {
  return VIDEOS.filter((v) => Boolean(v.approvedOn));
}
