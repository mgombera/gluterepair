import type { Metadata } from "next";
import { HOME_PROGRAM_PRIVACY } from "@/content";
import { Card, Container, PageHeader } from "@/components/ui";
import { routeInfo } from "@/lib/routes";

// Privacy (scope section 8), from the approved sibling-site page.

const r = routeInfo("/privacy");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/privacy" } };

const POINTS: { title: string; text: string }[] = [
  {
    title: "What this site stores",
    text: "Your surgery date, your procedure, and the checklist items you tick off. They are saved only in this browser on this device, so the site can show what applies to you today.",
  },
  {
    title: "What it never collects",
    text: "No name, no contact details, no medical records, no forms and no account. Nothing you enter is sent to us or to anyone else.",
  },
  {
    title: "Removing your information",
    text: 'Use "Clear my information" on the home page, or tap "Change or clear" under the header. You can also clear this site\'s data in your browser settings.',
  },
  {
    title: "Visitor counts",
    text: "We count page visits without cookies and without identifying you, to see which pages help patients most. These counts never include your surgery date or procedure.",
  },
  {
    title: "Videos",
    text: "Videos are hosted on YouTube. Nothing loads from YouTube until you tap play, and then the privacy-enhanced youtube-nocookie.com player is used. YouTube's own privacy policy applies once a video plays.",
  },
  { title: "myHealthTrack", text: HOME_PROGRAM_PRIVACY },
  {
    title: "Contacting us",
    text: "Phone calls, email and the patient portal are handled by our office under its usual privacy practices, separate from this website.",
  },
];

export default function PrivacyPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-5 py-6 sm:py-10">
      <PageHeader title="Your privacy" intro={<p className="m-0 text-muted">Short version: your information stays on your device.</p>} />
      {POINTS.map((p) => (
        <Card key={p.title} className="flex flex-col gap-2">
          <h2 className="m-0 text-[21px] font-bold text-brand-ink">{p.title}</h2>
          <p className="m-0">{p.text}</p>
        </Card>
      ))}
    </Container>
  );
}
