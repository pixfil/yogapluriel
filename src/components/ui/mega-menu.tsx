"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Home,
  Shield,
  Sun,
  Droplets,
  Wrench,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Calculator
} from "lucide-react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const prestationsData = {
  mainServices: [
    {
      icon: Home,
      title: "Ardoise",
      description: "Naturelle et durable",
      href: "/nos-prestations/ardoise",
      image: "/prestations/ardoise.webp"
    },
    {
      icon: Home,
      title: "Tuile Plate",
      description: "Traditionnelle alsacienne",
      href: "/nos-prestations/tuile-plate",
      image: "/prestations/tuile-plate.jpg"
    },
    {
      icon: Home,
      title: "Tuile Mécanique",
      description: "Moderne et économique",
      href: "/nos-prestations/tuile-mecanique",
      image: "/prestations/tuile-mecanique.jpg"
    },
    {
      icon: Home,
      title: "Alu Préfa",
      description: "Durable et esthétique",
      href: "/nos-prestations/alu-prefa",
      image: "/prestations/alu-prefa.jpg"
    }
  ],
  specialties: [
    {
      icon: Wrench,
      title: "Isolation bio-sourcée",
      description: "Performance énergétique",
      href: "/nos-prestations/isolation",
      featured: true
    },
    {
      icon: Shield,
      title: "Zinc",
      description: "Matériau noble et durable",
      href: "/nos-prestations/zinc"
    },
    {
      icon: Shield,
      title: "Cuivre",
      description: "Excellence et patine naturelle",
      href: "/nos-prestations/cuivre"
    },
    {
      icon: Sun,
      title: "Velux",
      description: "Fenêtres de toit",
      href: "/nos-prestations/velux"
    },
    {
      icon: Droplets,
      title: "EPDM",
      description: "Étanchéité terrasses",
      href: "/nos-prestations/epdm-etancheite"
    }
  ],
  resources: [
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Questions fréquentes",
      href: "/faq"
    },
    {
      icon: BookOpen,
      title: "Lexique",
      description: "Termes techniques",
      href: "/lexique"
    },
    {
      icon: Shield,
      title: "Guide Ma Prime Rénov'",
      description: "Tout savoir sur les aides",
      href: "/nos-prestations/isolation/ma-prime-renov"
    }
  ]
};

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isOpen ? 1 : 0, 
        y: isOpen ? 0 : 10 
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[800px] max-w-[90vw]",
        "bg-white border border-gray-200 rounded-2xl shadow-2xl",
        "transition-all duration-200 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
    >
      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          
          {/* Main Services Column */}
          <div>
            <h3 className="text-sm font-semibold text-yellow uppercase tracking-wider mb-4 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Couvertures
            </h3>
            <div className="space-y-2">
              {prestationsData.mainServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-yellow/15 hover:border-yellow/20 hover:shadow-md hover:scale-[1.02] border border-transparent transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-yellow/10 rounded-lg flex items-center justify-center group-hover:bg-yellow group-hover:text-black transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {service.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {service.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* All Services Link */}
            <Link
              href="/nos-prestations"
              onClick={onClose}
              className="inline-flex items-center gap-1 mt-4 px-3 py-2 rounded-lg bg-yellow text-black hover:bg-yellow/90 hover:-translate-y-1 transition-all duration-200 font-medium text-xs shadow-md hover:shadow-lg"
            >
              Toutes nos prestations
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Specialties Column */}
          <div>
            <h3 className="text-sm font-semibold text-yellow uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Spécialités
            </h3>
            <div className="space-y-2">
              {prestationsData.specialties.map((service) => {
                const IconComponent = service.icon;
                const isFeatured = (service as any).featured;
                const badge = (service as any).badge;

                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 p-2 rounded-lg hover:shadow-md hover:scale-[1.02] transition-all duration-200 ${
                      isFeatured
                        ? 'bg-yellow/15 border-2 border-yellow/40 hover:border-yellow'
                        : 'hover:bg-yellow/15 hover:border-yellow/20 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isFeatured
                        ? 'bg-yellow text-black'
                        : 'bg-yellow/10 group-hover:bg-yellow group-hover:text-black'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-gray-900 text-sm ${isFeatured ? 'font-bold' : ''}`}>
                        {service.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {service.description}
                      </div>
                      {badge && (
                        <span className="inline-block mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                          {badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-sm font-semibold text-yellow uppercase tracking-wider mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Ressources & Services
            </h3>
            <div className="space-y-2">
              {prestationsData.resources.map((resource) => {
                const IconComponent = resource.icon;
                return (
                  <Link
                    key={resource.title}
                    href={resource.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-yellow/15 hover:border-yellow/20 hover:shadow-md hover:scale-[1.02] border border-transparent transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-yellow/10 rounded-lg flex items-center justify-center group-hover:bg-yellow group-hover:text-black transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {resource.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {resource.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Calculator Section */}
            <div className="mt-6 p-4 bg-yellow/5 rounded-lg border border-yellow/10">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Calculette des aides 2025</h4>
              <p className="text-xs text-gray-600 mb-3">
                Estimez vos aides financières pour vos travaux
              </p>
              <Link
                href="/calculateur-aides"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow text-black rounded-lg hover:bg-yellow/90 hover:shadow-md hover:scale-105 transition-all duration-200 text-sm font-medium"
              >
                <Calculator className="w-4 h-4" />
                Calculer mes aides
              </Link>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}