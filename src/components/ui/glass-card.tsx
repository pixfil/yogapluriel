"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "tinted";
  hover?: boolean;
  delay?: number;
}

const GlassCard = ({ 
  children, 
  className, 
  variant = "default",
  hover = false,
  delay = 0 
}: GlassCardProps) => {
  const baseClasses = "rounded-lg border border-white/20 shadow-xl";
  
  const variantClasses = {
    default: "glass",
    dark: "glass-dark", 
    tinted: "backdrop-blur-lg bg-yellow/10 border border-yellow/20"
  };
  
  const hoverAnimation = hover ? {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2 }
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverAnimation}
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;