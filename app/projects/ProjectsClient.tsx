"use client";

import { ProjectControls } from "@/components/projects/ProjectControls";
import { ProjectsStacking } from "@/components/projects/ProjectsStacking";
import type { Project } from "@/lib/site-assets";

interface ProjectsClientProps {
  projects: Project[];
  locale?: "it" | "en";
}

export function ProjectsClient({ projects, locale = "en" }: ProjectsClientProps) {
  return (
    <div className="w-full">
      <ProjectsStacking projects={projects} locale={locale} />
      <ProjectControls projects={projects} locale={locale} />
    </div>
  );
}
