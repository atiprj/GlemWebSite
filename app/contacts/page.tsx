import { FadeInView } from "@/components/layout/FadeInView";
import ChromaGrid, { type ChromaItem } from "@/components/contacts/ChromaGrid";
import { getContactsContent } from "@/lib/contacts";

export default async function ContactsPage() {
  const contacts = await getContactsContent();
  const colorByInitials: Record<string, { border: string; gradient: string }> = {
    MG: { border: "#B22222", gradient: "linear-gradient(165deg, #f7d9d9, #f2c3c3)" }, // Rosso
    GM: { border: "#1F4D2E", gradient: "linear-gradient(165deg, #d8eadf, #c0dccb)" }, // Verde scuro
    LO: { border: "#C9A400", gradient: "linear-gradient(165deg, #f7efc8, #efe3a6)" }, // Giallo
    ES: { border: "#6B46C1", gradient: "linear-gradient(165deg, #e6dcfa, #d4c3f3)" }, // Viola
    GF: { border: "#1D4ED8", gradient: "linear-gradient(165deg, #d8e6ff, #bdd3ff)" } // Blu
  };

  const fallbackColors = { border: "#bcae95", gradient: "linear-gradient(165deg, #f4f2eb, #ebe6dc)" };

  const items: ChromaItem[] = contacts.members.map((member) => {
    const handle = `@${member.name.toLowerCase().replace(/\s+/g, "")}`;
    const initials = member.name
      .split(/\s+/)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);
    const palette = colorByInitials[initials] ?? fallbackColors;
    return {
      title: member.name,
      subtitle: member.role || "ATI Project Team",
      handle,
      handleUrl: member.linkedin,
      borderColor: palette.border,
      gradient: palette.gradient,
      url: `mailto:${member.email}`
    };
  });

  items.push({
    title: "Contact Us",
    subtitle: "Let's connect and build something meaningful.",
    handle: "@atiproject",
    borderColor: "#d6d0c7",
    gradient: "linear-gradient(165deg, #ffffff, #f7f5f0)",
    url: "mailto:atiproject@legalmail.it"
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
      <FadeInView>
        <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-2 text-sm tracking-[0.24em] text-neutral-500">{contacts.title}</p>
        <div className="mt-8">
          <ChromaGrid items={items} radius={260} damping={0.45} fadeOut={0.6} />
        </div>
      </FadeInView>
    </div>
  );
}
