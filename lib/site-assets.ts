import { aboutData, eventsData, homeData, projectsData } from "@/data/content";

type MediaType = "image" | "video";
export type MediaOrientation = "landscape" | "portrait";

export interface MediaAsset {
  src: string;
  type: MediaType;
  orientation?: MediaOrientation;
  width?: number;
  height?: number;
}

export interface ProjectGalleryItem {
  slug: string;
  title: string;
  assets: MediaAsset[];
}

export interface Project {
  slug: string;
  title: string;
  year: number;
  articleLink: string;
  tags: string[];
  cover: MediaAsset | null;
  assets: MediaAsset[];
  devContentPath: string;
  devAssets: MediaAsset[];
  devText: {
    intro: string;
    description: string;
    conclusions: string;
    team: string;
    awards: string;
  };
  searchText: string;
}

export async function getHomeHeroAsset(): Promise<MediaAsset | null> {
  const heroSrc = homeData.heroVideo || homeData.heroImages[0] || null;
  if (!heroSrc) return null;
  const type: MediaType = heroSrc.toLowerCase().endsWith(".mp4") || heroSrc.toLowerCase().endsWith(".webm") ? "video" : "image";
  return { src: heroSrc, type };
}

export async function getHomeProjectCollageImages(limit = 24): Promise<string[]> {
  const images = projectsData.flatMap((project) => project.gallery.filter((src) => /\.(jpe?g|png|webp|gif)$/i.test(src)));
  return images.slice(0, Math.max(1, limit));
}

export async function getHomeMenuImageFromFolder(folderName: string): Promise<string | null> {
  if (folderName === "03.Project") return projectsData[0]?.cover ?? null;
  if (folderName === "04.Events") return eventsData.items[0]?.image ?? null;
  return null;
}

export async function getFolderText(folderName: string, fallback: string) {
  if (folderName === "02.About us") return aboutData.description || fallback;
  if (folderName === "04.Events") return fallback;
  return fallback;
}

export async function getFolderMedia(folderName: string): Promise<MediaAsset[]> {
  if (folderName === "02.About us") {
    return aboutData.images.map((src) => ({ src, type: "image", orientation: "landscape" as const }));
  }
  if (folderName === "04.Events") {
    return eventsData.items.map((item) => ({ src: item.image, type: "image", orientation: "landscape" as const }));
  }
  return [];
}

export async function getProjectGalleries(): Promise<ProjectGalleryItem[]> {
  return projectsData.map((project) => ({
    slug: project.slug,
    title: project.title,
    assets: [project.cover, ...project.gallery]
      .filter(Boolean)
      .map((src) => ({
        src,
        type: /\.(mp4|webm|mov)$/i.test(src) ? "video" : "image",
        orientation: "landscape" as const
      }))
  }));
}

function parseYearFromSlug(slug: string) {
  const match = slug.match(/^(\d{2})/);
  if (!match) return null;
  return 2000 + Number(match[1]);
}

function pickCopCover(assets: MediaAsset[]) {
  const copAssets = assets.filter((asset) => asset.src.includes("/COP/"));
  const fromCop = copAssets.find((asset) => asset.type === "image") ?? copAssets[0];
  if (fromCop) return fromCop;
  return assets.find((asset) => asset.type === "image") ?? assets[0] ?? null;
}

function parseDevTextSections(content: string) {
  const normalized = content.replaceAll("\r\n", "\n");
  const readBlock = (labelPattern: string) => {
    const pattern = new RegExp(
      String.raw`(?:^|\n)\s*(?:${labelPattern})\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:INTRO|DESCRIZIONE|CONCLUSIONI?|CONCLUSIONE|TEAM|CREDITS?|GRUPPO|AWARDS?|PREMI|RICONOSCIMENTI)\s*:?\s*\n|$)`,
      "i"
    );
    const match = normalized.match(pattern);
    return (match?.[1] ?? "").trim();
  };

  return {
    intro: readBlock("INTRO"),
    description: readBlock("DESCRIZIONE"),
    conclusions: readBlock("CONCLUSIONI?|CONCLUSIONE"),
    team: readBlock("TEAM|CREDITS?|GRUPPO"),
    awards: readBlock("AWARDS?|PREMI|RICONOSCIMENTI")
  };
}

export async function getProjects(): Promise<Project[]> {
  const galleries = await getProjectGalleries();
  const mapped: Project[] = galleries.map((project) => {
    const year = parseYearFromSlug(project.slug) ?? 0;
    const devAssets: MediaAsset[] = project.assets.filter((asset) => asset.src.includes("/DEV/"));
    return {
      slug: project.slug,
      title: project.title,
      year,
      articleLink: "",
      tags: [],
      cover: pickCopCover(project.assets),
      assets: project.assets,
      devContentPath: `/assets/03.Project/${project.slug}/DEV`,
      devAssets,
      devText: { intro: "", description: "", conclusions: "", team: "", awards: "" },
      searchText: `${project.title} ${project.slug} ${year}`.toLowerCase()
    };
  });
  return mapped.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
