-- =============================================
-- Migration: Add gallery_layout column to projects table
-- Description: Permet de choisir entre galerie classique (grid) ou avant/pendant/après
-- Date: 2025-10-21
-- =============================================

-- Ajouter la colonne gallery_layout
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS gallery_layout VARCHAR(20) DEFAULT 'grid';

-- Ajouter une contrainte CHECK pour valider les valeurs
ALTER TABLE projects
ADD CONSTRAINT projects_gallery_layout_check
CHECK (gallery_layout IN ('grid', 'before-after'));

-- Créer un index pour améliorer les performances des requêtes filtrées par layout
CREATE INDEX IF NOT EXISTS idx_projects_gallery_layout ON projects(gallery_layout);

-- Commentaire sur la colonne
COMMENT ON COLUMN projects.gallery_layout IS 'Type de mise en page de la galerie : grid (classique) ou before-after (avant/pendant/après)';

-- =============================================
-- INSTRUCTIONS
-- =============================================
--
-- Cette migration ajoute un système de choix de layout pour les galeries de projets.
--
-- Valeurs possibles :
-- - 'grid' : Galerie classique en grille (par défaut)
-- - 'before-after' : Mise en page spéciale avant/pendant/après
--
-- Après avoir exécuté cette migration :
-- 1. Tous les projets existants auront 'grid' par défaut
-- 2. Dans l'admin, vous pourrez choisir le layout lors de la création/édition
-- 3. Le front-end s'adaptera automatiquement selon le layout choisi
--
-- Pour vérifier :
-- SELECT title, gallery_layout FROM projects;
