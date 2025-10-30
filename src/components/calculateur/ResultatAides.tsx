"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ResultatCalcul } from "@/lib/calculateur/types";
import { MESSAGES } from "@/lib/calculateur/baremes-2025";
import {
  CheckCircle,
  Euro,
  TrendingDown,
  FileText,
  Phone,
  Download,
  Info,
  AlertCircle
} from "lucide-react";
import CTAButton from "@/components/ui/cta-button";
import CurseurBudget from "./CurseurBudget";

interface ResultatAidesProps {
  resultat: ResultatCalcul;
  onReset: () => void;
  surface?: number;
}

export default function ResultatAides({ resultat, onReset, surface = 100 }: ResultatAidesProps) {
  const [coutAjuste, setCoutAjuste] = useState(resultat.coutEstime);

  if (!resultat.eligible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Non éligible</h3>
          <div className="space-y-2 mb-6">
            {resultat.recommandations.map((rec, index) => (
              <p key={index} className="text-gray-700">{rec}</p>
            ))}
          </div>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-yellow hover:bg-yellow/90 text-black font-semibold rounded-lg transition-all"
          >
            Refaire une simulation
          </button>
        </div>
      </motion.div>
    );
  }

  const categorie = MESSAGES[resultat.categorieRevenu];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header - Catégorie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
        style={{ borderTop: `4px solid ${categorie.color}` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${categorie.color}20` }}
          >
            <CheckCircle className="w-6 h-6" style={{ color: categorie.color }} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{categorie.titre}</h3>
            <p className="text-gray-600">{categorie.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Résumé financier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total aides */}
        <div className="bg-gradient-to-br from-yellow to-yellow/80 rounded-2xl p-6 text-black shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5" />
            <p className="font-medium">Total des aides</p>
          </div>
          <p className="text-4xl font-bold">{resultat.aides.total.toLocaleString('fr-FR')} €</p>
          <p className="text-sm mt-2 opacity-90">
            {resultat.aides.pourcentageCouverture}% de prise en charge
          </p>
        </div>

        {/* Coût estimé */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <p className="font-medium text-gray-700">Coût des travaux</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {resultat.coutEstime.toLocaleString('fr-FR')} €
          </p>
          <p className="text-sm text-gray-600 mt-2">Estimation TTC</p>
        </div>

        {/* Reste à charge */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <p className="font-medium text-gray-700">Reste à charge</p>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {resultat.resteACharge.toLocaleString('fr-FR')} €
          </p>
          <p className="text-sm text-gray-600 mt-2">Après aides</p>
        </div>
      </motion.div>

      {/* Détails des aides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
      >
        <h3 className="text-2xl font-bold mb-6">Détail des aides</h3>
        <div className="space-y-4">
          {resultat.detailsAides.map((aide, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{aide.type}</p>
                <p className="text-sm text-gray-600">{aide.description}</p>
              </div>
              <p className="text-2xl font-bold text-yellow ml-4">
                {aide.montant.toLocaleString('fr-FR')} €
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Curseur de budget - NOUVEAU */}
      {resultat.coutEstime > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CurseurBudget
            surface={surface}
            aidesFixes={resultat.aides.maprimerenov + resultat.aides.cee}
            onChangeCout={setCoutAjuste}
          />
        </motion.div>
      )}

      {/* Informations complémentaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Éco-PTZ */}
        {resultat.eligibleEcoPTZ && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Éligible à l'Éco-PTZ</h4>
                <p className="text-sm text-gray-700">
                  Financez le reste à charge sans intérêts jusqu'à 50 000 € sur 20 ans.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TVA réduite */}
        {resultat.eligibleTVAReduite && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">TVA réduite à 5,5%</h4>
                <p className="text-sm text-gray-700">
                  Bénéficiez automatiquement du taux de TVA réduit pour vos travaux.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recommandations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-yellow" />
          <h3 className="text-xl font-bold">Recommandations</h3>
        </div>
        <ul className="space-y-3">
          {resultat.recommandations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* CTA Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white"
      >
        <h3 className="text-2xl font-bold mb-4 text-center">
          Concrétisez votre projet avec Formdetoit
        </h3>
        <p className="text-center text-gray-300 mb-6 max-w-2xl mx-auto">
          Artisan certifié RGE Qualibat, nous vous accompagnons dans vos démarches
          et garantissons votre éligibilité aux aides.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <CTAButton size="lg" glow href="/contact" className="w-full sm:w-auto">
            <Phone className="w-5 h-5" />
            Demander un devis gratuit
          </CTAButton>

          <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all border border-white/20"
          >
            Nouvelle simulation
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Les montants affichés sont des estimations basées sur les barèmes 2025.
          Le montant final sera confirmé lors de l'étude de votre dossier.
        </p>
      </motion.div>
    </div>
  );
}