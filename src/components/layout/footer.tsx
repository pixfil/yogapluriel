import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Facebook, Instagram, Linkedin, AlertCircle, FileText } from "lucide-react";
import { getGeneralSettings } from "@/app/actions/settings";
import FooterAccordion from "./FooterAccordion";

const Footer = async () => {
  const currentYear = new Date().getFullYear();
  const generalSettings = await getGeneralSettings();

  const services = [
    { name: "Ardoise", href: "/nos-prestations/ardoise" },
    { name: "Tuile plate", href: "/nos-prestations/tuile-plate" },
    { name: "Tuile mécanique", href: "/nos-prestations/tuile-mecanique" },
    { name: "Zinc", href: "/nos-prestations/zinc" },
    { name: "Cuivre", href: "/nos-prestations/cuivre" },
    { name: "Alu Prefa", href: "/nos-prestations/alu-prefa" },
    { name: "Isolation", href: "/nos-prestations/isolation" },
    { name: "Velux", href: "/nos-prestations/velux" },
    { name: "Étanchéité EPDM", href: "/nos-prestations/epdm-etancheite" },
    { name: "Zinguerie", href: "/nos-prestations/zinguerie" },
    { name: "Couverture", href: "/nos-prestations" }
  ];

  const company = [
    { name: "Artisan couvreur", href: "/artisan-couvreur" },
    { name: "Notre équipe", href: "/notre-equipe" },
    { name: "Nos réalisations", href: "/nos-realisations" },
    { name: "Nos labels et certifications", href: "/nos-labels-certifications" },
    { name: "Zone d'intervention", href: "/artisan-couvreur#zone-intervention" },
    { name: "Contact", href: "/contact" }
  ];

  const resources = [
    { name: "FAQ", href: "/faq" },
    { name: "Lexique couverture", href: "/lexique" },
    { name: "Calculateur d'aides 2025", href: "/calculateur-aides" },
    { name: "Guide Ma Prime Rénov'", href: "/nos-prestations/isolation/ma-prime-renov" }
  ];

  const contact = [
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "Devis personnalisé gratuit", href: "/contact?tab=devis", icon: FileText }
  ];

  const legal = [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/politique-confidentialite" }
  ];

  // Préparation des sections pour les accordéons mobiles
  const accordionSections = [
    { title: "Nos services", items: services },
    { title: "L'entreprise", items: company },
    { title: "Ressources", items: resources },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mobile: Company Info + Accordions */}
        <div className="md:hidden space-y-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <Image
                src="/formdetoit_logo.png"
                alt="Formdetoit - Artisan Couvreur Bas-Rhin"
                width={360}
                height={100}
                className="h-20 w-auto mb-4 filter brightness-0 invert"
              />
              <p className="text-slate-300 leading-relaxed text-sm">
                Artisan couvreur-zingueur dans le Bas-Rhin, spécialisé dans la couverture,
                l'isolation et l'étanchéité. Certifié RGE Qualibat.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {generalSettings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-yellow flex-shrink-0" />
                  <a
                    href={`tel:${generalSettings.phone.replace(/\s/g, '')}`}
                    className="text-sm hover:text-yellow transition-colors"
                  >
                    {generalSettings.phone}
                  </a>
                </div>
              )}

              {generalSettings.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-yellow flex-shrink-0" />
                  <a
                    href={`mailto:${generalSettings.email}`}
                    className="text-sm hover:text-yellow transition-colors"
                  >
                    {generalSettings.email}
                  </a>
                </div>
              )}

              {/* Social Media */}
              {(generalSettings.facebook || generalSettings.instagram || generalSettings.linkedin) && (
                <div className="flex items-center gap-3 pt-3">
                  {generalSettings.facebook && (
                    <a
                      href={generalSettings.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-800 hover:bg-yellow rounded-full flex items-center justify-center transition-all duration-300 group"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  {generalSettings.instagram && (
                    <a
                      href={generalSettings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-800 hover:bg-yellow rounded-full flex items-center justify-center transition-all duration-300 group"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  {generalSettings.linkedin && (
                    <a
                      href={generalSettings.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-800 hover:bg-yellow rounded-full flex items-center justify-center transition-all duration-300 group"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Accordions */}
          <FooterAccordion sections={accordionSections} />

          {/* Contact & Urgences */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact</h3>
            <ul className="space-y-3">
              {contact.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-300 hover:text-yellow transition-colors text-sm flex items-center gap-2 group"
                    >
                      <Icon className="h-4 w-4 text-yellow/70 group-hover:text-yellow flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Urgences 24/7 */}
            {generalSettings.phone && (
              <div className="mt-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h4 className="font-semibold text-red-500 text-sm">Urgences 24/7</h4>
                </div>
                <a
                  href={`tel:${generalSettings.phone.replace(/\s/g, '')}`}
                  className="text-white font-semibold hover:text-yellow transition-colors block text-lg mb-3"
                >
                  {generalSettings.phone}
                </a>
                <Link
                  href="/contact?tab=urgent"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-md transition-colors w-full"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Formulaire d'urgence
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/formdetoit_logo.png"
                alt="Formdetoit - Artisan Couvreur Bas-Rhin"
                width={360}
                height={100}
                className="h-20 w-auto mb-4 filter brightness-0 invert"
              />
              <p className="text-slate-300 leading-relaxed text-sm">
                Artisan couvreur-zingueur dans le Bas-Rhin, spécialisé dans la couverture,
                l'isolation et l'étanchéité. Certifié RGE Qualibat.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {generalSettings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-yellow flex-shrink-0" />
                  <a
                    href={`tel:${generalSettings.phone.replace(/\s/g, '')}`}
                    className="text-sm hover:text-yellow transition-colors"
                  >
                    {generalSettings.phone}
                  </a>
                </div>
              )}

              {generalSettings.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-yellow flex-shrink-0" />
                  <a
                    href={`mailto:${generalSettings.email}`}
                    className="text-sm hover:text-yellow transition-colors"
                  >
                    {generalSettings.email}
                  </a>
                </div>
              )}

              {/* Social Media */}
              {(generalSettings.facebook || generalSettings.instagram || generalSettings.linkedin) && (
                <div className="flex items-center gap-3 pt-3">
                  {generalSettings.facebook && (
                    <a
                      href={generalSettings.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-800 hover:bg-yellow rounded-full flex items-center justify-center transition-all duration-300 group"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  {generalSettings.instagram && (
                    <a
                      href={generalSettings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-800 hover:bg-yellow rounded-full flex items-center justify-center transition-all duration-300 group"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  {generalSettings.linkedin && (
                    <a
                      href={generalSettings.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-800 hover:bg-yellow rounded-full flex items-center justify-center transition-all duration-300 group"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Nos services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-slate-300 hover:text-yellow transition-colors text-sm block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-6">L'entreprise</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-yellow transition-colors text-sm block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Ressources</h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-yellow transition-colors text-sm block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Urgences */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact</h3>
            <ul className="space-y-3">
              {contact.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-300 hover:text-yellow transition-colors text-sm flex items-center gap-2 group"
                    >
                      <Icon className="h-4 w-4 text-yellow/70 group-hover:text-yellow flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Urgences 24/7 */}
            {generalSettings.phone && (
              <div className="mt-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h4 className="font-semibold text-red-500 text-sm">Urgences 24/7</h4>
                </div>
                <a
                  href={`tel:${generalSettings.phone.replace(/\s/g, '')}`}
                  className="text-white font-semibold hover:text-yellow transition-colors block text-lg mb-3"
                >
                  {generalSettings.phone}
                </a>
                <Link
                  href="/contact?tab=urgent"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-md transition-colors w-full"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Formulaire d'urgence
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Certifications Section - Deuxième ligne */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-6">Nos labels et certifications</h3>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/qualibat.png"
                  alt="Qualibat"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/qualipv.jpg"
                  alt="QualiPV"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/reseau-entreprendre.jpg"
                  alt="Réseau Entreprendre"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/artisan.png"
                  alt="Artisan"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/velux-expert.webp"
                  alt="VELUX Expert"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/alsace.png"
                  alt="Marque Alsace"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-3 h-24 w-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Image
                  src="/certifications/logo_artisan_alsace.jpg"
                  alt="Artisan d'Alsace"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/nos-labels-certifications"
                className="inline-flex items-center gap-2 text-yellow hover:text-yellow/80 transition-colors font-medium"
              >
                En savoir plus sur toutes nos certifications
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              {legal.map((item, index) => (
                <span key={item.name} className="flex items-center gap-6">
                  <Link href={item.href} className="hover:text-yellow transition-colors">
                    {item.name}
                  </Link>
                  {index < legal.length - 1 && (
                    <span className="text-slate-500">•</span>
                  )}
                </span>
              ))}
            </div>

            <div className="text-sm text-slate-300">
              <span>© {currentYear} Formdetoit. Tous droits réservés.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;