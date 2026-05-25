"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Project } from "@/lib/site-assets";

// Lag configuration — mirrors Codrops demo1 values.
// baseLag = displacement (px) applied to center column per px/s of scroll velocity.
// lagScale = extra displacement per column away from center.
const BASE_LAG = 0.007;
const LAG_SCALE = 0.004;

function getLagFactor(colIndex: number, numColumns: number): number {
  const mid = (numColumns - 1) / 2;
  return BASE_LAG + Math.abs(colIndex - mid) * LAG_SCALE;
}

// ─── responsive column count ────────────────────────────────────────────────

function useColumnCount(): number {
  const [count, setCount] = useState(5); // SSR-safe: 5 is the primary desktop target

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCount(w < 640 ? 2 : w < 1024 ? 3 : 5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

// ─── single column ───────────────────────────────────────────────────────────

interface ColItem {
  project: Project;
  imageSrc: string;
  href: string;
  priority: boolean;
}

interface ElasticColumnProps {
  items: ColItem[];
  lagFactor: number;
  springVelocity: ReturnType<typeof useSpring>;
}

function ElasticColumn({ items, lagFactor, springVelocity }: ElasticColumnProps) {
  const y = useTransform(springVelocity, (v) => v * lagFactor);

  return (
    <motion.div className="flex flex-col gap-[5vw]" style={{ y }}>
      {items.map(({ project, imageSrc, href, priority }) => (
        <Link key={project.slug} href={href} className="group block">
          {/* aspect-ratio: 128/160 = 4/5, matching Codrops grid__item-img */}
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
            <Image
              src={imageSrc}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              priority={priority}
            />
          </div>
          <p className="mt-2 text-[11px] font-bold leading-tight text-neutral-700">{project.title}</p>
        </Link>
      ))}
    </motion.div>
  );
}

// ─── elastic grid ────────────────────────────────────────────────────────────

export interface ElasticGridItem {
  project: Project;
  imageSrc: string;
  href: string;
}

interface ElasticGridProps {
  items: ElasticGridItem[];
}

export function ElasticGrid({ items }: ElasticGridProps) {
  const numColumns = useColumnCount();

  // Shared spring velocity — computed once, passed down to each column
  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const springVelocity = useSpring(rawVelocity, { stiffness: 400, damping: 50 });

  // Distribute items round-robin across columns (same as Codrops)
  const columns = useMemo<ColItem[][]>(() => {
    const cols: ColItem[][] = Array.from({ length: numColumns }, () => []);
    items.forEach((item, i) => {
      cols[i % numColumns].push({ ...item, priority: i < numColumns * 2 });
    });
    return cols;
  }, [items, numColumns]);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${numColumns}, minmax(80px, 1fr))`,
        columnGap: "5vw",
      }}
    >
      {columns.map((colItems, colIndex) => (
        <ElasticColumn
          key={colIndex}
          items={colItems}
          lagFactor={getLagFactor(colIndex, numColumns)}
          springVelocity={springVelocity}
        />
      ))}
    </div>
  );
}
