// Barèmes officiels MaPrimeRénov' 2025
// Source: FFB - Document officiel version n°2 du 30 septembre 2025
// ⚠️ MISE À JOUR CRITIQUE - Barèmes corrigés selon document officiel

import { PlafondRevenu } from './types';

/**
 * PLAFONDS DE RESSOURCES 2025 (Revenu Fiscal de Référence)
 * Source: Page 3 du PDF officiel MaPrimeRénov' 2025
 *
 * Catégories:
 * - bleu = Très modestes
 * - jaune = Modestes
 * - violet = Intermédiaires
 * - rose = Supérieurs (NON éligibles en parcours geste depuis 2024)
 */
export const PLAFONDS_REVENUS_2025: Record<string, Record<number, PlafondRevenu>> = {
  'ile-de-france': {
    1: { bleu: 23768, jaune: 28933, violet: 40404 },
    2: { bleu: 34884, jaune: 42463, violet: 59394 },
    3: { bleu: 41893, jaune: 51000, violet: 71060 },
    4: { bleu: 48914, jaune: 59549, violet: 83637 },
    5: { bleu: 55961, jaune: 68123, violet: 95758 },
  },
  'autre': {
    1: { bleu: 17173, jaune: 22015, violet: 30844 },
    2: { bleu: 25115, jaune: 32197, violet: 45340 },
    3: { bleu: 30206, jaune: 38719, violet: 54592 },
    4: { bleu: 35285, jaune: 45234, violet: 63844 },
    5: { bleu: 40388, jaune: 51775, violet: 73098 },
  },
};

/**
 * MONTANTS MAPRIMERENOV' PAR GESTE (Source: Pages 5-6 du PDF)
 *
 * ISOLATION THERMIQUE
 * Tous les montants en €/m² ou €/équipement selon catégorie de revenus
 */

// Isolation des rampants de toiture et plafonds de combles (combles perdus exclus)
// Critère technique: R ≥ 6 en métropole
export const MONTANTS_ISOLATION_RAMPANTS: Record<string, number> = {
  bleu: 25,    // €/m² - Très modestes
  jaune: 20,   // €/m² - Modestes
  violet: 15,  // €/m² - Intermédiaires
  rose: 0,     // Non éligible
};

// Isolation des murs par l'EXTÉRIEUR
// Critère technique: R ≥ 3,7 en métropole
// Prime calculée dans la limite de 100 m²
export const MONTANTS_ISOLATION_MURS_EXTERIEUR: Record<string, number> = {
  bleu: 75,    // €/m² - Très modestes
  jaune: 60,   // €/m² - Modestes
  violet: 40,  // €/m² - Intermédiaires
  rose: 0,     // Non éligible
};

// Isolation des murs par l'INTÉRIEUR
// Critère technique: R ≥ 3,7 en métropole
// ⚠️ Ne sera plus éligible aux primes par geste pour les demandes à compter du 1er janvier 2026
export const MONTANTS_ISOLATION_MURS_INTERIEUR: Record<string, number> = {
  bleu: 25,    // €/m²
  jaune: 20,   // €/m²
  violet: 15,  // €/m²
  rose: 0,
};

// Isolation des toitures-terrasses
// Critère technique: R ≥ 4,5 en métropole
export const MONTANTS_ISOLATION_TOITURE_TERRASSE: Record<string, number> = {
  bleu: 75,    // €/m²
  jaune: 60,   // €/m²
  violet: 40,  // €/m²
  rose: 0,
};

// Fenêtres ou portes-fenêtres en remplacement de simple vitrage
// Critères: Uw ≤ 1,3 et Sw ≥ 0,3 OU Uw ≤ 1,7 et Sw ≥ 0,36
export const MONTANTS_FENETRE: Record<string, number> = {
  bleu: 100,   // € par équipement
  jaune: 80,   // € par équipement
  violet: 40,  // € par équipement
  rose: 0,
};

// Fenêtres de toit (Velux) en remplacement de simple vitrage
// Critères: Uw ≤ 1,5 et Sw ≤ 0,36
export const MONTANTS_FENETRE_TOIT: Record<string, number> = {
  bleu: 100,   // € par équipement
  jaune: 80,   // € par équipement
  violet: 40,  // € par équipement
  rose: 0,
};

/**
 * AUTRES TRAVAUX ÉLIGIBLES
 */

// VMC double flux autoréglables ou hygroréglables
// Note: En maison individuelle, installation doit être concomitante à un geste d'isolation
export const MONTANTS_VMC_DOUBLE_FLUX: Record<string, number> = {
  bleu: 2500,  // €
  jaune: 2000, // €
  violet: 1500, // €
  rose: 0,
};

// Dépose d'une cuve à fioul (hors Outre-mer)
export const MONTANTS_DEPOSE_CUVE_FIOUL: Record<string, number> = {
  bleu: 1200,  // €
  jaune: 800,  // €
  violet: 400, // €
  rose: 0,
};

