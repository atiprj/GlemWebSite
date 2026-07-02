import { notFound } from "next/navigation";

import { HomeHero } from "@/components/hero/HomeHero";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getHomeHeroAsset } from "@/lib/site-assets";
import { getHomeProjectCollageImages } from "@/lib/projects-assets";

export default async function LocaleEntryPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const hero = await getHomeHeroAsset();
  const collageImages = await getHomeProjectCollageImages(12);

  return (
    <div className="w-full">
      <section id="home-sections" className="relative w-full scroll-mt-16">
        <HomeHero heroSrc={hero?.src ?? null} collageImages={collageImages} />

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 w-full -translate-y-1/2">
          <div className="pointer-events-auto h-auto w-full md:h-[clamp(360px,45vh,620px)]">
            <FlowingMenu
              items={[
                { link: `/${locale}/about`,    text: t.about },
                { link: `/${locale}/projects`, text: t.projects },
                { link: `/${locale}/events`,   text: t.events },
                { link: `/${locale}/contacts`, text: t.contacts }
              ]}
              textColor="#ffffff"
              borderColor="rgba(255,255,255,0.28)"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
