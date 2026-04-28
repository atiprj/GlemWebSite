import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import { FadeInView } from "@/components/layout/FadeInView";
import { getContactsContent } from "@/lib/contacts";
import { dictionaries, isLocale } from "@/lib/i18n";

export default async function LocaleContactsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = dictionaries[locale];
  const contacts = await getContactsContent();
  const toEmail = contacts.members[0]?.email || "atiproject@legalmail.it";

  const findMember = (key: string) => {
    const k = key.toLowerCase().trim();
    const tokens = k.split(/\s+/).filter(Boolean);
    const firstToken = tokens[0] ?? k;

    return (
      contacts.members.find((m) => m.name.toLowerCase().trim() === k) ??
      contacts.members.find((m) => m.name.toLowerCase().trim().includes(k)) ??
      contacts.members.find((m) => m.name.toLowerCase().trim().startsWith(firstToken)) ??
      contacts.members.find((m) => m.name.toLowerCase().trim().split(/\s+/)[0] === firstToken) ??
      null
    );
  };

  const leadKeys = ["Mattia Giannetti", "Giacomo"];
  const crewKeys = ["Luca", "Erica", "Gabriele"];
  const renderGroupRows = (label: "LEAD" | "CREW", keys: string[]) =>
    keys.map((k, index) => {
      const member = findMember(k);
      const name = member?.name ?? k;
      const handle = `@${name.toLowerCase().replace(/\s+/g, "")}`;

      return (
        <div key={`${label}-${k}`} className="space-y-1">
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              {index === 0 ? <p className="mb-2 text-sm font-semibold tracking-[0.28em] text-neutral-900">{label}</p> : null}
              <p className="text-lg font-bold text-neutral-900">{name}</p>
            </div>

            <div className="space-y-0.5">
              {member?.role ? <p className="text-sm italic text-neutral-700">{member.role}</p> : null}
              {member?.email ? (
                <a href={`mailto:${member.email}`} className="block text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900">
                  {member.email}
                </a>
              ) : null}
              {member?.linkedin ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm italic text-neutral-700 underline underline-offset-4 hover:text-neutral-900"
                >
                  {handle}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      );
    });

  return (
    <div
      className="bg-[#f6f6f2]"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)"
      }}
    >
      <section className="w-full overflow-hidden md:flex md:min-h-[calc(100vh-64px)]">
        <div className="w-full min-w-0 px-6 py-10 md:w-1/2 md:px-12">
          <FadeInView>
            <h1 className="text-3xl font-semibold tracking-tight">{t.contacts}</h1>
            <p className="mt-2 text-sm tracking-[0.24em] text-neutral-500">{contacts.title}</p>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
                {renderGroupRows("LEAD", leadKeys)}
                {renderGroupRows("CREW", crewKeys)}
              </div>
            </div>
          </FadeInView>
        </div>

        <aside className="sticky top-16 h-[calc(100vh-64px)] w-full min-w-0 overflow-y-auto border-l border-neutral-700/70 bg-black px-6 py-12 md:w-1/2 md:flex-none md:px-12">
          <FadeInView>
            <ContactForm toEmail={toEmail} locale={locale} />
          </FadeInView>
        </aside>
      </section>
    </div>
  );
}
