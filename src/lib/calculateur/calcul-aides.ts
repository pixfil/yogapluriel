// Logique de calcul des aides MaPrimeRénov' 2025
// Mis à jour selon barèmes officiels FFB du 30/09/2025

import {
  FormulaireData,
  CategorieRevenu,
  ResultatCalcul,
  MontantAide,
} from './types';
import {
  PLAFONDS_REVENUS_2025,
  MONTANTS_ISOLATION_RAMPANTS,
  MONTANTS_ISOLATION_MURS_EXTERIEUR,
  MONTANTS_ISOLATION_MURS_INTERIEUR,
  MONTANTS_ISOLATION_TOITURE_TERRASSE,
  MONTANTS_FENETRE,
  MONTANTS_FENETRE_TOIT,
  MONTANTS_VMC_DOUBLE_FLUX,
  MONTANTS_DEPOSE_CUVE_FIOUL,
  MONTANTS_AUDIT_ENERGETIQUE,
  PRIME_CEE,
  TVA_REDUITE,
  TVA_NORMALE,
  CONDITIONS,
  COUTS_MOYENS,
  COUTS_CHANTIERS_COMPLETS,
  COUTS_VELUX,
  MESSAGES,
} from './baremes-2025';

/**
 * Détermine la catégorie de revenu du ménage
 * Source: Page 3 du PDF MaPrimeRénov' 2025
 */
export function determinerCategorie(
  region: string,
  nombrePersonnes: number,
  revenuFiscal: number
): CategorieRevenu {
  const plafonds = PLAFONDS_REVENUS_2025[region][nombrePersonnes] ||
    PLAFONDS_REVENUS_2025[region][5];

  if (revenuFiscal <= plafonds.bleu) return 'bleu';
  if (revenuFiscal <= plafonds.jaune) return 'jaune';
  if (revenuFiscal <= plafonds.violet) return 'violet';
  return 'rose';
}

/**
 * Calcule le coût estimé des travaux
 * NOUVELLE VERSION : Prend en compte la configuration chantier avec matériaux
 */
function calculerCoutTravaux(data: FormulaireData): number {
  let cout = 0;

  // NOUVEAU : Si configuration chantier définie, utiliser les prix personnalisés
  if (data.configurationChantier) {
    const config = data.configurationChantier;
    const { surface, prixPersonnalise, materiau, nombreVelux } = config;

    // Coût de la toiture avec matériau choisi
    if (prixPersonnalise) {
      cout += surface * prixPersonnalise;
    } else if (materiau) {
      // Si pas de prix personnalisé, utiliser prix moyen du matériau
      const infoMateriau = COUTS_CHANTIERS_COMPLETS[materiau];
      cout += surface * infoMateriau.prixMoyen;
    }

    // Ajouter coût Velux si applicable
    if (nombreVelux && nombreVelux > 0) {
      cout += nombreVelux * COUTS_VELUX.prixMoyen;
    }

    return Math.round(cout);
  }

  // ANCIEN SYSTÈME : Si pas de configuration chantier, utiliser l'ancien calcul
  data.travauxSelectionnes.forEach((travail) => {
    switch (travail) {
      // ISOLATION
      case 'isolation-rampants':
        cout += (data.surface || 0) * COUTS_MOYENS.isolationRampants;
        break;
      case 'isolation-combles':
        cout += (data.surface || 0) * COUTS_MOYENS.isolationCombles;
        break;
      case 'isolation-murs-exterieur':
        cout += (data.surface || 0) * COUTS_MOYENS.isolationMursExterieur;
        break;
      case 'isolation-murs-interieur':
        cout += (data.surface || 0) * COUTS_MOYENS.isolationMursInterieur;
        break;
      case 'isolation-toiture-terrasse':
        cout += (data.surface || 0) * COUTS_MOYENS.isolationToiturTerrasse;
        break;

      // MENUISERIES
      case 'fenetre-standard':
        cout += (data.nombreFenetres || 0) * COUTS_MOYENS.fenetrStandard;
        break;
      case 'fenetre-toit':
        cout += (data.nombreFenetres || 0) * COUTS_MOYENS.fenetreToit;
        break;

      // VENTILATION
      case 'vmc-double-flux':
        cout += COUTS_MOYENS.vmcDoubleFlux;
        break;

      // AUTRES
      case 'depose-cuve-fioul':
        cout += COUTS_MOYENS.deposeCuveFioul;
        break;
      case 'audit-energetique':
        cout += COUTS_MOYENS.auditEnergetique;
        break;
    }
  });

  return Math.round(cout);
}

