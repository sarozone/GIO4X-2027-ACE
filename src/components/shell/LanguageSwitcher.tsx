"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ENGLISH, ENGLISH_EQUIVALENT, LOCALES, localePath, parseLocalePath } from "@/i18n/config";
import { shellLabels } from "@/i18n/shell";

type Entry = { code: string; tag: string; native: string; english: string; dir: "ltr" | "rtl"; href: string; current: boolean };

/**
 * Where each language leads from the page that is open (docs/I18N.md).
 * On an English page every language leads to its own home page. On a
 * translated page the other languages lead to the same page in their
 * language, and English to the nearest English page. Only pages that exist
 * are ever linked.
 */
function useLanguages(): { entries: Entry[]; current: Entry; label: string } {
  const pathname = usePathname();
  const at = parseLocalePath(pathname);
  const entries: Entry[] = [
    { ...ENGLISH, href: at ? ENGLISH_EQUIVALENT[at.page] : "/", current: !at },
    ...LOCALES.map((l) => ({ ...l, href: localePath(l.code, at?.page ?? ""), current: at?.lang === l.code })),
  ];
  return { entries, current: entries.find((e) => e.current) ?? entries[0], label: shellLabels(pathname)("Language") };
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2.4 8h11.2M8 2.4c-1.9 1.5-2.6 3.4-2.6 5.6s.7 4.1 2.6 5.6c1.9-1.5 2.6-3.4 2.6-5.6S9.9 3.9 8 2.4Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The language switcher.
 *
 * `menu` is the header's: a quiet button and a popover, built like the
 * display-settings popover beside it (outside press and Escape close it,
 * Escape gives the focus back to the button). `list` is the same choice laid
 * out in the open, for the phone drawer and the footer.
 *
 * The links are ordinary links, so they work with the keyboard, without
 * JavaScript in the list form, and are followed by search engines. Each
 * carries its own `lang`, so a screen reader pronounces the language's name
 * in that language.
 */
export function LanguageSwitcher({ variant = "menu", className = "" }: { variant?: "menu" | "list"; className?: string }) {
  const { entries, current, label } = useLanguages();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // a choice has been made, or the page changed some other way
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "list") {
    return (
      <nav aria-label={label} dir="ltr" className={className}>
        <p className="label">{label}</p>
        <ul className="mt-8 flex flex-wrap gap-x-21 gap-y-3">
          {entries.map((e) => (
            <li key={e.code}>
              <Link
                href={e.href}
                prefetch={false}
                lang={e.tag}
                hrefLang={e.tag}
                dir={e.dir}
                title={e.english}
                aria-current={e.current ? "true" : undefined}
                className={`inline-flex min-h-[2.75rem] items-center text-sm sm:min-h-0 sm:py-3 ${e.current ? "font-semibold text-accent" : "link-quiet"}`}
              >
                {e.native}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <div ref={ref} dir="ltr" className={`relative ${className}`}>
      <button
        ref={btn}
        type="button"
        className="btn btn-quiet h-[2.125rem] gap-5 px-8"
        aria-label={`${label}: ${current.native}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <GlobeIcon />
        <span aria-hidden className="text-[0.6875rem] font-semibold">
          {current.code}
        </span>
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label={label}
          className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(14rem,calc(100vw-2.6rem))] rounded-md border border-line-strong bg-paper p-13 shadow-3"
          style={{ animation: "gx-rise 260ms var(--ease-out)" }}
        >
          <p className="label px-8">{label}</p>
          <ul className="mt-8 grid max-h-[min(60vh,26rem)] gap-2 overflow-y-auto overscroll-contain">
            {entries.map((e) => (
              <li key={e.code}>
                <Link
                  href={e.href}
                  prefetch={false}
                  lang={e.tag}
                  hrefLang={e.tag}
                  aria-current={e.current ? "true" : undefined}
                  className={`flex min-h-[2.125rem] items-center justify-between gap-13 rounded-sm px-8 text-sm transition-colors duration-fast hover:bg-surface ${e.current ? "font-semibold text-ink" : "text-ink-2 hover:text-ink"}`}
                >
                  <span>{e.native}</span>
                  <span lang="en" className="text-xs font-normal text-ink-3">
                    {e.english}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
