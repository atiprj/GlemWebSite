import path from "node:path";
import fs from "node:fs/promises";

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];
const TEXT_EXT = [".txt", ".md"];
const LIST_MAX_DEPTH = 40;

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
  searchText: string;
}

function toWebPath(absoluteFilePath: string): string | null {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const relative = path.relative(publicDir, absoluteFilePath);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      return null;
    }
    return `/${relative.replaceAll("\\", "/")}`;
  } catch {
    return null;
  }
}

function detectType(filePath: string): MediaType | null {
  const lower = filePath.toLowerCase();
  if (IMAGE_EXT.some((ext) => lower.endsWith(ext))) return "image";
  if (VIDEO_EXT.some((ext) => lower.endsWith(ext))) return "video";
  return null;
}

async function listFilesRecursive(dir: string, depth = 0): Promise<string[]> {
  if (depth > LIST_MAX_DEPTH) return [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const nested = await Promise.all(
      entries.map(async (entry) => {
        try {
          const absolute = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            return listFilesRecursive(absolute, depth + 1);
          }
          return [absolute];
        } catch {
          return [];
        }
      })
    );
    return nested.flat();
  } catch {
    return [];
  }
}

export async function getHomeHeroAsset(): Promise<MediaAsset | null> {
  try {
    const root = path.join(process.cwd(), "public", "assets");
    const homeFolder = path.join(root, "01.Home");
    const candidates = [homeFolder, root];

    for (const candidate of candidates) {
      const files = await listFilesRecursive(candidate);
      const mediaFile =
        files.find((file) => detectType(file) === "image") ?? files.find((file) => detectType(file) === "video");
      if (mediaFile) {
        const type = detectType(mediaFile);
        const src = toWebPath(mediaFile);
        if (type && src) return { src, type };
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

export async function getFolderText(folderName: string, fallback: string) {
  try {
    const folder = path.join(process.cwd(), "public", "assets", folderName);
    const files = await listFilesRecursive(folder);
    const textFile = files.find((file) => TEXT_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
    if (!textFile) return fallback;
    const content = await fs.readFile(textFile, "utf8").catch(() => "");
    return content.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function getFolderMedia(folderName: string): Promise<MediaAsset[]> {
  try {
    const folder = path.join(process.cwd(), "public", "assets", folderName);
    const files = await listFilesRecursive(folder);
    return files
      .map((file) => {
        const type = detectType(file);
        const src = toWebPath(file);
        if (!type || !src) return null;
        return { src, type } satisfies MediaAsset;
      })
      .filter((item): item is MediaAsset => item !== null);
  } catch {
    return [];
  }
}

export async function getProjectGalleries(): Promise<ProjectGalleryItem[]> {
  try {
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
            const files = await listFilesRecursive(fullPath);
            const assets = files
              .map((file) => {
                const type = detectType(file);
                const src = toWebPath(file);
                if (!type || !src) return null;
                return { src, type } satisfies MediaAsset;
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
  } catch {
    return [];
  }
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
  try {
    const galleries = await getProjectGalleries();

    const mapped = await Promise.all(
      galleries.map(async (project) => {
        try {
          const projectRootCandidates = ["03.Projects", "03.Project"].map((folder) =>
            path.join(process.cwd(), "public", "assets", folder, project.slug)
          );

          let projectPath: string | null = null;
          for (const candidate of projectRootCandidates) {
            const exists = await fs
              .access(candidate)
              .then(() => true)
              .catch(() => false);
            if (exists) {
              projectPath = candidate;
              break;
            }
          }

          let descriptionText = "";
          if (projectPath) {
            const files = await listFilesRecursive(projectPath);
            const textFiles = files.filter((file) => TEXT_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
            const textChunks = await Promise.all(
              textFiles.map((file) =>
                fs
                  .readFile(file, "utf8")
                  .then((content) => content.trim())
                  .catch(() => "")
              )
            );
            descriptionText = textChunks.filter(Boolean).join(" ");
          }

          const year = parseYearFromSlug(project.slug) ?? 0;

          const row: Project = {
            slug: project.slug,
            title: project.title,
            year,
            cover: pickCopCover(project.assets),
            assets: project.assets,
            searchText: `${project.title} ${project.slug} ${year} ${descriptionText}`.toLowerCase()
          };
          return row;
        } catch {
          return null;
        }
      })
    );

    const filtered: Project[] = mapped.filter((p): p is Project => p !== null);
    return filtered.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}
