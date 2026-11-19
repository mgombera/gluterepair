import type { Metadata } from "next";
import { VIDEO_NOTICE, VIDEOS_COMING, approvedVideos } from "@/content";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Container, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

// Dr. Gombera's own videos only (decision 11/01/2026). None yet.

const r = routeInfo("/videos");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/videos" } };

export default function VideosPage() {
  const videos = approvedVideos();
  return (
    <Container className="flex max-w-3xl flex-col gap-5 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      {videos.length === 0 ? (
        <p className="m-0 rounded-[14px] border border-border bg-surface p-5 text-lg">{VIDEOS_COMING}</p>
      ) : (
        <>
          <p role="note" className="m-0 rounded-[14px] border-2 border-accent bg-surface p-4 font-semibold">
            {VIDEO_NOTICE}
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {videos.map((v) => (
              <VideoPlayer key={v.id} video={v} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
