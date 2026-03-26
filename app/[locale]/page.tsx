import { dictionaries, isLocale } from "@/lib/i18n";
import { getHomeHeroAsset, getHomeIntroText, getProjectPreviewData, homeData } from "@/data/content";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const heroAsset = await getHomeHeroAsset();
  const introText = await getHomeIntroText();
  const projectPreviews = await getProjectPreviewData();

  return (
    <div className="bg-neutral-950 text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {heroAsset?.type === "video" ? (
          <video
            src={heroAsset.src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {heroAsset?.type === "image" ? (
          <Image
            src={heroAsset.src}
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
        {!heroAsset ? <div className="absolute inset-0 bg-neutral-800" /> : null}

        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85 md:text-base">{t.homeIntro}</p>
        </div>

        <a
          href="#home-intro"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-[0.24em] text-white/80"
        >
          SCROLL DOWN
        </a>
      </section>

      <section id="home-intro" className="bg-white py-20 text-neutral-900 md:py-28">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12">
          <h2 className="md:col-span-5 text-3xl font-semibold leading-tight md:text-5xl">
            {homeData.introTitle}
          </h2>
          <div className="md:col-span-7 md:pt-2">
            <p className="max-w-2xl text-base leading-relaxed text-neutral-700 md:text-lg">
              {introText}
            </p>
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
