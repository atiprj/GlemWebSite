"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { usePathname } from "next/navigation";

import InfinitePhotoStrip from "@/components/ui/InfinitePhotoStrip";
import BlurText from "@/components/ui/BlurText";
import SplitText from "@/components/ui/SplitText";
import { isLocale } from "@/lib/i18n";
import { measureTextLines } from "@/lib/measure-text-lines";
import type { MediaAsset, Project } from "@/lib/site-assets";
import type { Photo } from "@/types/carousel";

interface ProjectArticleProps {
  project: Project;
}

function sortedImages(assets: MediaAsset[]) {
  return assets
    .filter((a) => a.type === "image")
    .sort((a, b) => {
      const num = (s: string) => {
        const m = s.match(/(\d+)/);
        return m ? Number(m[1]) : 999;
      };
      return num(a.src) - num(b.src);
    });
}

function textLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function briefDescription(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const firstSentence = normalized.split(/[.!?](?:\s|$)/)[0]?.trim() ?? "";
  if (!firstSentence) return normalized.slice(0, 180);
  return firstSentence.length > 220 ? `${firstSentence.slice(0, 220).trim()}...` : `${firstSentence}.`;
}

function projectLeadText(intro: string) {
  const introOnly = intro || "";
  const firstParagraph = introOnly
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)[0];

  return firstParagraph || introOnly.trim();
}

function toCarouselPhotos(images: MediaAsset[], title: string): Photo[] {
  return images.map((img, index) => ({
    id: `${img.src}-${index}`,
    url: img.src,
    alt: `${title} image ${index + 1}`,
    title,
    width: img.width,
    height: img.height
  }));
}

