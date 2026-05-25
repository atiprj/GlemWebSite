"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { ProjectCoverParallax } from "@/components/projects/ProjectCoverParallax";
import type { Project } from "@/lib/site-assets";

interface ProjectsStackingProps {
  projects: Project[];
  locale?: "it" | "en";
}

function ProjectStackCard({
  project,
  index,
  total,
  locale = "en"
}: {
  project: Project;
  index: number;
  total: number;
  locale?: "it" | "en";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.72, 1], [1, 1, 0.9]);
  const filter = useTransform(scrollYProgress, [0, 0.72, 1], ["brightness(1)", "brightness(1)", "brightness(0.72)"]);

  const isItalian = locale === "it";
  const localizedProjectsPath = locale === "it" || locale === "en" ? `/${locale}/projects` : "/projects";

  return (
    <motion.div ref={ref} style={{ zIndex: index + 1 }} className="relative h-[115vh]">
      <motion.article
        style={{ scale, filter }}
        className="sticky top-0 h-screen overflow-hidden bg-black shadow-[0_-28px_60px_rgba(0,0,0,0.45)]"
      >
        <ProjectCoverParallax
          containerRef={ref}
          scrollYProgress={scrollYProgress}
          className="h-full w-full"
          range={28}
        >
          {project.cover?.type === "image" ? (
            <Image
              src={project.cover.src}
              alt={project.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index < 2}
            />
          ) : project.cover?.type === "video" ? (
            <video
              src={project.cover.src}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-neutral-800" />
          )}
        </ProjectCoverParallax>
        <Link
          href={`${localizedProjectsPath}/${project.slug}`}
          aria-label={`${isItalian ? "Apri pagina di" : "Open"} ${project.title}`}
          className="absolute inset-0 z-20"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute bottom-12 left-8 z-10 md:left-12">
          <p className="mb-2 text-xs tracking-[0.25em] text-white/80">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <p className="mb-2 text-xs tracking-[0.25em] text-white/80">{project.year || (isItalian ? "N/D" : "N/A")}</p>
          <h2 className="text-balance text-3xl font-semibold text-white drop-shadow-md md:text-5xl">{project.title}</h2>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function ProjectsStacking({ projects, locale = "en" }: ProjectsStackingProps) {
  const isItalian = locale === "it";
  const stackProjects = projects.filter((project) => project.cover);

  if (stackProjects.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-14 text-neutral-700 md:px-10">
        {isItalian
          ? "Nessun progetto trovato in `public/assets/03.Projects` (o fallback `03.Project`)."
          : "No projects found in `public/assets/03.Projects` (or fallback `03.Project`)."}
      </section>
    );
  }

  return (
    <section className="relative bg-black">
      {stackProjects.map((project, index) => (
        <ProjectStackCard
          key={project.slug}
          project={project}
          index={index}
          total={stackProjects.length}
          locale={locale}
        />
      ))}
      <div aria-hidden className="h-[18vh]" />
    </section>
  );
}
