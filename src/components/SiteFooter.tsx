import Link from "next/link";
import { AUDIENCE_LINK_TEXT, AUDIENCE_STATEMENT, PRACTICE } from "@/lib/site";

// Footer only: the audience statement and the reviewed-by line, with no date
// (scope sections 1 and 8).
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-footer text-[15px] text-muted print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5">
        <p className="m-0">
          {AUDIENCE_STATEMENT}{" "}
          <a href={PRACTICE.consultUrl} className="underline underline-offset-2">
            {AUDIENCE_LINK_TEXT}
          </a>
          .
        </p>
        <p className="m-0">Content reviewed by Dr. Gombera.</p>
        <p className="m-0">
          <Link href="/privacy" className="inline-flex min-h-12 items-center underline underline-offset-2">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}
