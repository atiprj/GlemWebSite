"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import type { Project } from "@/lib/site-assets";

interface ProjectsStackingProps {
  projects: Project[];
}

function ProjectStackCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [1, 1, 1, 0.25]);
  const x = useTransform(scrollYProgress, [0, 1], [index * 18, index * 6]);

  return (
    <div ref={ref} className="relative h-screen">
      <motion.article
        style={{ opacity, x }}
        className="sticky top-0 h-screen overflow-hidden border-b border-white/15 bg-black"
      >
        {project.cover?.type === "image" ? (
          <motion.div style={{ scale }} className="h-full w-full">
            <Image
              src={project.cover.src}
              alt={project.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        ) : project.cover?.type === "video" ? (
          <motion.video
            style={{ scale }}
            src={project.cover.src}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <motion.div style={{ scale }} className="h-full w-full bg-neutral-800" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute bottom-12 left-8 z-10 md:left-12">
          <p className="mb-2 text-xs tracking-[0.25em] text-white/80">{project.year || "N/A"}</p>
          <h2 className="text-balance text-3xl font-semibold text-white drop-shadow-md md:text-5xl">{project.title}</h2>
        </div>
      </motion.article>
    </div>
  );
}

export function ProjectsStacking({ projects }: ProjectsStackingProps) {
  if (projects.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-14 text-neutral-700 md:px-10">
        No projects found in `public/assets/03.Projects` (or fallback `03.Project`).
      </section>
    );
  }

  const featured = projects.slice(0, Math.min(4, projects.length));

  return (
    <section className="bg-black">
      {featured.map((project, index) => (
        <ProjectStackCard key={project.slug} project={project} index={index} />
      ))}
    </section>
  );
}
