-- Migration: Ajout colonnes tracking source pour tous les formulaires
-- Date: 28/10/2025
-- Description: Ajoute les colonnes source_url, source_form_type, referrer aux tables de messages
--              + colonnes deleted_at/deleted_by si manquantes (soft delete)

-- ============================================================================
-- TABLE: contacts (formulaire contact standard + urgence)
-- ============================================================================

-- Colonnes de tracking source
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS source_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS source_form_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Colonnes soft delete (si pas déjà présentes)
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_contacts_source_url
ON contacts(source_url)
WHERE source_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at
ON contacts(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN contacts.source_url IS 'URL exacte de la page d''où provient le message (ex: /, /contact, /prestations)';
COMMENT ON COLUMN contacts.source_form_type IS 'Type de formulaire utilisé (ex: urgence_hero, contact_page, contact_footer)';
COMMENT ON COLUMN contacts.referrer IS 'URL de la page précédente (HTTP Referrer)';
COMMENT ON COLUMN contacts.deleted_at IS 'Timestamp when the record was soft-deleted';
COMMENT ON COLUMN contacts.deleted_by IS 'User ID who soft-deleted the record';

-- ============================================================================
-- TABLE: quote_requests (demandes de devis simple + urgence)
-- ============================================================================

-- Colonnes de tracking source
ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS source_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS source_form_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Colonnes soft delete (si pas déjà présentes)
ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_source_url
ON quote_requests(source_url)
WHERE source_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quote_requests_deleted_at
ON quote_requests(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN quote_requests.source_url IS 'URL exacte de la page d''où provient la demande';
COMMENT ON COLUMN quote_requests.source_form_type IS 'Type de formulaire (ex: urgence_hero, quick_quote_footer, simple_devis_page)';
COMMENT ON COLUMN quote_requests.referrer IS 'URL de la page précédente (HTTP Referrer)';
COMMENT ON COLUMN quote_requests.deleted_at IS 'Timestamp when the record was soft-deleted';
COMMENT ON COLUMN quote_requests.deleted_by IS 'User ID who soft-deleted the record';

-- ============================================================================
-- TABLE: detailed_quotes (demandes de devis détaillées)
-- ============================================================================
-- Note: deleted_at/deleted_by déjà ajoutés dans migration précédente 20251028_add_soft_delete_to_detailed_quotes.sql

-- Colonnes de tracking source
ALTER TABLE detailed_quotes
ADD COLUMN IF NOT EXISTS source_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS source_form_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_detailed_quotes_source_url
ON detailed_quotes(source_url)
WHERE source_url IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN detailed_quotes.source_url IS 'URL exacte de la page d''où provient la demande (normalement toujours /contact)';
COMMENT ON COLUMN detailed_quotes.source_form_type IS 'Type de formulaire (toujours detailed_quote_contact_page)';
COMMENT ON COLUMN detailed_quotes.referrer IS 'URL de la page précédente';

-- ============================================================================
-- TABLE: calculator_submissions (soumissions calculatrice)
-- ============================================================================
-- Cette table peut aussi recevoir des soumissions depuis différentes pages

-- Colonnes de tracking source
ALTER TABLE calculator_submissions
ADD COLUMN IF NOT EXISTS source_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS source_form_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Colonnes soft delete (si pas déjà présentes)
ALTER TABLE calculator_submissions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_calculator_submissions_source_url
ON calculator_submissions(source_url)
WHERE source_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calculator_submissions_deleted_at
ON calculator_submissions(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN calculator_submissions.source_url IS 'URL de la page d''où provient la soumission';
COMMENT ON COLUMN calculator_submissions.source_form_type IS 'Type de formulaire (calculator_widget, calculator_page)';
COMMENT ON COLUMN calculator_submissions.referrer IS 'URL de la page précédente';
COMMENT ON COLUMN calculator_submissions.deleted_at IS 'Timestamp when the record was soft-deleted';
COMMENT ON COLUMN calculator_submissions.deleted_by IS 'User ID who soft-deleted the record';

-- ============================================================================
-- VALEURS PAR DÉFAUT pour données existantes (optionnel)
-- ============================================================================

-- Marquer les données existantes avec source inconnue
UPDATE contacts
SET source_form_type = 'legacy_unknown'
WHERE source_form_type IS NULL;

UPDATE quote_requests
SET source_form_type = 'legacy_unknown'
WHERE source_form_type IS NULL;

UPDATE detailed_quotes
SET source_form_type = 'legacy_detailed_quote'
WHERE source_form_type IS NULL;

UPDATE calculator_submissions
SET source_form_type = 'legacy_calculator'
WHERE source_form_type IS NULL;

-- ============================================================================
-- DOCUMENTATION DES VALEURS source_form_type
-- ============================================================================

/*
Valeurs possibles pour source_form_type :

FORMULAIRES CONTACT:
- 'contact_page' : Formulaire contact standard depuis /contact
- 'contact_footer' : Formulaire contact dans footer (si présent)

FORMULAIRES URGENCE:
- 'urgence_hero' : Formulaire urgence dans hero homepage
- 'urgence_contact_page' : Tab "Urgence" sur page /contact
- 'urgence_prestation_page' : Formulaire urgence sur page prestation

FORMULAIRES DEVIS:
- 'quick_quote_hero' : Devis rapide homepage
- 'quick_quote_prestation' : Devis rapide page prestation
- 'simple_devis_contact_page' : Formulaire devis simple /contact

FORMULAIRE DÉTAILLÉ:
- 'detailed_quote_contact_page' : Questionnaire détaillé /contact

CALCULATRICE:
- 'calculator_widget' : Widget calculatrice
- 'calculator_page' : Page calculatrice dédiée

LEGACY:
- 'legacy_unknown' : Données avant implémentation tracking
- 'legacy_detailed_quote' : Devis détaillés anciens
- 'legacy_calculator' : Calculatrices anciennes
*/
