"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { HashScrollHandler } from "@/components/layout/HashScrollHandler";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import StaggeredMenu from "@/components/navigation/StaggeredMenu";
import { dictionaries, isLocale, type Locale } from "@/lib/i18n";

interface AppShellProps {
  children: ReactNode;
}

const INTRO_SEEN_KEY = "glem-intro-seen";

function hasSeenIntro() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [introCompleted, setIntroCompleted] = useState(false);
  const shouldHideGlobalFooter = pathname?.includes("/contacts");
  const isHomePath = pathname === "/" || pathname === "/it" || pathname === "/en";
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const firstSegment = pathSegments[0] ?? "";
  const currentLocale: Locale | null = isLocale(firstSegment) ? firstSegment : null;
  const defaultLocale: Locale = currentLocale ?? "it";
  const t = dictionaries[defaultLocale];
  const pathWithoutLocale = currentLocale ? `/${pathSegments.slice(1).join("/")}` : pathname || "/";
  const normalizedPathWithoutLocale = pathWithoutLocale === "" ? "/" : pathWithoutLocale;
  const buildLocalizedPath = (locale: Locale) =>
    normalizedPathWithoutLocale === "/" ? `/${locale}` : `/${locale}${normalizedPathWithoutLocale}`;
  const targetPathForIt = buildLocalizedPath("it");
  const targetPathForEn = buildLocalizedPath("en");
  const switchTargetLocale: Locale = defaultLocale === "it" ? "en" : "it";
  const switchTargetPath = switchTargetLocale === "it" ? targetPathForIt : targetPathForEn;
  const withLocale = (route: string) => {
    if (!currentLocale) return route;
    if (route === "/") return `/${currentLocale}`;
    return `/${currentLocale}${route}`;
  };

  const menuItems = [
    { label: t.home, ariaLabel: "Go to home page", link: withLocale("/") },
    { label: t.about, ariaLabel: "Learn about us", link: withLocale("/about") },
    { label: t.projects, ariaLabel: "View our projects", link: withLocale("/projects") },
    { label: t.events, ariaLabel: "View events", link: withLocale("/events") },
    { label: t.contacts, ariaLabel: "Get in touch", link: withLocale("/contacts") }
  ];

  const socialItems = [
    {
      label: "Instagram",
      link: "https://www.instagram.com/atiproject/",
      iconSrc: "/assets/06.Icons/icons8-instagram-48.png",
      iconSize: 22
    },
    {
      label: "LinkedIn",
      link: "https://www.linkedin.com/company/atiproject/posts/?feedView=all",
      iconSrc: "/assets/06.Icons/icons8-linkedin-60.png",
      iconSize: 24
    },
    {
      label: "GitHub",
      link: "https://github.com/",
      iconSrc: "/assets/06.Icons/icons8-github-50.png",
      iconSize: 22
    }
  ];

  const handleIntroComplete = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      /* ignore private browsing */
    }
    setIntroCompleted(true);
  }, []);

  useEffect(() => {
    if (!pathname || pathname !== "/") return;

    const browserLanguage = (navigator.language || "").toLowerCase();
    const preferredLocale: Locale = browserLanguage.startsWith("en") ? "en" : "it";
    router.replace(`/${preferredLocale}`);
  }, [pathname, router]);

  useEffect(() => {
    const isProjectsOrEvents =
      pathname?.includes("/projects") || pathname?.includes("/events");
    if (!isProjectsOrEvents) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    if (hasSeenIntro()) {
      setIntroCompleted(true);
      return;
    }
    if (!pathname || pathname === "/") {
      setIntroCompleted(true);
      return;
    }
    if (!isHomePath) {
      setIntroCompleted(true);
      return;
    }
    setIntroCompleted(false);
  }, [isHomePath, pathname]);

  return (
    <div className="min-h-screen bg-[#f6f6f2] text-neutral-900">
      <HashScrollHandler />
      <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between bg-[#f6f6f2]/95 px-6 py-4 backdrop-blur-md md:px-10">
        <Link href={withLocale("/")} className="text-lg font-bold tracking-[0.22em] text-black" data-intro-logo>
          GLEM
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-neutral-600">
            <Link
              href={switchTargetPath}
              className="text-black transition hover:text-neutral-700"
              aria-label={`Switch language to ${switchTargetLocale === "it" ? "Italian" : "English"}`}
            >
              {defaultLocale.toUpperCase()}
            </Link>
          </div>
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
        </div>
      </header>

      <main
        className={`${shouldHideGlobalFooter ? "pb-0" : "pb-32"} ${isHomePath ? "pt-0" : "pt-16"}`}
      >
        {children}
      </main>

      {!shouldHideGlobalFooter ? <GlobalFooter /> : null}
      {isHomePath && pathname !== "/" && !introCompleted ? <IntroOverlay onComplete={handleIntroComplete} /> : null}
    </div>
  );
}