export function ProjectArticle({ project }: ProjectArticleProps) {
  const pathname = usePathname();
  const leadContainerRef = useRef<HTMLDivElement>(null);
  const [animatedLeadText, setAnimatedLeadText] = useState<string | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [liveIntro, setLiveIntro] = useState(project.devText.intro.trim());
  const [liveDescription, setLiveDescription] = useState(project.devText.description.trim());
  const [liveTeam, setLiveTeam] = useState(project.devText.team.trim());
  const [liveAwards, setLiveAwards] = useState(project.devText.awards.trim());
  const [liveArticleLink, setLiveArticleLink] = useState(project.articleLink || "");
  const [liveTags, setLiveTags] = useState<string[]>(project.tags || []);

  useEffect(() => {
    let isUnmounted = false;

    const fetchProjectContent = async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(project.slug)}/description`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          intro?: string;
          description?: string;
          team?: string;
          awards?: string;
          articleLink?: string;
          tags?: string[];
        };
        if (!isUnmounted) {
          if (typeof data.intro === "string") {
            setLiveIntro(data.intro.trim());
          }
          if (typeof data.description === "string") {
            setLiveDescription(data.description.trim());
          }
          if (typeof data.team === "string") {
            setLiveTeam(data.team.trim());
          }
          if (typeof data.awards === "string") {
            setLiveAwards(data.awards.trim());
          }
          if (typeof data.articleLink === "string") {
            setLiveArticleLink(data.articleLink.trim());
          }
          if (Array.isArray(data.tags)) {
            setLiveTags(data.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0));
          }
        }
      } catch {
        /* keep current content */
      }
    };

    fetchProjectContent();
    const intervalMs = process.env.NODE_ENV === "development" ? 2000 : 30000;
    const intervalId = window.setInterval(fetchProjectContent, intervalMs);

    return () => {
      isUnmounted = true;
      window.clearInterval(intervalId);
    };
  }, [project.slug]);

  const images = sortedImages(project.devAssets);
  const carouselPhotos = toCarouselPhotos(images, project.title);
  const leadText = projectLeadText(liveIntro || project.devText.intro.trim());

  useLayoutEffect(() => {
    const container = leadContainerRef.current;
    if (!container || !leadText) {
      setAnimatedLeadText(null);
      return;
    }

    const updateLines = () => {
      const styles = window.getComputedStyle(container);
      const font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
      const maxWidth = container.clientWidth;
      const lines = measureTextLines(leadText, maxWidth, font);
      setAnimatedLeadText(lines.join("\n"));
    };

    updateLines();

    const resizeObserver = new ResizeObserver(updateLines);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateLines);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, [leadText]);

  const descriptionText =
    liveDescription ||
    project.devText.description.trim() ||
    "";
  const resolvedArticleLink = liveArticleLink || project.articleLink || "";
  const resolvedTags = liveTags.length > 0 ? liveTags : project.tags;
  const teamLines = textLines(liveTeam || project.devText.team);
  const awardsLines = textLines(liveAwards || project.devText.awards);
  const videos = project.devAssets
    .filter((asset) => asset.type === "video")
    .sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));
  const mainVideo = videos[0];
  const firstSegment = pathname?.split("/").filter(Boolean)[0] ?? "";
  const projectsHref = isLocale(firstSegment) ? `/${firstSegment}/projects` : "/projects";

  return (
    <div className="bg-[#f6f6f2] text-neutral-900 antialiased min-h-screen">

      {/* ① hero */}
      <section aria-label="Project identity" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-4 pb-0">
        <div className="grid lg:grid-cols-12 lg:gap-10 gap-6 items-end">

          {/* identity */}
          <div className="lg:col-span-4 pb-2">
            {project.year > 0 ? (
              <p className="mb-4 text-[10px] tracking-[0.28em] text-neutral-400">{project.year}</p>
            ) : null}
            <div className="flex items-center gap-4">
              <Link
                href={projectsHref}
                className="inline-block shrink-0 opacity-50 transition hover:opacity-100"
                aria-label="Back to projects"
              >
                <Image
                  src="/assets/06.Icons/icons8-freccia-sinistra-50.png"
                  alt=""
                  width={20}
                  height={20}
                />
              </Link>
              <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.01em]">
                {project.title}
              </h1>
            </div>
            {resolvedTags.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2">
                {resolvedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/15 bg-black/[0.03] px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-neutral-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-[11px] text-neutral-500">No tags loaded yet.</p>
            )}
          </div>

          {/* cover */}
          {project.cover ? (
            <figure className="lg:col-span-8 overflow-hidden group">
              <div className="relative w-full pb-[calc(50%+1.5cm)]">
                {project.cover.type === "image" ? (
                  <Image
                    src={project.cover.src}
                    alt={project.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <video
                    src={project.cover.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
            </figure>
          ) : (
            <div className="lg:col-span-8 bg-neutral-200 pb-[calc(50%+1.5cm)]" />
          )}
        </div>
        {leadText ? (
          <div
            ref={leadContainerRef}
            className="mt-8 w-full text-[clamp(1.05rem,1.2vw,1.15rem)] font-semibold leading-[1.55] text-neutral-800"
          >
            {animatedLeadText ? (
              <SplitText
                text={animatedLeadText}
                className=""
                delay={90}
                duration={0.95}
                ease="power3.out"
                splitType="lines"
                from={{ opacity: 0, y: 34 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-90px"
                textAlign="left"
                showCallback
                onLetterAnimationComplete={() => {
                  console.log("Lead text lines animation complete");
                }}
              />
            ) : (
              <p>{leadText}</p>
            )}
          </div>
        ) : null}
        {images.length > 0 ? (
          <div className="mt-6 w-full border-y border-black/[0.07] py-3">
            <InfinitePhotoStrip
              photos={carouselPhotos}
              autoScrollSeconds={58}
              controlsPlacement="overlay"
            />
          </div>
        ) : null}

        {descriptionText ? (
          <div className="mt-8 border-t border-black/[0.07] pt-7">
            <button
              type="button"
              onClick={() => setIsDescriptionOpen(true)}
              className="group block w-full cursor-pointer rounded-xl border border-black/15 bg-white/80 px-5 py-4 text-left shadow-[0_8px_24px_-20px_rgba(0,0,0,0.45)] transition duration-300 hover:border-black/30 hover:bg-white hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)]"
              aria-label="Read more about this project"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[clamp(1.05rem,1.2vw,1.15rem)] font-semibold leading-tight text-neutral-800 transition group-hover:text-neutral-950">
                  Read more
                </h2>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-neutral-500 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-900" />
              </div>
              <p className="mt-3 line-clamp-3 text-[clamp(0.75rem,0.85vw,0.8125rem)] font-normal leading-[1.7] text-neutral-800">
                {descriptionText}
              </p>
            </button>
          </div>
        ) : null}
      </section>

      <section aria-label="Project details" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-10 pb-16">
        {mainVideo ? (
          <div className="mt-8 w-full">
            <video
              src={mainVideo.src}
              controls
              className="mx-auto block h-auto max-h-[85vh] w-full rounded-xl bg-neutral-900"
            />
          </div>
        ) : null}

        <div className="mt-12 border-t border-black/[0.07] pt-10">
          <p className="text-[10px] tracking-[0.28em] text-neutral-400 mb-8">KEY INFORMATION</p>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-black/[0.06]">
            {[
              { label: "Project", value: project.title },
              { label: "Year", value: project.year > 0 ? String(project.year) : "N/A" },
              { label: "Tags", value: resolvedTags.length > 0 ? resolvedTags.join(" • ") : "N/A" }
            ].map((item) => (
              <div
                key={item.label}
                className={`bg-[#f6f6f2] p-5 ${item.label === "Tags" ? "md:col-span-2 lg:col-span-2" : ""}`}
              >
                <dt className="text-[10px] tracking-[0.2em] text-neutral-400 mb-2">{item.label}</dt>
                <dd className="text-[14px] leading-snug">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 border-t border-black/[0.07] py-8 grid lg:grid-cols-12 gap-6 lg:gap-14">
          <h2 className="lg:col-span-4 text-[clamp(1.05rem,1.8vw,1.35rem)] font-medium leading-tight">Team</h2>
          <div className="lg:col-span-8">
            {teamLines.length > 0 ? (
              <ul className="space-y-2 text-[14px] leading-relaxed text-neutral-700">
                {teamLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-neutral-500 leading-relaxed">Team details are not available yet.</p>
            )}
          </div>
        </div>

        <div className="border-t border-black/[0.07] py-8 grid lg:grid-cols-12 gap-6 lg:gap-14">
          <h2 className="lg:col-span-4 text-[clamp(1.05rem,1.8vw,1.35rem)] font-medium leading-tight">Award</h2>
          <div className="lg:col-span-8">
            {awardsLines.length > 0 ? (
              <ul className="space-y-2 text-[14px] leading-relaxed text-neutral-700">
                {awardsLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-neutral-500 leading-relaxed">Award information is not available yet.</p>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isDescriptionOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close description backdrop"
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setIsDescriptionOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 h-screen w-[min(92vw,520px)] border-l border-black/10 bg-[#f6f1e7]/82 p-6 text-neutral-900 backdrop-blur-md"
              initial={{ x: 540, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 540, opacity: 0.9 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              aria-label="Project description drawer"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.24em] text-neutral-500">PROJECT</p>
                  <h3 className="mt-2 text-[clamp(1.2rem,2vw,1.7rem)] font-semibold leading-tight">{project.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDescriptionOpen(false)}
                  aria-label="Close description panel"
                  className="rounded-md border border-black/20 p-2 transition hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap text-justify text-[15px] leading-[1.85] text-neutral-800">
                  {descriptionText}
                </p>
                <a
                  href={resolvedArticleLink || "#"}
                  target={resolvedArticleLink ? "_blank" : undefined}
                  rel={resolvedArticleLink ? "noreferrer" : undefined}
                  className={`mt-5 inline-block ${resolvedArticleLink ? "text-neutral-900" : "cursor-not-allowed text-neutral-500"}`}
                  aria-label={`Read more about ${project.title}`}
                >
                  <span className="inline-flex items-center gap-1 text-base font-bold">
                    <span>Read More</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
