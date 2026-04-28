import { AppShell } from "@/components/layout/AppShell";
import { isLocale } from "@/lib/i18n";
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

  return <AppShell>{children}</AppShell>;
}
