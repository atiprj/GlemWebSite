"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import Link from "next/link";

import { AppSidebar } from "@/components/navigation/AppSidebar";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { IntroOverlay } from "@/components/intro/IntroOverlay";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.location.pathname !== "/") return false;
    const key = "glem-intro-seen";
    const alreadySeen = window.sessionStorage.getItem(key) === "1";
    if (alreadySeen) return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  });
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f6f2] text-neutral-900">
      <header className="fixed left-0 top-0 z-20 flex w-full items-center justify-between bg-white/90 px-6 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="text-lg font-bold tracking-[0.22em] text-black">
          GLEM
        </Link>
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setIsOpen(true)}
          className="rounded-md p-2 transition hover:bg-black/10"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" className="text-black" aria-hidden="true">
            <path d="M5 4L19 12L5 20V4Z" fill="currentColor" />
          </svg>
        </button>
      </header>

      <AppSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <main className="pb-[560px] pt-16">{children}</main>

      <GlobalFooter />
      {showIntro ? <IntroOverlay onComplete={handleIntroComplete} /> : null}
    </div>
  );
}
