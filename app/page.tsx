import { HomeHero } from "@/components/hero/HomeHero";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import { getHomeHeroAsset } from "@/lib/site-assets";

export default async function EntryPage() {
  const hero = await getHomeHeroAsset();

  return (
    <div className="w-full">
      <HomeHero heroSrc={hero?.src ?? null} />

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <div className="h-[420px] overflow-hidden rounded-xl border border-neutral-300 bg-[#f6f6f2]">
          <FlowingMenu
            items={[
              {
                link: "/about",
                text: "About",
                image: "/assets/03.Project/22.Lubica22-Y/COP/Gabriele Giussani (4).jpg"
              },
              {
                link: "/projects",
                text: "Projects",
                image: "/assets/03.Project/25.MDW25-MiraConceptAI/All_ATI Project.jpg"
              },
              {
                link: "/events",
                text: "Events",
                image: "/assets/03.Project/25.MDW25-MiraConceptAI/DEV/02.JPG"
              },
              {
                link: "/contacts",
                text: "Contacts",
                image: "/assets/03.Project/25.MDW25-MiraConceptAI/DEV/05.jpg"
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
