"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const TEAM = [
  {
    name: "Mattia Giannetti",
    role: "The Soul",
    email: "mattiagiannetti@atiproject.com",
    phone: "+39 012 3456789"
  },
  {
    name: "Giacomo Marani",
    role: "The Strategists",
    email: "giacomomarani@atiproject.com",
    phone: "+39 012 3456789"
  },
  {
    name: "Luca Ofria",
    role: "The Backbone",
    email: "lucaofria@atiproject.com",
    phone: "+39 012 3456789"
  },
  {
    name: "Erica Scribano",
    role: "The Crew",
    email: "ericascribano@atiproject.com",
    phone: "+39 012 3456789"
  }
];

export function GlobalFooter() {
  const { scrollYProgress } = useScroll();
  const [isRevealed, setIsRevealed] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setIsRevealed(value > 0.93);
  });

  return (
    <motion.footer
      className="fixed bottom-0 left-0 z-30 w-full bg-black px-8 py-32 text-white"
      initial={{ opacity: 0, y: 80 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ pointerEvents: isRevealed ? "auto" : "none" }}
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-xs tracking-[0.35em] text-white/85">
          ATI PROJECT - R&D DEPARTEMENT
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
          {TEAM.map((member) => (
            <div key={member.email} className="space-y-3">
              <p className="text-xl font-bold">{member.name}</p>
              <p className="text-sm italic text-gray-300">{member.role}</p>
              <a href={`mailto:${member.email}`} className="block text-sm text-white underline-offset-4 hover:underline">
                {member.email}
              </a>
              <p className="text-sm text-white/90">{member.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
