/**
 * Prebuild script: scans public/assets/03.Project and generates
 * data/projects-manifest.json  — no heavy files are imported
 * inside Next.js server functions, so each function stays < 250 MB.
 *
 * Run automatically via "prebuild" in package.json before next build.
 */

import { readdir, readFile, access, writeFile, mkdir, stat as stat_fn } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_ROOT = path.join(ROOT, "public", "assets", "03.Project");
const OUT_DIR = path.join(ROOT, "data");
const OUT_FILE = path.join(OUT_DIR, "projects-manifest.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const TEXT_EXT = new Set([".txt", ".md"]);

function detectType(filePath) {
  const lower = filePath.toLowerCase();
  const ext = path.extname(lower);
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

function toWebPath(absoluteFilePath) {
  const publicDir = path.join(ROOT, "public");
  const relative = path.relative(publicDir, absoluteFilePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return `/${relative.replaceAll("\\", "/")}`;
}

async function listFiles(dir, maxDepth = 10, depth = 0) {
  if (depth > maxDepth) return [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(abs, maxDepth, depth + 1);
      return [abs];
    })
  );
  return nested.flat();
}

function parseYearFromSlug(slug) {
  const match = slug.match(/^(\d{2})/);
  if (!match) return null;
  return 2000 + Number(match[1]);
}

function pickCopCover(assets) {
  const copAssets = assets.filter((a) => a.src.includes("/COP/"));
  const fromCop = copAssets.find((a) => a.type === "image") ?? copAssets[0];
  if (fromCop) return fromCop;
  return assets.find((a) => a.type === "image") ?? assets[0] ?? null;
}

function parseDevTextSections(content) {
  const normalized = content.replaceAll("\r\n", "\n");
  const readBlock = (labelPattern) => {
    const pattern = new RegExp(
      `(?:^|\\n)\\s*(?:${labelPattern})\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:INTRO|DESCRIZIONE|CONCLUSIONI?|CONCLUSIONE|TEAM|CREDITS?|GRUPPO|AWARDS?|PREMI|RICONOSCIMENTI)\\s*:?\\s*\\n|$)`,
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
    awards: readBlock("AWARDS?|PREMI|RICONOSCIMENTI"),
  };
}

async function readSpreadsheetMeta() {
  try {
    const xlsx = await import("xlsx");
    const excelPath = path.join(ASSETS_ROOT, "Projects List.xlsx");
    const excelBuffer = await readFile(excelPath);
    const workbook = xlsx.read(excelBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return new Map();

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false,
    });

    const metaMap = new Map();
    rows.slice(1).forEach((row) => {
      const rawFolder = typeof row[0] === "string" ? row[0].trim() : "";
      const rawLink = typeof row[1] === "string" ? row[1].trim() : "";
      const tags = row
        .slice(3)
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean);
      if (!rawFolder) return;
      metaMap.set(rawFolder.toLowerCase().replace(/[^a-z0-9]/g, ""), {
        articleLink: rawLink,
        tags,
        originalKey: rawFolder,
      });
    });
    return metaMap;
  } catch {
    return new Map();
  }
}

/** Find "Immagine menu home" image in a folder (root files only, no recursion). */
async function findMenuHomeImage(folderPath) {
  const entries = await readdir(folderPath, { withFileTypes: true }).catch(() => []);
  const found = entries.find(
    (e) => !e.isDirectory() && /^immagine\s*menu\s*home\.(jpe?g|png|webp)$/i.test(e.name.trim())
  );
  if (!found) return null;
  return toWebPath(path.join(folderPath, found.name));
}

