/**
 * Prebuild script: scans public/assets/03.Project and generates
 * data/projects-manifest.json  — no heavy files are imported
 * inside Next.js server functions, so each function stays < 250 MB.
 *
 * Run automatically via "prebuild" in package.json before next build.
 */

import { readdir, readFile, access, writeFile, mkdir } from "node:fs/promises";
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

async function main() {
  const exists = await access(ASSETS_ROOT).then(() => true).catch(() => false);
  if (!exists) {
    console.warn(`[manifest] ${ASSETS_ROOT} not found, writing empty manifest.`);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify([], null, 2), "utf8");
    return;
  }

  const spreadsheetMeta = await readSpreadsheetMeta();
  const projectDirs = await readdir(ASSETS_ROOT, { withFileTypes: true }).catch(() => []);
  const projects = [];

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

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(projects, null, 2), "utf8");
  console.log(`[manifest] wrote ${projects.length} projects → ${OUT_FILE}`);
}

main().catch((e) => {
  console.error("[manifest] error:", e);
  process.exit(1);
});
