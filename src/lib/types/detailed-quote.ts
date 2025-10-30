// Types pour le formulaire de demande détaillée (Questionnaire R0.5)
// Basé sur le questionnaire de découverte client en 13 points

export interface DetailedQuoteData {
  // Étape 1: Nature du projet
  projectNature: string[]; // Réfection, Réfection+isolation, Isolation, Velux, Dépannage urgent, Autres
  existingTiles: string; // Type de tuiles en place
  existingInsulation: string; // Type d'isolation en place
  existingZinguerie: string; // Type de zinguerie en place

  // Étape 2: Historique du bien
  houseYear: number; // Année de construction de la maison
  carpentryYear: number; // Année de la charpente
  insulationYear: number; // Année de l'isolation
  roofYear: number; // Année de la toiture

  // Étape 3: Objectifs & Souhaits
  objectives: string[]; // Fuites, Confort, Isolation, Esthétique, Vétusté, Valorisation
  desiredMaterials: string; // Souhaits en termes de matériaux
  materialsReason: string; // Pourquoi ces matériaux
  specialRequests: string; // Attentes et points particuliers

  // Étape 4: Contraintes & Planning
  timeline: string; // <3 mois, 3-6 mois, 6-12 mois, >12 mois, Non défini
  atticAccess: string; // Aménagées, Perdues, Non accessible, Ne sais pas
  regulatoryConstraints: boolean; // Bâtiment classé/ABF
  constraintsDetails: string; // Détails des contraintes

  // Étape 5: Budget & Aides
  requestedAids: string[]; // MaPrimeRénov', CEE, Éco-PTZ, TVA réduite, Aucune, Ne sais pas
  needsAidSupport: boolean; // Accompagnement montage dossier
  budgetRange: string; // <10k, 10-20k, 20-30k, 30-50k, >50k, À définir

  // Étape 6: Découverte & Coordonnées
  discoverySource: string; // Comment avez-vous connu Formdetoit
  discoverySourceOther: string; // Si "Autre", préciser
  name: string;
  phone: string;
  email: string;
  propertyAddress: string;
  agreedPolicy: boolean;
}

// Types pour les options de formulaire
export type ProjectNatureOption =
  | 'refection'
  | 'refection-isolation'
  | 'isolation'
  | 'velux'
  | 'urgence'
  | 'autres';

export type ObjectiveOption =
  | 'fuites'
  | 'confort'
  | 'isolation'
  | 'esthetique'
  | 'vetuste'
  | 'valorisation';

export type TimelineOption =
  | '<3-mois'
  | '3-6-mois'
  | '6-12-mois'
  | '>12-mois'
  | 'non-defini';

export type AtticAccessOption =
  | 'amenagees'
  | 'perdues'
  | 'non-accessible'
  | 'ne-sais-pas';

export type AidOption =
  | 'maprimerenov'
  | 'cee'
  | 'eco-ptz'
  | 'tva-reduite'
  | 'aucune'
  | 'ne-sais-pas';

export type BudgetRangeOption =
  | '<10k'
  | '10-20k'
  | '20-30k'
  | '30-50k'
  | '>50k'
  | 'a-definir';

export type DiscoverySourceOption =
  | 'google'
  | 'recommandation'
  | 'site-web'
  | 'reseaux-sociaux'
  | 'ancien-client'
  | 'publicite'
  | 'autre';

// Labels pour l'affichage
export const PROJECT_NATURE_LABELS: Record<ProjectNatureOption, string> = {
  'refection': 'Réfection de toiture',
  'refection-isolation': 'Réfection + Isolation',
  'isolation': 'Isolation seule',
  'velux': 'Fenêtres de toit (Velux)',
  'urgence': 'Dépannage urgent',
  'autres': 'Autres travaux'
};

export const OBJECTIVE_LABELS: Record<ObjectiveOption, string> = {
  'fuites': 'Réparation de fuites',
  'confort': 'Amélioration du confort',
  'isolation': 'Isolation thermique',
  'esthetique': 'Esthétique',
  'vetuste': 'Vétusté / Usure',
  'valorisation': 'Valorisation du bien'
};

export const TIMELINE_LABELS: Record<TimelineOption, string> = {
  '<3-mois': 'Moins de 3 mois',
  '3-6-mois': '3 à 6 mois',
  '6-12-mois': '6 à 12 mois',
  '>12-mois': 'Plus de 12 mois',
  'non-defini': 'Délai non défini'
};