// Audit énergétique
export const MONTANTS_AUDIT_ENERGETIQUE: Record<string, number> = {
  bleu: 500,   // €
  jaune: 400,  // €
  violet: 300, // €
  rose: 0,
};

/**
 * PRIME CEE (Certificats d'Économie d'Énergie)
 * Montants estimatifs moyens - peuvent varier selon fournisseur d'énergie
 */
export const PRIME_CEE: Record<string, { isolation: number; fenetre: number }> = {
  'ile-de-france': {
    isolation: 12, // €/m²
    fenetre: 80,   // € par fenêtre
  },
  'autre': {
    isolation: 10, // €/m²
    fenetre: 70,   // € par fenêtre
  },
};

/**
 * TVA RÉDUITE
 */
export const TVA_REDUITE = 5.5;  // % pour travaux de rénovation énergétique
export const TVA_NORMALE = 20;   // %

/**
 * CONDITIONS D'ÉLIGIBILITÉ
 */
export const CONDITIONS = {
  ancienneteMinimum: 15, // ans - Le logement doit avoir au moins 15 ans

  // Résistances thermiques minimales (R en m²·K/W)
  resistances: {
    rampantsToiture: 6,        // R ≥ 6 pour rampants/toiture
    murs: 3.7,                 // R ≥ 3,7 pour murs
    toiturTerrasse: 4.5,       // R ≥ 4,5 pour toiture terrasse
  },

  // Plafonds d'aide totale MaPrimeRénov' sur 5 ans (parcours par geste)
  plafondAideTotale: {
    bleu: 20000,    // € maximum sur 5 ans (tous gestes confondus)
    jaune: 20000,   // € maximum sur 5 ans
    violet: 20000,  // € maximum sur 5 ans
    rose: 0,        // Non éligible
  },

  // Règles d'écrêtement (Source: Page 6 du PDF)
  // Le montant cumulé MPR + CEE + CRE (Outre-mer) ne peut dépasser:
  tauxEcretement: {
    bleu: 90,     // % de la dépense éligible
    jaune: 75,    // % de la dépense éligible
    violet: 60,   // % de la dépense éligible
    rose: 40,     // % (pour info, mais non éligible MPR)
  },

  // Le total MPR + toutes aides publiques/privées ne peut dépasser 100% de la dépense
  tauxMaxToutesAides: 100,
};

/**
 * COÛTS MOYENS TRAVAUX (Estimation TTC)
 * ⚠️ MISE À JOUR : Prix réalistes FormDeToit 2025
 * Par défaut, assume une toiture complète (couverture + isolation + échafaudage)
 */
export const COUTS_MOYENS = {
  isolationRampants: 350,        // €/m² TTC (TOITURE COMPLÈTE : couverture + isolation + échafaudage)
  isolationCombles: 115,         // €/m² TTC (isolation seule)
  isolationMursExterieur: 150,   // €/m² TTC (ITE plus chère - NON proposé par FormDeToit)
  isolationMursInterieur: 50,    // €/m² TTC (NON proposé par FormDeToit)
  isolationToiturTerrasse: 175,  // €/m² TTC (toiture terrasse EPDM + isolation)
  fenetreToit: 1050,             // € TTC par fenêtre Velux (pose comprise)
  fenetrStandard: 600,           // € TTC par fenêtre standard (NON proposé)
  vmcDoubleFlux: 4000,           // € TTC installation complète (NON proposé)
  deposeCuveFioul: 1500,         // € TTC (NON proposé)
  auditEnergetique: 800,         // € TTC (NON proposé)
};

/**
 * COÛTS CHANTIERS COMPLETS FORMDETOIT
 * Tarifs réels incluant : couverture + isolation + échafaudage
 * Source : Tarifs FormDeToit 2025
 */
