"use client";

import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { InfinitePhotoStripProps, Photo } from "@/types/carousel";

const CONTROL_PAUSE_MS = 1200;

function normalizeShift(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  const normalized = value % max;
  return normalized < 0 ? normalized + max : normalized;
}

function getStepWidth(photos: Photo[], loopWidth: number): number {
  if (!photos.length || loopWidth <= 0) {
    return 0;
  }

  return loopWidth / photos.length;
}

export default function InfinitePhotoStrip({
  photos,
  autoScrollSeconds = 55,
  className,
  controlsPlacement = "overlay",
  priorityCount = 2,
}: InfinitePhotoStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartShiftRef = useRef(0);

  const [loadedPhotos, setLoadedPhotos] = useState<Set<string>>(new Set());
  const [photoRatios, setPhotoRatios] = useState<Record<string, number>>({});
  const [loopWidth, setLoopWidth] = useState(0);
  const [manualShift, setManualShift] = useState(0);
  const [pausedByControl, setPausedByControl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const duplicatedPhotos = useMemo(() => [...photos, ...photos], [photos]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const updateWidth = () => {
      setLoopWidth(track.scrollWidth / 2);
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(track);
    updateWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, [duplicatedPhotos.length]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  const setPhotoLoaded = (photoId: string) => {
    setLoadedPhotos((prev) => {
      if (prev.has(photoId)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(photoId);
      return next;
    });
  };

  const setPhotoRatio = (photoId: string, width: number, height: number) => {
    if (!width || !height) {
      return;
    }

    const ratio = width / height;
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return;
    }

    setPhotoRatios((prev) => {
      if (prev[photoId] === ratio) {
        return prev;
      }

      return { ...prev, [photoId]: ratio };
    });
  };

  const shiftByDirection = (direction: 1 | -1) => {
    const step = getStepWidth(photos, loopWidth);
    if (!step) {
      return;
    }

    setManualShift((prev) => normalizeShift(prev + direction * step, loopWidth));
    setPausedByControl(true);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => {
      setPausedByControl(false);
    }, CONTROL_PAUSE_MS);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      return;
    }

    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartShiftRef.current = manualShift;
    setIsDragging(true);
    setPausedByControl(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    const nextShift = dragStartShiftRef.current - deltaX;
    setManualShift(normalizeShift(nextShift, loopWidth));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    dragPointerIdRef.current = null;
    setIsDragging(false);
    setPausedByControl(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!photos.length) {
    return null;
  }

  const isOverlayControls = controlsPlacement === "overlay";
  const wrapperClassName = className ? `infinite-photo-strip ${className}` : "infinite-photo-strip";

  return (
    <section
      className={wrapperClassName}
      style={
        {
          ["--carousel-speed" as string]: `${autoScrollSeconds}s`,
          ["--manual-shift" as string]: `${manualShift}px`,
        } as CSSProperties
      }
    >
      <div className={`relative ${isOverlayControls ? "" : "px-12"}`}>
        <div
          className="infinite-photo-strip__viewport border border-black/5 bg-white shadow-[0_10px_35px_-18px_rgba(0,0,0,0.45)]"
          data-paused={pausedByControl}
          data-dragging={isDragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="infinite-photo-strip__edge-mask infinite-photo-strip__edge-mask--left" />
          <div className="infinite-photo-strip__edge-mask infinite-photo-strip__edge-mask--right" />
          <div className="infinite-photo-strip__manual-layer">
            <div className="infinite-photo-strip__track py-2" ref={trackRef}>
              {duplicatedPhotos.map((photo, index) => {
                const cardKey = `${photo.id}-${index}`;
                const loaded = loadedPhotos.has(cardKey);
                const isPriorityImage = index < priorityCount;
                const fallbackRatio =
                  photo.width && photo.height && photo.height > 0 ? photo.width / photo.height : 4 / 3;
                const ratio = photoRatios[photo.id] ?? fallbackRatio;

                return (
                  <article
                    key={cardKey}
                    className="infinite-photo-strip__item group"
                    style={{ width: `calc(var(--row-height) * ${ratio})` }}
                  >
                    {!loaded ? (
                      <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200" />
                    ) : null}
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      width={photo.width ?? 1600}
                      height={photo.height ?? 1200}
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 30vw"
                      priority={isPriorityImage}
                      loading={isPriorityImage ? "eager" : "lazy"}
                      className={`h-[var(--row-height)] w-auto rounded-xl object-contain shadow-[0_8px_30px_-18px_rgba(0,0,0,0.55)] transition duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-105 ${
                        loaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={(event) => {
                        const target = event.currentTarget;
                        setPhotoLoaded(cardKey);
                        setPhotoRatio(photo.id, target.naturalWidth, target.naturalHeight);
                      }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-8">
                      <p className="line-clamp-1 text-sm font-medium text-white">{photo.title}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Scorri a sinistra"
          onClick={() => shiftByDirection(-1)}
          className={`absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/35 bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/75 ${
            isOverlayControls ? "left-3" : "left-0"
          }`}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Scorri a destra"
          onClick={() => shiftByDirection(1)}
          className={`absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/35 bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/75 ${
            isOverlayControls ? "right-3" : "right-0"
          }`}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
