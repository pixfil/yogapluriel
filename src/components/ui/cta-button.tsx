"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  glow?: boolean;
  showArrow?: boolean;
}

const CTAButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  glow = false,
  showArrow = true
}: CTAButtonProps) => {
  const baseClasses = "group inline-flex items-center gap-3 rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary: "bg-yellow hover:bg-transparent border-2 border-yellow",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border-2 border-yellow text-yellow bg-transparent hover:bg-yellow"
  };

  const circleVariantClasses = {
    primary: "bg-white text-black group-hover:bg-white group-hover:text-yellow",
    dark: "bg-yellow text-black",
    outline: "bg-transparent border border-yellow text-yellow group-hover:bg-black group-hover:text-yellow group-hover:border-black"
  };

  const sizeClasses = {
    sm: "pl-3 pr-2 py-1.5 text-sm",
    md: "pl-4 pr-2 py-2 text-base",
    lg: "pl-6 pr-3 py-2.5 text-lg"
  };

  const circleSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  const arrowSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const glowClasses = glow ? "shadow-yellow-lg hover:shadow-2xl" : "shadow-lg hover:shadow-xl";

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    glowClasses,
    className
  );

  const textColorClasses = {
    primary: "text-black group-hover:text-yellow",
    dark: "",
    outline: "group-hover:text-black"
  };

  const buttonContent = (
    <>
      <span className={cn("flex items-center gap-2 transition-colors duration-300", textColorClasses[variant])}>
        {children}
      </span>
      {showArrow && (
        <div
          className={cn(
            "rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110",
            circleVariantClasses[variant],
            circleSizeClasses[size]
          )}
        >
          <ArrowRight className={cn(arrowSizeClasses[size], "transition-all duration-300 group-hover:translate-x-1")} />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={combinedClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {buttonContent}
    </motion.button>
  );
};

export default CTAButton;