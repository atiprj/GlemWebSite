import { notFound } from "next/navigation";

import { ProjectsClient } from "@/app/projects/ProjectsClient";
import { isLocale } from "@/lib/i18n";
import { getProjects } from "@/lib/site-assets";

export const dynamic = "force-dynamic";

export default async function LocaleProjectsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const projects = await getProjects();
  return <ProjectsClient projects={projects} locale={locale} />;
}
