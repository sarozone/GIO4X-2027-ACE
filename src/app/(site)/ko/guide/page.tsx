import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/guide";

const params = Promise.resolve({ lang: "ko" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