/**
 * Calcule le montant de MaPrimeRénov' selon barèmes officiels 2025
 * Source: Pages 5-6 du PDF
 * MODIFIÉ : Prend en compte la configuration chantier
 */
function calculerMaPrimeRenov(
  data: FormulaireData,
  categorie: CategorieRevenu
): number {
  let montant = 0;

  // Ménages aux revenus supérieurs NON éligibles au parcours par geste
  if (categorie === 'rose' || categorie === 'non-eligible') {
    return 0;
  }

  // NOUVEAU : Si configuration chantier définie, calculer selon la surface d'isolation
  if (data.configurationChantier && data.configurationChantier.incluIsolation) {
    const config = data.configurationChantier;
    const surface = config.surface;

    // Pour une toiture complète avec isolation, on utilise le barème isolation rampants
    if (config.typeProjet === 'toiture-complete' || config.typeProjet === 'isolation-seule') {
      const montantRampants = MONTANTS_ISOLATION_RAMPANTS[categorie] || 0;
      montant += surface * montantRampants;
    }

    // Pour une toiture terrasse, barème isolation toiture terrasse
    if (config.typeProjet === 'toiture-terrasse') {
      const montantToiture = MONTANTS_ISOLATION_TOITURE_TERRASSE[categorie] || 0;
      montant += surface * montantToiture;
    }

    // Ajouter prime pour Velux si présents
    if (config.nombreVelux && config.nombreVelux > 0) {
      const montantVelux = MONTANTS_FENETRE_TOIT[categorie] || 0;
      montant += config.nombreVelux * montantVelux;
    }

    // Respecter le plafond maximum d'aide (20 000€ sur 5 ans)
    const plafondMax = CONDITIONS.plafondAideTotale[categorie] || 0;
    return Math.round(Math.min(montant, plafondMax));
  }

  // ANCIEN SYSTÈME : Si pas de configuration chantier, utiliser l'ancien calcul
  data.travauxSelectionnes.forEach((travail) => {
    switch (travail) {
      // ISOLATION - Rampants et combles (même barème)
      case 'isolation-rampants':
      case 'isolation-combles':
        const montantRampants = MONTANTS_ISOLATION_RAMPANTS[categorie] || 0;
        montant += (data.surface || 0) * montantRampants;
        break;

      // ISOLATION - Murs par l'extérieur (ITE)
      case 'isolation-murs-exterieur':
        const montantITE = MONTANTS_ISOLATION_MURS_EXTERIEUR[categorie] || 0;
        // Prime calculée dans la limite de 100 m² (cf. PDF page 5)
        const surfacePlafonneeITE = Math.min(data.surface || 0, 100);
        montant += surfacePlafonneeITE * montantITE;
        break;

      // ISOLATION - Murs par l'intérieur (ITI)
      // ⚠️ Ne sera plus éligible à partir du 1er janvier 2026
      case 'isolation-murs-interieur':
        const montantITI = MONTANTS_ISOLATION_MURS_INTERIEUR[categorie] || 0;
        montant += (data.surface || 0) * montantITI;
        break;

      // ISOLATION - Toiture terrasse
      case 'isolation-toiture-terrasse':
        const montantToitureTerr = MONTANTS_ISOLATION_TOITURE_TERRASSE[categorie] || 0;
        montant += (data.surface || 0) * montantToitureTerr;
        break;

      // MENUISERIES - Fenêtres standard
      case 'fenetre-standard':
        const montantFenetre = MONTANTS_FENETRE[categorie] || 0;
        montant += (data.nombreFenetres || 0) * montantFenetre;
        break;

      // MENUISERIES - Fenêtres de toit (Velux)
      case 'fenetre-toit':
        const montantFenetreToit = MONTANTS_FENETRE_TOIT[categorie] || 0;
        montant += (data.nombreFenetres || 0) * montantFenetreToit;
        break;

      // VENTILATION - VMC double flux
      case 'vmc-double-flux':
        const montantVMC = MONTANTS_VMC_DOUBLE_FLUX[categorie] || 0;
        montant += montantVMC;
        break;

      // AUTRES - Dépose cuve à fioul
      case 'depose-cuve-fioul':
        const montantCuve = MONTANTS_DEPOSE_CUVE_FIOUL[categorie] || 0;
        montant += montantCuve;
        break;

      // AUTRES - Audit énergétique
      case 'audit-energetique':
        const montantAudit = MONTANTS_AUDIT_ENERGETIQUE[categorie] || 0;
        montant += montantAudit;
        break;
    }
  });

  // Respecter le plafond maximum d'aide (20 000€ sur 5 ans - cf. page 2 PDF)
  const plafondMax = CONDITIONS.plafondAideTotale[categorie] || 0;
  return Math.round(Math.min(montant, plafondMax));
}

