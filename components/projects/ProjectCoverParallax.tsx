"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

interface ProjectCoverParallaxProps {
  children: ReactNode;
  className?: string;
  /** Extra image height (% of container) used for the upward pan */
  range?: number;
  containerRef?: RefObject<HTMLElement | null>;
  offset?: ScrollOffset;
  scrollYProgress?: MotionValue<number>;
}

export function ProjectCoverParallax({
  children,
  className = "",
  range = 22,
  containerRef,
  offset = ["start end", "end start"],
  scrollYProgress: externalProgress
}: ProjectCoverParallaxProps) {
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const targetRef = containerRef ?? fallbackRef;

  const { scrollYProgress: internalProgress } = useScroll({
    target: targetRef,
    offset
  });

  const progress = externalProgress ?? internalProgress;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const y = useTransform(progress, [0, 1], reducedMotion ? ["0%", "0%"] : ["0%", `-${range}%`]);

  return (
    <div
      ref={containerRef ? undefined : fallbackRef}
      className={`relative h-full w-full overflow-hidden ${className}`.trim()}
    >
      <motion.div
        className="absolute inset-x-0 top-0 w-full will-change-transform"
        style={{ height: `${100 + range}%`, y }}
      >
        <div className="relative h-full w-full">{children}</div>
      </motion.div>
    </div>
  );
}
