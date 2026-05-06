import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectArticle } from "@/components/projects/ProjectArticle";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getProjects } from "@/lib/projects-assets";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const t = dictionaries[locale];
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: `${project.title} - ${t.projects}`,
    description: project.devText.intro || project.title
  };
}

export default async function LocaleProjectDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    notFound();
  }

  return <ProjectArticle project={project} />;
}
