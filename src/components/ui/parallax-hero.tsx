"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ParallaxHeroProps {
  backgroundImage: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

const ParallaxHero = ({
  backgroundImage,
  children,
  className,
  height = "100vh",
  overlay = true,
  overlayOpacity = 0.4
}: ParallaxHeroProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ height }}
    >
      {/* Background image with parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </motion.div>
      
      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black z-10"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 h-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxHero;