import path from "node:path";
import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import { imageSize } from "image-size";

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];
const TEXT_EXT = [".txt", ".md"];
const LIST_MAX_DEPTH = 40;

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

function detectImageMeta(filePath: string) {
  try {
    const imageBuffer = readFileSync(filePath);
    const size = imageSize(imageBuffer);
    const width = size.width ?? 0;
    const height = size.height ?? 0;
    return {
      width,
      height,
      orientation: height > width ? "portrait" : "landscape"
    } satisfies { width: number; height: number; orientation: MediaOrientation };
  } catch {
    return { width: 0, height: 0, orientation: "landscape" as MediaOrientation };
  }
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

export async function getHomeProjectCollageImages(limit = 24): Promise<string[]> {
  try {
    const projectRoots = ["03.Projects", "03.Project"].map((folder) => path.join(process.cwd(), "public", "assets", folder));
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

    const files = await listFilesRecursive(rootToUse);
    const weightedImages = await Promise.all(
      files
        .filter((file) => detectType(file) === "image")
        .map(async (file) => {
          const src = toWebPath(file);
          if (!src) return null;
          const size = await fs
            .stat(file)
            .then((stats) => stats.size)
            .catch(() => Number.MAX_SAFE_INTEGER);
          return { src, size };
        })
    );

    return weightedImages
      .filter((item): item is { src: string; size: number } => item !== null)
      .sort((a, b) => a.size - b.size)
      .slice(0, Math.max(1, limit))
      .map((item) => item.src);
  } catch {
    return [];
  }
}

export async function getHomeMenuImageFromFolder(folderName: string): Promise<string | null> {
  try {
    const folder = path.join(process.cwd(), "public", "assets", folderName);
    const files = await fs.readdir(folder).catch(() => []);
    const menuHomeImage = files.find((file) =>
      /^immagine\s*menu\s*home\.(jpe?g)$/i.test(file.trim())
    );
    if (!menuHomeImage) return null;
    return `/${path.posix.join("assets", folderName, menuHomeImage)}`;
  } catch {
    return null;
  }
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
    const assets = files
      .map<MediaAsset | null>((file) => {
        const type = detectType(file);
        const src = toWebPath(file);
        if (!type || !src) return null;
        const imageMeta = type === "image" ? detectImageMeta(file) : null;
        const asset: MediaAsset = {
          src,
          type,
          orientation: imageMeta?.orientation ?? "landscape",
          width: imageMeta?.width,
          height: imageMeta?.height
        };
        return asset;
      })
      .filter((item): item is MediaAsset => item !== null);
    return assets;
  } catch {
    return [];
  }
}

// getProjects and getProjectGalleries have been moved to lib/projects-assets.ts
// which reads from the pre-built data/projects-manifest.json.
// This avoids Turbopack / NFT tracing public/assets/03.Project into every function bundle.
