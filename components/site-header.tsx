"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  t: Record<string, string>;
};

export function SiteHeader({ locale, t }: Props) {
  const pathname = usePathname();
  const altLocale = locale === "it" ? "en" : "it";
  const swappedPath = pathname.replace(`/${locale}`, `/${altLocale}`);

  return (
    <header className="container topbar">
      <strong>GLEM</strong>
      <nav className="nav">
        <Link href={`/${locale}`}>{t.home}</Link>
        <Link href={`/${locale}/about`}>{t.about}</Link>
        <Link href={`/${locale}/projects`}>{t.projects}</Link>
        <Link href={`/${locale}/events`}>{t.events}</Link>
        <Link href={`/${locale}/contacts`}>{t.contacts}</Link>
      </nav>
      <div className="lang-switch">
        <Link href={swappedPath || `/${altLocale}`}>{altLocale.toUpperCase()}</Link>
      </div>
    </header>
  );
}
