import { ProjectControls } from "@/components/projects/ProjectControls";
import { ProjectsStacking } from "@/components/projects/ProjectsStacking";
import { getProjects } from "@/lib/site-assets";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="w-full">
      <ProjectsStacking projects={projects} />
      <ProjectControls projects={projects} />
    </div>
  );
}
