"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function FadeInSection({ id, title, children }: FadeInSectionProps) {
  return (
    <motion.section
      id={id}
      className="mx-auto w-full max-w-6xl px-6 py-20 md:px-10 md:py-24"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <p className="mb-4 text-xs tracking-[0.3em] text-neutral-500">{title.toUpperCase()}</p>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">{children}</div>
    </motion.section>
  );
}
