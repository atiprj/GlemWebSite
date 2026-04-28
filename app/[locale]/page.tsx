import { notFound } from "next/navigation";

import { HomeHero } from "@/components/hero/HomeHero";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getHomeHeroAsset, getHomeMenuImageFromFolder, getHomeProjectCollageImages } from "@/lib/site-assets";

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
  const collageImages = await getHomeProjectCollageImages();
  const projectMenuImage = await getHomeMenuImageFromFolder("03.Project");
  const eventsMenuImage = await getHomeMenuImageFromFolder("04.Events");

  return (
    <div className="w-full">
      <HomeHero heroSrc={hero?.src ?? null} collageImages={collageImages} />

      <section className="w-full pb-20">
        <div className="h-[420px] w-full overflow-hidden border border-neutral-300 bg-[#f6f6f2]">
          <FlowingMenu
            items={[
              {
                link: `/${locale}/projects`,
                text: t.projects,
                image: projectMenuImage ?? "/assets/03.Project/25.MDW25-MiraConceptAI/All_ATI Project.jpg"
              },
              {
                link: `/${locale}/events`,
                text: t.events,
                image: eventsMenuImage ?? "/assets/03.Project/25.MDW25-MiraConceptAI/DEV/02.JPG"
              },
              {
                link: `/${locale}/contacts`,
                text: t.contacts,
                image: "/assets/05.Contacts/Immagine menu home.svg"
              }
            ]}
            speed={14}
            textColor="#111111"
            bgColor="#f6f6f2"
            marqueeBgColor="#ffffff"
            marqueeTextColor="#111111"
            borderColor="#d2cec6"
          />
        </div>
      </section>
    </div>
  );
}
