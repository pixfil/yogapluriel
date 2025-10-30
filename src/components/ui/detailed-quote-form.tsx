"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Target,
  Clock,
  Euro,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import {
  DetailedQuoteData,
  PROJECT_NATURE_LABELS,
  OBJECTIVE_LABELS,
  TIMELINE_LABELS,
  ATTIC_ACCESS_LABELS,
  AID_LABELS,
  BUDGET_RANGE_LABELS,
  DISCOVERY_SOURCE_LABELS,
  TILES_OPTIONS,
  INSULATION_OPTIONS,
  ZINGUERIE_OPTIONS,
  validateStep,
  saveDraft,
  loadDraft,
  clearDraft,
  ProjectNatureOption,
  ObjectiveOption,
  TimelineOption,
  AtticAccessOption,
  AidOption,
  BudgetRangeOption,
  DiscoverySourceOption
} from "@/lib/types/detailed-quote";

interface DetailedQuoteFormProps {
  onSubmit: (data: DetailedQuoteData) => Promise<void>;
  onCancel?: () => void;
}

export default function DetailedQuoteForm({ onSubmit, onCancel }: DetailedQuoteFormProps) {
  const [etape, setEtape] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { executeRecaptcha } = useRecaptcha();

  const [formData, setFormData] = useState<Partial<DetailedQuoteData>>({
    projectNature: [],
    existingTiles: '',
    existingInsulation: '',
    existingZinguerie: '',
    houseYear: 1960,
    carpentryYear: 1960,
    insulationYear: 1980,
    roofYear: 1980,
    objectives: [],
    desiredMaterials: '',
    materialsReason: '',
    specialRequests: '',
    timeline: '',
    atticAccess: '',
    regulatoryConstraints: false,
    constraintsDetails: '',
    requestedAids: [],
    needsAidSupport: false,
    budgetRange: '',
    discoverySource: '',
    discoverySourceOther: '',
    name: '',
    phone: '',
    email: '',
    propertyAddress: '',
    agreedPolicy: false
  });

  const totalEtapes = 6;

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && Object.keys(draft).length > 3) {
      setFormData(draft);
      setShowDraftNotice(true);
      setTimeout(() => setShowDraftNotice(false), 5000);
    }
  }, []);

  // Auto-save every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(formData).some(key => formData[key as keyof DetailedQuoteData])) {
        saveDraft(formData);
        setLastSaved(new Date());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleNext = () => {
    if (etape < totalEtapes) {
      setEtape(etape + 1);
    }
  };

  const handlePrevious = () => {
    if (etape > 1) setEtape(etape - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(6, formData)) return;

    setIsSubmitting(true);
    try {
      // Générer token reCAPTCHA
      const recaptchaToken = await executeRecaptcha("detailed_quote_form");

      // Ajouter le token aux données
      const dataWithToken = {
        ...formData,
        recaptchaToken,
      } as DetailedQuoteData & { recaptchaToken: string | null };

      await onSubmit(dataWithToken);
      clearDraft();
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof DetailedQuoteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof DetailedQuoteData, value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const canProceed = () => validateStep(etape, formData);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Draft Notice */}
      <AnimatePresence>
        {showDraftNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
          >
            <Save className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Brouillon restauré</p>
              <p className="text-xs text-blue-700">Vos réponses précédentes ont été rechargées.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">
            Étape {etape} sur {totalEtapes}
          </p>
          {lastSaved && (
            <p className="text-xs text-gray-500">
              Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
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
          {/* Étape 1: Nature du projet */}
          {etape === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Nature du projet</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Type de travaux envisagés (plusieurs choix possibles)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(PROJECT_NATURE_LABELS) as ProjectNatureOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArrayValue('projectNature', key)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.projectNature?.includes(key)
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                        formData.projectNature?.includes(key)
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                        {formData.projectNature?.includes(key) && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <span className="text-sm">{PROJECT_NATURE_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Type de tuiles en place
                </label>
                <select
                  value={formData.existingTiles || ''}
                  onChange={(e) => updateFormData('existingTiles', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                >
                  <option value="">Sélectionnez...</option>
                  {TILES_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Type d'isolation en place
                </label>
                <select
                  value={formData.existingInsulation || ''}
                  onChange={(e) => updateFormData('existingInsulation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                >
                  <option value="">Sélectionnez...</option>
                  {INSULATION_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Type de zinguerie en place
                </label>
                <select
                  value={formData.existingZinguerie || ''}
                  onChange={(e) => updateFormData('existingZinguerie', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                >
                  <option value="">Sélectionnez...</option>
                  {ZINGUERIE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Étape 2: Historique du bien */}
          {etape === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Historique du bien</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Année de construction de la maison
                  </label>
                  <input
                    type="number"
                    value={formData.houseYear || ''}
                    onChange={(e) => updateFormData('houseYear', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 1980"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Année de la charpente
                  </label>
                  <input
                    type="number"
                    value={formData.carpentryYear || ''}
                    onChange={(e) => updateFormData('carpentryYear', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 1980"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Année de l'isolation (0 si aucune)
                  </label>
                  <input
                    type="number"
                    value={formData.insulationYear || ''}
                    onChange={(e) => updateFormData('insulationYear', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 2000 ou 0"
                    min="0"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Année de la toiture
                  </label>
                  <input
                    type="number"
                    value={formData.roofYear || ''}
                    onChange={(e) => updateFormData('roofYear', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 1995"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                  />
                </div>
              </div>

              {formData.houseYear && (new Date().getFullYear() - formData.houseYear) >= 15 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Éligibilité MaPrimeRénov'
                    </p>
                    <p className="text-xs text-green-700">
                      Votre bien a plus de 15 ans, vous pourriez bénéficier des aides à la rénovation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Objectifs & Souhaits */}
          {etape === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Objectifs & Souhaits</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Objectifs attendus (plusieurs choix possibles)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(OBJECTIVE_LABELS) as ObjectiveOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArrayValue('objectives', key)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.objectives?.includes(key)
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                        formData.objectives?.includes(key)
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                        {formData.objectives?.includes(key) && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <span className="text-sm">{OBJECTIVE_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Souhaits en termes de matériaux ou solutions techniques (facultatif)
                </label>
                <textarea
                  value={formData.desiredMaterials || ''}
                  onChange={(e) => updateFormData('desiredMaterials', e.target.value)}
                  placeholder="Ex: Tuiles en terre cuite, isolation biosourcée (chanvre, laine de bois)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Pourquoi ces matériaux / solutions ? (facultatif)
                </label>
                <textarea
                  value={formData.materialsReason || ''}
                  onChange={(e) => updateFormData('materialsReason', e.target.value)}
                  placeholder="Ex: Recherche de matériaux écologiques, durabilité, esthétique..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Attentes et points particuliers à préciser (facultatif)
                </label>
                <textarea
                  value={formData.specialRequests || ''}
                  onChange={(e) => updateFormData('specialRequests', e.target.value)}
                  placeholder="Toutes vos attentes, contraintes ou demandes spécifiques..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Étape 4: Contraintes & Planning */}
          {etape === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Contraintes & Planning</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Dans quels délais souhaitez-vous réaliser les travaux ?
                </label>
                <div className="space-y-2">
                  {(Object.keys(TIMELINE_LABELS) as TimelineOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateFormData('timeline', key)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.timeline === key
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        formData.timeline === key
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                      </div>
                      <span className="text-sm">{TIMELINE_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Accès aux combles lors de la visite technique (R1)
                </label>
                <div className="space-y-2">
                  {(Object.keys(ATTIC_ACCESS_LABELS) as AtticAccessOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateFormData('atticAccess', key)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.atticAccess === key
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        formData.atticAccess === key
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                      </div>
                      <span className="text-sm">{ATTIC_ACCESS_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label htmlFor="abf" className="text-sm font-medium text-gray-700 flex-1">
                    Bâtiment classé ou soumis à l'Architecte des Bâtiments de France (ABF)
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData('regulatoryConstraints', !formData.regulatoryConstraints)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow focus:ring-offset-2",
                      formData.regulatoryConstraints ? "bg-yellow" : "bg-gray-300"
                    )}
                    role="switch"
                    aria-checked={formData.regulatoryConstraints || false}
                    aria-labelledby="abf"
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        formData.regulatoryConstraints ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {formData.regulatoryConstraints && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <textarea
                      value={formData.constraintsDetails || ''}
                      onChange={(e) => updateFormData('constraintsDetails', e.target.value)}
                      placeholder="Précisez les contraintes réglementaires ou techniques..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Étape 5: Budget & Aides */}
          {etape === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Euro className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Budget & Aides financières</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Aides financières sollicitées (plusieurs choix possibles)
                </label>
                <div className="space-y-2">
                  {(Object.keys(AID_LABELS) as AidOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArrayValue('requestedAids', key)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.requestedAids?.includes(key)
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                        formData.requestedAids?.includes(key)
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                        {formData.requestedAids?.includes(key) && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <span className="text-sm">{AID_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateFormData('needsAidSupport', !formData.needsAidSupport)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
                    formData.needsAidSupport ? "bg-yellow" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
                    formData.needsAidSupport ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
                <label
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => updateFormData('needsAidSupport', !formData.needsAidSupport)}
                >
                  Je souhaite être accompagné(e) dans le montage de mon dossier d'aides financières
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Fourchette budgétaire envisagée
                </label>
                <div className="space-y-2">
                  {(Object.keys(BUDGET_RANGE_LABELS) as BudgetRangeOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateFormData('budgetRange', key)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.budgetRange === key
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        formData.budgetRange === key
                          ? "border-yellow bg-yellow"
                          : "border-gray-300"
                      )}>
                      </div>
                      <span className="text-sm">{BUDGET_RANGE_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 6: Découverte & Coordonnées */}
          {etape === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-8 h-8 text-yellow" />
                <h3 className="text-2xl font-bold">Découverte & Coordonnées</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Comment avez-vous connu Formdetoit ?
                </label>
                <div className="space-y-2">
                  {(Object.keys(DISCOVERY_SOURCE_LABELS) as DiscoverySourceOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateFormData('discoverySource', key)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                        formData.discoverySource === key
                          ? "border-yellow bg-yellow/10"
                          : "border-gray-200 hover:border-yellow/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        formData.discoverySource === key
                          ? "border-yellow"
                          : "border-gray-300"
                      )}>
                        {formData.discoverySource === key && (
                          <div className="w-2.5 h-2.5 bg-yellow rounded-full" />
                        )}
                      </div>
                      <span className="text-sm">{DISCOVERY_SOURCE_LABELS[key]}</span>
                    </button>
                  ))}
                </div>

                {formData.discoverySource === 'autre' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      value={formData.discoverySourceOther || ''}
                      onChange={(e) => updateFormData('discoverySourceOther', e.target.value)}
                      placeholder="Précisez..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                    />
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Nom et prénom"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="votre@email.fr"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresse du bien (pour devis précis et déplacement)
                </label>
                <textarea
                  value={formData.propertyAddress || ''}
                  onChange={(e) => updateFormData('propertyAddress', e.target.value)}
                  placeholder="Adresse complète du chantier..."
                  rows={2}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-colors outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateFormData('agreedPolicy', !formData.agreedPolicy)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
                    formData.agreedPolicy ? "bg-yellow" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
                    formData.agreedPolicy ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
                <label
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => updateFormData('agreedPolicy', !formData.agreedPolicy)}
                >
                  J'accepte la{" "}
                  <a href="/politique-confidentialite" className="text-yellow hover:underline" target="_blank" onClick={(e) => e.stopPropagation()}>
                    politique de confidentialité
                  </a>
                  {" "}et autorise Formdetoit à me contacter concernant ma demande.
                </label>
              </div>

              {!canProceed() && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    Veuillez remplir tous les champs obligatoires et accepter la politique de confidentialité.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {etape > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all text-gray-700 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
            ) : (
              onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all text-gray-500 hover:bg-gray-100"
                >
                  Annuler
                </button>
              )
            )}

            {etape < totalEtapes ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ml-auto",
                  canProceed()
                    ? "bg-yellow hover:bg-yellow/90 text-black"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ml-auto",
                  canProceed() && !isSubmitting
                    ? "bg-yellow hover:bg-yellow/90 text-black"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer la demande
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
