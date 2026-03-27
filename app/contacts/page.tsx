import { FadeInView } from "@/components/layout/FadeInView";
import { getFolderText } from "@/lib/site-assets";

export default async function ContactsPage() {
  const text = await getFolderText(
    "05.Contacts",
    "Contact details will be loaded here from files in public/assets/05.Contacts."
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
      <FadeInView>
        <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-5 max-w-3xl whitespace-pre-line text-neutral-700">{text}</p>
      </FadeInView>
    </div>
  );
}
