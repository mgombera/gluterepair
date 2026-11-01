import type { Metadata } from "next";
import { format } from "date-fns";
import * as C from "@/content";
import type { Exercise, Phase, Protocol, Sourced, SourceId } from "@/content";
import { Container, PageHeader, SectionTitle } from "@/components/ui";
import { braceText, keyRules, romLimits } from "@/lib/protocolText";

// Gate 1 review tool for Dr. Gombera (scope section 10). Every clinical item on
// the site, the protocols side by side, and the items grouped by their main
// source document. Derived items are highlighted. Not linked, not in the
// sitemap, not indexed. Print it to PDF from the browser (light theme, letter).

export const metadata: Metadata = {
  title: "Content proof",
  robots: { index: false, follow: false },
};

type Item = { kind: string; title: string; points: string[] } & Sourced;

const info = (kind: string, s: C.InfoSection): Item => ({ kind, title: s.title, points: s.points, source: s.source, derived: s.derived, approvedOn: s.approvedOn });
const pending = (s: Sourced) => s.derived && !s.approvedOn;
const label = (id: C.ProtocolId) => (id === "standard" ? "Open Gluteus Tendon Repair" : "Gluteus Maximus Transfer");

const ITEMS: Item[] = [
  ...C.CHECKLIST.map((c) => ({ kind: "Before surgery checklist", title: c.title, points: [c.detail], source: c.source, derived: c.derived, approvedOn: c.approvedOn })),
  ...C.SURGERY_DAY.map((s) => info("Surgery day", s)),
  info("Add-ons", C.BIOLOGICS),
  ...C.HOME_CARE.map((s) => info("Home care", s)),
  info("Medications", C.STANDARD_MEDICATIONS),
  info("Medications", C.MEDICATION_TIPS),
  info("When to call", C.CALL_NOW),
  info("When to call", C.USUALLY_NORMAL),
  info("Your diagnosis", C.OUTCOMES),
  ...C.DIAGNOSIS.map((s) => info("Your diagnosis", s)),
  ...C.ANATOMY.map((s) => info("3D anatomy model", s)),
  ...C.FAQ.map((f) => ({ kind: `FAQ, ${f.group} surgery`, title: f.q, points: [f.a], source: f.source, derived: f.derived, approvedOn: f.approvedOn })),
  { kind: "Home program", title: "Notice at the top of the page", points: [C.HOME_PROGRAM_NOTICE, `Dashboard and timeline line: ${C.HOME_PROGRAM_LINE}`, `Privacy page: ${C.HOME_PROGRAM_PRIVACY}`], source: ["decisions"], derived: true },
  info("Home program", C.HOME_PROGRAM_INTRO),
  info("Home program", C.HOME_PROGRAM_CHOOSE),
  ...C.HOME_PROGRAM_PATHWAYS.map((x) => ({ kind: "Home program pathway", title: label(x.procedure), points: [x.pathway ? `"${x.pathway}"` : (x.note ?? "")], source: x.source, derived: x.derived })),
  ...C.HOME_PROGRAM_TIERS.map((t) => ({ kind: "Home program tier", title: `${t.free ? "Free" : "Premium"}: ${t.label}`, points: t.points, source: t.source, derived: t.derived })),
  info("Home program", C.HOME_PROGRAM_START),
];

// Scope section 11: where the site follows a decision instead of the printed text.
const CHANGES: [doc: string, printed: string, site: string][] = [
  ["Pre-op letter", "PreAdmit 713-794-3525", "(713) 395-6607"],
  ["Pre-op letter", "4 weeks on crutches or a walker", "Same, plus: some patients need a cane after that"],
  ["Pre-op letter", "Brace for 4 to 6 weeks when walking", "6 weeks when walking"],
  ["Pre-op letter", "Pain pills every 3-4 hours as needed", "Norco every 6 hours as needed"],
  ["Pre-op letter", "6 months (or more) to return to an elite level", "Same, plus: running and high impact at 6 months"],
  ["Discharge sheet", "20 lb with crutches for 6 weeks", "4 weeks, crutches or a walker"],
  ["Discharge sheet", "Brace when walking and sitting, for the first 4 weeks", "When walking, for 6 weeks"],
  ["Discharge sheet", "Sedentary work 4-7 days after surgery", "1 to 2 weeks"],
  ["Discharge sheet", "Driving after you are evaluated in the office", "Off narcotics, able to lift the leg actively (around 3 weeks), full control"],
  ["PT protocol", "Brace 4 weeks, 20 lb for 6 weeks", "Brace 6 weeks, 20 lb for 4 weeks"],
  ["PT protocol", "Phase III weeks 10-15 (overview)", "Weeks 10 to 16"],
  ["PT protocol", "Running at 3 months", "Running and high impact at 6 months"],
  ["PT protocol", "Scar massage at portal incisions", "At the incision"],
  ["PT protocol", "Range-of-motion angles", "Kept for the therapist; patients see only the 90 degree sitting rule"],
];

