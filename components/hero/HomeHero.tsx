"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HomeHeroProps {
  heroSrc: string | null;
  collageImages?: string[];
}

const FALLBACK_COLUMN_COUNT = 4;
const GRID_GAP_PX = 8;
const GRID_HORIZONTAL_PADDING_PX = 16;
const MIN_BASE_IMAGES_PER_COLUMN = 4;
const MAX_BASE_IMAGES_PER_COLUMN = 5;
const IMAGE_HEIGHT_RATIO = 4 / 3;

function getResponsiveColumnCount(width: number) {
  if (width < 640) return 2;
  if (width < 960) return 3;
  if (width < 1280) return 4;
  if (width < 1680) return 5;
  return 6;
}

function getBaseImageCount(width: number, height: number, columnCount: number) {
  if (!width || !height) {
    return MIN_BASE_IMAGES_PER_COLUMN;
  }

  const totalGapWidth = (columnCount - 1) * GRID_GAP_PX;
  const availableWidth = Math.max(width - GRID_HORIZONTAL_PADDING_PX - totalGapWidth, 1);
  const columnWidth = availableWidth / columnCount;
  const imageHeight = columnWidth * IMAGE_HEIGHT_RATIO;
  const imagesNeededToFillViewport = Math.ceil((height + GRID_GAP_PX) / (imageHeight + GRID_GAP_PX));

  return Math.min(
    MAX_BASE_IMAGES_PER_COLUMN,
    Math.max(MIN_BASE_IMAGES_PER_COLUMN, imagesNeededToFillViewport)
  );
}

function repeatColumnImages(column: string[], imageCount: number) {
  if (column.length === 0) {
    return [];
  }

  return Array.from({ length: imageCount }, (_, index) => column[index % column.length]);
}

export function HomeHero({ heroSrc, collageImages = [] }: HomeHeroProps) {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const maxImagesPerColumn = 4;
  const columnCount = viewportSize.width ? getResponsiveColumnCount(viewportSize.width) : FALLBACK_COLUMN_COUNT;
  const baseImageCount = getBaseImageCount(viewportSize.width, viewportSize.height, columnCount);

  useEffect(() => {
    const syncColumnsWithViewport = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    syncColumnsWithViewport();
    window.addEventListener("resize", syncColumnsWithViewport);
    return () => window.removeEventListener("resize", syncColumnsWithViewport);
  }, []);

  const collageColumns = Array.from({ length: columnCount }, (_, columnIndex) =>
    collageImages.filter((_, imageIndex) => imageIndex % columnCount === columnIndex).slice(0, maxImagesPerColumn)
  );
  const hasCollage = collageImages.length > 0;

  return (
    <section className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden bg-neutral-800 md:h-screen md:min-h-screen">
      {hasCollage ? (
        <div
          className="absolute inset-0 grid gap-2 overflow-hidden p-2"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {collageColumns.map((column, columnIndex) => {
            const baseColumn = repeatColumnImages(column, baseImageCount);
            const loopColumn = [...baseColumn, ...baseColumn];
            const duration = 70 + columnIndex * 8;

            return (
              <div key={`column-${columnIndex}`} className="relative h-full overflow-hidden">
                <div
                  className="collage-track flex flex-col gap-2"
                  style={{
                    animationDuration: `${duration}s`
                  }}
                >
                  {loopColumn.map((src, index) => {
                    const isInitiallyVisibleCopy = index >= baseColumn.length && index < baseColumn.length + 2;
                    const isPriorityImage = columnIndex < 2 && isInitiallyVisibleCopy;

                    return (
                      <div key={`${src}-${columnIndex}-${index}`} className="relative aspect-[3/4] overflow-hidden rounded-sm">
                        <Image
                          src={src}
                          alt={`Project collage image ${(index % baseColumn.length) + 1}`}
                          fill
                          priority={isPriorityImage}
                          loading={isPriorityImage ? undefined : "lazy"}
                          quality={50}
                          className="object-cover grayscale"
                          sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, (max-width: 1280px) 25vw, (max-width: 1680px) 20vw, 16vw"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : heroSrc ? (
        <>
          <Image
            src={heroSrc}
            alt="GLEM hero background"
            fill
            priority
            className="object-cover grayscale"
            sizes="100vw"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-neutral-700" />
      )}
      <div className="absolute inset-0 bg-black/35" />

      <style jsx>{`
        @keyframes collageDown {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0%);
          }
        }

        .collage-track {
          animation-name: collageDown;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
