import { HomeHero } from "@/components/hero/HomeHero";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import { getHomeHeroAsset, getHomeMenuImageFromFolder } from "@/lib/site-assets";
import { getHomeProjectCollageImages, getProjectMenuImage } from "@/lib/projects-assets";

export default async function EntryPage() {
  const hero = await getHomeHeroAsset();
  const collageImages = await getHomeProjectCollageImages(12);
  const projectMenuImage = await getProjectMenuImage();
  const eventsMenuImage = await getHomeMenuImageFromFolder("04.Events");

  return (
    <div className="w-full">
      <HomeHero heroSrc={hero?.src ?? null} collageImages={collageImages} />

      <section id="home-sections" className="w-full scroll-mt-16 pb-20">
        <div className="h-auto w-full overflow-hidden border border-neutral-300 bg-[#f6f6f2] md:h-[420px]">
          <FlowingMenu
            items={[
              {
                link: "/projects",
                text: "Projects",
                image: projectMenuImage ?? "/assets/03.Project/25.MDW25-MiraConceptAI/All_ATI Project.jpg"
              },
              {
                link: "/events",
                text: "Events",
                image: eventsMenuImage ?? "/assets/03.Project/25.MDW25-MiraConceptAI/DEV/02.JPG"
              },
              {
                link: "/contacts",
                text: "Contacts",
                image: "/assets/05.Contacts/Immagine menu home.svg"
              }
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
