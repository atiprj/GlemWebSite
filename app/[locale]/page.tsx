import { notFound } from "next/navigation";

import { HomeHero } from "@/components/hero/HomeHero";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getHomeHeroAsset, getHomeMenuImageFromFolder } from "@/lib/site-assets";
import { getHomeProjectCollageImages, getProjectMenuImage } from "@/lib/projects-assets";

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
  const projectMenuImage = await getProjectMenuImage();
  const eventsMenuImage = await getHomeMenuImageFromFolder("04.Events");

  const menuImages = [
    projectMenuImage ?? "/assets/03.Project/25.MDW25-MiraConceptAI/All_ATI Project.jpg",
    eventsMenuImage ?? "/assets/03.Project/25.MDW25-MiraConceptAI/DEV/02.JPG",
    "/assets/05.Contacts/Immagine menu home.svg"
  ];

  return (
    <div className="w-full">
      {/* Preload FlowingMenu hover images so they're ready on first interaction */}
      {menuImages.filter(src => !src.endsWith(".svg")).map(src => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <HomeHero heroSrc={hero?.src ?? null} collageImages={collageImages} />

      <section id="home-sections" className="w-full scroll-mt-16 pb-20">
        <div className="h-auto w-full overflow-hidden border border-neutral-300 bg-[#f6f6f2] md:h-[clamp(360px,45vh,620px)]">
          <FlowingMenu
            items={[
              { link: `/${locale}/projects`, text: t.projects, image: menuImages[0] },
              { link: `/${locale}/events`,   text: t.events,   image: menuImages[1] },
              { link: `/${locale}/contacts`, text: t.contacts, image: menuImages[2] }
            ]}
            speed={14}
            textColor="#111111"
            bgColor="#f6f6f2"
            marqueeBgColor="#f6f6f2"
            marqueeTextColor="#111111"
            borderColor="#d2cec6"
          />
        </div>
      </section>
    </div>
  );
}
