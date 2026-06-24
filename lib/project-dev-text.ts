import fs from "node:fs/promises";
import path from "node:path";

import { findProjectTextFile, parseDevTextSections } from "./project-text-parser.mjs";

export interface ProjectDevText {
  intro: string;
  description: string;
  conclusions: string;
  team: string;
  awards: string;
}

const EMPTY_DEV_TEXT: ProjectDevText = {
  intro: "",
  description: "",
  conclusions: "",
  team: "",
  awards: "",
};

const ASSETS_ROOT = path.join(process.cwd(), "public", "assets", "03.Project");

async function listFiles(dir: string, maxDepth = 10, depth = 0): Promise<string[]> {
  if (depth > maxDepth) return [];

  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFiles(absolutePath, maxDepth, depth + 1);
      }
      return [absolutePath];
    })
  );

  return nested.flat();
}

export async function readProjectDevText(slug: string): Promise<ProjectDevText> {
  const projectPath = path.join(ASSETS_ROOT, slug);
  const exists = await fs.access(projectPath).then(() => true).catch(() => false);
  if (!exists) {
    return EMPTY_DEV_TEXT;
  }

  const allFiles = await listFiles(projectPath);
  const textFile = findProjectTextFile(allFiles, projectPath, path.sep);
  if (!textFile) {
    return EMPTY_DEV_TEXT;
  }

  const raw = await fs.readFile(textFile, "utf8").catch(() => "");
  return parseDevTextSections(raw);
}
