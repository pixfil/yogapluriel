"use client";

import { useState } from "react";
import { Metadata } from "next";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import CalculateurForm from "@/components/calculateur/CalculateurForm";
import ResultatAides from "@/components/calculateur/ResultatAides";
import { FormulaireData, ResultatCalcul } from "@/lib/calculateur/types";
import { calculerAides } from "@/lib/calculateur/calcul-aides";
import { Calculator, TrendingUp, Shield, CheckCircle, Info } from "lucide-react";

export default function CalculateurAidesPage() {
  const [resultat, setResultat] = useState<ResultatCalcul | null>(null);
  const [surfaceSaisie, setSurfaceSaisie] = useState<number>(100);

  const handleSubmit = (data: FormulaireData) => {
    const calcul = calculerAides(data);
    setResultat(calcul);
    // Sauvegarder la surface saisie (ou estimer à 100m² par défaut)
    setSurfaceSaisie(data.surface || 100);
    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResultat(null);
  };

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Calculateur d'Aides"
        subtitle="Estimez vos aides MaPrimeRénov' 2025 en quelques clics"
        backgroundImage="/background/bg-calculateur.webp"
      />

      {/* Introduction */}
      {!resultat && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Calculez gratuitement vos <span className="text-yellow">aides à la rénovation</span>
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Découvrez en quelques minutes le montant des aides financières auxquelles vous avez droit
                  pour vos travaux d'isolation et de couverture.
                </p>
              </div>
            </AnimatedSection>

            {/* Benefits */}
            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-yellow" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Calcul précis</h3>
                  <p className="text-gray-600 text-sm">
                    Basé sur les barèmes officiels MaPrimeRénov' 2025
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-yellow" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Toutes les aides</h3>
                  <p className="text-gray-600 text-sm">
                    MaPrimeRénov', CEE, TVA réduite, Éco-PTZ
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-yellow" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Artisan RGE</h3>
                  <p className="text-gray-600 text-sm">
                    Formdetoit certifié pour garantir vos aides
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Formulaire ou Résultats */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            {resultat ? (
              <ResultatAides resultat={resultat} onReset={handleReset} surface={surfaceSaisie} />
            ) : (
              <CalculateurForm onSubmit={handleSubmit} />
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Section informative */}
      {!resultat && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">
                  Pourquoi utiliser notre calculateur ?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Barèmes 2025 à jour</h3>
                        <p className="text-sm text-gray-600">
                          Notre calculateur intègre les derniers plafonds de revenus et montants d'aides officiels 2025.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Calcul personnalisé</h3>
                        <p className="text-sm text-gray-600">
                          Estimation précise selon votre situation, votre région et vos travaux envisagés.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Accompagnement expert</h3>
                        <p className="text-sm text-gray-600">
                          Formdetoit vous accompagne dans le montage de votre dossier d'aides.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-yellow flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Certification RGE Qualibat</h3>
                        <p className="text-sm text-gray-600">
                          Condition indispensable pour bénéficier de MaPrimeRénov' et des CEE.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-8 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <Info className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Outil de simulation gratuit</h3>
                      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                        <p>
                          Ce calculateur est proposé gratuitement par Formdetoit pour vous aider à estimer vos aides
                          MaPrimeRénov' 2025. Les montants affichés sont basés sur les barèmes officiels de la Fédération
                          Française du Bâtiment (FFB) version n°2 du 30 septembre 2025.
                        </p>
                        <p>
                          <strong>Résultats indicatifs et non contractuels :</strong> Les estimations fournies ne constituent
                          pas un engagement de notre part. Le montant définitif de vos aides sera déterminé lors du dépôt
                          officiel de votre dossier auprès de l'ANAH et des organismes compétents.
                        </p>
                        <p>
                          <strong>Législation susceptible d'évoluer :</strong> Les barèmes et conditions peuvent être
                          modifiés à tout moment par l'État. <a href="/nos-prestations/isolation/ma-prime-renov" className="text-yellow hover:underline font-semibold">Consultez notre guide MaPrimeRénov' 2025</a> pour
                          plus de détails ou <a href="/contact" className="text-yellow hover:underline font-semibold">contactez-nous</a> pour
                          un audit gratuit et une simulation personnalisée.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}
    </>
  );
}