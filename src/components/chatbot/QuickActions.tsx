"use client";

import { motion } from "framer-motion";
import { QuickAction } from "@/lib/chatbot/types";
import {
  Calculator,
  Wrench,
  Phone,
  PhoneCall,
  Mail,
  AlertTriangle,
  Eye,
  Grid,
  Users,
  List,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
}

const iconMap = {
  calculator: Calculator,
  wrench: Wrench,
  phone: Phone,
  'phone-call': PhoneCall,
  mail: Mail,
  'alert-triangle': AlertTriangle,
  eye: Eye,
  grid: Grid,
  users: Users,
  list: List,
  'external-link': ExternalLink
};

const QuickActions = ({ actions, onActionClick }: QuickActionsProps) => {
  if (actions.length === 0) return null;

  const handleActionClick = (action: QuickAction) => {
    if (action.action === 'navigate') {
      // For navigation, we'll handle it through the parent component
      onActionClick(action);
    } else if (action.action === 'call') {
      window.open(`tel:${action.value}`, '_self');
    } else {
      onActionClick(action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-3 px-4"
    >
      {actions.map((action, index) => {
        const IconComponent = iconMap[action.icon as keyof typeof iconMap] || Calculator;

        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleActionClick(action)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium",
              "border-2 border-yellow/20 bg-yellow/10 text-yellow-700 hover:bg-yellow/20",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow/30"
            )}
          >
            <IconComponent className="w-3 h-3" />
            <span className="whitespace-nowrap">{action.label}</span>
            {action.action === 'navigate' && <ExternalLink className="w-3 h-3 opacity-60" />}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default QuickActions;