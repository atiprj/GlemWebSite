import { SiteHeader } from "@/components/site-header";
import { dictionaries, isLocale } from "@/lib/i18n";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];

  return (
    <div className="site-shell">
      <SiteHeader locale={locale} t={t} />
      <main className="container">{children}</main>
      <footer className="footer">
        <div className="container muted">{t.footer}</div>
      </footer>
    </div>
  );
}
