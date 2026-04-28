import Image from "next/image";
import { notFound } from "next/navigation";

import { FadeInView } from "@/components/layout/FadeInView";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getFolderMedia, getFolderText } from "@/lib/site-assets";

export default async function LocaleEventsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const text = await getFolderText("04.Events", t.eventsPlaceholder);
  const media = await getFolderMedia("04.Events");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
      <FadeInView>
        <h1 className="text-3xl font-semibold tracking-tight">{t.events}</h1>
        <p className="mt-5 max-w-3xl whitespace-pre-line text-neutral-700">{text}</p>
      </FadeInView>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {media.map((asset) =>
          asset.type === "image" ? (
            <FadeInView key={asset.src} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <Image src={asset.src} alt={`${t.events} visual`} width={1200} height={800} className="h-auto w-full object-cover" />
            </FadeInView>
          ) : (
            <FadeInView key={asset.src} className="overflow-hidden rounded-lg border border-neutral-200 bg-black">
              <video src={asset.src} controls className="h-auto w-full" />
            </FadeInView>
          )
        )}
      </div>
    </div>
  );
}
