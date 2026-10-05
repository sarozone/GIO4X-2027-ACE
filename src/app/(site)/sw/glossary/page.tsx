import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/glossary";

const params = Promise.resolve({ lang: "sw" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
