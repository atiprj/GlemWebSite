"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

interface IntroOverlayProps {
  onComplete: () => void;
}

gsap.registerPlugin(useGSAP, GSAPSplitText);

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

      // Calcola posizione target leggendo il logo reale nell'header
      const getTarget = () => {
        const wordRect = word.getBoundingClientRect();
        const logoEl = document.querySelector("[data-intro-logo]");
        if (!logoEl) return { x: 0, y: 0, scale: 1 };

        const logoRect = logoEl.getBoundingClientRect();

        // scala: rapporto larghezza logo / larghezza scritta intro
        const scale = logoRect.width / wordRect.width;

        // delta tra centro della scritta intro e centro del logo
        const wordCenterX = wordRect.left + wordRect.width / 2;
        const wordCenterY = wordRect.top + wordRect.height / 2;
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;

        return {
          x: logoCenterX - wordCenterX,
          y: logoCenterY - wordCenterY,
          scale
        };
      };

      const split = new GSAPSplitText(word, {
        type: "chars",
        charsClass: "split-char"
      });
      const chars = split.chars;

      gsap.set(word, { opacity: 0, force3D: true });
      gsap.set(chars, { opacity: 0, y: 36, force3D: true });

      const tl = gsap.timeline({
        onComplete: () => onCompleteRef.current()
      });

      // 0.5s sfondo visibile senza scritta
      tl.to({}, { duration: 0.5 });

      // compare GLEM lettera per lettera
      tl.set(word, { opacity: 1 });
      tl.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.16,
        ease: "power3.out",
        force3D: true
      });

      // rimane al centro
      tl.to({}, { duration: 1.5 });

      // vola in alto a sinistra con scala proporzionale
      tl.add(() => {
        const { x, y, scale } = getTarget();
        tl.to(word, {
          x,
          y,
          scale,
          duration: 1.1,
          ease: "expo.inOut",
          force3D: true
        });
        tl.to(root, {
          opacity: 0,
          duration: 0.35,
          ease: "power1.in"
        }, "-=0.2");
      });

      return () => {
        tl.kill();
        split.revert();
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/55 backdrop-blur-[2px]"
    >
      <div
        ref={wordRef}
        className="relative z-10 select-none text-4xl font-bold tracking-[0.22em] text-black md:text-5xl"
        style={{ opacity: 0 }}
      >
        GLEM
      </div>
    </div>
  );
}
