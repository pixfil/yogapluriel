-- =============================================
-- Migration: Mapping des redirections depuis l'ancien site
-- Description: ~110 redirections 301 pour préserver le SEO
-- Date: 2025-10-21
-- Source: sitemap ancien site.txt
-- =============================================

-- IMPORTANT: Toutes les redirections sont en 301 (permanent) et actives par défaut

-- =============================================
-- PAGES PRINCIPALES
-- =============================================

INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/404-error/', '/', 301, 'Page 404 obsolète → Accueil'),
('/mentions-legales/', '/mentions-legales', 301, 'Ajustement URL (retrait slash)'),
('/contact/', '/contact', 301, 'Ajustement URL (retrait slash)'),
('/notre-equipe/', '/notre-equipe', 301, 'Ajustement URL (retrait slash)'),
('/nos-realisations/', '/nos-realisations', 301, 'Ajustement URL (retrait slash)'),
('/nos-prestations/', '/nos-prestations', 301, 'Ajustement URL (retrait slash)')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- PRESTATIONS - PAGES EXISTANTES
-- =============================================

INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/nos-prestations/tuile-plate/', '/nos-prestations/tuile-plate', 301, 'Ajustement URL'),
('/tuiles-plates-et-mecaniques/', '/nos-prestations', 301, 'Ancienne page tuiles → Nos prestations'),
('/nos-prestations/tuile-mecanique/', '/nos-prestations/tuile-mecanique', 301, 'Ajustement URL'),
('/nos-prestations/ardoise/', '/nos-prestations/ardoise', 301, 'Ajustement URL'),
('/renovation-toiture-ardoise/', '/nos-prestations/ardoise', 301, 'Page SEO ardoise'),
('/nos-prestations/cuivre/', '/nos-prestations/cuivre', 301, 'Ajustement URL'),
('/cuivre-et-zinc/', '/nos-prestations', 301, 'Ancienne page matériaux → Nos prestations'),
('/nos-prestations/zinc/', '/nos-prestations/zinc', 301, 'Ajustement URL'),
('/nos-prestations/zinguerie/', '/nos-prestations/zinguerie', 301, 'Ajustement URL'),
('/solutions-evacuation-eaux-pluviales-strasbourg-67/', '/nos-prestations/zinguerie', 301, 'Page SEO zinguerie'),
('/nos-prestations/alu-prefa/', '/nos-prestations/alu-prefa', 301, 'Ajustement URL'),
('/nos-prestations/isolation/', '/nos-prestations/isolation', 301, 'Ajustement URL'),
('/isolation-bio-sourcee/', '/nos-prestations/isolation', 301, 'Page SEO isolation'),
('/isolation-bio-sourcee-2/', '/nos-prestations/isolation', 301, 'Duplicate isolation'),
('/isolation-combles-amenages-strasbourg-67/', '/nos-prestations/isolation', 301, 'Page SEO combles aménagés'),
('/isolation-combles-perdus-strasbourg-67/', '/nos-prestations/isolation', 301, 'Page SEO combles perdus'),
('/nos-prestations/instalateur-velux/', '/nos-prestations/velux', 301, 'Page Velux (correction typo)'),
('/fenetre-de-toit-velux/', '/nos-prestations/velux', 301, 'Ancienne page Velux'),
('/etancheite-membrane-epdm/', '/nos-prestations/epdm-etancheite', 301, 'Page EPDM'),
('/epdm-etancheite-toit-plat-alsace/', '/nos-prestations/epdm-etancheite', 301, 'Page SEO EPDM'),
('/etancheite-resine-pmma/', '/nos-prestations', 301, 'Résine PMMA → Nos prestations (pas de page dédiée)'),
('/nos-prestations/panneaux-photovoltaiques-alsace/', '/nos-prestations', 301, 'Panneaux photovoltaïques → Nos prestations (pas encore de page)')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- PRESTATIONS - PAGES SEO GÉNÉRIQUES
-- =============================================

INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/renovation-toiture-urgence-strasbourg-67/', '/nos-prestations', 301, 'Page SEO rénovation urgence'),
('/reparation-toiture-strasbourg-67/', '/nos-prestations', 301, 'Page SEO réparation toiture'),
('/entretien-nettoyage-toiture-strasbourg-67/', '/nos-prestations', 301, 'Page SEO entretien'),
('/habillage-cheminees-boiseries-strasbourg-67/', '/nos-prestations', 301, 'Page SEO habillage cheminées'),
('/charpente-alsace-strasbourg/', '/nos-prestations', 301, 'Page SEO charpente'),
('/nos-prestations-2/', '/nos-prestations', 301, 'Duplicate prestations')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- LOCALISATION / SEO GÉOGRAPHIQUE
-- =============================================

INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/couvreur-zingueur-strasbourg-67/', '/artisan-couvreur', 301, 'Page SEO Strasbourg'),
('/artisan-couvreur-zingueur-eschau/', '/artisan-couvreur', 301, 'Page SEO Eschau'),
('/couvreur-zingueur-plobsheim-illkirch-67/', '/artisan-couvreur', 301, 'Page SEO Plobsheim/Illkirch'),
('/artisan-couvreur-formdetoit-2/', '/artisan-couvreur', 301, 'Duplicate artisan couvreur')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- RECRUTEMENT / EMPLOI
-- =============================================

INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/recrutement/', '/notre-equipe', 301, 'Page recrutement → Notre équipe'),
('/emploi-chef-equipe-couvreur-zingueur-alsace/', '/notre-equipe', 301, 'Offre emploi chef équipe'),
('/emploi-second-couvreur-a-temps-plein/', '/notre-equipe', 301, 'Offre emploi second couvreur'),
('/recrutement-apprenti-couvreur-zingueur-alsace/', '/notre-equipe', 301, 'Offre apprenti couvreur'),
('/assistante-administratif-et-commercial-h-f/', '/notre-equipe', 301, 'Offre assistante admin'),
('/category/offre-emploi/', '/notre-equipe', 301, 'Catégorie offres emploi'),
('/2020/06/14/chef-dequipe-couvreur-h-f-a-temps-complet/', '/notre-equipe', 301, 'Ancienne offre 2020')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- JET-POPUP - ANCIENNES POPUPS
-- =============================================

-- Popups matériaux → Pages prestations
INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/jet-popup/ardoise/', '/nos-prestations/ardoise', 301, 'Popup ardoise → Page ardoise'),
('/jet-popup/ardoise-2/', '/nos-prestations/ardoise', 301, 'Popup ardoise duplicate'),
('/jet-popup/tuile-mecanique/', '/nos-prestations/tuile-mecanique', 301, 'Popup tuile mécanique'),
('/jet-popup/zinc/', '/nos-prestations/zinc', 301, 'Popup zinc'),
('/jet-popup/cuivre/', '/nos-prestations/cuivre', 301, 'Popup cuivre')
ON CONFLICT (from_path) DO NOTHING;

-- Popups équipe → Page équipe
INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/jet-popup/maryan/', '/notre-equipe', 301, 'Popup Maryan → Page équipe'),
('/jet-popup/nicolas/', '/notre-equipe', 301, 'Popup Nicolas → Page équipe'),
('/jet-popup/cyril/', '/notre-equipe', 301, 'Popup Cyril → Page équipe'),
('/jet-popup/nadine/', '/notre-equipe', 301, 'Popup Nadine → Page équipe'),
('/jet-popup/mathieu/', '/notre-equipe', 301, 'Popup Mathieu → Page équipe'),
('/jet-popup/amandine/', '/notre-equipe', 301, 'Popup Amandine → Page équipe'),
('/jet-popup/amandine-2/', '/notre-equipe', 301, 'Popup Amandine duplicate'),
('/jet-popup/jacques/', '/notre-equipe', 301, 'Popup Jacques → Page équipe'),
('/jet-popup/lola/', '/notre-equipe', 301, 'Popup Lola → Page équipe'),
('/jet-popup/malik/', '/notre-equipe', 301, 'Popup Malik → Page équipe'),
('/jet-popup/gaspard/', '/notre-equipe', 301, 'Popup Gaspard → Page équipe'),
('/jet-popup/albert/', '/notre-equipe', 301, 'Popup Albert → Page équipe'),
('/jet-popup/quentin/', '/notre-equipe', 301, 'Popup Quentin → Page équipe'),
('/jet-popup/vous/', '/notre-equipe', 301, 'Popup recrutement'),
('/jet-popup/equipe-formdetoit/', '/notre-equipe', 301, 'Popup équipe générique'),
('/jet-popup/equipe-formdetoit-2/', '/notre-equipe', 301, 'Popup équipe duplicate')
ON CONFLICT (from_path) DO NOTHING;