/**
 * Calcule la prime CEE (Certificats d'Économie d'Énergie)
 * Montants estimatifs moyens
 * MODIFIÉ : Prend en compte la configuration chantier
 */
function calculerPrimeCEE(data: FormulaireData): number {
  let montant = 0;
  const primeCEE = PRIME_CEE[data.region];

  // NOUVEAU : Si configuration chantier définie et isolation incluse
  if (data.configurationChantier && data.configurationChantier.incluIsolation) {
    const config = data.configurationChantier;

    // Prime CEE pour l'isolation
    montant += config.surface * primeCEE.isolation;

    // Prime CEE pour Velux si présents
    if (config.nombreVelux && config.nombreVelux > 0) {
      montant += config.nombreVelux * primeCEE.fenetre;
    }

    return Math.round(montant);
  }

  // ANCIEN SYSTÈME : Si pas de configuration chantier
  data.travauxSelectionnes.forEach((travail) => {
    switch (travail) {
      // Isolation (tous types confondus)
      case 'isolation-rampants':
      case 'isolation-combles':
      case 'isolation-murs-exterieur':
      case 'isolation-murs-interieur':
      case 'isolation-toiture-terrasse':
        montant += (data.surface || 0) * primeCEE.isolation;
        break;

      // Fenêtres
      case 'fenetre-standard':
      case 'fenetre-toit':
        montant += (data.nombreFenetres || 0) * primeCEE.fenetre;
        break;

      // Pas de CEE pour VMC, dépose cuve, audit (ou montants négligeables)
    }
  });

  return Math.round(montant);
}

/**
 * Calcule l'économie de TVA (différence entre 20% et 5,5%)
 * Source: TVA réduite à 5,5% pour travaux de rénovation énergétique
 */
function calculerEconomieTVA(coutTravaux: number): number {
  const tvaReduite = coutTravaux * (TVA_REDUITE / 100);
  const tvaNormale = coutTravaux * (TVA_NORMALE / 100);
  return Math.round(tvaNormale - tvaReduite);
}

/**
 * Applique les règles d'écrêtement officielles
 * Source: Page 6 du PDF - Règle d'écrêtement pour MaPrimeRénov' par geste
 */
