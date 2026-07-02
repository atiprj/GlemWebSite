import { HomeHero } from "@/components/hero/HomeHero";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import { getHomeHeroAsset } from "@/lib/site-assets";
import { getHomeProjectCollageImages } from "@/lib/projects-assets";

export default async function EntryPage() {
  const hero = await getHomeHeroAsset();
  const collageImages = await getHomeProjectCollageImages(12);

  return (
    <div className="w-full">
      <section id="home-sections" className="relative w-full scroll-mt-16">
        <HomeHero heroSrc={hero?.src ?? null} collageImages={collageImages} />

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 w-full -translate-y-1/2">
          <div className="pointer-events-auto h-auto w-full md:h-[420px]">
            <FlowingMenu
              items={[
                { link: "/about", text: "About us" },
                { link: "/projects", text: "Projects" },
                { link: "/events", text: "Events" },
                { link: "/contacts", text: "Contacts" }
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
