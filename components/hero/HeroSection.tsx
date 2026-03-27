"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface HeroSectionProps {
  onOpenMenu: () => void;
}

export function HeroSection({ onOpenMenu }: HeroSectionProps) {
  const [isHoveringScroll, setIsHoveringScroll] = useState(false);

  return (
    <section className="relative h-screen w-screen overflow-hidden" id="top">
      <Image
        src="/assets/03.Project/22.Lubica22-Y/COP/Gabriele Giussani (4).jpg"
        alt="GLEM architectural hero"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/35" />

      <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between bg-white/90 px-6 py-4 backdrop-blur-md md:px-10">
        <h1 className="text-lg font-bold tracking-[0.22em] text-black md:text-xl">GLEM</h1>
        <button
          aria-label="Open navigation menu"
          onClick={onOpenMenu}
          className="rounded-md p-2 transition hover:bg-black/10"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" className="text-black" aria-hidden="true">
            <path d="M5 4L19 12L5 20V4Z" fill="currentColor" />
          </svg>
        </button>
      </header>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        onMouseEnter={() => setIsHoveringScroll(true)}
        onMouseLeave={() => setIsHoveringScroll(false)}
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className={isHoveringScroll ? "hidden" : "block text-white"}
        >
          <ArrowDown className="h-8 w-8" />
        </motion.div>
        <div
          className={
            isHoveringScroll
              ? "rounded-sm bg-[#F5F5DC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black"
              : "hidden"
          }
        >
          scroll down
        </div>
      </a>
    </section>
  );
}
