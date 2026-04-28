import { AtSign, Mail } from "lucide-react";

interface ContactCardProps {
  name: string;
  role: string;
  email: string;
  handle?: string;
  linkedin?: string;
}

export default function ContactCard({ name, role, email, handle, linkedin }: ContactCardProps) {
  return (
    <article className="space-y-2 border-b border-black/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-lg font-bold text-neutral-900">{name}</p>
      {role ? <p className="text-sm italic text-neutral-700">{role}</p> : null}

      <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900">
        <Mail className="h-4 w-4" />
        <span className="underline underline-offset-4">{email}</span>
      </a>

      {linkedin && handle ? (
        <a
          href={linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm italic text-neutral-700 hover:text-neutral-900"
        >
          <AtSign className="h-4 w-4" />
          <span className="underline underline-offset-4">{handle}</span>
        </a>
      ) : null}
    </article>
  );
}

