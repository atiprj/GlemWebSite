"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

const sectionLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#events", label: "Events" },
  { href: "#contacts", label: "Contacts" }
];

export function SidebarMenu({ open, onClose }: SidebarMenuProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close menu backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 h-screen w-[250px] border-l border-white/20 bg-black/95 px-6 py-6 text-white backdrop-blur-md"
            initial={{ x: 250, opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 250, opacity: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mb-10 flex items-center justify-between">
              <p className="text-xs tracking-[0.35em] text-white/70">NAVIGATION</p>
              <button
                aria-label="Close menu"
                className="rounded-md border border-white/20 p-2 transition hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-sm tracking-[0.22em]">
              {sectionLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={onClose} className="text-white/90 transition hover:text-white">
                  {link.label.toUpperCase()}
                </a>
              ))}
            </nav>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
