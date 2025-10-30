-- Migration: Correction de la contrainte CHECK sur certifications.category
-- Date: 2025-10-21
-- Description: Modifie la contrainte pour accepter les nouvelles catégories (quality, expertise, territorial, network)

-- Supprimer l'ancienne contrainte
ALTER TABLE certifications
DROP CONSTRAINT IF EXISTS certifications_category_check;

-- Ajouter la nouvelle contrainte avec les bonnes catégories
ALTER TABLE certifications
ADD CONSTRAINT certifications_category_check
CHECK (category IN ('quality', 'expertise', 'territorial', 'network'));

-- Vérification
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'certifications_category_check';
