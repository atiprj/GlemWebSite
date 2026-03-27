"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface HomeHeroProps {
  heroSrc: string | null;
}

export function HomeHero({ heroSrc }: HomeHeroProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative h-screen w-screen overflow-hidden">
      {heroSrc ? (
        <Image
          src={heroSrc}
          alt="GLEM hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-700" />
      )}
      <div className="absolute inset-0 bg-black/35" />

      <a
        href="#home-sections"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
      >
        {!isHovered ? (
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"
          >
            <span className="sr-only">Scroll down indicator</span>
          </motion.div>
        ) : (
          <span className="rounded-sm bg-[#F5F5DC] px-4 py-2 text-xs uppercase tracking-[0.2em] text-black">
            scroll down
          </span>
        )}
      </a>
    </section>
  );
}
