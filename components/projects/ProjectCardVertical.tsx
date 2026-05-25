"use client";

import Image from "next/image";
import Link from "next/link";

import type { Project } from "@/lib/site-assets";

interface ProjectCardVerticalProps {
  project: Project;
  imageSrc: string;
  href: string;
  openLabel: string;
  notAvailable: string;
  priority?: boolean;
}

export function ProjectCardVertical({
  project,
  imageSrc,
  href,
  openLabel,
  notAvailable,
  priority = false
}: ProjectCardVerticalProps) {
  return (
    <li className="list-none">
      <Link href={href} aria-label={`${openLabel}: ${project.title}`} className="group block">
        <article>
          <div className="relative aspect-[2/3] overflow-hidden bg-neutral-200">
            <Image
              src={imageSrc}
              alt={project.title}
              fill
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority={priority}
            />
          </div>
          <div className="pt-2">
            <p className="text-[10px] font-bold tracking-tight text-black/90">
              {project.title}
              {project.year > 0 ? <span className="font-normal text-black/45"> — {project.year}</span> : null}
            </p>
          </div>
        </article>
      </Link>
    </li>
  );
}
