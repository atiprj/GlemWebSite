export type ScatterTileLayout = {
  /** Placement on 12-column grid, e.g. "1 / span 5" */
  column: string;
  rowSpan: number;
  /** CSS aspect-ratio value, e.g. "5/3" */
  aspectRatio: string;
  justifySelf: "start" | "end" | "center" | "stretch";
  marginTop: number;
  marginBottom: number;
  maxWidth?: string;
};

/** Rettangoli dritti, sparse nello spazio (stile UNS) */
export const SCATTER_TILE_LAYOUTS: ScatterTileLayout[] = [
  { column: "1 / span 6", rowSpan: 4, aspectRatio: "5/3", justifySelf: "start", marginTop: 0, marginBottom: 48 },
  { column: "9 / span 4", rowSpan: 3, aspectRatio: "3/4", justifySelf: "end", marginTop: 72, marginBottom: 32 },
  { column: "2 / span 4", rowSpan: 3, aspectRatio: "1/1", justifySelf: "start", marginTop: 24, marginBottom: 64 },
  { column: "7 / span 5", rowSpan: 5, aspectRatio: "16/10", justifySelf: "end", marginTop: 0, marginBottom: 40 },
  { column: "1 / span 4", rowSpan: 3, aspectRatio: "4/5", justifySelf: "start", marginTop: 56, marginBottom: 24, maxWidth: "88%" },
  { column: "6 / span 6", rowSpan: 5, aspectRatio: "3/2", justifySelf: "stretch", marginTop: 16, marginBottom: 80 },
  { column: "3 / span 5", rowSpan: 4, aspectRatio: "5/4", justifySelf: "center", marginTop: 40, marginBottom: 48 },
  { column: "10 / span 3", rowSpan: 3, aspectRatio: "2/3", justifySelf: "end", marginTop: 88, marginBottom: 0 },
  { column: "1 / span 5", rowSpan: 4, aspectRatio: "16/9", justifySelf: "start", marginTop: 32, marginBottom: 56 },
  { column: "8 / span 4", rowSpan: 3, aspectRatio: "4/3", justifySelf: "end", marginTop: 0, marginBottom: 72 }
];

export function getScatterLayout(index: number): ScatterTileLayout {
  return SCATTER_TILE_LAYOUTS[index % SCATTER_TILE_LAYOUTS.length];
}

/** @deprecated use getScatterLayout */
export function getPatchworkLayout(index: number): ScatterTileLayout {
  return getScatterLayout(index);
}
