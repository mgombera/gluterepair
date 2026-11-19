"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ANATOMY, DIAGNOSIS } from "@/content";
import { Glute2D } from "./Glute2D";
import { PARTS, STAGE_NOTE, VIEWS } from "./parts";
import type { PartId, Stage, ViewId } from "./parts";

// The anatomy page (scope 6.7): the 3D model with a before/after switch,
// camera views, a "hide the IT band" checkbox, a tappable parts list with
// explanations and a note for each stage. Without WebGL, a 2D drawing.

const GluteModel3D = dynamic(() => import("./GluteModel3D"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-white">Loading the 3D model...</div>,
});

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const TEXT = Object.fromEntries(ANATOMY.map((a) => [a.id, a])) as Record<PartId, (typeof ANATOMY)[number]>;
const TEAR = DIAGNOSIS.find((d) => d.id === "tear")!;
const REPAIR = DIAGNOSIS.find((d) => d.id === "repair")!;

/** What each stage shows, from the approved diagnosis text. */
const STAGE_TEXT: Record<Stage, string> = {
  before: TEAR.points[1],
  after: REPAIR.points[0],
};

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="grid gap-1 rounded-xl border border-control-border bg-surface p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-12 rounded-[10px] px-2 font-semibold ${value === o.id ? "bg-brand text-white" : "text-text"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function GluteExplorer() {
  const [mode, setMode] = useState<"3d" | "2d" | null>(null);
  const [stage, setStage] = useState<Stage>("before");
  const [view, setView] = useState<ViewId>("side");
  const [hideItBand, setHideItBand] = useState(false);
  const [selected, setSelected] = useState<PartId | null>("gluteus-medius");

  useEffect(() => setMode(webglAvailable() ? "3d" : "2d"), []);

  const part = selected ? TEXT[selected] : null;

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        label="Stage"
        value={stage}
        options={[
          { id: "before", label: "Before surgery" },
          { id: "after", label: "After repair" },
        ]}
        onChange={setStage}
      />
      <p className="m-0">{STAGE_TEXT[stage]}</p>

      <div className="relative aspect-square w-full overflow-hidden rounded-[14px] bg-[#1d2440] sm:aspect-[4/3]">
        {mode === "3d" && <GluteModel3D selected={selected} onSelect={setSelected} stage={stage} view={view} hideItBand={hideItBand} />}
        {mode === "2d" && <Glute2D stage={stage} selected={selected} onSelect={setSelected} />}
      </div>
      <p className="m-0 text-base text-muted">
        {mode === "2d" ? "A flat drawing is shown because this browser cannot show 3D." : "Drag to turn the hip. Pinch or scroll to zoom. Tap a part to learn about it."}
      </p>

      {mode === "3d" && <Segmented label="View" value={view} options={VIEWS} onChange={setView} />}
      {mode === "3d" && (
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" checked={hideItBand} onChange={(e) => setHideItBand(e.target.checked)} className="h-6 w-6 shrink-0 accent-[var(--accent)]" />
          <span>Hide the IT band to see the tendons</span>
        </label>
      )}

      {part && (
        <section aria-live="polite" aria-labelledby="part-title" className="flex flex-col gap-2 rounded-[14px] border-2 border-accent bg-surface px-4 py-5">
          <h2 id="part-title" className="m-0 text-[21px] font-bold text-brand-ink">
            {part.title}
          </h2>
          {part.points.map((t) => (
            <p key={t} className="m-0">
              {t}
            </p>
          ))}
          <p className="m-0 text-base text-muted">{STAGE_NOTE[stage][selected!]}</p>
        </section>
      )}

      <section aria-labelledby="parts" className="flex flex-col gap-2">
        <h2 id="parts" className="m-0 text-[22px] font-bold text-brand-ink">
          Parts
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
          {PARTS.map((id) => (
            <li key={id}>
              <button
                type="button"
                aria-pressed={selected === id}
                onClick={() => setSelected(id)}
                className={`flex min-h-12 w-full items-center rounded-[10px] px-3.5 text-left font-semibold ${
                  selected === id ? "border-2 border-accent bg-accent/10" : "border border-control-border bg-surface"
                }`}
              >
                {TEXT[id].title}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
