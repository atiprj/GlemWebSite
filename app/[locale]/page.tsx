import { isLocale } from "@/lib/i18n";
import { LocaleHomeContent } from "@/components/home/LocaleHomeContent";
import { notFound } from "next/navigation";

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return <LocaleHomeContent locale={locale} />;
}
