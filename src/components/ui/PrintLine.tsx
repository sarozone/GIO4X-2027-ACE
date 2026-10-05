"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";

/**
 * The last line of a printed lesson, primer or blog post: the page's address
 * and the day it was printed. On screen it is not there (.print-only, see
 * styles/globals.css).
 *
 * The day is the visitor's own, read when the print dialogue opens, so a page
 * left open overnight is not dated yesterday. The server sends the line
 * without a day: the HTML is the same for everyone.
 */
export function PrintLine({ url, className = "" }: { url: string; className?: string }) {
  const [day, setDay] = useState("");
  useEffect(() => {
    const stamp = () => setDay(new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date()));
    stamp();
    window.addEventListener("beforeprint", stamp);
    return () => window.removeEventListener("beforeprint", stamp);
  }, []);
  return (
    <p className={`print-only border-t border-line pt-13 text-xs text-ink-3 [overflow-wrap:anywhere] ${className}`} data-print-line>
      {url}
      <br />
      Printed from {site.domain}
      {day ? ` on ${day}` : ""}.
    </p>
  );
}
