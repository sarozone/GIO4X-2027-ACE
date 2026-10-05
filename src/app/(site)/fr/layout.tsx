import type { ReactNode } from "react";
import LocaleLayout from "@/components/i18n/pages/layout";

// One fixed folder per language (docs/I18N.md, section 6): the pages are in src/components/i18n/pages.
const params = Promise.resolve({ lang: "fr" });

export default function Layout({ children }: { children: ReactNode }) {
  return <LocaleLayout params={params}>{children}</LocaleLayout>;
}