function appliquerEcretement(
  montantMPR: number,
  montantCEE: number,
  coutTravaux: number,
  categorie: CategorieRevenu
): { mpr: number; cee: number } {
  // Le montant cumulé MPR + CEE ne peut dépasser X% de la dépense éligible
  const tauxMax = CONDITIONS.tauxEcretement[categorie] || 0;
  const plafondTotal = coutTravaux * (tauxMax / 100);

  const totalAidesSansEcretement = montantMPR + montantCEE;

  if (totalAidesSansEcretement <= plafondTotal) {
    // Pas de dépassement, on garde les montants
    return { mpr: montantMPR, cee: montantCEE };
  }

  // Dépassement: on réduit proportionnellement MPR et CEE
  const ratio = plafondTotal / totalAidesSansEcretement;
  return {
    mpr: Math.round(montantMPR * ratio),
    cee: Math.round(montantCEE * ratio),
  };
}

/**
 * Vérifie l'éligibilité à l'Éco-PTZ
 */
function verifierEligibiliteEcoPTZ(data: FormulaireData): boolean {
  return (
    data.anciennete >= CONDITIONS.ancienneteMinimum &&
    data.residencePrincipale &&
    data.travauxSelectionnes.length > 0
  );
}

/**
 * Génère des recommandations personnalisées
 */
function genererRecommandations(
  data: FormulaireData,
  categorie: CategorieRevenu,
  aides: MontantAide
): string[] {
  const recommandations: string[] = [];

  // Recommandation selon catégorie
  if (categorie !== 'rose') {
    recommandations.push(
      `En tant que ménage ${MESSAGES[categorie].titre.toLowerCase()}, vous bénéficiez d'aides importantes pour vos travaux.`
    );
  } else {
    recommandations.push(
      'Les ménages aux revenus supérieurs ne sont plus éligibles au parcours par geste. Envisagez le parcours accompagné (rénovation d\'ampleur) si votre logement est classé E, F ou G.'
    );
  }

  // Alerte ITI (fin 2025)
  if (data.travauxSelectionnes.includes('isolation-murs-interieur')) {
    recommandations.push(
      '⚠️ Important : L\'isolation des murs par l\'intérieur ne sera plus éligible aux primes par geste à partir du 1er janvier 2026. Planifiez vos travaux avant cette date !'
    );
  }

  // Recommandation VMC + isolation
  if (
    data.typeLogement === 'maison' &&
    data.travauxSelectionnes.includes('vmc-double-flux') &&
    !data.travauxSelectionnes.some(t =>
      ['isolation-rampants', 'isolation-combles', 'isolation-murs-exterieur', 'isolation-murs-interieur'].includes(t)
    )
  ) {
    recommandations.push(
      'En maison individuelle, l\'installation d\'une VMC double flux doit être concomitante à un geste d\'isolation pour être éligible à MaPrimeRénov\'.'
    );
  }

  // Recommandation Éco-PTZ
  if (data.anciennete >= CONDITIONS.ancienneteMinimum && data.residencePrincipale) {
    const nbGestes = data.travauxSelectionnes.length;
    let montantEcoPTZ = 0;
    if (nbGestes === 1) montantEcoPTZ = 7000;
    else if (nbGestes === 2) montantEcoPTZ = 15000;
    else if (nbGestes >= 3) montantEcoPTZ = 25000;

    if (montantEcoPTZ > 0) {
      recommandations.push(
        `Vous êtes éligible à l'Éco-PTZ jusqu'à ${montantEcoPTZ.toLocaleString()}€ pour financer le reste à charge sans intérêts (sur 20 ans maximum).`
      );
    }
  }

  // Recommandation certification RGE
  recommandations.push(
    'Formdetoit est certifié RGE Qualibat, condition indispensable pour bénéficier de MaPrimeRénov\', des CEE et de l\'Éco-PTZ.'
  );

  // Recommandation économies d'énergie
  if (aides.pourcentageCouverture >= 70) {
    recommandations.push(
      'Avec ce taux de prise en charge élevé, vous réaliserez des économies d\'énergie immédiates pour un faible investissement personnel.'
    );
  }

  // Recommandation audit si grosse rénovation
  if (
    data.travauxSelectionnes.length >= 3 &&
    !data.travauxSelectionnes.includes('audit-energetique')
  ) {
    recommandations.push(
      'Pour un projet de cette ampleur, pensez à réaliser un audit énergétique (500/400/300€ avec MaPrimeRénov\') pour optimiser vos choix.'
    );
  }

  return recommandations;
}

