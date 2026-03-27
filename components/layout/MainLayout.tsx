"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { IntroOverlay } from "@/components/intro/IntroOverlay";

interface MainLayoutProps {
  children: ReactNode;
}

interface HomeRevealVariants extends Variants {
  hidden: { opacity: number; filter: string };
  visible: {
    opacity: number;
    filter: string;
    transition: {
      staggerChildren: number;
      delayChildren: number;
      when: "beforeChildren" | "afterChildren";
    };
  };
}

const homeRevealVariants: HomeRevealVariants = {
  hidden: { opacity: 0, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

export const homeItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export function MainLayout({ children }: MainLayoutProps) {
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = isIntroComplete ? originalOverflow : "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isIntroComplete]);

  return (
    <div className="relative min-h-screen">
      <motion.main
        className="relative z-[1] min-h-screen"
        variants={homeRevealVariants}
        initial="hidden"
        animate={isIntroComplete ? "visible" : "hidden"}
      >
        {children}
      </motion.main>

      <AnimatePresence>{!isIntroComplete ? <IntroOverlay onComplete={() => setIsIntroComplete(true)} /> : null}</AnimatePresence>
    </div>
  );
}
