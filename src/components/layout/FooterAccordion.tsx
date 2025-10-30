"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FooterSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon?: React.ElementType;
  }>;
}

interface FooterAccordionProps {
  sections: FooterSection[];
}

export default function FooterAccordion({ sections }: FooterAccordionProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="md:hidden space-y-2">
      {sections.map((section) => {
        const isOpen = openSections.includes(section.title);

        return (
          <div key={section.title} className="border-b border-slate-800">
            {/* Accordion Header */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between py-4 text-left hover:text-yellow transition-colors"
            >
              <h3 className="font-semibold text-base">{section.title}</h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-slate-400 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {/* Accordion Content */}
            <motion.div
              initial={false}
              animate={{
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ul className="space-y-3 pb-4">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-slate-300 hover:text-yellow transition-colors text-sm flex items-center gap-2 group"
                      >
                        {Icon && (
                          <Icon className="h-4 w-4 text-yellow/70 group-hover:text-yellow flex-shrink-0" />
                        )}
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
