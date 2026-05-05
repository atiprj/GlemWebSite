import path from "node:path";
import fs from "node:fs/promises";

import { aboutData, eventsData, homeData, projectsData } from "@/data/content";

type MediaType = "image" | "video";
export type MediaOrientation = "landscape" | "portrait";
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];
const TEXT_EXT = [".txt", ".md"];

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

function detectType(filePath: string): MediaType | null {
  const lower = filePath.toLowerCase();
  if (IMAGE_EXT.some((ext) => lower.endsWith(ext))) return "image";
  if (VIDEO_EXT.some((ext) => lower.endsWith(ext))) return "video";
  return null;
}

function toWebPath(absoluteFilePath: string): string | null {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const relative = path.relative(publicDir, absoluteFilePath);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
    return `/${relative.replaceAll("\\", "/")}`;
  } catch {
    return null;
  }
}

async function listFilesRecursive(dir: string, maxDepth = 8, depth = 0): Promise<string[]> {
  if (depth > maxDepth) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFilesRecursive(abs, maxDepth, depth + 1);
      return [abs];
    })
  );
  return nested.flat();
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
  if (folderName === "03.Project") return projectsData.find((p) => Boolean(p.cover))?.cover ?? null;
  if (folderName === "04.Events") return eventsData.items.find((i) => Boolean(i.image))?.image ?? null;
  return null;
}

export async function getFolderText(folderName: string, fallback: string) {
  const allowed = new Set(["02.About us", "04.Events", "05.Contacts"]);
  if (!allowed.has(folderName)) {
    if (folderName === "02.About us") return aboutData.description || fallback;
    return fallback;
  }

  const folder = path.join(process.cwd(), "public", "assets", folderName);
  const files = await listFilesRecursive(folder, 4);
  const textFile = files.find((file) => TEXT_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
  if (!textFile) {
    if (folderName === "02.About us") return aboutData.description || fallback;
    return fallback;
  }
  const content = await fs.readFile(textFile, "utf8").catch(() => "");
  return content.trim() || fallback;
}

export async function getFolderMedia(folderName: string): Promise<MediaAsset[]> {
  const allowed = new Set(["02.About us", "04.Events", "05.Contacts"]);
  if (!allowed.has(folderName)) {
    if (folderName === "02.About us") {
      return aboutData.images.map((src) => ({ src, type: "image", orientation: "landscape" as const }));
    }
    if (folderName === "04.Events") {
      return eventsData.items.map((item) => ({ src: item.image, type: "image", orientation: "landscape" as const }));
    }
    return [];
  }

  const folder = path.join(process.cwd(), "public", "assets", folderName);
  const files = await listFilesRecursive(folder, 6);
  const media = files
    .map<MediaAsset | null>((file) => {
      const type = detectType(file);
      const src = toWebPath(file);
      if (!type || !src) return null;
      const asset: MediaAsset = { src, type, orientation: "landscape" };
      return asset;
    })
    .filter((item): item is MediaAsset => item !== null);

  if (media.length > 0) return media;
  if (folderName === "02.About us") return aboutData.images.map((src) => ({ src, type: "image", orientation: "landscape" as const }));
  if (folderName === "04.Events") return eventsData.items.map((item) => ({ src: item.image, type: "image", orientation: "landscape" as const }));
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
