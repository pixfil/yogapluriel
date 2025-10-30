import { Metadata } from "next";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import { Shield, Lock, Eye, UserX, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Formdetoit | Protection des données",
  description: "Politique de confidentialité et protection des données personnelles de Formdetoit. Découvrez comment nous collectons, utilisons et protégeons vos informations.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Politique de Confidentialité"
        subtitle="Protection de vos données personnelles"
      />

      {/* Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Introduction */}
          <AnimatedSection>
            <div className="bg-yellow/10 border-l-4 border-yellow p-6 rounded-lg mb-12">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-yellow flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Votre vie privée est importante</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Chez Formdetoit, nous prenons la protection de vos données personnelles très au sérieux.
                    Cette politique de confidentialité vous explique comment nous collectons, utilisons et
                    protégeons vos informations conformément au RGPD.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="prose prose-lg mx-auto">

            <AnimatedSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-0">1. Données collectées</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Lorsque vous utilisez notre site web ou nos services, nous pouvons collecter les données suivantes :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Données d'identification :</strong> Nom, prénom</li>
                <li><strong>Coordonnées :</strong> Adresse email, numéro de téléphone, adresse postale</li>
                <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées</li>
                <li><strong>Données de projet :</strong> Informations relatives à votre demande de devis ou projet de toiture</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-0">2. Utilisation des données</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons vos données personnelles uniquement dans les buts suivants :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>Répondre à vos demandes de contact et devis</li>
                <li>Gérer et suivre votre projet de toiture</li>
                <li>Vous envoyer des informations sur nos services (avec votre consentement)</li>
                <li>Améliorer notre site web et nos services</li>
                <li>Respecter nos obligations légales et réglementaires</li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-700 mb-0">
                  <strong>Important :</strong> Nous ne vendons jamais vos données à des tiers et ne les utilisons
                  jamais à des fins commerciales sans votre consentement explicite.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">3. Base légale du traitement</h2>
              <p className="text-gray-700 leading-relaxed">
                Le traitement de vos données personnelles repose sur les bases légales suivantes :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Exécution d'un contrat :</strong> Pour répondre à vos demandes de devis et réaliser vos projets</li>
                <li><strong>Intérêt légitime :</strong> Pour améliorer nos services et notre site web</li>
                <li><strong>Consentement :</strong> Pour l'envoi de communications marketing (opt-in)</li>
                <li><strong>Obligations légales :</strong> Pour respecter nos obligations fiscales et comptables</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Conservation des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités
                pour lesquelles elles ont été collectées :
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-700 mb-0">
                  <li><strong>Demandes de devis :</strong> 3 ans maximum après le dernier contact</li>
                  <li><strong>Projets réalisés :</strong> 10 ans (durée de la garantie décennale)</li>
                  <li><strong>Données de navigation :</strong> 13 mois maximum</li>
                  <li><strong>Documents comptables :</strong> 10 ans (obligation légale)</li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <UserX className="w-5 h-5 text-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-0">5. Vos droits</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-yellow/5 p-4 rounded-lg border border-yellow/20">
                  <h4 className="font-bold text-gray-900 mb-2">Droit d'accès</h4>
                  <p className="text-sm text-gray-700 mb-0">Obtenir une copie de vos données</p>
                </div>
                <div className="bg-yellow/5 p-4 rounded-lg border border-yellow/20">
                  <h4 className="font-bold text-gray-900 mb-2">Droit de rectification</h4>
                  <p className="text-sm text-gray-700 mb-0">Corriger vos données inexactes</p>
                </div>
                <div className="bg-yellow/5 p-4 rounded-lg border border-yellow/20">
                  <h4 className="font-bold text-gray-900 mb-2">Droit à l'effacement</h4>
                  <p className="text-sm text-gray-700 mb-0">Supprimer vos données</p>
                </div>
                <div className="bg-yellow/5 p-4 rounded-lg border border-yellow/20">
                  <h4 className="font-bold text-gray-900 mb-2">Droit d'opposition</h4>
                  <p className="text-sm text-gray-700 mb-0">Vous opposer au traitement</p>
                </div>
                <div className="bg-yellow/5 p-4 rounded-lg border border-yellow/20">
                  <h4 className="font-bold text-gray-900 mb-2">Droit à la portabilité</h4>
                  <p className="text-sm text-gray-700 mb-0">Récupérer vos données</p>
                </div>
                <div className="bg-yellow/5 p-4 rounded-lg border border-yellow/20">
                  <h4 className="font-bold text-gray-900 mb-2">Droit de limitation</h4>
                  <p className="text-sm text-gray-700 mb-0">Limiter le traitement</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">6. Sécurité des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées
                pour protéger vos données personnelles contre :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>La destruction accidentelle ou illicite</li>
                <li>La perte, l'altération ou la divulgation non autorisée</li>
                <li>L'accès non autorisé ou toute autre forme de traitement illicite</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Notre site utilise le protocole HTTPS pour sécuriser les échanges de données et nous stockons
                vos informations sur des serveurs sécurisés.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">7. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Nous utilisons :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                <li><strong>Cookies analytiques :</strong> Pour comprendre comment vous utilisez notre site (avec votre consentement)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Vous pouvez à tout moment désactiver les cookies non essentiels via les paramètres de votre navigateur.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">8. Partage des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous ne partageons vos données personnelles qu'avec :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Prestataires de services :</strong> Hébergement web (Vercel), email, etc.</li>
                <li><strong>Autorités compétentes :</strong> Si requis par la loi</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Tous nos prestataires sont tenus de respecter la confidentialité de vos données et de les
                utiliser uniquement conformément à nos instructions.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-0">9. Exercer vos droits</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Pour exercer vos droits ou pour toute question concernant le traitement de vos données personnelles,
                vous pouvez nous contacter :
              </p>
              <div className="bg-yellow/10 p-6 rounded-lg mt-4">
                <p className="text-gray-900 mb-2"><strong>Par email :</strong></p>
                <p className="text-lg text-gray-900 mb-4">
                  <a href="mailto:contact@formdetoit.fr" className="text-yellow hover:underline">
                    contact@formdetoit.fr
                  </a>
                </p>
                <p className="text-gray-900 mb-2"><strong>Par courrier :</strong></p>
                <p className="text-gray-900 mb-0">
                  Formdetoit<br />
                  4 rue Bernard Stalter<br />
                  67114 Eschau
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-4 mb-0">
                Nous nous engageons à répondre à votre demande dans un délai maximum d'un mois.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">10. Réclamation</h2>
              <p className="text-gray-700 leading-relaxed">
                Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD,
                vous avez le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de
                l'Informatique et des Libertés) :
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-gray-900 mb-0">
                  CNIL<br />
                  3 Place de Fontenoy<br />
                  TSA 80715<br />
                  75334 Paris Cedex 07<br />
                  Tél. : 01 53 73 22 22<br />
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-yellow hover:underline">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">11. Modifications</h2>
              <p className="text-gray-700 leading-relaxed mb-0">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                Toute modification sera publiée sur cette page avec une date de mise à jour.
              </p>
            </AnimatedSection>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-0">
                <strong>Dernière mise à jour :</strong> Janvier 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}