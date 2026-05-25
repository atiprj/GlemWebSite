"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import { getScatterLayout } from "@/lib/patchwork-layout";
import type { Project } from "@/lib/site-assets";

interface ProjectScatterTileProps {
  project: Project;
  imageSrc: string;
  index: number;
  href: string;
  openLabel: string;
  notAvailable: string;
}

const MOBILE_ASPECTS = ["5/4", "4/5", "16/10", "1/1"];

export function ProjectScatterTile({
  project,
  imageSrc,
  index,
  href,
  openLabel,
  notAvailable
}: ProjectScatterTileProps) {
  const layout = getScatterLayout(index);
  const mobileAspect = MOBILE_ASPECTS[index % MOBILE_ASPECTS.length];

  return (
    <li
      className="scatter-tile relative list-none"
      data-align={layout.justifySelf}
      style={
        {
          "--scatter-col": layout.column,
          "--scatter-rows": layout.rowSpan,
          "--scatter-mt": `${layout.marginTop}px`,
          "--scatter-mb": `${layout.marginBottom}px`,
          "--scatter-max-w": layout.maxWidth ?? "100%",
          "--scatter-aspect": layout.aspectRatio,
          "--scatter-aspect-mobile": mobileAspect
        } as CSSProperties
      }
    >
      <Link href={href} aria-label={`${openLabel}: ${project.title}`} className="group block">
        <article className="scatter-tile__frame relative overflow-hidden bg-neutral-300">
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 30vw"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-90 transition group-hover:from-black/60" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-6">
            <p className="mb-1 text-[10px] tracking-[0.28em] text-white/85">
              {project.year > 0 ? project.year : notAvailable}
            </p>
            <h2 className="text-balance text-lg font-medium leading-snug text-white md:text-xl">{project.title}</h2>
          </div>
        </article>
      </Link>
    </li>
  );
}
