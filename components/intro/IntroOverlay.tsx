"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

interface IntroOverlayProps {
  onComplete: () => void;
}

gsap.registerPlugin(useGSAP, GSAPSplitText);

// Minimum time the intro is visible after letters appear (ms)
const MIN_HOLD_MS = 2500;
// Max time to wait for page load before proceeding anyway (ms)
const MAX_WAIT_MS = 12000;

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const word = wordRef.current;
      if (!root || !word) return;

      const getTarget = () => {
        const wordRect = word.getBoundingClientRect();
        const logoEl = document.querySelector("[data-intro-logo]");
        if (!logoEl) return { x: 0, y: 0, scale: 1 };
        const logoRect = logoEl.getBoundingClientRect();
        const scale = logoRect.width / wordRect.width;
        const wordCenterX = wordRect.left + wordRect.width / 2;
        const wordCenterY = wordRect.top + wordRect.height / 2;
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;
        return { x: logoCenterX - wordCenterX, y: logoCenterY - wordCenterY, scale };
      };

      const split = new GSAPSplitText(word, { type: "chars", charsClass: "split-char" });
      const chars = split.chars;

      gsap.set(word, { opacity: 0, force3D: true });
      gsap.set(chars, { opacity: 0, y: 36, force3D: true });

      // ── Phase 2: fly to corner (built lazily when both conditions are met) ──
      let tl2: gsap.core.Timeline | null = null;

      const startPhase2 = () => {
        if (tl2) return; // guard: run once
        const { x, y, scale } = getTarget();
        tl2 = gsap.timeline({ onComplete: () => onCompleteRef.current() });
        tl2.to(word, { x, y, scale, duration: 1.1, ease: "expo.inOut", force3D: true });
        // Long fade-out so the home page is fully ready before it's revealed
        tl2.to(root, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.2");
      };

      // ── Conditions: phase-1 animation done AND page loaded AND min hold elapsed ──
      let phase1Done = false;
      let pageLoaded = false;
      let minHoldDone = false;

      const tryAdvance = () => {
        if (phase1Done && pageLoaded && minHoldDone) startPhase2();
      };

      // Minimum visible time after letters appear
      const minHoldTimer = window.setTimeout(() => {
        minHoldDone = true;
        tryAdvance();
      }, MIN_HOLD_MS);

      // ── Phase 1: background + GLEM letters ──
      const tl1 = gsap.timeline({
        onComplete: () => {
          phase1Done = true;
          tryAdvance();
        }
      });

      // 1s sfondo bianco senza scritta
      tl1.to({}, { duration: 1.0 });

      // GLEM lettera per lettera — lento e morbido
      tl1.set(word, { opacity: 1 });
      tl1.to(chars, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.28,
        ease: "power2.out",
        force3D: true
      });

      // ── Wait for page load ──
      const onPageLoad = () => {
        pageLoaded = true;
        tryAdvance();
      };

      if (document.readyState === "complete") {
        pageLoaded = true;
      } else {
        window.addEventListener("load", onPageLoad, { once: true });
      }

      // Safety: proceed after MAX_WAIT_MS regardless of load state
      const safetyTimer = window.setTimeout(() => {
        pageLoaded = true;
        minHoldDone = true;
        tryAdvance();
      }, MAX_WAIT_MS);

      return () => {
        tl1.kill();
        tl2?.kill();
        split.revert();
        window.removeEventListener("load", onPageLoad);
        window.clearTimeout(minHoldTimer);
        window.clearTimeout(safetyTimer);
      };
    },
    { scope: rootRef }
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
