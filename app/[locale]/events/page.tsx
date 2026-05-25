import { notFound } from "next/navigation";

import { EventsOverview } from "@/components/events/EventsOverview";
import { isLocale } from "@/lib/i18n";
import { getFolderMedia } from "@/lib/site-assets";

export const dynamic = "force-dynamic";

export default async function LocaleEventsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const media = await getFolderMedia("04.Events");
  return <EventsOverview media={media} locale={locale} />;
}
