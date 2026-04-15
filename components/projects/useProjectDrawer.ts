"use client";

import { useCallback, useState } from "react";

import type { Project } from "@/lib/site-assets";

export function useProjectDrawer() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const openDrawer = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return {
    selectedProject,
    isOpen: selectedProject !== null,
    openDrawer,
    closeDrawer
  };
}
