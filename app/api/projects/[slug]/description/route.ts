import { NextResponse } from "next/server";

import { getProjects } from "@/lib/site-assets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      slug: project.slug,
      title: project.title,
      description: project.devText.description.trim(),
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
