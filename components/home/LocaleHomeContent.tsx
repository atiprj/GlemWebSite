import Link from "next/link";
import { dictionaries, type Locale } from "@/lib/i18n";
import { getHomeHeroAsset, getHomeIntroText, getProjectPreviewData, homeData } from "@/data/content";
import { HeroSection } from "@/components/home/HeroSection";
import Image from "next/image";

interface LocaleHomeContentProps {
  locale: Locale;
}

export async function LocaleHomeContent({ locale }: LocaleHomeContentProps) {
  const t = dictionaries[locale];
  const heroAsset = await getHomeHeroAsset();
  const introText = await getHomeIntroText();
  const projectPreviews = await getProjectPreviewData();

  return (
    <div className="bg-neutral-950 text-white">
      <HeroSection title={t.heroTitle} intro={t.homeIntro} heroAsset={heroAsset} />

      <section id="home-intro" className="bg-white py-20 text-neutral-900 md:py-28">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12">
          <h2 className="text-3xl font-semibold leading-tight md:col-span-5 md:text-5xl">
            {homeData.introTitle}
          </h2>
          <div className="md:col-span-7 md:pt-2">
            <p className="max-w-2xl text-base leading-relaxed text-neutral-700 md:text-lg">{introText}</p>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h3 className="text-2xl font-semibold text-neutral-900 md:text-3xl">{t.projects}</h3>
            <Link
              href={`/${locale}/projects`}
              className="text-xs tracking-[0.2em] text-neutral-600 transition hover:text-neutral-900"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projectPreviews.map((project) => (
              <Link
                key={project.slug}
                href={`/${locale}/projects`}
                className="group relative block aspect-[4/5] overflow-hidden bg-neutral-200"
              >
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/45" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="translate-y-4 text-lg font-medium text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {project.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