const QUESTIONS = [
  'myHealthTrack: does the "Hip Arthroscopy w/Gluteus Medius Repair" pathway match your protocol (20 lb for 4 weeks, brace for 6 weeks)? Until you confirm, the Home Program page says the app\'s weeks may differ and to follow the protocol and the therapist.',
  "myHealthTrack: Gluteus Maximus Transfer patients are told to ask the office which pathway to use. Does the office know what to tell them?",
  "myHealthTrack: the flyer claims below are left off the site. Approve any you want shown.",
  "Please review the highlighted items: the home program text and the three checklist items still waiting from 10/31/2026.",
];

// The five questions from the 10/31/2026 proof and his answers.
const ANSWERED: [question: string, answer: string][] = [
  ["Phase IV: strengthening from month 4; running, agility and jumping at 6 months", "Correct"],
  ["Gluteus Maximus Transfer description under Your diagnosis", "Correct, approved as written"],
  ["Max transfer: after at least 6 weeks, weight bearing as tolerated with a cane during the transition", "Correct"],
  ["The 4 derived descriptions in the 3D model text", "Correct, approved as written"],
  ["A gluteus repair video to replace the dropped overview videos", "Not yet; the Videos page says videos are coming"],
];

// Other changes he made on 11/01/2026 (scope section 11).
const SCOPE_CHANGES = [
  "The site is educational only: no exercise library, weekly exercise ticks, exercise links on the timeline, or YouTube exercise videos. The exercises below stay only for the protocol print sheet and the therapist.",
  "New Home Program tab under After surgery for the optional myHealthTrack app.",
  "When to call is the last After tab, in calm plain cards. The footer Red flags link is gone; /red-flags and /after/exercises redirect.",
  "Checklist, one week before: driver, time off, cold therapy, biologics, home setup, then the optional home program. The anesthesia-history item is removed (PreAdmit covers it).",
  "A Home button in the header. No prehab page (no gluteus prehab protocol).",
];


function Tags({ s }: { s: Sourced }) {
  return (
    <p className="m-0 mt-2 flex flex-wrap gap-1.5 text-sm">
      {s.source.map((id) => (
        <span key={id} className="rounded border border-border px-1.5 py-0.5 text-muted">
          {id}
        </span>
      ))}
      {pending(s) && <span className="rounded bg-[#7a5b00] px-1.5 py-0.5 font-semibold text-white [print-color-adjust:exact]">Derived: please approve</span>}
      {s.derived && s.approvedOn && <span className="rounded border border-border px-1.5 py-0.5 font-semibold">Derived, approved {s.approvedOn}</span>}
    </p>
  );
}

