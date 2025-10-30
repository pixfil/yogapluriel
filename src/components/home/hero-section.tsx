"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CTAButton from "@/components/ui/cta-button";
import DevisForm from "@/components/ui/devis-form";
import AnimatedCounter from "@/components/ui/animated-counter";
import { Calendar, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [phone, setPhone] = useState("03 88 75 66 53");

  useEffect(() => {
    // Fetch phone from settings
    fetch('/api/settings/general')
      .then(res => res.json())
      .then(data => {
        if (data.phone) {
          setPhone(data.phone);
        }
      })
      .catch(() => {
        // Keep default if fetch fails
      });
  }, []);
  return (
    <>
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[700px] pt-28 pb-8 md:pt-32 md:pb-12">
        {/* Background Video */}
        <div className="absolute inset-0" style={{top: '-250px', height: 'calc(100% + 250px)'}}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://res.cloudinary.com/doj84owtw/video/upload/v1761062800/bg-accueil_vxzpml.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/65" />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          {/* Content Area - Centered */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-16 items-center relative">
              {/* Left Column - Content */}
              <div className="space-y-6">
                {/* Breadcrumb */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-white/80 mb-8"
                >
                  <span>Bienvenue sur Formdetoit.fr</span>
                </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden md:block"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 md:mb-6" style={{fontFamily: 'var(--font-outfit)'}}>
                  Votre Artisan
                  <br />
                  <span className="text-yellow">Couvreur-Zingueur</span>
                  <br />
                  Bas-Rhin
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 max-w-lg">
                  Réparation et rénovation toiture : nous intervenons sur tous types de chantiers,
                  de la toiture la plus traditionnelle à la plus contemporaine.
                </p>
              </motion.div>

              {/* Version mobile sans animation pour LCP optimal */}
              <div className="md:hidden">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 md:mb-6" style={{fontFamily: 'var(--font-outfit)'}}>
                  Votre Artisan
                  <br />
                  <span className="text-yellow">Couvreur-Zingueur</span>
                  <br />
                  Bas-Rhin
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 max-w-lg">
                  Réparation et rénovation toiture : nous intervenons sur tous types de chantiers,
                  de la toiture la plus traditionnelle à la plus contemporaine.
                </p>
              </div>

              {/* CTA Buttons - Toujours en row pour mobile compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-row items-center gap-3 sm:gap-4 flex-wrap"
              >
                <CTAButton
                  href="/contact"
                  size="md"
                  glow
                  className="shadow-2xl text-sm sm:text-base flex-shrink-0"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Demandez un Rendez-vous</span>
                  <span className="sm:hidden">Prendre RDV</span>
                </CTAButton>

                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 sm:gap-3 text-white hover:text-yellow transition-colors group flex-shrink-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Phone className="w-5 h-5 text-yellow" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">{phone}</span>
                </a>
              </motion.div>
              </div>

              {/* Right Column - Form */}
              <div className="relative z-30 hidden xl:block py-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="w-full max-w-sm mx-auto xl:mx-0 xl:ml-auto"
                >
                  <DevisForm glassmorphism />
                </motion.div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Yellow band */}
      <section className="bg-yellow py-6 md:py-12 lg:py-16 relative z-20">
        {/* Worker Image - Positioned to overlap both sections - Desktop only */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute left-1/2 transform -translate-x-1/3 z-30 hidden lg:block"
          style={{
            bottom: '0px' // Bas de l'image au niveau du bas de la section jaune
          }}
        >
          <Image
            src="/couvreur-zingueur4.webp"
            alt="Artisan couvreur-zingueur Formdetoit"
            width={600}
            height={750}
            className="max-w-[340px] lg:max-w-[440px] xl:max-w-[530px] 2xl:max-w-[610px] object-contain max-h-[42vh] lg:max-h-[54vh] xl:max-h-[60vh] w-auto"
            priority
          />
        </motion.div>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Left: Stats */}
            <div className="flex gap-6 md:gap-12 lg:gap-16">
              <AnimatedCounter
                value={1000}
                label="Projets réalisés"
                suffix="+"
                className="text-center"
              />
            </div>

            {/* Right: Certification Logos - Desktop only */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden lg:flex flex-row gap-3 items-center"
            >
              <div className="bg-white rounded-lg p-2 shadow-lg h-20 w-20 flex items-center justify-center">
                <Image
                  src="/certifications/alsace.png"
                  alt="Artisan d'Alsace"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-2 shadow-lg h-20 w-20 flex items-center justify-center">
                <Image
                  src="/certifications/qualibat.png"
                  alt="Certification Qualibat"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-2 shadow-lg h-20 w-20 flex items-center justify-center">
                <Image
                  src="/certifications/rge-garant.webp"
                  alt="RGE Garant"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;