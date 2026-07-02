import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectArticle } from "@/components/projects/ProjectArticle";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getProjects } from "@/lib/projects-assets";
import { getProjectWithLiveText, hasDevText } from "@/lib/project-with-live-text";
import { readProjectDevText } from "@/lib/project-dev-text";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  if (!isLocale(locale)) return {};

  const t = dictionaries[locale];
  const projects = await getProjects();
  const liveDevText = await readProjectDevText(slug);
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  const devText = hasDevText(liveDevText) ? liveDevText : project.devText;

  return {
    title: `${project.title} - ${t.projects}`,
    description: devText.intro || project.title
  };
}

export default async function LocaleProjectDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  if (!isLocale(locale)) {
    notFound();
  }

  const projects = await getProjects();
  const project = await getProjectWithLiveText(slug, projects);
  if (!project) {
    notFound();
  }

  return <ProjectArticle project={project} />;
}