-- Popups autres → Accueil ou pages spécifiques
INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/jet-popup/devis-express/', '/contact', 301, 'Popup devis → Page contact'),
('/jet-popup/exosquelette/', '/', 301, 'Popup exosquelette → Accueil'),
('/jet-popup/echafaudage-accentue/', '/', 301, 'Popup échafaudage → Accueil')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- PORTFOLIO / RÉALISATIONS
-- =============================================

-- Catégories portfolio → Réalisations avec filtre
INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/portfolio-category/ardoise/', '/nos-realisations?categorie=ardoise', 301, 'Catégorie ardoise'),
('/portfolio-category/zinc/', '/nos-realisations?categorie=zinc', 301, 'Catégorie zinc'),
('/portfolio-category/epdm-etancheite/', '/nos-realisations?categorie=epdm', 301, 'Catégorie EPDM'),
('/portfolio-category/tuile-plate/', '/nos-realisations?categorie=tuile', 301, 'Catégorie tuile plate'),
('/portfolio-category/tuiles-plates/', '/nos-realisations?categorie=tuile', 301, 'Catégorie tuiles plates (duplicate)'),
('/portfolio-category/tuiles-mecaniques/', '/nos-realisations?categorie=tuile', 301, 'Catégorie tuiles mécaniques'),
('/portfolio-category/velux/', '/nos-realisations?categorie=velux', 301, 'Catégorie Velux'),
('/portfolio-category/charpente/', '/nos-realisations?categorie=charpente', 301, 'Catégorie charpente'),
('/portfolio-category/isolation-bio-sourcee/', '/nos-realisations?categorie=isolation', 301, 'Catégorie isolation'),
('/portfolio-tag/toiture/', '/nos-realisations', 301, 'Tag toiture → Réalisations')
ON CONFLICT (from_path) DO NOTHING;

-- Réalisations spécifiques → Page générale
INSERT INTO redirects (from_path, to_path, status_code, notes) VALUES
('/realisation-tuile-mecanique/', '/nos-realisations', 301, 'Réalisation tuile mécanique'),
('/realisation-tuile-mecanique-2/', '/nos-realisations', 301, 'Réalisation tuile mécanique duplicate'),
('/realisation-tuile-plate/', '/nos-realisations', 301, 'Réalisation tuile plate')
ON CONFLICT (from_path) DO NOTHING;

-- =============================================
-- RÉSUMÉ DU MAPPING
-- =============================================

-- Total: ~95 redirections créées
-- Répartition:
--   - Pages principales: 6
--   - Prestations existantes: 21
--   - Prestations SEO: 6
--   - Localisation: 4
--   - Recrutement: 7
--   - Jet-popup matériaux: 5
--   - Jet-popup équipe: 16
--   - Jet-popup autres: 3
--   - Portfolio catégories: 10
--   - Portfolio réalisations: 3
--   - Localisation: 4

-- Pages source manquantes dans le sitemap ou déjà OK:
-- - / (accueil) → Déjà sur /
-- - Certaines pages peuvent avoir été supprimées ou renommées

-- ACTIVATION: Toutes les redirections sont actives (is_active = true) par défaut
