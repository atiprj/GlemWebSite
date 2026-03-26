import { contactsData } from "@/data/content";
import { dictionaries, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function ContactsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const contactsText = contactsData.text;

  return (
    <section className="section">
      <h1>{t.contacts}</h1>
      <p className="muted">{contactsText || t.contactsPlaceholder}</p>
    </section>
  );
}
