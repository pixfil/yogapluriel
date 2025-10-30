-- =============================================
-- Migration: Fix infinite redirect loop on /notre-equipe
-- Description: Désactiver la redirection circulaire /notre-equipe/ → /notre-equipe
-- Date: 2025-10-21
-- =============================================

-- Problème : La redirection /notre-equipe/ → /notre-equipe crée une boucle infinie
-- car Next.js normalise automatiquement les URLs en ajoutant un slash final.

-- Désactiver la redirection problématique
UPDATE redirects
SET
  is_active = false,
  notes = CASE
    WHEN notes IS NULL OR notes = '' THEN 'Désactivée - Causait boucle infinie avec normalisation Next.js'
    ELSE notes || ' - Désactivée (causait boucle infinie avec normalisation Next.js)'
  END,
  updated_at = NOW()
WHERE from_path = '/notre-equipe/'
  AND to_path = '/notre-equipe'
  AND is_active = true;

-- Afficher un message de confirmation
DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'Redirection /notre-equipe/ désactivée (% ligne(s) mise(s) à jour)', rows_updated;
END $$;

-- =============================================
-- INSTRUCTIONS
-- =============================================
--
-- Cette migration désactive la redirection qui causait une boucle infinie.
-- Next.js gère lui-même la normalisation des URLs (avec/sans slash final).
--
-- Après avoir exécuté cette migration :
-- 1. Testez l'accès à /notre-equipe dans votre navigateur
-- 2. Vérifiez qu'il n'y a plus de boucle de redirection
-- 3. Si besoin, redémarrez votre serveur dev : npm run dev
--
-- Pour vérifier que la redirection a bien été désactivée :
-- SELECT * FROM redirects WHERE from_path = '/notre-equipe/' AND to_path = '/notre-equipe';
