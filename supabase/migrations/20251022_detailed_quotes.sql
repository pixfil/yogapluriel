-- Migration: Table pour les demandes détaillées (Questionnaire R0.5)
-- Date: 2025-10-22
-- Description: Stockage des demandes de devis complètes avec toutes les données du wizard 6 étapes

-- Table principale: detailed_quotes
CREATE TABLE IF NOT EXISTS detailed_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Étape 1: Nature du projet
  project_nature TEXT[] NOT NULL, -- Types de travaux: refection, isolation, velux, etc.
  existing_tiles TEXT,
  existing_insulation TEXT,
  existing_zinguerie TEXT,

  -- Étape 2: Historique du bien
  house_year INTEGER,
  carpentry_year INTEGER,
  insulation_year INTEGER,
  roof_year INTEGER,

  -- Étape 3: Objectifs & Souhaits
  objectives TEXT[] NOT NULL, -- fuites, confort, isolation, esthétique, vétusté, valorisation
  desired_materials TEXT,
  materials_reason TEXT,
  special_requests TEXT,

  -- Étape 4: Contraintes & Planning
  timeline TEXT, -- <3-mois, 3-6-mois, 6-12-mois, >12-mois, non-defini
  attic_access TEXT, -- amenagees, perdues, non-accessible, ne-sais-pas
  regulatory_constraints BOOLEAN DEFAULT FALSE,
  constraints_details TEXT,

  -- Étape 5: Budget & Aides
  requested_aids TEXT[] NOT NULL, -- maprimerenov, cee, eco-ptz, tva-reduite, aucune, ne-sais-pas
  needs_aid_support BOOLEAN DEFAULT FALSE,
  budget_range TEXT, -- <10k, 10-20k, 20-30k, 30-50k, >50k, a-definir

  -- Étape 6: Découverte & Coordonnées
  discovery_source TEXT, -- google, recommandation, site-web, reseaux-sociaux, ancien-client, publicite, autre
  discovery_source_other TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  property_address TEXT NOT NULL,

  -- Données complètes en JSON (backup/référence)
  form_data JSONB,

  -- Métadonnées de gestion
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'quoted', 'converted', 'archived')),
  is_read BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT, -- Notes internes admin

  -- Soft delete
  deleted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_status ON detailed_quotes(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_created_at ON detailed_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_email ON detailed_quotes(email);
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_is_read ON detailed_quotes(is_read) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_deleted ON detailed_quotes(deleted_at) WHERE deleted_at IS NOT NULL;

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_detailed_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detailed_quotes_updated_at
  BEFORE UPDATE ON detailed_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_detailed_quotes_updated_at();

-- Row Level Security (RLS)
ALTER TABLE detailed_quotes ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs authentifiés peuvent tout lire
CREATE POLICY "Authenticated users can read detailed quotes"
  ON detailed_quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tout le monde peut insérer (formulaire public)
CREATE POLICY "Anyone can insert detailed quotes"
  ON detailed_quotes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "Authenticated users can update detailed quotes"
  ON detailed_quotes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Seuls les utilisateurs authentifiés peuvent supprimer (soft delete)
CREATE POLICY "Authenticated users can delete detailed quotes"
  ON detailed_quotes
  FOR DELETE
  TO authenticated
  USING (true);

-- Commentaires sur la table
COMMENT ON TABLE detailed_quotes IS 'Stockage des demandes de devis détaillées via le formulaire wizard 6 étapes (Questionnaire R0.5)';
COMMENT ON COLUMN detailed_quotes.project_nature IS 'Types de travaux envisagés (array): refection, refection-isolation, isolation, velux, urgence, autres';
COMMENT ON COLUMN detailed_quotes.objectives IS 'Objectifs du projet (array): fuites, confort, isolation, esthetique, vetuste, valorisation';
COMMENT ON COLUMN detailed_quotes.requested_aids IS 'Aides financières sollicitées (array): maprimerenov, cee, eco-ptz, tva-reduite, aucune, ne-sais-pas';
COMMENT ON COLUMN detailed_quotes.form_data IS 'Backup complet des données du formulaire en JSON';
COMMENT ON COLUMN detailed_quotes.status IS 'Statut de traitement: new (nouveau), in_progress (en cours), quoted (devisé), converted (converti client), archived (archivé)';

-- Fonction helper pour récupérer les demandes non lues
CREATE OR REPLACE FUNCTION get_unread_detailed_quotes_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM detailed_quotes
  WHERE is_read = FALSE
    AND deleted_at IS NULL;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fonction helper pour archiver une demande
CREATE OR REPLACE FUNCTION archive_detailed_quote(quote_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE detailed_quotes
  SET archived_at = NOW(),
      updated_at = NOW()
  WHERE id = quote_id
    AND archived_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour restaurer depuis archives
CREATE OR REPLACE FUNCTION unarchive_detailed_quote(quote_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE detailed_quotes
  SET archived_at = NULL,
      updated_at = NOW()
  WHERE id = quote_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour l'admin: statistiques des demandes détaillées
CREATE OR REPLACE VIEW detailed_quotes_stats AS
SELECT
  COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
  COUNT(*) FILTER (WHERE status = 'new' AND deleted_at IS NULL) AS new_count,
  COUNT(*) FILTER (WHERE is_read = FALSE AND deleted_at IS NULL) AS unread_count,
  COUNT(*) FILTER (WHERE status = 'in_progress' AND deleted_at IS NULL) AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'quoted' AND deleted_at IS NULL) AS quoted_count,
  COUNT(*) FILTER (WHERE status = 'converted' AND deleted_at IS NULL) AS converted_count,
  COUNT(*) FILTER (WHERE archived_at IS NOT NULL) AS archived_count,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL) AS this_week_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days' AND deleted_at IS NULL) AS this_month_count
FROM detailed_quotes;

-- Grant permissions sur la vue
GRANT SELECT ON detailed_quotes_stats TO authenticated;