export const COUTS_CHANTIERS_COMPLETS = {
  'tuile-mecanique': {
    prixMin: 280,
    prixMax: 350,
    prixMoyen: 315,
    nom: 'Tuile mécanique',
    description: 'Entrée de gamme - Tuiles mécaniques standard',
    eligibleMPR: true,
    categorie: 'standard',
    icone: '🏠',
  },
  'tuile-plate': {
    prixMin: 350,
    prixMax: 400,
    prixMoyen: 375,
    nom: 'Tuile plate',
    description: 'Standard - Tuiles plates traditionnelles',
    eligibleMPR: true,
    categorie: 'standard',
    icone: '🏘️',
  },
  'ardoise': {
    prixMin: 500,
    prixMax: 550,
    prixMoyen: 525,
    nom: 'Ardoise',
    description: 'Premium - Ardoise naturelle, esthétique et durable',
    eligibleMPR: true,
    categorie: 'premium',
    icone: '⬛',
    specialiteFormdetoit: true,
  },
  'zinc': {
    prixMin: 450,
    prixMax: 550,
    prixMoyen: 500,
    nom: 'Zinc',
    description: 'Premium - Joint debout zinc, moderne et étanche',
    eligibleMPR: true,
    categorie: 'premium',
    icone: '⚪',
    specialiteFormdetoit: true,
  },
  'prefa': {
    prixMin: 500,
    prixMax: 550,
    prixMoyen: 525,
    nom: 'PREFA',
    description: 'Premium - Aluminium PREFA, léger et résistant',
    eligibleMPR: true,
    categorie: 'premium',
    icone: '✨',
    specialiteFormdetoit: true,
  },
  'cuivre': {
    prixMin: 600,
    prixMax: 700,
    prixMoyen: 650,
    nom: 'Cuivre',
    description: 'Très premium - Couverture cuivre, luxe et longévité exceptionnelle',
    eligibleMPR: true,
    categorie: 'luxe',
    icone: '🟤',
    specialiteFormdetoit: true,
  },
  'epdm': {
    prixMin: 150,
    prixMax: 200,
    prixMoyen: 175,
    nom: 'EPDM / Membrane',
    description: 'Toiture terrasse - Membrane EPDM ou étanchéité',
    eligibleMPR: true,
    categorie: 'toiture-terrasse',
    icone: '▪️',
  },
} as const;

/**
 * COÛTS VELUX FORMDETOIT
 * Tarifs fenêtres de toit (pose comprise)
 */
export const COUTS_VELUX = {
  prixMin: 900,
  prixMax: 1200,
  prixMoyen: 1050,
  description: 'Fenêtre de toit Velux avec pose (prix unitaire)',
};

/**
 * ÉCO-PTZ (Éco-Prêt à Taux Zéro)
 * Montants disponibles selon type de rénovation
 */
export const ECO_PTZ = {
  montantsDisponibles: [7000, 15000, 25000, 30000, 50000],
  conditionUnGeste: 7000,                    // € pour 1 geste de travaux
  conditionDeuxGestes: 15000,                // € pour 2 gestes
  conditionTroisGestes: 25000,               // € pour 3 gestes ou plus
  conditionPerformanceGlobale: 30000,        // € pour rénovation d'ampleur
  conditionLogementIndecent: 50000,          // € pour sortir de l'indécence
  dureeRemboursement: 20,                    // ans maximum
  eligibiliteAnciennete: 15,                 // ans minimum
};

/**
 * MESSAGES ET LABELS PAR CATÉGORIE
 */
export const MESSAGES = {
  bleu: {
    titre: 'Revenus très modestes',
    description: 'Vous bénéficiez du taux maximal de MaPrimeRénov\' (jusqu\'à 90% de prise en charge)',
    color: '#0078D4',
  },
  jaune: {
    titre: 'Revenus modestes',
    description: 'Vous bénéficiez d\'un bon taux de MaPrimeRénov\' (jusqu\'à 75% de prise en charge)',
    color: '#FFB900',
  },
  violet: {
    titre: 'Revenus intermédiaires',
    description: 'Vous êtes éligible à MaPrimeRénov\' (jusqu\'à 60% de prise en charge)',
    color: '#8661C1',
  },
  rose: {
    titre: 'Revenus supérieurs',
    description: 'Les ménages aux revenus supérieurs ne sont plus éligibles au parcours par geste depuis 2024. Seul le parcours accompagné (rénovation d\'ampleur) reste ouvert à 10% pour les logements E, F ou G.',
    color: '#E81123',
  },
};

/**
 * INFORMATIONS RÉNOVATION D'AMPLEUR (Parcours accompagné)
 * Source: Pages 7-8 du PDF
 */
export const RENOVATION_AMPLEUR = {
  logements: ['E', 'F', 'G'], // Classes DPE éligibles
  gainMinimum: 2,              // Nombre de classes DPE à sauter (minimum)

  // Taux de financement selon gain DPE
  tauxFinancement: {
    gain2Classes: {
      plafond: 30000,  // € HT
      bleu: 80,        // % HT
      jaune: 60,       // % HT
      violet: 45,      // % HT
      rose: 10,        // % HT (oui, éligibles pour ce parcours!)
    },
    gain3ClassesOuPlus: {
      plafond: 40000,  // € HT
      bleu: 80,        // % HT
      jaune: 60,       // % HT
      violet: 45,      // % HT
      rose: 10,        // % HT
    },
  },

  // Écrêtement TTC toutes aides confondues
  ecretementTTC: {
    bleu: 100,       // %
    jaune: 90,       // %
    violet: 80,      // %
    rose: 50,        // %
  },

  // Accompagnateur Rénov' obligatoire
  accompagnateur: {
    plafond: 2000,   // € TTC
    bleu: 100,       // % de prise en charge
    jaune: 80,       // %
    violet: 40,      // %
    rose: 20,        // %
  },
};
