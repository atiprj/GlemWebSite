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
      className="fixed bottom-0 left-0 z-30 w-full bg-black px-6 py-8 text-white"
      initial={{ opacity: 0, y: 40 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ pointerEvents: isRevealed ? "auto" : "none" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <h2 className="shrink-0 text-[9px] tracking-[0.3em] text-white/70">
          {contacts.title}
        </h2>

        <div className="overflow-hidden md:hidden">
          <div className="names-marquee-track flex flex-nowrap items-start gap-x-8 whitespace-nowrap">
            {[...contacts.members, ...contacts.members].map((member, index) => (
              <span key={`${member.email}-${index}`} className="flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold">{member.name}</span>
                {member.role ? <span className="text-[10px] italic text-white/60">{member.role}</span> : null}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden flex-nowrap items-start justify-start gap-x-8 overflow-x-auto whitespace-nowrap md:flex">
          {contacts.members.map((member) => (
            <span key={member.email} className="flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold">{member.name}</span>
              {member.role ? <span className="text-[10px] italic text-white/60">{member.role}</span> : null}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes namesMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .names-marquee-track {
          width: max-content;
          animation: namesMarquee 16s linear infinite;
        }
      `}</style>
    </motion.footer>
  );
}