export const ATTIC_ACCESS_LABELS: Record<AtticAccessOption, string> = {
  'amenagees': 'Combles aménagées (accessibles)',
  'perdues': 'Combles perdues (accessibles)',
  'non-accessible': 'Non accessible',
  'ne-sais-pas': 'Je ne sais pas'
};

export const AID_LABELS: Record<AidOption, string> = {
  'maprimerenov': 'MaPrimeRénov\'',
  'cee': 'CEE (Certificats d\'Économie d\'Énergie)',
  'eco-ptz': 'Éco-PTZ (Éco-Prêt à Taux Zéro)',
  'tva-reduite': 'TVA réduite 5.5%',
  'aucune': 'Aucune aide',
  'ne-sais-pas': 'Je ne sais pas encore'
};

export const BUDGET_RANGE_LABELS: Record<BudgetRangeOption, string> = {
  '<10k': 'Moins de 10 000€',
  '10-20k': '10 000€ - 20 000€',
  '20-30k': '20 000€ - 30 000€',
  '30-50k': '30 000€ - 50 000€',
  '>50k': 'Plus de 50 000€',
  'a-definir': 'À définir ensemble'
};

export const DISCOVERY_SOURCE_LABELS: Record<DiscoverySourceOption, string> = {
  'google': 'Recherche Google',
  'recommandation': 'Recommandation',
  'site-web': 'Site web',
  'reseaux-sociaux': 'Réseaux sociaux',
  'ancien-client': 'Ancien client',
  'publicite': 'Publicité',
  'autre': 'Autre'
};

// Matériaux suggérés
export const TILES_OPTIONS = [
  'Tuiles mécaniques',
  'Tuiles plates',
  'Ardoises naturelles',
  'Ardoises fibro-ciment',
  'Zinc',
  'Bac acier',
  'Shingles',
  'Tuiles béton',
  'Ne sais pas',
  'Autre'
];

export const INSULATION_OPTIONS = [
  'Laine de verre',
  'Laine de roche',
  'Laine de bois',
  'Ouate de cellulose',
  'Chanvre',
  'Polyuréthane',
  'Polystyrène',
  'Aucune isolation',
  'Ne sais pas',
  'Autre'
];

export const ZINGUERIE_OPTIONS = [
  'Zinc naturel',
  'Zinc prépatiné',
  'Cuivre',
  'Aluminium',
  'PVC',
  'Ne sais pas',
  'Autre'
];

// Validation du formulaire
export function validateStep(step: number, data: Partial<DetailedQuoteData>): boolean {
  switch (step) {
    case 1:
      return (data.projectNature?.length ?? 0) > 0 &&
             !!data.existingTiles &&
             !!data.existingInsulation &&
             !!data.existingZinguerie;

    case 2:
      return !!data.houseYear && data.houseYear > 1800 &&
             !!data.carpentryYear && data.carpentryYear > 1800 &&
             !!data.insulationYear && data.insulationYear >= 0 &&
             !!data.roofYear && data.roofYear > 1800;

    case 3:
      return (data.objectives?.length ?? 0) > 0;

    case 4:
      return !!data.timeline &&
             !!data.atticAccess;

    case 5:
      return (data.requestedAids?.length ?? 0) > 0 &&
             !!data.budgetRange;

    case 6:
      return !!data.name && data.name.length > 2 &&
             !!data.phone && data.phone.length >= 10 &&
             !!data.email && data.email.includes('@') &&
             !!data.propertyAddress && data.propertyAddress.length > 10 &&
             !!data.discoverySource &&
             !!data.agreedPolicy;

    default:
      return false;
  }
}

// Helper pour localStorage
export const STORAGE_KEY = 'formdetoit-detailed-quote-draft';

export function saveDraft(data: Partial<DetailedQuoteData>): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erreur sauvegarde draft:', error);
    }
  }
}

export function loadDraft(): Partial<DetailedQuoteData> | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { data, savedAt } = JSON.parse(saved);
        // Expirer après 7 jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (new Date(savedAt) > sevenDaysAgo) {
          return data;
        }
      }
    } catch (error) {
      console.error('Erreur chargement draft:', error);
    }
  }
  return null;
}

export function clearDraft(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur suppression draft:', error);
    }
  }
}
