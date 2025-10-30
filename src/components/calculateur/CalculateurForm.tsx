"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormulaireData, TypeTravaux } from "@/lib/calculateur/types";
import {
  Home,
  Users,
  Euro,
  Calendar,
  Wrench,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculateurFormProps {
  onSubmit: (data: FormulaireData) => void;
}

export default function CalculateurForm({ onSubmit }: CalculateurFormProps) {
  const [etape, setEtape] = useState(1);
  const [formData, setFormData] = useState<FormulaireData>({
    typeLogement: 'maison',
    region: 'autre',
    nombrePersonnes: 1,
    revenuFiscal: 0,
    anciennete: 15,
    travauxSelectionnes: [],
    residencePrincipale: true,
  });

  // Nouveau : type de projet principal (choix unique)
  const [typeProjetPrincipal, setTypeProjetPrincipal] = useState<TypeTravaux | null>(null);
  // Nouveau : ajout Velux optionnel
  const [ajouterVelux, setAjouterVelux] = useState(false);

  const totalEtapes = 6;

  const handleNext = () => {
    if (etape < totalEtapes) {
      setEtape(etape + 1);
    } else {
      // Construire le tableau travauxSelectionnes à partir des choix
      const travaux: TypeTravaux[] = [];
      if (typeProjetPrincipal) {
        travaux.push(typeProjetPrincipal);
      }
      if (ajouterVelux) {
        travaux.push('fenetre-toit');
      }

      const dataToSubmit = {
        ...formData,
        travauxSelectionnes: travaux,
      };
      onSubmit(dataToSubmit);
    }
  };

  const handlePrevious = () => {
    if (etape > 1) setEtape(etape - 1);
  };

  const updateFormData = (field: keyof FormulaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTravaux = (travail: TypeTravaux) => {
    setFormData(prev => {
      const current = prev.travauxSelectionnes;
      if (current.includes(travail)) {
        return { ...prev, travauxSelectionnes: current.filter(t => t !== travail) };
      } else {
        return { ...prev, travauxSelectionnes: [...current, travail] };
      }
    });
  };

  const canProceed = () => {
    switch (etape) {
      case 1: return formData.typeLogement && formData.region;
      case 2: return formData.nombrePersonnes > 0;
      case 3: return formData.revenuFiscal >= 0;
      case 4: return formData.anciennete >= 0;
      case 5: return typeProjetPrincipal !== null; // Au moins un type de projet choisi
      case 6: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[...Array(totalEtapes)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all",
                i + 1 < etape
                  ? "bg-yellow text-black"
                  : i + 1 === etape
                  ? "bg-yellow text-black ring-4 ring-yellow/30"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {i + 1 < etape ? <Check className="w-5 h-5" /> : i + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow"
            initial={{ width: 0 }}
            animate={{ width: `${(etape / totalEtapes) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Étape {etape} sur {totalEtapes}
        </p>
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={etape}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
        >
          {/* Étape 1: Type de logement et région */}
          {etape === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Votre logement</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Type de logement</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'maison', label: 'Maison' },
                    { value: 'appartement', label: 'Appartement' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('typeLogement', option.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        formData.typeLogement === option.value
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Localisation</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'ile-de-france', label: 'Île-de-France' },
                    { value: 'autre', label: 'Autre région' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('region', option.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        formData.region === option.value
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="residence"
                  checked={formData.residencePrincipale}
                  onChange={(e) => updateFormData('residencePrincipale', e.target.checked)}
                  className="mt-1 w-4 h-4 text-yellow border-gray-300 rounded focus:ring-yellow"
                />
                <label htmlFor="residence" className="text-sm text-gray-700">
                  Il s'agit de ma résidence principale (obligatoire pour MaPrimeRénov')
                </label>
              </div>
            </div>
          )}

          {/* Étape 2: Composition du foyer */}
          {etape === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Composition du foyer</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Nombre de personnes dans le foyer
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((nb) => (
                    <button
                      key={nb}
                      type="button"
                      onClick={() => updateFormData('nombrePersonnes', nb)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all font-semibold",
                        formData.nombrePersonnes === nb
                          ? "border-yellow bg-yellow text-black"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      {nb === 5 ? '5+' : nb}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                Le nombre de personnes composant le foyer fiscal est indiqué sur votre dernier avis d'imposition.
              </p>
            </div>
          )}

          {/* Étape 3: Revenus */}
          {etape === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Euro className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Vos revenus</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Revenu Fiscal de Référence (RFR)
                </label>
                <input
                  type="number"
                  value={formData.revenuFiscal || ''}
                  onChange={(e) => updateFormData('revenuFiscal', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 25000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-lg"
                />
                <p className="text-sm text-gray-600 mt-2">€ par an</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Où trouver mon RFR ?
                </p>
                <p className="text-sm text-gray-700">
                  Votre Revenu Fiscal de Référence se trouve sur votre dernier avis d'imposition,
                  en première page, dans le cadre "Vos références".
                </p>
              </div>
            </div>
          )}

          {/* Étape 4: Ancienneté */}
          {etape === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Ancienneté du logement</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Âge du logement (en années)
                </label>
                <input
                  type="number"
                  value={formData.anciennete || ''}
                  onChange={(e) => updateFormData('anciennete', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 20"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-lg"
                />
                <p className="text-sm text-gray-600 mt-2">années</p>
              </div>

              <div className={cn(
                "p-4 rounded-lg",
                formData.anciennete >= 15 ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
              )}>
                {formData.anciennete >= 15 ? (
                  <p className="text-sm text-green-800">
                    ✓ Votre logement est éligible à MaPrimeRénov' (plus de 15 ans)
                  </p>
                ) : (
                  <p className="text-sm text-orange-800">
                    ⚠ Votre logement doit avoir au moins 15 ans pour être éligible à MaPrimeRénov'
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Étape 5: Type de travaux */}
          {etape === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Wrench className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Type de projet</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Quel type de travaux souhaitez-vous réaliser ?
                </label>
                <div className="space-y-3">
                  {[
                    {
                      value: 'isolation-rampants' as TypeTravaux,
                      label: 'Toiture en pente (couverture + isolation)',
                      aide: '25 €/m²',
                      icon: '🏠'
                    },
                    {
                      value: 'isolation-combles' as TypeTravaux,
                      label: 'Isolation rampants seule',
                      aide: '25 €/m²',
                      icon: '🔧'
                    },
                    {
                      value: 'isolation-toiture-terrasse' as TypeTravaux,
                      label: 'Toiture terrasse (EPDM + isolation)',
                      aide: '75 €/m² ⭐',
                      icon: '🏢'
                    },
                    {
                      value: 'fenetre-toit' as TypeTravaux,
                      label: 'Velux seul (remplacement)',
                      aide: '100 €/fenêtre',
                      icon: '🪟'
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTypeProjetPrincipal(option.value)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        typeProjetPrincipal === option.value
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        typeProjetPrincipal === option.value
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                        {typeProjetPrincipal === option.value && (
                          <div className="w-3 h-3 rounded-full bg-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Aide MaPrimeRénov' : {option.aide}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option Velux supplémentaire */}
              {typeProjetPrincipal && typeProjetPrincipal !== 'fenetre-toit' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ajouterVelux}
                      onChange={(e) => setAjouterVelux(e.target.checked)}
                      className="mt-1 w-5 h-5 text-yellow border-gray-300 rounded focus:ring-yellow"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Ajouter des fenêtres de toit (Velux)
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Aide supplémentaire : 100 € par fenêtre
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {!typeProjetPrincipal && (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  Sélectionnez un type de projet
                </p>
              )}
            </div>
          )}

          {/* Étape 6: Surface et nombre de fenêtres */}
          {etape === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Wrench className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Détails des travaux</h3>
              </div>

              {/* Affichage conditionnel de la surface selon le type de projet */}
              {typeProjetPrincipal &&
                ['isolation-rampants', 'isolation-combles', 'isolation-toiture-terrasse'].includes(typeProjetPrincipal) && (
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Surface à {typeProjetPrincipal === 'isolation-toiture-terrasse' ? 'traiter' : 'isoler'} (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.surface || ''}
                    onChange={(e) => updateFormData('surface', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 100"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {typeProjetPrincipal === 'isolation-rampants' && '🏠 Surface de toiture en pente'}
                    {typeProjetPrincipal === 'isolation-combles' && '🔧 Surface des rampants à isoler'}
                    {typeProjetPrincipal === 'isolation-toiture-terrasse' && '🏢 Surface de toiture terrasse'}
                  </p>
                </div>
              )}

              {/* Affichage conditionnel du nombre de fenêtres */}
              {(typeProjetPrincipal === 'fenetre-toit' || ajouterVelux) && (
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Nombre de fenêtres de toit (Velux)
                  </label>
                  <input
                    type="number"
                    value={formData.nombreFenetres || ''}
                    onChange={(e) => updateFormData('nombreFenetres', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 2"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none text-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    🪟 Nombre de fenêtres à installer ou remplacer
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Ces informations permettent de calculer avec précision le montant des aides auxquelles vous pouvez prétendre.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={etape === 1}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                etape === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                canProceed()
                  ? "bg-yellow hover:bg-yellow/90 text-black"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {etape === totalEtapes ? 'Calculer mes aides' : 'Suivant'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}