"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { ProjectCoverParallax } from "@/components/projects/ProjectCoverParallax";
import type { Project } from "@/lib/site-assets";

interface ProjectControlsProps {
  projects: Project[];
  locale?: "it" | "en";
}

function ProjectGridCard({
  project,
  ui,
  localizedProjectsPath
}: {
  project: Project;
  ui: {
    openProjectLabel: string;
    notAvailable: string;
  };
  localizedProjectsPath: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 1, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-sm border border-black/10 bg-neutral-200 shadow-sm"
    >
      <Link
        href={`${localizedProjectsPath}/${encodeURIComponent(project.slug)}`}
        aria-label={`${ui.openProjectLabel} ${project.title}`}
        className="absolute inset-0 z-20"
      />
      <div className="relative aspect-[6/10]">
        <ProjectCoverParallax
          containerRef={cardRef}
          range={18}
          offset={["start 0.92", "end 0.12"]}
          className="absolute inset-0"
        >
          {project.cover?.type === "image" ? (
            <Image
              src={project.cover.src}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : project.cover?.type === "video" ? (
            <video src={project.cover.src} muted loop playsInline autoPlay className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-neutral-300" />
          )}
        </ProjectCoverParallax>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10">
          <p className="mb-1 text-[10px] tracking-[0.2em] text-white/85">
            {project.year > 0 ? project.year : ui.notAvailable}
          </p>
          <h3 className="text-sm font-medium text-white drop-shadow-sm md:text-base">{project.title}</h3>
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectControls({ projects, locale = "en" }: ProjectControlsProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const years = useMemo(
    () =>
      Array.from(new Set(projects.map((project) => project.year).filter((year) => year > 0))).sort(
        (a, b) => b - a
      ),
    [projects]
  );

  const isItalian = locale === "it";
  const ui = {
    all: isItalian ? "TUTTI" : "ALL",
    searchPlaceholder: isItalian ? "Cerca progetti" : "Search projects",
    projectIndex: isItalian ? "Indice progetti" : "Project index",
    noResults: isItalian ? "Nessun progetto corrisponde alla ricerca." : "No projects match your search.",
    openProjectLabel: isItalian ? "Apri pagina di" : "Open",
    notAvailable: isItalian ? "N/D" : "N/A"
  };
  const localizedProjectsPath = locale === "it" || locale === "en" ? `/${locale}/projects` : "/projects";

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const yearMatches = selectedYear === "all" || project.year === selectedYear;
      const textMatches =
        normalizedQuery.length === 0 ||
        project.searchText.includes(normalizedQuery) ||
        String(project.year).includes(normalizedQuery);
      return yearMatches && textMatches;
    });
  }, [projects, searchQuery, selectedYear]);

  return (
    <section className="bg-[#f6f6f2]">
      <div className="sticky top-16 z-10 border-b border-black/10 bg-[#f6f6f2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex flex-wrap items-center gap-4 text-xs tracking-[0.22em] text-black/70">
            <button
              type="button"
              onClick={() => setSelectedYear("all")}
              className={selectedYear === "all" ? "text-black" : "text-black/60 transition hover:text-black"}
            >
              {ui.all}
            </button>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={selectedYear === year ? "text-black" : "text-black/60 transition hover:text-black"}
              >
                {String(year).slice(-2)}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="text"
              placeholder={ui.searchPlaceholder}
              className="w-full border-b border-black/20 bg-transparent pb-2 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-black md:text-3xl">{ui.projectIndex}</h2>
        {filteredProjects.length === 0 ? <p className="text-sm text-black/65">{ui.noResults}</p> : null}

        <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectGridCard
                key={project.slug}
                project={project}
                ui={ui}
                localizedProjectsPath={localizedProjectsPath}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
