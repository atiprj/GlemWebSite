"use client";

import { ProjectControls } from "@/components/projects/ProjectControls";
import { ProjectsStacking } from "@/components/projects/ProjectsStacking";
import type { Project } from "@/lib/site-assets";

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  return (
    <div className="w-full">
      <ProjectsStacking projects={projects} />
      <ProjectControls projects={projects} />
    </div>
  );
}
