import path from "node:path";
import fs from "node:fs/promises";
import { imageSize } from "image-size";
import * as XLSX from "xlsx";

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
    const size = imageSize(filePath);
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
    return files
      .map((file) => {
        const type = detectType(file);
        const src = toWebPath(file);
        if (!type || !src) return null;
        const imageMeta = type === "image" ? detectImageMeta(file) : null;
        return {
          src,
          type,
          orientation: imageMeta?.orientation ?? "landscape",
          width: imageMeta?.width,
          height: imageMeta?.height
        } satisfies MediaAsset;
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
                const imageMeta = type === "image" ? detectImageMeta(file) : null;
                return {
                  src,
                  type,
                  orientation: imageMeta?.orientation ?? "landscape",
                  width: imageMeta?.width,
                  height: imageMeta?.height
                } satisfies MediaAsset;
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

interface ProjectSpreadsheetMeta {
  articleLink: string;
  tags: string[];
}

async function getProjectSpreadsheetMeta() {
  try {
    const excelPath = path.join(process.cwd(), "public", "assets", "03.Project", "Projects List.xlsx");
    const excelBuffer = await fs.readFile(excelPath);
    const workbook = XLSX.read(excelBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return new Map<string, ProjectSpreadsheetMeta>();

    const rows = XLSX.utils.sheet_to_json<(string | null)[]>(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false
    });

    const metaMap = new Map<string, ProjectSpreadsheetMeta>();
    rows.slice(1).forEach((row) => {
      const rawFolder = typeof row[0] === "string" ? row[0].trim() : "";
      const rawLink = typeof row[1] === "string" ? row[1].trim() : "";
      const tags = row
        .slice(3)
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);

      if (!rawFolder) return;
      metaMap.set(rawFolder, { articleLink: rawLink, tags });
    });

    return metaMap;
  } catch {
    return new Map<string, ProjectSpreadsheetMeta>();
  }
}

function normalizeProjectKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveSpreadsheetMeta(project: ProjectGalleryItem, metaMap: Map<string, ProjectSpreadsheetMeta>) {
  const exactBySlug = metaMap.get(project.slug);
  if (exactBySlug) return exactBySlug;

  const normalizedSlug = normalizeProjectKey(project.slug);
  const normalizedTitle = normalizeProjectKey(project.title);

  for (const [key, meta] of metaMap.entries()) {
    const normalizedKey = normalizeProjectKey(key);
    if (!normalizedKey) continue;
    if (normalizedKey === normalizedSlug || normalizedKey === normalizedTitle) {
      return meta;
    }
  }

  return { articleLink: "", tags: [] };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const galleries = await getProjectGalleries();
    const spreadsheetMeta = await getProjectSpreadsheetMeta();

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
          const devContentPath = `/assets/03.Project/${project.slug}/DEV`;
          const projectMeta = resolveSpreadsheetMeta(project, spreadsheetMeta);

          const devAssets: MediaAsset[] = project.assets.filter((asset) => asset.src.includes("/DEV/"));

          const devText = projectPath
            ? await listFilesRecursive(path.join(projectPath, "DEV"))
                .then((files) =>
                  files.find((file) => {
                    const lower = path.basename(file).toLowerCase();
                    return (lower === "testo.txt" || lower.startsWith("testo")) && lower.endsWith(".txt");
                  })
                )
                .then(async (textFile) => {
                  if (!textFile) return { intro: "", description: "", conclusions: "", team: "", awards: "" };
                  const raw = await fs.readFile(textFile, "utf8").catch(() => "");
                  return parseDevTextSections(raw);
                })
            : { intro: "", description: "", conclusions: "", team: "", awards: "" };

          const row: Project = {
            slug: project.slug,
            title: project.title,
            year,
            articleLink: projectMeta.articleLink,
            tags: projectMeta.tags,
            cover: pickCopCover(project.assets),
            assets: project.assets,
            devContentPath,
            devAssets,
            devText,
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
