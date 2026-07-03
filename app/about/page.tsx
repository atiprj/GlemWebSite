import Image from "next/image";
import Link from "next/link";

import { FadeInView } from "@/components/layout/FadeInView";
import { getFolderMedia, getFolderText } from "@/lib/site-assets";
import { parseAboutContent } from "@/lib/about-content-parser";
import { renderWithFirstBold } from "@/lib/text-highlight";

export default async function AboutPage() {
  const rawText = await getFolderText("02.About us", "");
  const content = parseAboutContent(rawText);
  const media = await getFolderMedia("02.About us");

  return (
    <div className="w-full bg-[#f6f6f2] text-neutral-900">
      <section className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8 md:py-14">
        <FadeInView>
          <div className="flex items-center gap-4">
            <Link
              href="/#home-sections"
              className="inline-block shrink-0 opacity-50 transition hover:opacity-100"
              aria-label="Back to home"
            >
              <Image
                src="/assets/06.Icons/icons8-freccia-sinistra-50.png"
                alt="Back"
                width={20}
                height={20}
              />
            </Link>
            <h1 className="text-[clamp(1.9rem,7vw,3.75rem)] font-semibold tracking-tight">About us</h1>
          </div>

          {content.eyebrow ? (
            <p className="mt-8 text-[10px] tracking-[0.28em] text-neutral-400">{content.eyebrow}</p>
          ) : null}

          {content.paragraphs.length > 0 ? (
            <div className="mt-4 space-y-5 leading-relaxed text-neutral-700">
              {(() => {
                const glemState = { found: false };
                return content.paragraphs.map((paragraph, index) => (
                  <p key={index}>{renderWithFirstBold(paragraph, "GLEM", glemState)}</p>
                ));
              })()}
            </div>
          ) : (
            <p className="mt-4 text-neutral-500">
              About us content will appear here as soon as text files are added in public/assets/02.About us.
            </p>
          )}
        </FadeInView>

        {content.services.length > 0 ? (
          <FadeInView>
            <div className="mt-14 border-t border-black/[0.07] pt-10">
              {content.servicesHeading ? (
                <h2 className="text-[clamp(1.05rem,1.8vw,1.35rem)] font-bold leading-tight">
                  {content.servicesHeading}
                </h2>
              ) : null}
              {content.servicesIntro ? (
                <p className="mt-4 leading-relaxed text-neutral-700">{content.servicesIntro}</p>
              ) : null}
              <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {content.services.map((service) => (
                  <li key={service.title}>
                    <Link
                      href="/contacts"
                      className="block h-full rounded-lg border border-black/10 bg-white p-5 transition hover:border-black/20 hover:shadow-sm"
                    >
                      <p className="text-[14px] font-semibold text-neutral-900">{service.title}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-neutral-700">{service.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeInView>
        ) : null}

        {media.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
            {media.map((asset) =>
              asset.type === "image" ? (
                <FadeInView key={asset.src} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <Image src={asset.src} alt="About visual" width={1200} height={800} className="h-auto w-full object-cover" />
                </FadeInView>
              ) : (
                <FadeInView key={asset.src} className="overflow-hidden rounded-lg border border-neutral-200 bg-black">
                  <video src={asset.src} controls preload="metadata" className="h-auto w-full" />
                </FadeInView>
              )
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
