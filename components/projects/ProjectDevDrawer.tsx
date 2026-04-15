"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import type { Project } from "@/lib/site-assets";

interface ProjectDevDrawerProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectDevDrawer({ project, open, onClose }: ProjectDevDrawerProps) {
  const imageAssets = useMemo(
    () =>
      project
        ? project.devAssets
            .filter((asset) => asset.type === "image")
            .sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }))
        : [],
    [project]
  );

  return (
    <AnimatePresence>
      {open && project ? (
        <>
          <motion.button
            type="button"
            aria-label="Close project drawer"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} development content`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed bottom-6 right-6 top-6 z-50 h-[calc(100vh-3rem)] w-[calc(100%-3rem)] overflow-hidden rounded-3xl border border-black/15 bg-[#e3e1d8]/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl md:w-2/5 md:p-8"
          >
            <div className="h-full overflow-y-auto pr-2 [scrollbar-color:#6f6b62_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#6f6b62]/80 [&::-webkit-scrollbar-track]:bg-transparent">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.2em] text-black/60">DEV CONTENT</p>
                  <h3 className="mt-2 text-2xl font-semibold text-black">{project.title}</h3>
                  {project.devText.intro ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-black/80">{project.devText.intro}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={onClose}
                  className="rounded-full border border-black/20 p-2 text-black/70 transition hover:bg-black/5 hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                {imageAssets.length === 0 ? <p className="text-sm text-black/70">No DEV files found for this project.</p> : null}

                {imageAssets.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-flow-dense lg:auto-rows-[120px]">
                    {imageAssets.map((asset, index) => (
                      <div
                        key={asset.src}
                        className={`group relative overflow-hidden rounded-2xl border border-black/15 bg-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.09)] ${
                          index % 5 === 0 ? "aspect-[16/9] lg:col-span-3" : "aspect-[4/5] lg:col-span-1"
                        }`}
                      >
                        <Image
                          src={asset.src}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
                        />
                      </div>
                    ))}

                    {project.devText.description ? (
                      <section className="rounded-2xl border border-black/10 bg-white/35 p-4 lg:col-span-2">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80">{project.devText.description}</p>
                      </section>
                    ) : null}

                    {project.devText.conclusions ? (
                      <section className="rounded-2xl border border-black/10 bg-white/35 p-4 lg:col-span-2">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80">{project.devText.conclusions}</p>
                      </section>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
