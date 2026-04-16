"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HomeHeroProps {
  heroSrc: string | null;
  collageImages?: string[];
}

function getResponsiveColumnCount(width: number) {
  if (width < 640) return 2;
  if (width < 960) return 3;
  if (width < 1280) return 4;
  if (width < 1680) return 5;
  return 6;
}

export function HomeHero({ heroSrc, collageImages = [] }: HomeHeroProps) {
  const [columnCount, setColumnCount] = useState(4);
  const maxImagesPerColumn = 6;

  useEffect(() => {
    const syncColumnsWithViewport = () => {
      setColumnCount(getResponsiveColumnCount(window.innerWidth));
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
    <section className="relative h-screen w-full overflow-hidden bg-neutral-800">
      {hasCollage ? (
        <div
          className="absolute inset-0 grid gap-2 overflow-hidden p-2"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {collageColumns.map((column, columnIndex) => {
            const doubledColumn = [...column, ...column];
            const duration = 70 + columnIndex * 8;

            return (
              <div key={`column-${columnIndex}`} className="relative h-full overflow-hidden">
                <div
                  className="collage-track flex flex-col gap-2"
                  style={{
                    animationDuration: `${duration}s`
                  }}
                >
                  {doubledColumn.map((src, index) => (
                    <div key={`${src}-${columnIndex}-${index}`} className="relative aspect-[3/4] overflow-hidden rounded-sm">
                      <Image
                        src={src}
                        alt={`Project collage image ${index + 1}`}
                        fill
                        priority={columnIndex === 0 && index < 2}
                        quality={55}
                        className="object-cover grayscale"
                        sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, (max-width: 1280px) 25vw, (max-width: 1680px) 20vw, 16vw"
                      />
                    </div>
                  ))}
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
