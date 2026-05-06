import { getProjects } from "@/lib/projects-assets";
import { ProjectsClient } from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsClient projects={projects} />;
}
