import { NextResponse } from "next/server";

import { readProjectDevText } from "@/lib/project-dev-text";
import { getProjects } from "@/lib/projects-assets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const projects = await getProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const devText = await readProjectDevText(slug);

  return NextResponse.json(
    {
      slug: project.slug,
      title: project.title,
      intro: devText.intro.trim(),
      description: devText.description.trim(),
      conclusions: devText.conclusions.trim(),
      team: devText.team.trim(),
      awards: devText.awards.trim(),
      articleLink: project.articleLink,
      tags: project.tags
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