async function main() {
  const exists = await access(ASSETS_ROOT).then(() => true).catch(() => false);
  if (!exists) {
    console.warn(`[manifest] ${ASSETS_ROOT} not found, writing empty manifest.`);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify({ projects: [], collageImages: [], projectMenuImage: null }, null, 2), "utf8");
    return;
  }

  const spreadsheetMeta = await readSpreadsheetMeta();
  const projectDirs = await readdir(ASSETS_ROOT, { withFileTypes: true }).catch(() => []);
  const projects = [];
  /** @type {{ src: string; size: number; project: string }[]} */
  const allProjectImagePaths = [];

  for (const entry of projectDirs) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const projectPath = path.join(ASSETS_ROOT, slug);
    const allFiles = await listFiles(projectPath);

    const assets = allFiles
      .map((file) => {
        const type = detectType(file);
        const src = toWebPath(file);
        if (!type || !src) return null;
        return { src, type, orientation: "landscape" };
      })
      .filter(Boolean);

    // Collect DEV images with file sizes for collage selection
    const devImageFiles = allFiles.filter((f) => {
      if (!f.includes(`${path.sep}DEV${path.sep}`)) return false;
      const type = detectType(f);
      return type === "image";
    });
    for (const f of devImageFiles) {
      try {
        const stat = await stat_fn(f);
        const src = toWebPath(f);
        if (src) allProjectImagePaths.push({ src, size: stat.size, project: slug });
      } catch { /* skip unreadable */ }
    }

    if (assets.length === 0) continue;

    const devFiles = allFiles.filter((f) => f.includes(`${path.sep}DEV${path.sep}`));
    const textFile = devFiles.find((f) => {
      const base = path.basename(f).toLowerCase();
      return (base === "testo.txt" || base.startsWith("testo")) && base.endsWith(".txt");
    });
    const devText = textFile
      ? parseDevTextSections(await readFile(textFile, "utf8").catch(() => ""))
      : { intro: "", description: "", conclusions: "", team: "", awards: "" };

    const allTextFiles = allFiles.filter((f) => TEXT_EXT.has(path.extname(f).toLowerCase()));
    const textChunks = await Promise.all(
      allTextFiles.map((f) => readFile(f, "utf8").then((c) => c.trim()).catch(() => ""))
    );
    const searchText = textChunks.filter(Boolean).join(" ");

    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
    const meta = spreadsheetMeta.get(normalizedSlug) ?? { articleLink: "", tags: [] };

    const year = parseYearFromSlug(slug) ?? 0;
    const cover = pickCopCover(assets);
    const devAssets = assets.filter((a) => a.src.includes("/DEV/"));

    projects.push({
      slug,
      title: slug.replace(/[._-]/g, " ").replace(/\s+/g, " ").trim(),
      year,
      articleLink: meta.articleLink ?? "",
      tags: meta.tags ?? [],
      cover,
      assets,
      devContentPath: `/assets/03.Project/${slug}/DEV`,
      devAssets,
      devText,
      searchText: `${slug} ${year} ${searchText}`.toLowerCase(),
    });
  }

  projects.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  // Find "Immagine menu home" in the 03.Project root
  const projectMenuImage = await findMenuHomeImage(ASSETS_ROOT);

  // Build collage: pick lightest DEV images, max 3 per project, skip files > 10 MB
  // Then interleave across projects so the collage mixes all projects
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_PER_PROJECT = 3;

  const byProject = new Map();
  for (const img of allProjectImagePaths) {
    if (img.size > MAX_FILE_SIZE) continue;
    if (!byProject.has(img.project)) byProject.set(img.project, []);
    byProject.get(img.project).push(img);
  }

  // Sort each project's images by size (lightest first) and keep top MAX_PER_PROJECT
  const projectBuckets = [];
  for (const [, imgs] of byProject) {
    imgs.sort((a, b) => a.size - b.size);
    projectBuckets.push(imgs.slice(0, MAX_PER_PROJECT));
  }

  // Interleave: take one image from each project in turn (round-robin)
  const collageImages = [];
  const maxRounds = MAX_PER_PROJECT;
  for (let round = 0; round < maxRounds; round++) {
    for (const bucket of projectBuckets) {
      if (bucket[round]) collageImages.push(bucket[round].src);
    }
  }

  const output = {
    projects,
    collageImages,
    projectMenuImage,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(output, null, 2), "utf8");

  const totalKB = Math.round(
    allProjectImagePaths.filter(i => i.size <= MAX_FILE_SIZE && collageImages.includes(i.src))
      .reduce((s, i) => s + i.size, 0) / 1024
  );
  console.log(`[manifest] wrote ${projects.length} projects, ${collageImages.length} collage images (~${totalKB} KB on disk) → ${OUT_FILE}`);
}

main().catch((e) => {
  console.error("[manifest] error:", e);
  process.exit(1);
});
