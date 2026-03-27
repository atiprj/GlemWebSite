import Link from "next/link";

import { HomeHero } from "@/components/hero/HomeHero";
import { FadeInView } from "@/components/layout/FadeInView";
import { getHomeHeroAsset } from "@/lib/site-assets";

export default async function EntryPage() {
  const hero = await getHomeHeroAsset();

  return (
    <div className="w-full">
      <HomeHero heroSrc={hero?.src ?? null} />

      <section id="home-sections" className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-20 md:grid-cols-2 md:px-10">
        <FadeInView className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="mt-3 text-sm text-neutral-700">Explore the ATI Project R&D approach, team values, and practice.</p>
          <Link href="/about" className="mt-6 inline-block text-xs tracking-[0.2em] text-neutral-900">
            GO TO ABOUT
          </Link>
        </FadeInView>

        <FadeInView className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="mt-3 text-sm text-neutral-700">Browse galleries and media from active and archived project work.</p>
          <Link href="/projects" className="mt-6 inline-block text-xs tracking-[0.2em] text-neutral-900">
            GO TO PROJECTS
          </Link>
        </FadeInView>

        <FadeInView className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Events</h2>
          <p className="mt-3 text-sm text-neutral-700">Discover workshops, showcases, and public R&D activities.</p>
          <Link href="/events" className="mt-6 inline-block text-xs tracking-[0.2em] text-neutral-900">
            GO TO EVENTS
          </Link>
        </FadeInView>

        <FadeInView className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Contacts</h2>
          <p className="mt-3 text-sm text-neutral-700">Find direct contact information and key team references.</p>
          <Link href="/contacts" className="mt-6 inline-block text-xs tracking-[0.2em] text-neutral-900">
            GO TO CONTACTS
          </Link>
        </FadeInView>
      </section>
    </div>
  );
}