function Box({ s, children }: { s: Sourced; children: React.ReactNode }) {
  return (
    <div
      className={`break-inside-avoid rounded-[10px] border p-4 ${pending(s) ? "theme-light border-[#7a5b00] bg-[#fff4c2] text-text [print-color-adjust:exact]" : "border-border bg-surface"}`}
    >
      {children}
      <Tags s={s} />
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
      {items.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

const exerciseName = (id: string) => C.exerciseById(id).name;

function PhaseBlock({ ph, other }: { ph: Phase; other: Phase }) {
  const notesDiffer = (i: number) => JSON.stringify(ph.weeks[i]?.notes ?? []) !== JSON.stringify(other.weeks[i]?.notes ?? []);
  return (
    <Box s={ph}>
      <h4 className="m-0 text-lg font-bold">
        Phase {ph.n}: {ph.name} ({ph.rangeLabel})
      </h4>
      <p className="m-0 mt-2 font-semibold">Goals</p>
      <List items={ph.goals} />
      {ph.weeks.map((w, i) => (
        <div key={`${w.fromWeek}-${i}`} className="mt-2">
          <p className="m-0 font-semibold">{w.fromWeek === w.toWeek ? `Week ${w.fromWeek}` : `Weeks ${w.fromWeek} to ${w.toWeek}`}</p>
          <List items={w.exerciseIds.map(exerciseName)} />
          {(w.notes ?? []).map((n) => (
            <p key={n} className={`m-0 mt-1 text-sm ${notesDiffer(i) ? "font-semibold" : ""}`}>
              Note: {n}
            </p>
          ))}
        </div>
      ))}
      {ph.cardio && <p className="m-0 mt-2">Cardio: {ph.cardio.map(exerciseName).join(", ")}</p>}
      {ph.criteriaToProgress.length > 0 && (
        <>
          <p className="m-0 mt-2 font-semibold">Criteria to progress</p>
          <List items={ph.criteriaToProgress} />
        </>
      )}
    </Box>
  );
}

function ProtocolRows({ a, b }: { a: Protocol; b: Protocol }) {
  const rows: [string, string, string][] = [
    ["Weight bearing", keyRules(a)[0], keyRules(b)[0]],
    ["After that", a.afterWeightBearing, b.afterWeightBearing],
    ["Brace", `When walking, ${braceText(a)}`, `When walking, ${braceText(b)}`],
    ["Patient limits", romLimits(a).join("; "), romLimits(b).join("; ")],
    ["Therapist angles (not shown to patients)", a.therapistRom.join("; "), b.therapistRom.join("; ")],
    ["Prone lying", a.proneLying ? "2 to 3 hours a day in Phase I" : "No", b.proneLying ? "2 to 3 hours a day in Phase I" : "No"],
    ["Aqua therapy", `After week ${a.aquaTherapyAfterWeek}`, `After week ${b.aquaTherapyAfterWeek}`],
    ["Running and high impact", `${a.runningAfterMonths} months`, `${b.runningAfterMonths} months`],
    ["Driving", a.driving, b.driving],
    ["Sources", a.source.join(", "), b.source.join(", ")],
  ];
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Table comparing the two protocols">
      <table className="w-full border-collapse text-left text-base">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2" scope="col">
              <span className="sr-only">Rule</span>
            </th>
            <th className="p-2" scope="col">{a.title}</th>
            <th className="p-2" scope="col">{b.title}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, x, y]) => (
            <tr key={label} className="border-b border-border align-top">
              <th className="p-2 font-semibold" scope="row">
                {label}
              </th>
              <td className="p-2">{x}</td>
              <td className={`p-2 ${x !== y ? "font-semibold" : ""}`}>{y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExerciseBox({ e }: { e: Exercise }) {
  return (
    <Box s={e}>
      <h4 className="m-0 font-bold">
        {e.name}
        {e.therapistOnly ? " (done with the therapist)" : ""}
      </h4>
      {e.cues.length > 0 && <List items={e.cues} />}
      {e.therapistCues && <p className="m-0 mt-1 text-sm">For the therapist only: {e.therapistCues.join("; ")}</p>}
      {e.caution && <p className="m-0 mt-1 text-sm">Caution: {e.caution}</p>}
    </Box>
  );
}

export default function ProofPage() {
  const { standard, "max-transfer": max } = C.PROTOCOLS;
  const derivedCount = [...ITEMS, ...C.EXERCISES, ...standard.phases].filter(pending).length;
  const bySource = (id: SourceId) => ITEMS.filter((it) => it.source[0] === id);

  return (
    <Container className="flex flex-col gap-10 py-10 print:py-0 print:text-[13px]">
      <PageHeader
        eyebrow={`Content proof for Dr. Gombera, ${format(new Date(), "MM/dd/yyyy")}`}
        title="Gluteus Tendon Repair: clinical content"
        intro={
          <div className="flex flex-col gap-2">
            <p className="m-0">
              Every clinical statement on gluterepair.com, for your sign-off (Gate 1). Each item lists its sources. Highlighted items are my plain-language
              inferences ({derivedCount} waiting): approve, edit or remove each one. Items you approved on 11/01/2026 are no longer highlighted.
            </p>
            <p className="m-0 text-muted">
              Status: {C.CONTENT_REVIEWED_ON ? `approved ${C.CONTENT_REVIEWED_ON}` : "waiting for your review"}.
            </p>
          </div>
        }
      />

      <section aria-labelledby="questions" className="flex flex-col gap-3">
        <SectionTitle id="questions">Questions for you</SectionTitle>
        <ol className="m-0 flex list-decimal flex-col gap-2 pl-6">
          {QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="omitted" className="flex flex-col gap-3">
        <SectionTitle id="omitted">Flyer claims left off the site</SectionTitle>
        <List items={C.HOME_PROGRAM_OMITTED_CLAIMS} />
      </section>

      <section aria-labelledby="answered" className="flex flex-col gap-3">
        <SectionTitle id="answered">Your answers of 11/01/2026</SectionTitle>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Table of your answers">
          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2" scope="col">Question</th>
                <th className="p-2" scope="col">Your answer</th>
              </tr>
            </thead>
            <tbody>
              {ANSWERED.map(([q, a]) => (
                <tr key={q} className="border-b border-border align-top">
                  <td className="p-2">{q}</td>
                  <td className="p-2 font-semibold">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="m-0 text-xl font-bold">Other changes you made</h3>
        <List items={SCOPE_CHANGES} />
      </section>

      <section aria-labelledby="sources" className="flex flex-col gap-3">
        <SectionTitle id="sources">Sources</SectionTitle>
        <dl className="m-0 grid gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
          {C.SOURCE_ORDER.map((id) => (
            <div key={id} className="contents">
              <dt className="font-semibold">{id}</dt>
              <dd className="m-0">{C.SOURCES[id]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="changes" className="flex flex-col gap-3">
        <SectionTitle id="changes">Where the site follows your decisions, not the printed text</SectionTitle>
        <p className="m-0 text-muted">From your decisions of 10/31/2026. Updating the printed documents keeps patients from seeing two answers.</p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Table of changes from the printed text">
          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2" scope="col">Document</th>
                <th className="p-2" scope="col">Printed text</th>
                <th className="p-2" scope="col">Site says</th>
              </tr>
            </thead>
            <tbody>
              {CHANGES.map(([doc, printed, site]) => (
                <tr key={printed} className="border-b border-border align-top">
                  <td className="p-2">{doc}</td>
                  <td className="p-2">{printed}</td>
                  <td className="p-2 font-semibold">{site}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="notices" className="flex flex-col gap-3">
        <SectionTitle id="notices">Notices, word for word</SectionTitle>
        <List items={[C.PROTOCOL_NOTICE, C.PT_OVERRIDE_NOTICE, C.MEDICATION_NOTICE, C.DATES_ARE_ESTIMATES, C.VIDEO_NOTICE, C.VIDEOS_COMING, C.HOME_EXERCISE_NOTE]} />
      </section>

      <section aria-labelledby="pt-protocol" className="flex flex-col gap-4">
        <SectionTitle id="pt-protocol">1. PT protocol: both procedures side by side</SectionTitle>
        <p className="m-0 text-muted">Bold marks where the Gluteus Maximus Transfer differs. The phases are the same for both.</p>
        <ProtocolRows a={standard} b={max} />
        <h3 className="m-0 text-xl font-bold">Phases (Open Gluteus Tendon Repair)</h3>
        {standard.phases.map((ph, i) => (
          <PhaseBlock key={ph.n} ph={ph} other={max.phases[i]} />
        ))}
        <h3 className="m-0 text-xl font-bold">Gluteus Maximus Transfer: phase notes that differ</h3>
        <List
          items={[
            ...max.phases[0].goals
              .map((g, i) => [standard.phases[0].goals[i], g])
              .filter(([a, b]) => a !== b)
              .map(([a, b]) => `Phase I goal. Repair: ${a}. Transfer: ${b}.`),
            ...max.phases.flatMap((ph, i) =>
              ph.weeks
                .map((w, j) => [standard.phases[i].weeks[j], w] as const)
                .filter(([a, b]) => JSON.stringify(a.notes ?? []) !== JSON.stringify(b.notes ?? []))
                .map(([a, b]) => {
                  const only = (x: string[] = [], y: string[] = []) => x.filter((n) => !y.includes(n)).join("; ") || "nothing extra";
                  return `Phase ${ph.n}, week ${b.fromWeek}. Repair: ${only(a.notes, b.notes)}. Transfer: ${only(b.notes, a.notes)}.`;
                }),
            ),
          ]}
        />
        <h3 className="m-0 text-xl font-bold">Exercises named in the protocol ({C.EXERCISES.length})</h3>
        <p className="m-0 text-muted">For the protocol print sheet and the therapist only. The site shows no exercise library, ticks or videos.</p>
        <div className="grid gap-3 md:grid-cols-2 print:block print:[&>*]:mb-2">
          {C.EXERCISES.map((e) => (
            <ExerciseBox key={e.id} e={e} />
          ))}
        </div>
      </section>

      {C.SOURCE_ORDER.filter((id) => id !== "pt-protocol").map((id, n) => {
        const items = bySource(id);
        if (items.length === 0) return null;
        return (
          <section key={id} aria-labelledby={`src-${id}`} className="flex flex-col gap-3">
            <SectionTitle id={`src-${id}`}>
              {n + 2}. {C.SOURCES[id]}
            </SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 print:block print:[&>*]:mb-2">
              {items.map((it) => (
                <Box key={`${it.kind}-${it.title}`} s={it}>
                  <p className="m-0 text-sm font-semibold text-muted">{it.kind}</p>
                  <h3 className="m-0 text-lg font-bold">{it.title}</h3>
                  <List items={it.points} />
                </Box>
              ))}
            </div>
          </section>
        );
      })}
    </Container>
  );
}
