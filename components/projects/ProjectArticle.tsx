"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

import InfinitePhotoStrip from "@/components/ui/InfinitePhotoStrip";
import BlurText from "@/components/ui/BlurText";
import SplitText from "@/components/ui/SplitText";
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

function projectLeadText(project: Project) {
  const introOnly = project.devText.intro || "";
  const firstParagraph = introOnly
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)[0];

  return firstParagraph || "";
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

function lineLengthByViewport(viewportWidth: number) {
  if (viewportWidth <= 640) return 42;
  if (viewportWidth <= 1024) return 68;
  return 92;
}

function leadTextForSplitAnimation(text: string, viewportWidth: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const words = normalized.split(" ");
  const lines: string[] = [];
  const maxLines = 5;
  const minCharsPerLine = lineLengthByViewport(viewportWidth);
  const requiredCharsPerLine = Math.ceil(normalized.length / maxLines);
  const maxCharsPerLine = Math.max(minCharsPerLine, requiredCharsPerLine);
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;

  }

  const finalLine = currentLine || "";
  if (finalLine) {
    lines.push(finalLine);
  }

  if (lines.length <= maxLines) {
    return lines.join("\n");
  }

  const keptLines = lines.slice(0, maxLines - 1);
  const lastMergedLine = lines.slice(maxLines - 1).join(" ");
  return [...keptLines, lastMergedLine].join("\n");
}

export function ProjectArticle({ project }: ProjectArticleProps) {
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [liveDescription, setLiveDescription] = useState(project.devText.description.trim());
  const [liveArticleLink, setLiveArticleLink] = useState(project.articleLink || "");
  const [liveTags, setLiveTags] = useState<string[]>(project.tags || []);

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth || 1440);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  useEffect(() => {
    let isUnmounted = false;

    const fetchDescription = async () => {
      try {
        const response = await fetch(`/api/projects/${project.slug}/description`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { description?: string; articleLink?: string; tags?: string[] };
        if (!isUnmounted) {
          if (typeof data.description === "string") {
            setLiveDescription(data.description.trim());
          }
          if (typeof data.articleLink === "string") {
            setLiveArticleLink(data.articleLink.trim());
          }
          if (Array.isArray(data.tags)) {
            setLiveTags(data.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0));
          }
        }
      } catch {
        /* keep current description */
      }
    };

    fetchDescription();
    const intervalMs = process.env.NODE_ENV === "development" ? 2000 : 30000;
    const intervalId = window.setInterval(fetchDescription, intervalMs);

    return () => {
      isUnmounted = true;
      window.clearInterval(intervalId);
    };
  }, [project.slug]);

  const images = sortedImages(project.devAssets);
  const carouselPhotos = toCarouselPhotos(images, project.title);
  const leadText = projectLeadText(project);
  const animatedLeadText = leadTextForSplitAnimation(leadText, viewportWidth);
  const descriptionText =
    liveDescription ||
    "Il prototipo è il risultato della collaborazione con eccellenze italiane, ognuna protagonista della trasformazione di MIRA in esperienza sensoriale.";
  const resolvedArticleLink =
    project.slug === "25.MDW25-MiraConceptAI"
      ? "https://atiproject.com/news/fuorisalone-2025-ati-presenta-mira-al-dot-materica/"
      : liveArticleLink || project.articleLink || "";
  const resolvedTags = liveTags.length > 0 ? liveTags : project.tags;
  const teamLines = textLines(project.devText.team);
  const awardsLines = textLines(project.devText.awards);
  const videos = project.devAssets
    .filter((asset) => asset.type === "video")
    .sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));
  const mainVideo = videos[0];

  return (
    <div className="bg-[#f6f6f2] text-neutral-900 antialiased min-h-screen">

      {/* back link */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          PROJECTS
        </Link>
      </div>

      {/* ① hero */}
      <section aria-label="Project identity" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-8 pb-0">
        <div className="grid lg:grid-cols-12 lg:gap-10 gap-6 items-end">

          {/* identity */}
          <div className="lg:col-span-4 pb-2">
            <p className="text-[10px] tracking-[0.28em] text-neutral-400 mb-5">
              {project.slug}
            </p>
            <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.01em]">
              {project.title}
            </h1>
            {project.year > 0 ? (
              <p className="mt-6 text-[10px] tracking-[0.28em] text-neutral-400">{project.year}</p>
            ) : null}
            {resolvedTags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
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
              <p className="mt-4 text-[11px] text-neutral-500">No tags loaded yet.</p>
            )}
          </div>

          {/* cover */}
          {project.cover ? (
            <figure className="lg:col-span-8 overflow-hidden group">
              <div className="relative w-full aspect-[2/1]">
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
            <div className="lg:col-span-8 bg-neutral-200 aspect-[2/1]" />
          )}
        </div>
        {leadText ? (
          <div className="mt-8 mx-auto max-w-5xl">
            <SplitText
              text={animatedLeadText}
              className="text-[clamp(1.05rem,1.9vw,1.8rem)] font-bold leading-[1.35] text-neutral-800"
              delay={90}
              duration={0.95}
              ease="power3.out"
              splitType="lines"
              from={{ opacity: 0, y: 34 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-90px"
              textAlign="center"
              showCallback
              onLetterAnimationComplete={() => {
                console.log("Lead text lines animation complete");
              }}
            />
          </div>
        ) : null}
        {images.length > 0 ? (
          <div className="mt-6 border-y border-black/[0.07] py-3">
            <InfinitePhotoStrip
              photos={carouselPhotos}
              autoScrollSeconds={58}
              controlsPlacement="overlay"
              className="mx-auto max-w-7xl"
            />
          </div>
        ) : null}

        <div className="mt-8 border-t border-black/[0.07] pt-7">
          <button
            type="button"
            onClick={() => setIsDescriptionOpen(true)}
            className="group block w-full cursor-pointer rounded-lg px-4 py-3 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-black/[0.02]"
            aria-label="Open project description"
          >
            <h2 className="text-[clamp(1.05rem,1.8vw,1.35rem)] font-medium leading-tight underline-offset-4 group-hover:underline">
              Description
            </h2>
            <p className="mt-3 line-clamp-2 max-w-4xl text-[15px] leading-[1.8] text-neutral-700">
              {descriptionText}
              ...
            </p>
          </button>
        </div>
      </section>

      <section aria-label="Project details" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-10 pb-16">
        {mainVideo ? (
          <div className="mt-8">
            <video src={mainVideo.src} controls className="w-full rounded-xl bg-neutral-900" />
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
