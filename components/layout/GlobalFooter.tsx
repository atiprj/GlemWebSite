"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

interface ContactMember {
  name: string;
  role: string;
  email: string;
}

interface ContactsContent {
  title: string;
  members: ContactMember[];
}

const FALLBACK_CONTENT: ContactsContent = {
  title: "ATI PROJECT - R&D DEPARTEMENT",
  members: [
    {
      name: "Mattia Giannetti",
      role: "Head of department R&D",
      email: "mattiagiannetti@atiproject.com"
    }
  ]
};

export function GlobalFooter() {
  const { scrollYProgress } = useScroll();
  const [isRevealed, setIsRevealed] = useState(false);
  const [contacts, setContacts] = useState<ContactsContent>(FALLBACK_CONTENT);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setIsRevealed(value > 0.93);
  });

  useEffect(() => {
    let isUnmounted = false;

    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/contacts", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ContactsContent;
        if (!isUnmounted) {
          setContacts(data);
        }
      } catch {
        /* keep fallback content */
      }
    };

    fetchContacts();
    const intervalMs = process.env.NODE_ENV === "development" ? 2000 : 30000;
    const intervalId = window.setInterval(fetchContacts, intervalMs);

    return () => {
      isUnmounted = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <motion.footer
      className="fixed bottom-0 left-0 z-30 w-full bg-black px-8 py-16 text-white"
      initial={{ opacity: 0, y: 80 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ pointerEvents: isRevealed ? "auto" : "none" }}
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-xs tracking-[0.35em] text-white/85">
          {contacts.title}
        </h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-4">
          {contacts.members.map((member) => (
            <div key={member.email} className="space-y-3 pb-6 last:pb-0">
              <p className="text-xl font-bold">{member.name}</p>
              {member.role ? <p className="text-sm italic text-gray-300">{member.role}</p> : null}
              <a href={`mailto:${member.email}`} className="block text-sm text-white underline-offset-4 hover:underline">
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
