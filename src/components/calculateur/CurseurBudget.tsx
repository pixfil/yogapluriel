"use client";

import { useState, useEffect } from "react";
import { Euro, Info } from "lucide-react";

interface CurseurBudgetProps {
  surface: number;
  aidesFixes: number;        // MPR + CEE (fixes, ne changent pas)
  onChangeCout: (nouveauCout: number) => void;
}

export default function CurseurBudget({
  surface,
  aidesFixes,
  onChangeCout,
}: CurseurBudgetProps) {
  // Fourchette de prix : 250-700 €/m²
  const prixMinM2 = 250;
  const prixMaxM2 = 700;
  const prixMoyenM2 = 350;

  const coutMin = Math.round(surface * prixMinM2);
  const coutMax = Math.round(surface * prixMaxM2);
  const coutMoyen = Math.round(surface * prixMoyenM2);

  const [coutSelectionne, setCoutSelectionne] = useState(coutMoyen);

  useEffect(() => {
    onChangeCout(coutSelectionne);
  }, [coutSelectionne, onChangeCout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nouveauCout = parseInt(e.target.value);
    setCoutSelectionne(nouveauCout);
  };

  const prixAuM2 = Math.round(coutSelectionne / surface);

  // Calcul de l'économie de TVA (dynamique selon le coût)
  // TVA normale 20% - TVA réduite 5.5% = 14.5% d'économie
  const economieTVA = Math.round(coutSelectionne * 0.145);

  // Total des aides = aides fixes (MPR + CEE) + économie TVA
  const totalAides = aidesFixes + economieTVA;

  const resteACharge = Math.max(0, coutSelectionne - totalAides);
  const pourcentageCouverture = coutSelectionne > 0
    ? Math.min(100, Math.round((totalAides / coutSelectionne) * 100))
    : 0;

  const percentagePosition = ((coutSelectionne - coutMin) / (coutMax - coutMin)) * 100;

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center">
          <Euro className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Estimez le coût de votre projet
          </h3>
          <p className="text-sm text-gray-600">
            Ajustez le curseur pour voir l'impact sur votre reste à charge
          </p>
        </div>
      </div>

      {/* Curseur */}
      <div className="space-y-4">
        <div className="relative pt-1">
          <input
            type="range"
            min={coutMin}
            max={coutMax}
            step={1000}
            value={coutSelectionne}
            onChange={handleChange}
            className="
              w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-yellow
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-6
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-yellow
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-lg
            "
            style={{
              background: `linear-gradient(to right, #FFB81C 0%, #FFB81C ${percentagePosition}%, #E5E7EB ${percentagePosition}%, #E5E7EB 100%)`,
            }}
          />

          {/* Valeur au-dessus du curseur */}
          <div
            className="absolute top-[-40px] transform -translate-x-1/2 transition-all duration-200"
            style={{ left: `${percentagePosition}%` }}
          >
            <div className="bg-yellow text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
              {coutSelectionne.toLocaleString()} €
            </div>
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-yellow mx-auto"></div>
          </div>
        </div>

        {/* Labels min/max */}
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>{coutMin.toLocaleString()} €</span>
          <span className="text-gray-400">{prixAuM2} €/m²</span>
          <span>{coutMax.toLocaleString()} €</span>
        </div>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Aides totales</p>
          <p className="text-lg font-bold text-green-600">
            {totalAides.toLocaleString()} €
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            MPR+CEE: {aidesFixes.toLocaleString()} €<br/>
            TVA: {economieTVA.toLocaleString()} €
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Coût total estimé</p>
          <p className="text-lg font-bold text-gray-900">
            {coutSelectionne.toLocaleString()} €
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {prixAuM2} €/m²
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Reste à charge</p>
          <p className="text-lg font-bold text-yellow">
            {resteACharge.toLocaleString()} €
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Après aides
          </p>
        </div>
      </div>

      {/* Message informatif */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-2">Le coût varie selon :</p>
          <ul className="space-y-1 text-xs">
            <li>• Les matériaux choisis (tuile standard vs ardoise premium)</li>
            <li>• La complexité de la toiture (pente, accès, découpes)</li>
            <li>• Les éléments complémentaires (Velux, zinguerie, isolation renforcée)</li>
          </ul>
          <p className="mt-3 text-xs font-semibold text-blue-800">
            💡 Les aides restent identiques quel que soit le matériau choisi. Un budget plus élevé
            signifie un % de prise en charge plus faible, mais des matériaux de meilleure qualité.
          </p>
        </div>
      </div>
    </div>
  );
}
