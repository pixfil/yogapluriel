"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show after 300px scroll
      if (currentScrollY > 300 && !isDismissed) {
        // Show when scrolling up, hide when scrolling down
        if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else if (currentScrollY <= 300) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="relative">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-1.5 shadow-lg z-10 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* CTA Button */}
            <Link
              href="/contact"
              className={cn(
                "flex items-center justify-center gap-3",
                "bg-yellow hover:bg-yellow/90",
                "text-black font-bold",
                "px-6 py-4",
                "rounded-xl shadow-2xl",
                "transition-all duration-300",
                "hover:scale-[1.02]",
                "active:scale-95"
              )}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className="text-base">Demander un devis gratuit</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
