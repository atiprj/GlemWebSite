"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { Project } from "@/lib/site-assets";

interface ProjectControlsProps {
  projects: Project[];
}

export function ProjectControls({ projects }: ProjectControlsProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const years = useMemo(
    () =>
      Array.from(new Set(projects.map((project) => project.year).filter((year) => year > 0))).sort(
        (a, b) => b - a
      ),
    [projects]
  );

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
              ALL
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
              placeholder="Search projects"
              className="w-full bg-transparent border-b border-black/20 pb-2 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        {filteredProjects.length === 0 ? (
          <p className="text-sm text-black/65">No projects match your search.</p>
        ) : null}

        <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.article
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-sm bg-neutral-200"
              >
                <div className="relative aspect-[6/10]">
                  {project.cover?.type === "image" ? (
                    <Image src={project.cover.src} alt={project.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : project.cover?.type === "video" ? (
                    <video src={project.cover.src} muted loop playsInline autoPlay className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-neutral-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="mb-1 text-[10px] tracking-[0.2em] text-white/75">
                      {project.year > 0 ? project.year : "N/A"}
                    </p>
                    <h3 className="text-sm font-medium text-white md:text-base">{project.title}</h3>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
