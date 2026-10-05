import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/glossary";

const params = Promise.resolve({ lang: "am" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
