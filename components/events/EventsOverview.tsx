"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import NextImage from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import type { MediaAsset } from "@/lib/site-assets";

// ─── helpers ────────────────────────────────────────────────────────────────

function getEventTitle(src: string): string | null {
  const marker = "/assets/04.Events/";
  const idx = src.indexOf(marker);
  if (idx === -1) return null;
  const segments = src.slice(idx + marker.length).split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const raw = decodeURIComponent(segments[0] ?? "");
  const normalized = raw.replace(/[_]+/g, " ").trim();
  return normalized || null;
}

function getEventYear(title: string): number {
  const match = title.match(/^(\d{2})\./);
  if (!match) return 0;
  return 2000 + parseInt(match[1], 10);
}

// ─── elastic column count ────────────────────────────────────────────────────

function useColumnCount(): number {
  const [count, setCount] = useState(5);
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

// ─── single elastic column ───────────────────────────────────────────────────

interface ColItem {
  asset: MediaAsset;
  title: string;
  priority: boolean;
}

function isPreferredEventImage(src: string): boolean {
  const filename = src.split("/").pop() ?? "";
  return /^01\.(jpe?g|png|webp|gif)$/i.test(filename.trim());
}

interface ElasticColProps {
  items: ColItem[];
  lagFactor: number;
  springVelocity: ReturnType<typeof useSpring>;
}

function ElasticCol({ items, lagFactor, springVelocity }: ElasticColProps) {
  const y = useTransform(springVelocity, (v) => v * lagFactor);
  return (
    <motion.div className="flex flex-col gap-[5vw]" style={{ y }}>
      {items.map(({ asset, title, priority }) =>
        asset.type === "image" ? (
          <div key={asset.src}>
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
              <NextImage
                src={asset.src}
                alt={title}
                fill
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                priority={priority}
              />
            </div>
            <p className="mt-2 text-[11px] font-bold leading-tight text-neutral-700">{title}</p>
          </div>
        ) : (
          <div key={asset.src}>
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
              <video src={asset.src} controls preload="metadata" className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 text-[11px] font-bold leading-tight text-neutral-700">{title}</p>
          </div>
        )
      )}
    </motion.div>
  );
}

// ─── elastic grid ────────────────────────────────────────────────────────────

const BASE_LAG = 0.007;
const LAG_SCALE = 0.004;

function getLag(col: number, total: number) {
  const mid = (total - 1) / 2;
  return BASE_LAG + Math.abs(col - mid) * LAG_SCALE;
}

function ElasticEventsGrid({ items }: { items: ColItem[] }) {
  const numCols = useColumnCount();
  const { scrollY } = useScroll();
  const rawVel = useVelocity(scrollY);
  const springVel = useSpring(rawVel, { stiffness: 400, damping: 50 });

  const columns = useMemo<ColItem[][]>(() => {
    const cols: ColItem[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
  }, [items, numCols]);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${numCols}, minmax(80px, 1fr))`,
        columnGap: "5vw",
      }}
    >
      {columns.map((colItems, ci) => (
        <ElasticCol
          key={ci}
          items={colItems}
          lagFactor={getLag(ci, numCols)}
          springVelocity={springVel}
        />
      ))}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export interface EventsOverviewProps {
  media: MediaAsset[];
  locale?: "it" | "en";
}

export function EventsOverview({ media, locale = "en" }: EventsOverviewProps) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isItalian = locale === "it";
  const ui = {
    title: isItalian ? "Eventi" : "Events",
    all: isItalian ? "Tutti" : "All",
    searchPlaceholder: isItalian ? "Cerca eventi" : "Search events",
    noResults: isItalian ? "Nessun evento trovato." : "No events found.",
  };

  const homeHref = locale === "it" || locale === "en" ? `/${locale}#home-sections` : "/#home-sections";

  // Build enriched items with one media per event folder:
  // prefer an image; fallback to the first available media.
  const allItems = useMemo<(ColItem & { year: number; searchText: string })[]>(() => {
    const byEvent = new Map<
      string,
      { title: string; year: number; cleanTitle: string; preferredImage?: MediaAsset; image?: MediaAsset; first?: MediaAsset }
    >();

    for (const asset of media) {
      const title = getEventTitle(asset.src);
      if (!title) continue;
      const year = getEventYear(title);
      const cleanTitle = title.replace(/^\d{2}\./, "").trim();
      const existing = byEvent.get(title) ?? { title, year, cleanTitle };
      if (!existing.first) existing.first = asset;
      if (asset.type === "image" && isPreferredEventImage(asset.src) && !existing.preferredImage) {
        existing.preferredImage = asset;
      }
      if (asset.type === "image" && !existing.image) existing.image = asset;
      byEvent.set(title, existing);
    }

    return Array.from(byEvent.values())
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.title.localeCompare(a.title, undefined, { numeric: true, sensitivity: "base" });
      })
      .map((event, i) => {
        const chosenAsset = event.preferredImage ?? event.image ?? event.first;
        if (!chosenAsset) return null;
        return {
          asset: chosenAsset,
          title: event.cleanTitle,
          priority: i < 10,
          year: event.year,
          searchText: event.cleanTitle.toLowerCase(),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [media]);

  const years = useMemo(
    () =>
      Array.from(new Set(allItems.map((e) => e.year).filter((y) => y > 0))).sort((a, b) => b - a),
    [allItems]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      const yearOk = selectedYear === "all" || item.year === selectedYear;
      const textOk = q.length === 0 || item.searchText.includes(q) || String(item.year).includes(q);
      return yearOk && textOk;
    });
  }, [allItems, selectedYear, searchQuery]);

  return (
    <section className="bg-[#f6f6f2] text-neutral-900">
      <header className="sticky top-16 z-30 bg-[#f6f6f2]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1800px] px-6 pt-5 pb-4 md:px-12 md:pt-6 md:pb-5">

          {/* title row */}
          <div className="flex items-center gap-4">
            <Link
              href={homeHref}
              className="inline-block shrink-0 opacity-50 transition hover:opacity-100"
              aria-label="Back to home"
            >
              <NextImage
                src="/assets/06.Icons/icons8-freccia-sinistra-50.png"
                alt="Back"
                width={20}
                height={20}
              />
            </Link>
            <h1 className="text-[clamp(1.9rem,7vw,3.75rem)] font-semibold tracking-tight">{ui.title}</h1>
          </div>

          {/* filters row */}
          <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs tracking-[0.22em] text-black/70">
              <button
                type="button"
                onClick={() => setSelectedYear("all")}
                className={selectedYear === "all" ? "text-black" : "text-black/60 transition hover:text-black"}
              >
                {ui.all}
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? "text-black" : "text-black/60 transition hover:text-black"}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="w-full shrink-0 md:w-80">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder={ui.searchPlaceholder}
                className="w-full border-b border-black/20 bg-transparent pb-2 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black"
              />
            </div>
          </div>

        </div>
      </header>

      <div className="mx-auto w-full max-w-[1800px] px-[5vw] pt-4 pb-[10rem] md:pt-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-black/65">{ui.noResults}</p>
        ) : (
          <ElasticEventsGrid items={filtered} />
        )}
      </div>
    </section>
  );
}
