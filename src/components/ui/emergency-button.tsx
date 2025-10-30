"use client";

import { useState, useEffect } from "react";
import { Phone, X, Mail, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Masquer le bouton pendant le scroll
      setIsVisible(false);

      // Annuler le timeout précédent s'il existe
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Réafficher le bouton après 500ms d'inactivité
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      setScrollTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  return (
    <>
      {/* Floating Button - Hidden on mobile */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex fixed top-32 right-6 z-50 w-16 h-16 bg-yellow hover:bg-yellow/90 text-black rounded-full shadow-2xl items-center justify-center transition-all duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isVisible ? 1 : 0.8,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none"
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 bg-yellow/50 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <Phone className="w-7 h-7 relative z-10 text-black" />
        </div>

        {/* Tooltip */}
        <motion.div
          className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            x: isVisible ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
        >
          Contact Urgence
        </motion.div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Urgence</h3>
                      <p className="text-red-100 text-sm">Nous sommes là pour vous aider</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Vous avez une <strong>fuite</strong>, un <strong>problème urgent</strong> sur votre toiture ?
                    Contactez-nous immédiatement !
                  </p>

                  {/* Contact Options */}
                  <div className="space-y-3">
                    {/* Phone */}
                    <a
                      href="tel:0388756653"
                      className="flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Appelez maintenant</div>
                        <div className="text-xl font-bold text-gray-900">03 88 75 66 53</div>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href="mailto:contact@formdetoit.fr?subject=Urgence%20toiture"
                      className="flex items-center gap-4 p-4 bg-yellow/10 hover:bg-yellow/20 rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Email urgence</div>
                        <div className="text-lg font-semibold text-gray-900">contact@formdetoit.fr</div>
                      </div>
                    </a>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-yellow" />
                    <p className="text-sm text-gray-700">
                      <strong>Délai d'intervention :</strong> Nous vous rappelons sous 2h pour les urgences
                    </p>
                  </div>

                  {/* Info */}
                  <div className="text-xs text-gray-500 text-center pt-2">
                    Disponible du lundi au vendredi • Intervention rapide dans tout le Bas-Rhin
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}