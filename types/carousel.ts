export interface Photo {
  id: string;
  url: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
}

export type ControlsPlacement = "overlay" | "outside";

export interface InfinitePhotoStripProps {
  photos: Photo[];
  autoScrollSeconds?: number;
  className?: string;
  controlsPlacement?: ControlsPlacement;
  priorityCount?: number;
}