/**
 * Fonction principale de calcul des aides MaPrimeRénov' 2025
 */
export function calculerAides(data: FormulaireData): ResultatCalcul {
  // Vérifications d'éligibilité de base
  const eligible =
    data.residencePrincipale &&
    data.anciennete >= CONDITIONS.ancienneteMinimum &&
    data.travauxSelectionnes.length > 0;

  if (!eligible) {
    return {
      categorieRevenu: 'non-eligible',
      eligible: false,
      aides: { maprimerenov: 0, tva: 0, cee: 0, total: 0, pourcentageCouverture: 0 },
      resteACharge: 0,
      coutEstime: 0,
      detailsAides: [],
      eligibleEcoPTZ: false,
      eligibleTVAReduite: false,
      recommandations: [
        'Votre logement ne remplit pas les conditions d\'éligibilité à MaPrimeRénov\'.',
        'Le logement doit être votre résidence principale et avoir au moins 15 ans.',
        'Vous devez sélectionner au moins un type de travaux éligible.',
      ],
    };
  }

  // Déterminer la catégorie de revenu
  const categorie = determinerCategorie(
    data.region,
    data.nombrePersonnes,
    data.revenuFiscal
  );

  // Calculer les montants bruts
  const coutEstime = calculerCoutTravaux(data);
  let montantMaPrimeRenov = calculerMaPrimeRenov(data, categorie);
  let montantCEE = calculerPrimeCEE(data);

  // Appliquer les règles d'écrêtement (page 6 PDF)
  const aidesEcretees = appliquerEcretement(
    montantMaPrimeRenov,
    montantCEE,
    coutEstime,
    categorie
  );

  montantMaPrimeRenov = aidesEcretees.mpr;
  montantCEE = aidesEcretees.cee;

  // Calcul économie TVA
  const economieTVA = calculerEconomieTVA(coutEstime);

  // Totaux
  const totalAides = montantMaPrimeRenov + montantCEE + economieTVA;
  const resteACharge = Math.max(0, coutEstime - totalAides);
  const pourcentageCouverture = coutEstime > 0
    ? Math.round((totalAides / coutEstime) * 100)
    : 0;

  // Vérification finale: total aides ne peut dépasser 100% du coût
  const totalAidesFinal = Math.min(totalAides, coutEstime);
  const pourcentageFinal = Math.min(pourcentageCouverture, 100);

  const aides: MontantAide = {
    maprimerenov: montantMaPrimeRenov,
    tva: economieTVA,
    cee: montantCEE,
    total: totalAidesFinal,
    pourcentageCouverture: pourcentageFinal,
  };

  // Détails des aides
  const detailsAides = [
    {
      type: 'MaPrimeRénov\'',
      montant: montantMaPrimeRenov,
      description: `Aide de l'État selon vos revenus (${MESSAGES[categorie].titre})`,
    },
    {
      type: 'Prime CEE',
      montant: montantCEE,
      description: 'Certificats d\'Économie d\'Énergie',
    },
    {
      type: 'TVA réduite 5,5%',
      montant: economieTVA,
      description: 'Économie vs TVA normale 20%',
    },
  ].filter((aide) => aide.montant > 0);

  // Recommandations
  const recommandations = genererRecommandations(data, categorie, aides);

  return {
    categorieRevenu: categorie,
    eligible: true,
    aides,
    resteACharge: Math.max(0, coutEstime - totalAidesFinal),
    coutEstime,
    detailsAides,
    eligibleEcoPTZ: verifierEligibiliteEcoPTZ(data),
    eligibleTVAReduite: true,
    recommandations,
  };
}
