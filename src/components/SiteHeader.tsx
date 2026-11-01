"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PRIMARY_NAV } from "@/lib/routes";
import { PRACTICE, SITE_TITLE } from "@/lib/site";
import { HomeIcon, PhoneIcon, MenuIcon, CloseIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

// Navy band with the gomberamd.com logo, the site title, the Home and Call
// buttons, then the Before / After switch. When to call lives under After surgery.

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
          <Link href="/" className="flex min-w-0 flex-col items-start gap-1.5 text-white no-underline">
            <span className="flex rounded-md bg-white px-2 py-1">
              <Image src={PRACTICE.logoUrl} alt="Mufaddal Gombera, MD, Orthopedic Surgery and Sports Medicine" width={367} height={61} className="h-6 w-auto sm:h-7" priority />
            </span>
            <span className="text-[19px] leading-tight font-bold sm:text-[22px]">{SITE_TITLE}</span>
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
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-[10px] border border-white/40 px-3 text-[17px] font-semibold text-white no-underline hover:bg-white/10"
              aria-label="Home"
            >
              <HomeIcon />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ThemeToggle className="hidden min-h-12 min-w-12 items-center justify-center rounded-[10px] border border-white/40 text-white hover:bg-white/10 lg:inline-flex" />
            <a
              href={`tel:${PRACTICE.office.tel}`}
              className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-[10px] bg-[#B54708] px-3 sm:px-[18px] text-[17px] font-semibold text-white no-underline"
              aria-label={`Call the office, ${PRACTICE.office.label}`}
            >
              <PhoneIcon />
              <span className="hidden sm:inline">Call</span>
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
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="sm:w-[28rem]">
            <ModeSwitch pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  );
}
