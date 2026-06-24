export function parseDevTextSections(content) {
  const normalized = content.replaceAll("\r\n", "\n");
  const readBlock = (labelPattern) => {
    const pattern = new RegExp(
      `(?:^|\\n)\\s*(?:${labelPattern})\\s*:?\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:INTRO|DESCRIZIONE|CONCLUSIONI?|CONCLUSIONE|TEAM|CREDITS?|GRUPPO|AWARDS?|PREMI|RICONOSCIMENTI)\\s*:?\\s*\\n|$)`,
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

export function findProjectTextFile(allFiles, projectPath, pathSep = "/") {
  const candidates = allFiles.filter((filePath) => {
    const base = filePath.split(pathSep).pop()?.toLowerCase() ?? "";
    return (base === "testo.txt" || base.startsWith("testo")) && base.endsWith(".txt");
  });

  const devMarker = `${pathSep}DEV${pathSep}`;
  const devTextFile = candidates.find((filePath) => filePath.includes(devMarker));
  if (devTextFile) return devTextFile;

  const rootTextFile = candidates.find((filePath) => {
    const parent = filePath.slice(0, filePath.lastIndexOf(pathSep));
    return parent === projectPath;
  });

  return rootTextFile ?? candidates[0] ?? null;
}
