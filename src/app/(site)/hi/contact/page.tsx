import Page, { generateMetadata as localeMetadata } from "@/components/i18n/pages/contact";

const params = Promise.resolve({ lang: "hi" });

export const generateMetadata = () => localeMetadata({ params });

export default function LocalePage() {
  return <Page params={params} />;
}
