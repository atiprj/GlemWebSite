"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import styles from "./ChromaGrid.module.css";

export interface ChromaItem {
  title: string;
  subtitle: string;
  handle?: string;
  handleUrl?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  location?: string;
}

interface ChromaGridProps {
  items: ChromaItem[];
  className?: string;
  radius?: number;
  columns?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

export default function ChromaGrid({
  items,
  className = "",
  radius = 260,
  columns = 3,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out"
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<((value: number) => void) | null>(null);
  const setY = useRef<((value: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    setX.current = gsap.quickSetter(element, "--x", "px");
    setY.current = gsap.quickSetter(element, "--y", "px");

    const { width, height } = element.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      overwrite: true,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      }
    });
  };

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const grid = rootRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    moveTo(event.clientX - rect.left, event.clientY - rect.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  const handleCardMove = (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  };

  const openCardUrl = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.chromaGrid} ${className}`.trim()}
      style={{ ["--r" as string]: `${radius}px`, ["--cols" as string]: columns } as React.CSSProperties}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className={styles.chromaCard}
          onMouseMove={handleCardMove}
          onClick={() => openCardUrl(item.url)}
          style={
            {
              ["--card-border" as string]: item.borderColor ?? "#bdb8af",
              ["--card-gradient" as string]: item.gradient ?? "linear-gradient(160deg, #f5f4ef, #ece8df)",
              cursor: item.url ? "pointer" : "default"
            } as React.CSSProperties
          }
        >
          <footer className={styles.info}>
            <h3 className={styles.name}>{item.title}</h3>
            {item.handle ? (
              item.handleUrl ? (
                <a
                  href={item.handleUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className={styles.handle}
                >
                  {item.handle}
                </a>
              ) : (
                <span className={styles.handle}>{item.handle}</span>
              )
            ) : null}
            <p className={styles.role}>{item.subtitle}</p>
            {item.location ? <span className={styles.location}>{item.location}</span> : null}
          </footer>
        </article>
      ))}

      <div className={styles.overlay} />
      <div ref={fadeRef} className={styles.fade} />
    </div>
  );
}
