"use client";

import { motion, type Transition, type Variants } from "framer-motion";
import { Triangle } from "lucide-react";

interface IntroSequenceProps {
  onTriangleComplete?: () => void;
}

interface TriangleAnimationMap extends Variants {
  initial: { rotate: number; opacity: number; scale: number };
  spinning: {
    rotate: number;
    opacity: number;
    scale: number;
    transition: Transition;
  };
}

const triangleVariants: TriangleAnimationMap = {
  initial: {
    rotate: 0,
    opacity: 0.95,
    scale: 0.95
  },
  spinning: {
    rotate: 360,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export function IntroSequence({ onTriangleComplete }: IntroSequenceProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <motion.div
        variants={triangleVariants}
        initial="initial"
        animate="spinning"
        onAnimationComplete={onTriangleComplete}
        className="will-change-transform"
      >
        <Triangle
          strokeWidth={1.5}
          className="h-32 w-32 text-white md:h-40 md:w-40"
          aria-label="Intro triangle"
        />
      </motion.div>
    </section>
  );
}
