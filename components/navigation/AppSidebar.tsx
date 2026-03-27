"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/contacts", label: "Contacts" }
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation backdrop"
            className="fixed inset-0 z-40 bg-black/35"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-screen w-[250px] border-l border-white/20 bg-black/95 p-6 text-white"
            initial={{ x: 250 }}
            animate={{ x: 0 }}
            exit={{ x: 250 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xs tracking-[0.28em] text-white/75">MENU</p>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={onClose}
                className="rounded-md border border-white/25 p-1.5 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-5 text-sm tracking-[0.2em]">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose} className="text-white/90 transition hover:text-white">
                  {item.label.toUpperCase()}
                </Link>
              ))}
            </nav>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
