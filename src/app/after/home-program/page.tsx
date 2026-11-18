import type { Metadata } from "next";
import Image from "next/image";
import {
  HOME_PROGRAM_CHOOSE,
  HOME_PROGRAM_INTRO,
  HOME_PROGRAM_NOTICE,
  HOME_PROGRAM_QR,
  HOME_PROGRAM_START,
  HOME_PROGRAM_TIERS,
  HOME_PROGRAM_URL,
} from "@/content";
import { HomeProgramPathways } from "@/components/HomeProgramPathways";
import { PhoneIcon } from "@/components/icons";
import { Bullets, Container, PageHeader, SectionTitle } from "@/components/ui";
import { routeInfo } from "@/lib/routes";
import { PRACTICE } from "@/lib/site";

// Optional myHealthTrack home program (scope 6.5, decisions of 11/01/2026).
// The site only links out; patients sign up in the app.

const r = routeInfo("/after/home-program");
export const metadata: Metadata = { title: r.title, description: r.summary, alternates: { canonical: "/after/home-program" } };

const card = "flex flex-col gap-3 rounded-[14px] border border-border bg-surface px-4 py-5 sm:px-6";

export default function HomeProgramPage() {
  return (
    <Container className="flex max-w-2xl flex-col gap-5 py-6 sm:py-10">
      <PageHeader title={r.title} intro={<p className="m-0 text-muted">{r.summary}</p>} />
      <p role="note" className="m-0 rounded-[14px] border-2 border-accent bg-surface p-4 font-semibold">
        {HOME_PROGRAM_NOTICE}
      </p>

      <section aria-labelledby="hp-what" className={card}>
        <h2 id="hp-what" className="m-0 text-[21px] font-bold text-brand-ink">
          {HOME_PROGRAM_INTRO.title}
        </h2>
        <Bullets items={HOME_PROGRAM_INTRO.points} />
      </section>

      <section aria-labelledby="hp-choose" className={card}>
        <h2 id="hp-choose" className="m-0 text-[21px] font-bold text-brand-ink">
          {HOME_PROGRAM_CHOOSE.title}
        </h2>
        <p className="m-0">{HOME_PROGRAM_CHOOSE.points[0]}</p>
        <HomeProgramPathways />
        <p className="m-0 text-muted">{HOME_PROGRAM_CHOOSE.points[1]}</p>
      </section>

      <section aria-labelledby="hp-tiers" className="flex flex-col gap-3">
        <SectionTitle id="hp-tiers">What the app offers</SectionTitle>
        {HOME_PROGRAM_TIERS.map((t) => (
          <div key={t.id} className={card}>
            <h3 className="m-0 text-[19px] font-bold text-brand-ink">
              <span className="mr-2 rounded-full border border-control-border px-2.5 py-0.5 text-sm font-semibold text-text">
                {t.free ? "Free" : "Premium"}
              </span>
              {t.label}
            </h3>
            <Bullets items={t.points} />
          </div>
        ))}
      </section>

      <section aria-labelledby="hp-start" className={card}>
        <h2 id="hp-start" className="m-0 text-[21px] font-bold text-brand-ink">
          {HOME_PROGRAM_START.title}
        </h2>
        <p className="m-0">{HOME_PROGRAM_START.points[0]}</p>
        <a
          href={HOME_PROGRAM_URL}
          rel="noopener"
          className="flex min-h-14 items-center justify-center rounded-xl bg-accent px-5 text-lg font-semibold text-accent-ink no-underline"
        >
          Open myHealthTrack
        </a>
        <div className="flex flex-col items-center gap-2 py-2">
          <Image src={HOME_PROGRAM_QR} alt="QR code that opens myHealthTrack at mht.link/fondren2" width={200} height={200} className="rounded-lg bg-white p-2" unoptimized />
          <span className="text-base text-muted">mht.link/fondren2</span>
        </div>
        <a
          href={`tel:${PRACTICE.office.tel}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-accent px-4 text-center font-semibold text-accent no-underline"
        >
          <PhoneIcon className="shrink-0" />
          <span>
            Call <span className="whitespace-nowrap">{PRACTICE.office.label}</span> with questions
          </span>
        </a>
      </section>
    </Container>
  );
}
