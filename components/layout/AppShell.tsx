"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import StaggeredMenu from "@/components/navigation/StaggeredMenu";

interface AppShellProps {
  children: ReactNode;
}

const INTRO_SESSION_KEY = "glem-intro-seen";

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [showIntro, setShowIntro] = useState(false);

  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    { label: "Projects", ariaLabel: "View our projects", link: "/projects" },
    { label: "Events", ariaLabel: "View events", link: "/events" },
    { label: "Contacts", ariaLabel: "Get in touch", link: "/contacts" }
  ];

  const socialItems = [
    { label: "Instagram", link: "https://www.instagram.com/" },
    { label: "GitHub", link: "https://github.com/atiprj" },
    { label: "LinkedIn", link: "https://linkedin.com" }
  ];

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    if (window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1") return;
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    setShowIntro(true);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f6f6f2] text-neutral-900">
      <header className="fixed left-0 top-0 z-20 flex w-full items-center justify-between bg-white/90 px-6 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="text-lg font-bold tracking-[0.22em] text-black">
          GLEM
        </Link>
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials
          displayItemNumbering
          menuButtonColor="#111111"
          openMenuButtonColor="#ffffff"
          changeMenuColorOnOpen
          colors={["#000000", "#C0C0C0"]}
          accentColor="#ffffff"
        />
      </header>

      <main className="pb-[560px] pt-16">{children}</main>

      <GlobalFooter />
      {showIntro ? <IntroOverlay onComplete={handleIntroComplete} /> : null}
    </div>
  );
}
