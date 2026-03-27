"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type IntroPhase = "drop" | "slide" | "reveal";

interface IntroOverlayProps {
  onComplete: () => void;
}

const INTRO_TIMING = {
  dropMs: 1500,
  slideMs: 750,
  revealMs: 650
} as const;

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [phase, setPhase] = useState<IntroPhase>("drop");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("slide"), INTRO_TIMING.dropMs);
    const t3 = window.setTimeout(
      () => setPhase("reveal"),
      INTRO_TIMING.dropMs + INTRO_TIMING.slideMs
    );
    const t4 = window.setTimeout(
      () => onCompleteRef.current(),
      INTRO_TIMING.dropMs + INTRO_TIMING.slideMs + INTRO_TIMING.revealMs
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={false}
      animate={
        phase === "reveal"
          ? { x: "100%", opacity: 0 }
          : { x: "0%", opacity: 1 }
      }
      transition={
        phase === "reveal"
          ? {
              duration: INTRO_TIMING.revealMs / 1000,
              ease: [0.55, 0.06, 0.68, 0.19]
            }
          : undefined
      }
    >
      <motion.div
        className="h-28 w-28 will-change-transform md:h-36 md:w-36"
        animate={{
          y:
            phase === "drop"
              ? ["-58vh", "0vh", "-14vh", "0vh", "-6vh", "0vh", "-2.5vh", "0vh"]
              : 0,
          x: phase === "slide" || phase === "reveal" ? "42vw" : "0vw",
          scaleX:
            phase === "drop"
              ? [1, 1, 1.14, 1, 1.07, 1, 1.03, 1]
              : phase === "slide"
              ? 1.01
              : 1,
          scaleY:
            phase === "drop"
              ? [1, 1, 0.86, 1, 0.93, 1, 0.97, 1]
              : phase === "slide"
              ? 0.99
              : 1
        }}
        transition={{
          y:
            phase === "drop"
              ? {
                  duration: INTRO_TIMING.dropMs / 1000,
                  times: [0, 0.5, 0.64, 0.76, 0.86, 0.93, 0.97, 1],
                  ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeOut"]
                }
              : { duration: 0.2 },
          x:
            phase === "slide"
              ? { duration: INTRO_TIMING.slideMs / 1000, ease: [0.33, 1, 0.68, 1] }
              : { duration: 0.3, ease: "linear" },
          scaleX:
            phase === "drop"
              ? { duration: INTRO_TIMING.dropMs / 1000, times: [0, 0.5, 0.64, 0.76, 0.86, 0.93, 0.97, 1] }
              : { duration: 0.25, ease: "easeOut" },
          scaleY:
            phase === "drop"
              ? { duration: INTRO_TIMING.dropMs / 1000, times: [0, 0.5, 0.64, 0.76, 0.86, 0.93, 0.97, 1] }
              : { duration: 0.25, ease: "easeOut" }
        }}
      >
        <div className="h-full w-full rounded-full bg-white" />
      </motion.div>
    </motion.div>
  );
}
