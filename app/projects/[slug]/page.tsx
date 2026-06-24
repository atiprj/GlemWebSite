import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectArticle } from "@/components/projects/ProjectArticle";
import { getProjects } from "@/lib/projects-assets";
import { getProjectWithLiveText } from "@/lib/project-with-live-text";
import { readProjectDevText } from "@/lib/project-dev-text";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  const devText = await readProjectDevText(slug);
  return {
    title: `${project.title} — Projects`,
    description: devText.intro || project.title
  };
}

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = await getProjectWithLiveText(slug, projects);
  if (!project) notFound();

  return <ProjectArticle project={project} />;
}
