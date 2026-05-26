"use client";

import { useLayoutEffect } from "react";

import { ProjectsOverview } from "@/components/projects/ProjectsOverview";
import { LenisProvider } from "@/components/smooth-scroll/LenisProvider";
import type { Project } from "@/lib/site-assets";

interface ProjectsClientProps {
  projects: Project[];
  locale?: "it" | "en";
}

export function ProjectsClient({ projects, locale = "en" }: ProjectsClientProps) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <LenisProvider>
      <ProjectsOverview projects={projects} locale={locale} />
    </LenisProvider>
  );
}
