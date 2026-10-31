"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PRIMARY_NAV } from "@/lib/routes";
import { PRACTICE, SITE_NAME } from "@/lib/site";
import { PhoneIcon, MenuIcon, CloseIcon, AlertIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

// Navy band with the site name and Call button, then the Before / After
// switch and the Red flags link (scope section 3, docs/design).

function ModeSwitch({ pathname }: { pathname: string }) {
  const isBefore = pathname.startsWith("/before");
  const isAfter = pathname.startsWith("/after");
  const base =
    "flex min-h-12 items-center justify-center rounded-[10px] px-3 font-semibold no-underline";
  const on = "bg-brand text-white";
  const off = "border border-control-border text-brand-ink";
  return (
    <nav aria-label="Surgery stage" className="grid grid-cols-2 gap-2">
      <Link href="/before" aria-current={isBefore ? "page" : undefined} className={`${base} ${isBefore ? on : off}`}>
        Before surgery
      </Link>
      <Link href="/after" aria-current={isAfter ? "page" : undefined} className={`${base} ${isAfter ? on : off}`}>
        After surgery
      </Link>
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const navLink = (active: boolean) =>
    `flex min-h-12 items-center rounded-[10px] px-3 font-semibold no-underline ${active ? "bg-white/15 text-white" : "text-white hover:bg-white/10"}`;

  return (
    <header className="print:hidden">
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
          <Link href="/" className="flex flex-col leading-tight text-white no-underline" aria-current={pathname === "/" ? "page" : undefined}>
            <span className="text-[19px] font-bold">{SITE_NAME}</span>
            <span className="text-sm text-[#D6DBEA]">Dr. Mufaddal Gombera</span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={navLink(pathname === item.href)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden min-h-12 min-w-12 items-center justify-center rounded-[10px] border border-white/40 text-white hover:bg-white/10 lg:inline-flex" />
            <a
              href={`tel:${PRACTICE.office.tel}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-[#B54708] px-[18px] text-[17px] font-semibold text-white no-underline"
            >
              <PhoneIcon />
              Call
            </a>
            <button
              type="button"
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-[10px] border border-white/40 text-white lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Main" className="mx-auto max-w-6xl px-4 pb-3 lg:hidden">
            <ul className="flex flex-col gap-1 border-t border-white/25 pt-2">
              <li>
                <Link href="/" onClick={() => setOpen(false)} className={navLink(pathname === "/")}>
                  Home
                </Link>
              </li>
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setOpen(false)} className={navLink(pathname === item.href)}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="flex min-h-12 items-center justify-between gap-3 px-3">
                <span className="font-semibold">Light or dark screen</span>
                <ThemeToggle className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-[10px] border border-white/40 text-white hover:bg-white/10" />
              </li>
            </ul>
          </nav>
        )}
      </div>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
          <div className="sm:w-[28rem]">
            <ModeSwitch pathname={pathname} />
          </div>
          <Link
            href="/red-flags"
            aria-current={pathname === "/red-flags" ? "page" : undefined}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-3 font-semibold text-alert no-underline hover:bg-alert-surface sm:ml-auto"
          >
            <AlertIcon />
            Red flags: when to call
          </Link>
        </div>
      </div>
    </header>
  );
}
