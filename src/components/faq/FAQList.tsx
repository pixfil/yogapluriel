"use client";

import { useState } from "react";
import AnimatedSection from "@/components/ui/animated-section";
import {
  ChevronDown,
  ChevronUp,
  BadgeDollarSign,
  Home,
  Clock,
  Shield,
  Wrench,
  HelpCircle,
  FileText,
  Settings,
} from "lucide-react";

// Icon mapping for dynamic icons
const iconMap: Record<string, any> = {
  BadgeDollarSign,
  Home,
  Clock,
  Shield,
  Wrench,
  HelpCircle,
  FileText,
  Settings,
};

type FAQQuestion = {
  id: string;
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  title: string;
  icon: string; // Icon name as string
  questions: FAQQuestion[];
};

type Props = {
  categories: FAQCategory[];
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-yellow flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-yellow flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQList({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune question disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category, categoryIndex) => {
        // Map string icon name to actual Lucide icon component
        const IconComponent = iconMap[category.icon] || HelpCircle;
        return (
          <AnimatedSection key={category.id} delay={0.1 * categoryIndex}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-yellow" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
              </div>

              <div className="space-y-3">
                {category.questions.map((item, index) => (
                  <FAQItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        );
      })}
    </div>
  );
}
