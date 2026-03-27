import path from "node:path";
import fs from "node:fs/promises";

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];
const TEXT_EXT = [".txt", ".md"];

type MediaType = "image" | "video";

export interface MediaAsset {
  src: string;
  type: MediaType;
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
  cover: MediaAsset | null;
  assets: MediaAsset[];
}

function toWebPath(absoluteFilePath: string) {
  const relative = path.relative(path.join(process.cwd(), "public"), absoluteFilePath);
  return `/${relative.replaceAll("\\", "/")}`;
}

function detectType(filePath: string): MediaType | null {
  const lower = filePath.toLowerCase();
  if (IMAGE_EXT.some((ext) => lower.endsWith(ext))) return "image";
  if (VIDEO_EXT.some((ext) => lower.endsWith(ext))) return "video";
  return null;
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFilesRecursive(absolute);
      }
      return [absolute];
    })
  );
  return nested.flat();
}

export async function getHomeHeroAsset(): Promise<MediaAsset | null> {
  const root = path.join(process.cwd(), "public", "assets");
  const homeFolder = path.join(root, "01.Home");
  const candidates = [homeFolder, root];

  for (const candidate of candidates) {
    const files = await listFilesRecursive(candidate).catch(() => []);
    const mediaFile = files.find((file) => detectType(file) === "image") ?? files.find((file) => detectType(file) === "video");
    if (mediaFile) {
      const type = detectType(mediaFile);
      if (type) return { src: toWebPath(mediaFile), type };
    }
  }

  return null;
}

export async function getFolderText(folderName: string, fallback: string) {
  const folder = path.join(process.cwd(), "public", "assets", folderName);
  const files = await listFilesRecursive(folder).catch(() => []);
  const textFile = files.find((file) => TEXT_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
  if (!textFile) return fallback;
  const content = await fs.readFile(textFile, "utf8").catch(() => "");
  return content.trim() || fallback;
}

export async function getFolderMedia(folderName: string): Promise<MediaAsset[]> {
  const folder = path.join(process.cwd(), "public", "assets", folderName);
  const files = await listFilesRecursive(folder).catch(() => []);
  return files
    .map((file) => {
      const type = detectType(file);
      if (!type) return null;
      return { src: toWebPath(file), type } satisfies MediaAsset;
    })
    .filter((item): item is MediaAsset => item !== null);
}

export async function getProjectGalleries(): Promise<ProjectGalleryItem[]> {
  const projectRoots = ["03.Projects", "03.Project"].map((folder) =>
    path.join(process.cwd(), "public", "assets", folder)
  );

  let rootToUse: string | null = null;
  for (const root of projectRoots) {
    const exists = await fs
      .access(root)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      rootToUse = root;
      break;
    }
  }
  if (!rootToUse) return [];

  const projectDirs = await fs.readdir(rootToUse, { withFileTypes: true }).catch(() => []);
  const mapped = await Promise.all(
    projectDirs
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        try {
          const slug = entry.name;
          const fullPath = path.join(rootToUse as string, slug);
          const files = await listFilesRecursive(fullPath).catch(() => []);
          const assets = files
            .map((file) => {
              const type = detectType(file);
              if (!type) return null;
              return { src: toWebPath(file), type } satisfies MediaAsset;
            })
            .filter((item): item is MediaAsset => item !== null);

          return {
            slug,
            title: slug.replace(/[._-]/g, " ").replace(/\s+/g, " ").trim(),
            assets
          } satisfies ProjectGalleryItem;
        } catch {
          return null;
        }
      })
  );

  return mapped.filter((item): item is ProjectGalleryItem => item !== null && item.assets.length > 0);
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

  const mapped = galleries.map((project) => ({
    slug: project.slug,
    title: project.title,
    year: parseYearFromSlug(project.slug) ?? 0,
    cover: pickCopCover(project.assets),
    assets: project.assets
  }));

  return mapped.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
