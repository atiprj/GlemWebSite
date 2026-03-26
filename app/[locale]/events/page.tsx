import { eventsData } from "@/data/content";
import { dictionaries, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function EventsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const events = eventsData.items;

  return (
    <section className="section">
      <h1>{t.events}</h1>
      <div className="grid">
        {events.length ? (
          events.map((eventItem) => (
            <article className="card" key={`${eventItem.title}-${eventItem.image ?? "none"}`}>
              {eventItem.image ? (
                <Image src={eventItem.image} alt={eventItem.title} width={1200} height={800} />
              ) : null}
              <strong>{eventItem.title}</strong>
              <p className="muted">{eventItem.description}</p>
            </article>
          ))
        ) : (
          <p className="muted">{t.eventsPlaceholder}</p>
        )}
      </div>
    </section>
  );
}
