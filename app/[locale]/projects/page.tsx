import { ProjectModal } from "@/components/project-modal";
import { projectsData } from "@/data/content";
import { dictionaries, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function ProjectsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const projects = projectsData;

  return (
    <section className="section">
      <h1>{t.projects}</h1>
      <div className="grid">
        {projects.length ? (
          projects.map((project) => <ProjectModal key={project.slug} project={project} />)
        ) : (
          <p className="muted">{t.projectsPlaceholder}</p>
        )}
      </div>
    </section>
  );
}
