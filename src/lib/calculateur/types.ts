// Types pour le calculateur d'éligibilité MaPrimeRénov' 2025
// Mis à jour selon barèmes officiels FFB du 30/09/2025

export type CategorieRevenu = 'bleu' | 'jaune' | 'violet' | 'rose' | 'non-eligible';

export type TypeLogement = 'maison' | 'appartement';

export type Region = 'ile-de-france' | 'autre';

/**
 * Types de projets proposés par FormDeToit
 */
export type TypeProjet =
  | 'toiture-complete'      // Réfection complète (couverture + isolation + échafaudage)
  | 'isolation-seule'       // Isolation uniquement (rampants/combles)
  | 'toiture-terrasse';     // Toiture terrasse (étanchéité + isolation)

/**
 * Matériaux de couverture proposés par FormDeToit
 */
export type MateriauCouverture =
  | 'tuile-mecanique'       // Entrée de gamme - 280-350 €/m²
  | 'tuile-plate'           // Standard - 350-400 €/m²
  | 'ardoise'               // Premium - 500-550 €/m²
  | 'zinc'                  // Premium - 450-550 €/m²
  | 'prefa'                 // Premium (aluminium) - 500-550 €/m²
  | 'cuivre'                // Très premium - 600-700 €/m²
  | 'epdm';                 // Membrane toiture terrasse - 150-200 €/m²

/**
 * Types de travaux éligibles MaPrimeRénov' 2025
 * Source: Pages 5-6 du PDF officiel
 */
export type TypeTravaux =
  // ISOLATION THERMIQUE
  | 'isolation-rampants'           // Rampants de toiture et plafonds combles (R≥6) - 25/20/15€/m²
  | 'isolation-combles'            // Combles perdus (R≥6) - 25/20/15€/m²
  | 'isolation-murs-exterieur'     // ITE Isolation par l'extérieur (R≥3.7) - 75/60/40€/m²
  | 'isolation-murs-interieur'     // ITI Isolation par l'intérieur (R≥3.7) - 25/20/15€/m² (fin 2025!)
  | 'isolation-toiture-terrasse'   // Toiture terrasse (R≥4.5) - 75/60/40€/m²

  // MENUISERIES
  | 'fenetre-standard'             // Fenêtres en remplacement simple vitrage - 100/80/40€
  | 'fenetre-toit'                 // Fenêtres de toit Velux - 100/80/40€

  // VENTILATION
  | 'vmc-double-flux'              // VMC double flux - 2500/2000/1500€

  // AUTRES
  | 'depose-cuve-fioul'            // Dépose cuve à fioul - 1200/800/400€
  | 'audit-energetique';           // Audit énergétique - 500/400/300€

/**
 * Configuration d'un chantier FormDeToit
 * Utilisé pour les projets avec choix de matériaux
 */
export interface ConfigurationChantier {
  typeProjet: TypeProjet;
  surface: number;
  materiau?: MateriauCouverture;        // Matériau choisi (si applicable)
  prixPersonnalise?: number;            // Prix au m² personnalisé via curseur
  nombreVelux?: number;                 // Nombre de fenêtres de toit
  incluIsolation: boolean;              // Isolation incluse dans le chantier
  incluEchafaudage: boolean;            // Échafaudage inclus
}

export interface FormulaireData {
  typeLogement: TypeLogement;
  region: Region;
  nombrePersonnes: number;
  revenuFiscal: number;
  anciennete: number;
  travauxSelectionnes: TypeTravaux[];
  surface?: number;
  nombreFenetres?: number;
  residencePrincipale: boolean;

  // NOUVEAU : Configuration chantier avec matériaux
  configurationChantier?: ConfigurationChantier;
}

export interface PlafondRevenu {
  bleu: number;
  jaune: number;
  violet: number;
}

export interface MontantAide {
  maprimerenov: number;
  tva: number;
  cee: number;
  total: number;
  pourcentageCouverture: number;
}

export interface ResultatCalcul {
  categorieRevenu: CategorieRevenu;
  eligible: boolean;
  aides: MontantAide;
  resteACharge: number;
  coutEstime: number;
  detailsAides: {
    type: string;
    montant: number;
    description: string;
  }[];
  eligibleEcoPTZ: boolean;
  eligibleTVAReduite: boolean;
  recommandations: string[];
}