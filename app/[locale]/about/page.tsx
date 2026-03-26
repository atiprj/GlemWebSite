import { aboutData } from "@/data/content";
import { dictionaries, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];

  return (
    <section className="section">
      <h1>{t.about}</h1>
      <p className="muted">{aboutData.description || t.aboutPlaceholder}</p>
      <div className="grid">
        {aboutData.images.map((img) => (
          <article className="card" key={img}>
            <Image src={img} alt={t.about} width={1200} height={800} />
          </article>
        ))}
      </div>
    </section>
  );
}
