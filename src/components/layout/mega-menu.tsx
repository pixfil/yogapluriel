"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Home, 
  Wrench, 
  Hammer,
  Shield,
  Sun,
  Droplets,
  Zap,
  Settings
} from "lucide-react";

const MegaMenu = () => {
  const prestations = {
    "Couverture traditionnelle": [
      { name: "Ardoise", href: "/nos-prestations/ardoise", icon: Home },
      { name: "Tuile plate", href: "/nos-prestations/tuile-plate", icon: Home },
      { name: "Tuile mécanique", href: "/nos-prestations/tuile-mecanique", icon: Home }
    ],
    "Solutions modernes": [
      { name: "Zinc", href: "/nos-prestations/zinc", icon: Shield },
      { name: "Cuivre", href: "/nos-prestations/cuivre", icon: Hammer },
      { name: "Alu Préfa", href: "/nos-prestations/alu-prefa", icon: Settings },
      { name: "EPDM Étanchéité", href: "/nos-prestations/epdm-etancheite", icon: Droplets }
    ],
    "Ressources & Services": [
      { name: "Isolation bio-sourcée", href: "/nos-prestations/isolation", icon: Shield, featured: true, badge: "Aides 2025" },
      { name: "Guide Ma Prime Rénov'", href: "/nos-prestations/isolation/ma-prime-renov", icon: Shield },
      { name: "Velux", href: "/nos-prestations/velux", icon: Sun },
      { name: "Zinguerie", href: "/nos-prestations/zinguerie", icon: Wrench },
      { name: "Panneaux photovoltaïques", href: "/nos-prestations/panneaux-photovoltaiques", icon: Zap }
    ]
  };

  return (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="glass p-8 rounded-lg shadow-xl w-[800px] max-w-screen-lg"
      >
        <div className="grid grid-cols-3 gap-8">
          {Object.entries(prestations).map(([category, items], categoryIndex) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider border-b border-border pb-2">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((item, index) => {
                  const IconComponent = item.icon;
                  const isFeatured = (item as any).featured;
                  const badge = (item as any).badge;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors group/item relative ${
                        isFeatured ? 'bg-yellow/10 border-2 border-yellow/30 hover:border-yellow' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                        isFeatured
                          ? 'bg-yellow text-black group-hover/item:bg-yellow/80'
                          : 'bg-yellow/10 text-yellow group-hover/item:bg-yellow group-hover/item:text-black'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium transition-colors text-sm ${
                          isFeatured
                            ? 'text-foreground font-semibold'
                            : 'text-foreground group-hover/item:text-yellow'
                        }`}>
                          {item.name}
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
          ))}
        </div>
        
        {/* Call to action footer */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Besoin d'un conseil personnalisé ?
            </p>
            <p className="text-lg font-semibold text-foreground">
              <a href="tel:+33388123456" className="hover:text-yellow transition-colors">
                03 88 75 66 53
              </a>
            </p>
          </div>
          <Link
            href="/nos-prestations"
            className="inline-flex items-center gap-2 bg-yellow text-black px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow/90 hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Voir toutes nos prestations →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default MegaMenu;