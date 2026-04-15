"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import InfinitePhotoStrip from "@/components/ui/InfinitePhotoStrip";
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
  return project.devText.intro || project.devText.conclusions || project.devText.description || "";
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

function ScrollRevealLine({
  text,
  progress,
  start,
  end
}: {
  text: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [28, 0]);

  return (
    <motion.p
      className="text-[clamp(1.25rem,2.2vw,2.1rem)] font-bold leading-[1.45] text-neutral-800"
      style={{ opacity, y }}
    >
      {text}
    </motion.p>
  );
}

export function ProjectArticle({ project }: ProjectArticleProps) {
  const images = sortedImages(project.devAssets);
  const carouselPhotos = toCarouselPhotos(images, project.title);
  const leadText = projectLeadText(project);
  const leadLines = textLines(leadText);
  const shortDescription = briefDescription(project.devText.description);
  const teamLines = textLines(project.devText.team);
  const awardsLines = textLines(project.devText.awards);
  const videos = project.devAssets
    .filter((asset) => asset.type === "video")
    .sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));
  const mainVideo = videos[0];
  const leadSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: leadSectionRef,
    offset: ["start 80%", "end 30%"]
  });

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
          <div ref={leadSectionRef} className="mt-8 mx-auto max-w-4xl text-center space-y-1">
            {leadLines.map((line, index) => (
              <ScrollRevealLine
                key={`${line}-${index}`}
                text={line}
                progress={scrollYProgress}
                start={index / Math.max(leadLines.length, 1)}
                end={(index + 0.85) / Math.max(leadLines.length, 1)}
              />
            ))}
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
      </section>

      <section aria-label="Project details" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-10 pb-16">
        {shortDescription ? (
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[15px] leading-[1.8] text-neutral-700">{shortDescription}</p>
          </div>
        ) : null}

        {mainVideo ? (
          <div className="mt-8">
            <video src={mainVideo.src} controls className="w-full rounded-xl bg-neutral-900" />
          </div>
        ) : null}

        <div className="mt-12 border-t border-black/[0.07] pt-10">
          <p className="text-[10px] tracking-[0.28em] text-neutral-400 mb-8">KEY INFORMATION</p>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/[0.06]">
            {[
              { label: "Project", value: project.title },
              { label: "Year", value: project.year > 0 ? String(project.year) : "N/A" },
              { label: "Images", value: String(images.length) },
              { label: "Videos", value: String(videos.length) }
            ].map((item) => (
              <div key={item.label} className="bg-[#f6f6f2] p-5">
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

    </div>
  );
}
