export interface ParsedDevTextSections {
  intro: string;
  description: string;
  conclusions: string;
  team: string;
  awards: string;
}

export function parseDevTextSections(content: string): ParsedDevTextSections;

export function findProjectTextFile(
  allFiles: string[],
  projectPath: string,
  pathSep?: string
): string | null;
