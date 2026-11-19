"use client";

import { HOME_PROGRAM_PATHWAYS } from "@/content";
import { useProfile } from "@/lib/profile";
import { procedureLabel } from "@/lib/procedures";

// The myHealthTrack pathway for each procedure, in the app's own words. The
// patient's own procedure is marked when it is saved on this device.
export function HomeProgramPathways() {
  const profile = useProfile();
  const mine = profile?.procedure === "different" ? null : profile?.procedure;
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {HOME_PROGRAM_PATHWAYS.map((p) => (
        <li
          key={p.procedure}
          aria-current={mine === p.procedure ? "true" : undefined}
          className={`flex flex-col gap-1 rounded-[10px] p-3.5 ${mine === p.procedure ? "border-2 border-accent bg-accent/10" : "border border-control-border"}`}
        >
          <span className="text-base text-muted">
            {procedureLabel(p.procedure)}
            {mine === p.procedure ? " (your surgery)" : ""}
          </span>
          <span className="font-semibold">{p.pathway ? `Pathway: "${p.pathway}"` : p.note}</span>
        </li>
      ))}
    </ul>
  );
}
