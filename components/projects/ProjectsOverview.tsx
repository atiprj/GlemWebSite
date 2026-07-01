"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ElasticGrid } from "@/components/projects/ElasticGrid";
import type { Project } from "@/lib/site-assets";

interface ProjectsOverviewProps {
  projects: Project[];
  locale?: "it" | "en";
}

function hasCopImage(project: Project) {
  return (project.copImages?.length ?? 0) > 0 || Boolean(project.cover?.src.includes("/COP/") && project.cover.type === "image");
}

function getCopSrc(project: Project) {
  return project.copImages?.[0]?.src ?? (project.cover?.type === "image" ? project.cover.src : null);
}

export function ProjectsOverview({ projects, locale = "en" }: ProjectsOverviewProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isItalian = locale === "it";
  const ui = {
    title: isItalian ? "Progetti" : "Projects",
    all: isItalian ? "Tutti" : "All",
    searchPlaceholder: isItalian ? "Cerca progetti" : "Search projects",
    noResults: isItalian
      ? "Nessun progetto con immagine nella cartella COP."
      : "No projects with an image in the COP folder.",
    openProject: isItalian ? "Apri progetto" : "Open project",
    notAvailable: isItalian ? "N/D" : "N/A"
  };

  const localizedProjectsPath = locale === "it" || locale === "en" ? `/${locale}/projects` : "/projects";
  const localizedHomePath =
    locale === "it" || locale === "en" ? `/${locale}#home-sections` : "/#home-sections";

  const overviewProjects = useMemo(() => projects.filter(hasCopImage), [projects]);

  const years = useMemo(
    () =>
      Array.from(new Set(overviewProjects.map((project) => project.year).filter((year) => year > 0))).sort(
        (a, b) => b - a
      ),
    [overviewProjects]
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return overviewProjects.filter((project) => {
      const yearMatches = selectedYear === "all" || project.year === selectedYear;
      const textMatches =
        normalizedQuery.length === 0 ||
        project.searchText.includes(normalizedQuery) ||
        project.title.toLowerCase().includes(normalizedQuery) ||
        String(project.year).includes(normalizedQuery);
      return yearMatches && textMatches;
    });
  }, [overviewProjects, searchQuery, selectedYear]);

  return (
    <section className="bg-[#f6f6f2] text-neutral-900">
      <header className="sticky top-16 z-30 bg-[#f6f6f2]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1800px] px-6 pt-5 pb-4 md:px-12 md:pt-6 md:pb-5">
          <div className="flex items-center gap-4">
            <Link
              href={localizedHomePath}
              className="inline-block shrink-0 opacity-50 transition hover:opacity-100"
              aria-label="Back to home"
            >
              <Image src="/assets/06.Icons/icons8-freccia-sinistra-50.png" alt="Back" width={20} height={20} />
            </Link>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{ui.title}</h1>
          </div>

          <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs tracking-[0.22em] text-black/70">
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
                  {year}
                </button>
              ))}
            </div>

            <div className="w-full shrink-0 md:w-80">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder={ui.searchPlaceholder}
                className="w-full border-b border-black/20 bg-transparent pb-2 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1800px] px-[5vw] pt-8 pb-[10rem] md:pt-10">
        {filteredProjects.length === 0 ? (
          <p className="text-sm text-black/65">{ui.noResults}</p>
        ) : (
          <ElasticGrid
            items={filteredProjects
              .map((project) => {
                const copSrc = getCopSrc(project);
                if (!copSrc) return null;
                return {
                  project,
                  imageSrc: copSrc,
                  href: `${localizedProjectsPath}/${encodeURIComponent(project.slug)}`,
                };
              })
              .filter((item): item is NonNullable<typeof item> => item !== null)}
          />
        )}
      </div>
    </section>
  );
}
