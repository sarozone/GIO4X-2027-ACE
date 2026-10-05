import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/glossary";

const params = Promise.resolve({ lang: "bn" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
