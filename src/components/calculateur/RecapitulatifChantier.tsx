"use client";

import { ConfigurationChantier } from "@/lib/calculateur/types";
import { COUTS_CHANTIERS_COMPLETS, COUTS_VELUX } from "@/lib/calculateur/baremes-2025";
import { CheckCircle, Home, Ruler, Package, Wrench, Sun } from "lucide-react";

interface RecapitulatifChantierProps {
  configuration: ConfigurationChantier;
  coutTotalEstime: number;
}

export default function RecapitulatifChantier({
  configuration,
  coutTotalEstime,
}: RecapitulatifChantierProps) {
  const { typeProjet, surface, materiau, prixPersonnalise, nombreVelux, incluIsolation, incluEchafaudage } =
    configuration;

  // Récupérer les infos du matériau si défini
  const infoMateriau = materiau ? COUTS_CHANTIERS_COMPLETS[materiau] : null;

  // Calculer le coût des Velux si applicable
  const coutVelux = nombreVelux && nombreVelux > 0 ? nombreVelux * COUTS_VELUX.prixMoyen : 0;

  // Type de projet en français
  const typeProjetLabel = {
    'toiture-complete': 'Réfection complète de toiture',
    'isolation-seule': 'Isolation seule',
    'toiture-terrasse': 'Toiture terrasse',
  }[typeProjet];

  return (
    <div className="bg-gradient-to-br from-yellow/10 via-white to-gray-50 rounded-xl border-2 border-yellow/30 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center">
          <Home className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Récapitulatif de votre projet
          </h3>
          <p className="text-sm text-gray-600">{typeProjetLabel}</p>
        </div>
      </div>

      {/* Détails du chantier */}
      <div className="space-y-4">
        {/* Surface */}
        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
          <Ruler className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Surface</p>
            <p className="text-sm text-gray-600">{surface} m²</p>
          </div>
        </div>

        {/* Matériau */}
        {infoMateriau && (
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <Package className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Matériau de couverture</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">{infoMateriau.icone}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {infoMateriau.nom}
                  </p>
                  {prixPersonnalise && (
                    <p className="text-xs text-gray-500">
                      {prixPersonnalise} €/m²
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Velux */}
        {nombreVelux && nombreVelux > 0 && (
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <Sun className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Fenêtres de toit</p>
              <p className="text-sm text-gray-600">
                {nombreVelux} Velux {nombreVelux > 1 ? 'installés' : 'installé'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +{coutVelux.toLocaleString()} € estimés
              </p>
            </div>
          </div>
        )}

        {/* Prestations incluses */}
        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
          <Wrench className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-2">Prestations incluses</p>
            <div className="space-y-1">
              {incluIsolation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Isolation thermique (R≥6)</span>
                </div>
              )}
              {incluEchafaudage && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Échafaudage et sécurisation</span>
                </div>
              )}
              {typeProjet === 'toiture-complete' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Couverture complète</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coût total */}
      <div className="mt-6 pt-6 border-t-2 border-yellow/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Coût total estimé TTC</p>
            <p className="text-xs text-gray-500">
              Avant aides et déductions
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow">
              {coutTotalEstime.toLocaleString()} €
            </p>
            <p className="text-xs text-gray-500 mt-1">
              soit {Math.round(coutTotalEstime / surface)} €/m²
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
        <p className="font-semibold mb-1">ℹ️ Estimation indicative</p>
        <p>
          Ce montant est une estimation basée sur vos choix. Un devis gratuit et personnalisé
          vous sera proposé après visite technique.
        </p>
      </div>
    </div>
  );
}
