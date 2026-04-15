"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

type SplitType = "chars" | "words" | "lines";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: { opacity?: number; y?: number };
  to?: { opacity?: number; y?: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
}

function mapEase(ease: string): [number, number, number, number] | "easeOut" {
  if (ease === "power3.out") return [0.215, 0.61, 0.355, 1];
  if (ease === "power2.out") return [0.25, 0.46, 0.45, 0.94];
  return "easeOut";
}

export default function SplitText({
  text,
  className,
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
  showCallback = false
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin
  });

  const chunks = useMemo(() => {
    if (!text) return [];
    if (splitType === "lines") {
      return text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
    if (splitType === "words") {
      return text.split(/\s+/).filter(Boolean);
    }
    return Array.from(text);
  }, [splitType, text]);

  useEffect(() => {
    if (!isInView || !showCallback || !onLetterAnimationComplete || chunks.length === 0) return;
    const totalMs = (chunks.length - 1) * delay + duration * 1000;
    const timer = window.setTimeout(() => {
      onLetterAnimationComplete();
    }, totalMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [chunks.length, delay, duration, isInView, onLetterAnimationComplete, showCallback]);

  const transitionEase = mapEase(ease);

  return (
    <div ref={ref} className={className} style={{ textAlign }}>
      {splitType === "lines" ? (
        <div className="space-y-1">
          {chunks.map((line, index) => (
            <div key={`${line}-${index}`} className="overflow-hidden">
              <motion.span
                className="block whitespace-nowrap"
                initial={from}
                animate={isInView ? to : from}
                transition={{ duration, ease: transitionEase, delay: (delay * index) / 1000 }}
              >
                {line}
              </motion.span>
            </div>
          ))}
        </div>
      ) : (
        <p>
          {chunks.map((chunk, index) => (
            <motion.span
              key={`${chunk}-${index}`}
              className={splitType === "words" ? "inline-block mr-1.5" : "inline-block"}
              initial={from}
              animate={isInView ? to : from}
              transition={{ duration, ease: transitionEase, delay: (delay * index) / 1000 }}
            >
              {chunk === " " ? "\u00A0" : chunk}
            </motion.span>
          ))}
        </p>
      )}
    </div>
  );
}
