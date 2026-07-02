"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

import { useReducedMotion } from "@/hooks/useReducedMotion";

interface IntroOverlayProps {
  onComplete: () => void;
}

gsap.registerPlugin(useGSAP, GSAPSplitText);

// Time to wait after window.load before allowing phase 2 (ms) — lets browser paint
const POST_LOAD_BUFFER_MS = 1200;
// Hard cap — proceed regardless after this long (ms)
const MAX_WAIT_MS = 12000;

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const word = wordRef.current;
      if (!root || !word) return;

      if (prefersReducedMotion) {
        onCompleteRef.current();
        return;
      }

      const getTarget = () => {
        const wordRect = word.getBoundingClientRect();
        const logoEl = document.querySelector("[data-intro-logo]");
        if (!logoEl) return { x: 0, y: 0, scale: 1 };
        const logoRect = logoEl.getBoundingClientRect();
        const scale = logoRect.width / wordRect.width;
        return {
          x: (logoRect.left + logoRect.width / 2) - (wordRect.left + wordRect.width / 2),
          y: (logoRect.top + logoRect.height / 2) - (wordRect.top + wordRect.height / 2),
          scale
        };
      };

      const split = new GSAPSplitText(word, { type: "chars", charsClass: "split-char" });
      const chars = split.chars;

      gsap.set(word, { opacity: 0, force3D: true });
      gsap.set(chars, { opacity: 0, y: 36, force3D: true });

      // ── Phase 2: fly to corner ──
      let tl2: gsap.core.Timeline | null = null;

      const startPhase2 = () => {
        if (tl2) return;
        const { x, y, scale } = getTarget();
        tl2 = gsap.timeline({ onComplete: () => onCompleteRef.current() });
        tl2.to(word, { x, y, scale, duration: 1.1, ease: "expo.inOut", force3D: true });
        tl2.to(root, { opacity: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.15");
      };

      // ── Two gates: letters animation done + page loaded ──
      let lettersReady = false;
      let pageReady = false;

      const tryAdvance = () => {
        if (lettersReady && pageReady) startPhase2();
      };

      // Gate 1 – letters animation
      const tl1 = gsap.timeline({
        onComplete: () => {
          lettersReady = true;
          tryAdvance();
        }
      });

      tl1.to({}, { duration: 0.5 });          // sfondo senza scritta
      tl1.set(word, { opacity: 1 });
      tl1.to(chars, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.28,
        ease: "power2.out",
        force3D: true
      });
      tl1.to({}, { duration: 0.4 });           // micro-pausa dopo ultima lettera

      // Gate 2 – window.load + buffer to allow browser to paint content
      const markReady = () => {
        window.setTimeout(() => {
          pageReady = true;
          tryAdvance();
        }, POST_LOAD_BUFFER_MS);
      };

      if (document.readyState === "complete") {
        markReady();
      } else {
        window.addEventListener("load", markReady, { once: true });
      }

      // Safety cap
      const safetyTimer = window.setTimeout(() => {
        pageReady = true;
        lettersReady = true;
        tryAdvance();
      }, MAX_WAIT_MS);

      return () => {
        tl1.kill();
        tl2?.kill();
        split.revert();
        window.removeEventListener("load", markReady);
        window.clearTimeout(safetyTimer);
      };
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.55)",
        willChange: "opacity",
        transform: "translateZ(0)"
      }}
    >
      <div
        ref={wordRef}
        className="relative z-10 select-none text-4xl font-bold tracking-[0.22em] text-black md:text-5xl"
        style={{ opacity: 0, willChange: "transform, opacity", transform: "translateZ(0)" }}
      >
        GLEM
      </div>
    </div>
  );
}
