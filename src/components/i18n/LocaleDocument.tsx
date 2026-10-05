"use client";

import { useEffect } from "react";

/**
 * While a translated page is open, the document says so: `<html lang>` and
 * `dir` follow the page, for screen readers, hyphenation, spell-checking and
 * the browser's own "translate this page" offer. The root layout declares
 * English for the whole site and is left alone; this puts English back when
 * the visitor leaves for an English page.
 */
export function LocaleDocument({ lang, dir }: { lang: string; dir: "ltr" | "rtl" }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    return () => {
      root.lang = "en";
      // the English document carries no `dir` attribute at all: left to right by default
      root.removeAttribute("dir");
    };
  }, [lang, dir]);
  return null;
}
