import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/home";

const params = Promise.resolve({ lang: "fr" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
