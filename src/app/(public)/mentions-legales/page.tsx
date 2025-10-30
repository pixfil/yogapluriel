import { Metadata } from "next";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales - Formdetoit | Artisan Couvreur Bas-Rhin",
  description: "Mentions légales de Formdetoit, artisan couvreur-zingueur dans le Bas-Rhin. Informations légales et réglementaires de l'entreprise.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      {/* Hero Section */}
      <PageHero 
        title="Mentions Légales"
        subtitle="Informations légales et réglementaires"
      />

      {/* Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg mx-auto">
            
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">1. Informations sur l'entreprise</h2>
              <div className="bg-slate-50 p-6 rounded-lg mb-8">
                <p><strong>Dénomination sociale :</strong> Formdetoit</p>
                <p><strong>Forme juridique :</strong> Entreprise individuelle</p>
                <p><strong>Adresse du siège social :</strong> 4 rue Bernard Stalter, 67114 Eschau</p>
                <p><strong>SIRET :</strong> [Numéro SIRET à compléter]</p>
                <p><strong>Code APE :</strong> 4391A - Travaux de charpente</p>
                <p><strong>TVA Intracommunautaire :</strong> [Numéro TVA à compléter]</p>
                <p><strong>Téléphone :</strong> 03 88 75 66 53</p>
                <p><strong>Email :</strong> contact@formdetoit.fr</p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">2. Directeur de publication</h2>
              <p>Le directeur de publication du site formdetoit.fr est Maryan LHUILLIER, gérant de Formdetoit.</p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">3. Hébergement</h2>
              <p>Le site formdetoit.fr est hébergé par :</p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p>Vercel Inc.<br />
                440 N Barranca Ave #4133<br />
                Covina, CA 91723, USA</p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Propriété intellectuelle</h2>
              <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
              <p>La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">5. Protection des données personnelles</h2>
              <p>Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.</p>
              <p>Les informations recueillies via nos formulaires de contact sont utilisées uniquement pour répondre à vos demandes et ne sont jamais communiquées à des tiers.</p>
              <p>Pour exercer vos droits, contactez-nous à : contact@formdetoit.fr</p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">6. Responsabilité</h2>
              <p>Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.</p>
              <p>Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, à l'adresse contact@formdetoit.fr, en décrivant le problème de la façon la plus précise possible.</p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">7. Liens hypertextes</h2>
              <p>Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de Formdetoit.</p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">8. Droit applicable</h2>
              <p>Tant le présent site que les modalités et conditions de son utilisation sont régies par le droit français, quel que soit le lieu d'utilisation. En cas de contestation éventuelle, et après l'échec de toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents pour connaître de ce litige.</p>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">9. Assurances professionnelles</h2>
              <div className="bg-yellow/10 p-6 rounded-lg">
                <p><strong>Assurance Responsabilité Civile Professionnelle :</strong><br />
                [Nom de la compagnie d'assurance]<br />
                Police n° [Numéro de police]<br />
                Validité : [Dates de validité]</p>
                
                <p className="mt-4"><strong>Assurance Décennale :</strong><br />
                [Nom de la compagnie d'assurance]<br />
                Police n° [Numéro de police]<br />
                Validité : [Dates de validité]</p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">10. Qualifications professionnelles</h2>
              <ul>
                <li>Qualification Qualibat RGE (Reconnu Garant de l'Environnement)</li>
                <li>Artisan formé aux Compagnons du Devoir</li>
                <li>Certification [autres certifications le cas échéant]</li>
              </ul>
            </AnimatedSection>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                <strong>Dernière mise à jour :</strong> Janvier 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}