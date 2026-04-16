"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

interface MenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

interface SocialItem {
  label: string;
  link: string;
}

interface StaggeredMenuProps {
  position?: "left" | "right";
  items: MenuItem[];
  socialItems?: SocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  changeMenuColorOnOpen?: boolean;
  colors?: [string, string] | string[];
  logoUrl?: string;
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export default function StaggeredMenu({
  position = "right",
  items,
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = false,
  menuButtonColor = "#111111",
  openMenuButtonColor = "#ffffff",
  changeMenuColorOnOpen = true,
  colors = ["#B497CF", "#5227FF"],
  logoUrl,
  accentColor = "#5227FF",
  onMenuOpen,
  onMenuClose
}: StaggeredMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuPanelRef = useRef<HTMLElement | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      onMenuOpen?.();
      return;
    }
    onMenuClose?.();
  }, [isOpen, onMenuClose, onMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      if (menuPanelRef.current?.contains(targetNode)) return;
      if (menuToggleRef.current?.contains(targetNode)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const [fromColor, toColor] = useMemo<[string, string]>(() => {
    const fallback: [string, string] = ["#B497CF", "#5227FF"];
    if (colors.length < 2) return fallback;
    return [colors[0], colors[1]];
  }, [colors]);

  const sideClasses = position === "left" ? "left-0 border-r" : "right-0 border-l";
  const buttonColor = isOpen && changeMenuColorOnOpen ? openMenuButtonColor : menuButtonColor;

  return (
    <>
      <button
        ref={menuToggleRef}
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-md p-2 transition hover:bg-black/10"
        style={{ color: buttonColor }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          {isOpen ? (
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          ) : (
            <>
              <path d="M6.5 8H17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M6.5 12H17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M6.5 16H17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation backdrop"
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            <motion.aside
              ref={menuPanelRef}
              className={`fixed top-0 z-50 h-screen w-[320px] border-white/15 p-6 text-white backdrop-blur-md ${sideClasses}`}
              initial={{ x: position === "left" ? -340 : 340, opacity: 0.94 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: position === "left" ? -340 : 340, opacity: 0.94 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              style={{ background: "#000000" }}
              onMouseLeave={() => setIsOpen(false)}
            >
              <div className="mb-10 flex items-center justify-between">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Menu logo" width={96} height={28} className="h-auto w-auto" />
                ) : (
                  <p className="text-xs tracking-[0.35em] text-white/85">MENU</p>
                )}
                <button
                  type="button"
                  aria-label="Close menu"
                  className="rounded-md border border-white/35 p-2 transition hover:bg-white/15"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <motion.nav className="flex flex-col gap-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.link}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.25, delay: 0.05 * index }}
                  >
                    <Link
                      href={item.link}
                      aria-label={item.ariaLabel}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-baseline gap-3 rounded-md px-2 py-1.5 transition hover:bg-white/10"
                    >
                      {displayItemNumbering ? (
                        <span className="text-[11px] tracking-[0.2em] text-white/70">{String(index + 1).padStart(2, "0")}</span>
                      ) : null}
                      <span className="text-base tracking-[0.16em] uppercase">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              {displaySocials && socialItems.length > 0 ? (
                <div className="mt-12 border-t border-white/25 pt-6">
                  <p className="mb-4 text-[11px] tracking-[0.28em] text-white/75">SOCIAL</p>
                  <div className="flex flex-wrap gap-2">
                    {socialItems.map((social) => (
                      <a
                        key={social.link}
                        href={social.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/35 px-3 py-1 text-xs tracking-[0.12em] transition hover:bg-white/10"
                        style={{ color: accentColor }}
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
