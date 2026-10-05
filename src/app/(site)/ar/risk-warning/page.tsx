import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/risk-warning";

const params = Promise.resolve({ lang: "ar" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
