"use client";

import { useState } from "react";
import { clearProfile } from "@/lib/profile";

// Removes the surgery date, procedure and checklist ticks from this device,
// after one confirming tap (scope section 4).
export function ClearMyInformation({ onCleared }: { onCleared?: () => void }) {
  const [asking, setAsking] = useState(false);
  const [done, setDone] = useState(false);
  const button = "inline-flex min-h-12 items-center rounded-[10px] px-4 font-semibold";

  if (done) {
    return (
      <p role="status" className="m-0 font-semibold">
        Your information was removed from this device.
      </p>
    );
  }
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={`${button} self-start border border-control-border text-text`}>
        Clear my information
      </button>
    );
  }
  return (
    <div role="group" aria-labelledby="clear-question" className="flex flex-col gap-3 rounded-[10px] border border-control-border p-4">
      <p id="clear-question" className="m-0 font-semibold">
        Remove your surgery date, procedure and checklist ticks from this device?
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            clearProfile();
            setDone(true);
            onCleared?.();
          }}
          className={`${button} bg-brand text-white`}
        >
          Yes, clear it
        </button>
        <button type="button" onClick={() => setAsking(false)} className={`${button} border border-control-border text-text`}>
          Keep it
        </button>
      </div>
    </div>
  );
}
