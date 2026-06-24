"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

import type { Photo } from "@/types/carousel";

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const photo = photos[currentIndex];
  const hasMultiple = photos.length > 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!hasMultiple) {
        return;
      }

      if (event.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      }

      if (event.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % photos.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [currentIndex, hasMultiple, onClose, onNavigate, photos.length]);

  if (!photo) {
    return null;
  }

  const goPrev = () => onNavigate((currentIndex - 1 + photos.length) % photos.length);
  const goNext = () => onNavigate((currentIndex + 1) % photos.length);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} — image ${currentIndex + 1} of ${photos.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col items-center"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <p className="mb-4 w-full truncate px-1 text-center text-sm font-medium text-white/90">{photo.title}</p>

        <div
          className="relative flex w-full items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          {hasMultiple ? (
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-0 z-20 -translate-x-1/2 rounded-full border border-white/35 bg-black/45 p-2.5 text-white backdrop-blur transition hover:bg-black/75 sm:left-2 sm:translate-x-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          <div className="relative h-[min(78vh,820px)] w-full overflow-hidden rounded-xl bg-black/20">
            <Image
              key={photo.id}
              src={photo.url}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 92vw, 1152px"
              className="object-contain"
              priority
            />
          </div>

          {hasMultiple ? (
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-0 z-20 translate-x-1/2 rounded-full border border-white/35 bg-black/45 p-2.5 text-white backdrop-blur transition hover:bg-black/75 sm:right-2 sm:translate-x-0"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>

        {hasMultiple ? (
          <p className="mt-4 text-xs tracking-[0.2em] text-white/60">
            {currentIndex + 1} / {photos.length}
          </p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
