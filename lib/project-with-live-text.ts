import { readProjectDevText, type ProjectDevText } from "@/lib/project-dev-text";
import type { Project } from "@/lib/site-assets";

export function hasDevText(devText: ProjectDevText): boolean {
  return Object.values(devText).some((value) => value.trim().length > 0);
}

export async function getProjectWithLiveText(
  slug: string,
  projects: Project[]
): Promise<Project | null> {
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    return null;
  }

  const liveDevText = await readProjectDevText(slug);
  return {
    ...project,
    devText: hasDevText(liveDevText) ? liveDevText : project.devText
  };
}
