"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CTAButton from "@/components/ui/cta-button";
import MegaMenu from "@/components/ui/mega-menu";
import { Menu, X, ChevronDown, Phone, Mail, Calculator, ArrowRight, AlertCircle, HelpCircle, BookOpen, FileText, MapPin, Clock as ClockIcon } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const menuCloseTimer = useRef<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Verrouillage du scroll de la page quand le menu est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Artisan couvreur", href: "/artisan-couvreur" },
    { name: "Notre équipe", href: "/notre-equipe" },
    { name: "Nos prestations", href: "/nos-prestations", hasDropdown: true },
    { name: "Nos réalisations", href: "/nos-realisations" },
  ];

  const services = [
    { name: "Ardoise", href: "/nos-prestations/ardoise" },
    { name: "Tuile plate", href: "/nos-prestations/tuile-plate" },
    { name: "Tuile mécanique", href: "/nos-prestations/tuile-mecanique" },
    { name: "Zinc", href: "/nos-prestations/zinc" },
    { name: "Cuivre", href: "/nos-prestations/cuivre" },
    { name: "Isolation", href: "/nos-prestations/isolation" },
    { name: "Velux", href: "/nos-prestations/velux" },
    { name: "EPDM Étanchéité", href: "/nos-prestations/epdm-etancheite" },
  ];

  const resourcesLinks = [
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Lexique couverture", href: "/lexique", icon: BookOpen },
    { name: "Calculateur d'aides 2025", href: "/calculateur-aides", icon: Calculator },
    { name: "Guide Ma Prime Rénov'", href: "/nos-prestations/isolation/ma-prime-renov", icon: FileText },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "glass shadow-lg" 
            : "bg-transparent"
        )}
      >
        {/* Top bar - Contact info */}
        <div className="bg-yellow text-black text-sm py-2">
          <div className="container mx-auto px-4 flex items-center justify-between">
            {/* Left side - Contact urgence (mobile) + Phone */}
            <div className="flex items-center gap-3">
              <a href="tel:0388756653" className="md:hidden flex items-center gap-1.5 hover:opacity-80 transition-opacity bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Urgence</span>
              </a>
              <a href="tel:0388756653" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Phone className="w-4 h-4" />
                <span className="font-medium">03 88 75 66 53</span>
              </a>
            </div>

            <Link
              href="/calculateur-aides"
              className="hidden md:flex items-center gap-2 font-semibold hover:scale-105 transition-transform"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculez vos aides 2025</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a href="mailto:contact@formdetoit.fr" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Mail className="w-4 h-4" />
              <span>contact@formdetoit.fr</span>
            </a>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Image
                  src={isScrolled ? "/formdetoit_logo_noir.webp" : "/formdetoit_logo.png"}
                  alt="Formdetoit - Artisan Couvreur Bas-Rhin"
                  width={180}
                  height={50}
                  className="h-12 md:h-16 lg:h-20 w-auto transition-opacity duration-300"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <div
                      className="group"
                      onMouseEnter={() => {
                        if (menuCloseTimer.current) {
                          clearTimeout(menuCloseTimer.current);
                        }
                        setIsServicesOpen(true);
                      }}
                      onMouseLeave={() => {
                        menuCloseTimer.current = setTimeout(() => {
                          setIsServicesOpen(false);
                        }, 250);
                      }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-1 hover:text-yellow transition-colors duration-200 font-medium",
                          isScrolled ? "text-gray-800" : "text-white"
                        )}
                      >
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </Link>

                      {/* Mega Menu */}
                      <div
                        onMouseEnter={() => {
                          if (menuCloseTimer.current) {
                            clearTimeout(menuCloseTimer.current);
                          }
                        }}
                        onMouseLeave={() => {
                          menuCloseTimer.current = setTimeout(() => {
                            setIsServicesOpen(false);
                          }, 250);
                        }}
                      >
                        <MegaMenu
                          isOpen={isServicesOpen}
                          onClose={() => setIsServicesOpen(false)}
                        />
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "hover:text-yellow transition-colors duration-200 font-medium",
                        isScrolled ? "text-gray-800" : "text-white"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-4">
              <CTAButton
                variant="primary"
                size="md"
                glow
                className="hidden sm:inline-flex font-semibold"
                href="/contact"
              >
                DEVIS GRATUIT
              </CTAButton>

              {/* Small Devis button for mobile - left of burger menu */}
              <Link
                href="/contact"
                className={cn(
                  "sm:hidden px-2.5 py-1.5 bg-yellow text-black rounded-md text-xs font-semibold hover:bg-yellow/90 transition-colors whitespace-nowrap",
                )}
              >
                Devis
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2 hover:text-yellow transition-colors",
                  isScrolled ? "text-gray-800" : "text-white"
                )}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation - Fullscreen */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          x: isMobileMenuOpen ? 0 : '100%',
          pointerEvents: isMobileMenuOpen ? "auto" : "none"
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 z-[60] lg:hidden"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)} />

        {/* Menu Panel - Fullscreen */}
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white overflow-y-auto shadow-2xl">
          {/* Header du menu avec logo et bouton fermer */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
            <Image
              src="/formdetoit_logo_noir.webp"
              alt="Formdetoit"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6 text-gray-900" />
            </button>
          </div>

          <nav className="p-6 space-y-6">
            {/* Navigation principale */}
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <div>
                      {/* Bouton accordéon */}
                      <button
                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                        className="w-full flex items-center justify-between py-3 text-base font-semibold text-gray-900 hover:text-yellow transition-colors"
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isServicesOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Sous-menu services avec animation */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isServicesOpen ? "auto" : 0,
                          opacity: isServicesOpen ? 1 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-yellow/30 pl-4 pb-2">
                          {services.map((service) => (
                            <Link
                              key={service.name}
                              href={service.href}
                              className="block py-2 text-sm text-gray-600 hover:text-yellow transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {service.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block py-3 text-base font-semibold text-gray-900 hover:text-yellow transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Section Ressources */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ressources</h3>
              <div className="space-y-2">
                {resourcesLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-700 hover:text-yellow transition-colors group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5 text-yellow/70 group-hover:text-yellow" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section Urgences 24/7 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-base font-bold text-red-900">Urgences 24/7</h3>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  Fuite, dégât des eaux ou problème urgent ?
                </p>
                <a
                  href="tel:0388756653"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors mb-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>03 88 75 66 53</span>
                </a>
                <Link
                  href="/contact?tab=urgent"
                  className="block text-center text-sm text-red-700 hover:text-red-900 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Formulaire d'urgence →
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <CTAButton
                variant="primary"
                size="lg"
                glow
                href="/contact"
                className="w-full justify-center mb-3"
              >
                DEVIS GRATUIT
              </CTAButton>

              <a
                href="tel:0388756653"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>03 88 75 66 53</span>
              </a>
            </div>

            {/* Footer - Coordonnées et horaires */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Coordonnées</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Formdetoit</p>
                    <p>Strasbourg, Bas-Rhin (67)</p>
                    <p>Zone d'intervention : 30km</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-yellow mt-0.5 flex-shrink-0" />
                  <a href="mailto:contact@formdetoit.fr" className="hover:text-yellow">
                    contact@formdetoit.fr
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Horaires d'ouverture</p>
                    <p>Lun - Ven : 8h - 18h</p>
                    <p>Sam : 9h - 12h</p>
                    <p className="text-red-600 font-medium mt-1">Urgences : 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default Header;