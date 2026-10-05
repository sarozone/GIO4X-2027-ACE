import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/home";

const params = Promise.resolve({ lang: "ur" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
