"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedSection from "@/components/ui/animated-section";

const ExpertiseSection = () => {
  return (
    <AnimatedSection>
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Badge "À Propos" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="text-yellow text-xl">🏠</span>
            <span className="text-yellow font-semibold text-sm uppercase tracking-wider">
              À Propos
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Une expertise 
                <span className="block text-yellow">complète</span>
              </h2>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                L'équipe Formdetoit vous accompagne dans la conception et la réalisation 
                de vos projets de toiture. Que ce soit pour répondre à un besoin de 
                rénovation toiture, pour installer d'un Velux, pour parfaire votre isolation ou 
                tout simplement pour entretenir votre toiture, notre équipe s'occupe de tout.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow mb-2">20%</div>
                  <p className="text-gray-600 text-sm">de réduction sur votre première intervention</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow mb-2">RGE</div>
                  <p className="text-gray-600 text-sm">Certifié Reconnu Garant Environnement</p>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    ✓ <span>Devis gratuit sous 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Garantie décennale</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/toiture-coucher-soleil.jpg"
                  alt="Toiture au coucher de soleil - Expertise Formdetoit"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                />
                
                {/* Badge Réduction Overlay */}
                <div className="absolute top-6 right-6">
                  <div className="bg-yellow text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg transform rotate-12">
                    -20% 
                    <span className="block text-xs font-normal -mt-1">de réduction</span>
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass rounded-xl p-4">
                    <div className="flex justify-between items-center text-white">
                      <div className="text-center">
                        <div className="text-2xl font-bold">25</div>
                        <div className="text-xs opacity-90">Ans d'expérience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-xs opacity-90">Satisfaction client</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">24h</div>
                        <div className="text-xs opacity-90">Délai de réponse</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
};

export default ExpertiseSection;