import { readProjectDevText } from "@/lib/project-dev-text";
import type { Project } from "@/lib/site-assets";

export async function getProjectWithLiveText(
  slug: string,
  projects: Project[]
): Promise<Project | null> {
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    return null;
  }

  const devText = await readProjectDevText(slug);
  return {
    ...project,
    devText
  };
}
