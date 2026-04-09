"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type IntroPhase = "hold" | "move" | "fade";

interface IntroOverlayProps {
  onComplete: () => void;
}

const INTRO_TIMING = {
  holdMs: 2000,
  moveMs: 900,
  fadeMs: 900
} as const;

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [phase, setPhase] = useState<IntroPhase>("hold");
  const [target, setTarget] = useState({ x: 0, y: 0, scale: 0.58 });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const updateTarget = () => {
      const horizontalPadding = window.innerWidth >= 768 ? 40 : 24;
      const verticalPadding = 16;
      const logoCenterX = horizontalPadding + 40;
      const logoCenterY = verticalPadding + 14;
      setTarget({
        x: -window.innerWidth / 2 + logoCenterX,
        y: -window.innerHeight / 2 + logoCenterY,
        scale: window.innerWidth >= 768 ? 0.56 : 0.6
      });
    };

    updateTarget();
    window.addEventListener("resize", updateTarget);
    return () => window.removeEventListener("resize", updateTarget);
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("move"), INTRO_TIMING.holdMs);
    const t2 = window.setTimeout(() => setPhase("fade"), INTRO_TIMING.holdMs + INTRO_TIMING.moveMs);
    const t4 = window.setTimeout(
      () => onCompleteRef.current(),
      INTRO_TIMING.holdMs + INTRO_TIMING.moveMs + INTRO_TIMING.fadeMs
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t4);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-white"
        initial={false}
        animate={
          phase === "fade"
            ? { opacity: [1, 0.78, 0], scale: [1, 1.006, 1.015] }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: INTRO_TIMING.fadeMs / 1000, ease: [0.33, 1, 0.68, 1] }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#f2f2ef]"
        initial={false}
        animate={phase === "fade" ? { opacity: [0.95, 0.55, 0] } : { opacity: 0.95 }}
        transition={{ duration: INTRO_TIMING.fadeMs / 1000, ease: [0.25, 1, 0.5, 1] }}
      />
      <motion.div
        className="relative z-10 select-none text-4xl font-bold tracking-[0.22em] text-black will-change-transform md:text-5xl"
        animate={{
          x: phase === "hold" ? 0 : target.x,
          y: phase === "hold" ? 0 : target.y,
          scale: phase === "hold" ? 1 : target.scale,
          opacity: phase === "fade" ? [1, 0.97, 0.88] : 1
        }}
        transition={{
          duration:
            phase === "fade" ? INTRO_TIMING.fadeMs / 1000 : phase === "hold" ? 0 : INTRO_TIMING.moveMs / 1000,
          ease: phase === "fade" ? [0.25, 1, 0.5, 1] : [0.22, 1, 0.36, 1]
        }}
      >
        GLEM
      </motion.div>
    </div>
  );
}
