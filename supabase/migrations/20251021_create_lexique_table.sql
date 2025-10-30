-- Migration: Create lexique_terms table
-- Date: 2025-10-21
-- Description: Table for managing technical terms displayed on /lexique

-- ============================================
-- 1. CREATE LEXIQUE_TERMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lexique_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  letter CHAR(1) NOT NULL CHECK (letter ~ '^[A-Z]$'),
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX idx_lexique_terms_letter ON lexique_terms(letter);
CREATE INDEX idx_lexique_terms_published ON lexique_terms(published) WHERE published = true;
CREATE INDEX idx_lexique_terms_display_order ON lexique_terms(letter, display_order);
CREATE INDEX idx_lexique_terms_deleted_at ON lexique_terms(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_lexique_terms_search ON lexique_terms USING gin(to_tsvector('french', term || ' ' || definition));

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE lexique_terms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Public: can view published and non-deleted terms
CREATE POLICY "lexique_terms_select_public" ON lexique_terms
  FOR SELECT
  USING (published = true AND deleted_at IS NULL);

-- Authenticated: can do everything
CREATE POLICY "lexique_terms_all_authenticated" ON lexique_terms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. INSERT INITIAL DATA (from current frontend)
-- ============================================

INSERT INTO lexique_terms (term, definition, letter, display_order, published) VALUES
-- A
('Ardoise', 'Roche métamorphique utilisée comme matériau de couverture. Très durable et résistante aux intempéries, elle peut durer plus de 100 ans.', 'A', 1, true),
('Arêtier', 'Ligne d''intersection de deux versants de toiture qui forment un angle saillant. Nécessite une étanchéité particulière.', 'A', 2, true),
('Abergement', 'Ensemble des ouvrages destinés à assurer l''étanchéité entre la couverture et les éléments qui la traversent (cheminée, lucarne, etc.).', 'A', 3, true),
('Ancrage', 'Point de fixation pour dispositif antichute. Élément essentiel pour la sécurité lors des travaux en hauteur.', 'A', 4, true),
('Auvent', 'Petit toit en saillie au-dessus d''une porte ou d''une fenêtre, servant d''abri.', 'A', 5, true),

-- B
('Bardeau', 'Petite plaque de bois, d''ardoise ou de matériau synthétique utilisée pour la couverture.', 'B', 1, true),
('Bac acier', 'Élément de couverture métallique nervuré, utilisé pour les toitures à faible pente.', 'B', 2, true),
('Bavette', 'Bande métallique assurant l''étanchéité au raccordement d''une toiture avec un élément vertical.', 'B', 3, true),

-- C
('Charpente', 'Structure portante de la toiture, généralement en bois, qui supporte la couverture et transmet les charges aux murs porteurs.', 'C', 1, true),
('Chevron', 'Pièce de bois disposée suivant la pente du toit et servant de support aux liteaux et à la couverture.', 'C', 2, true),
('Couvertine', 'Élément de couverture placé au faîtage d''un mur pour le protéger des infiltrations d''eau.', 'C', 3, true),
('Crochet', 'Pièce métallique servant à fixer les ardoises ou tuiles sur les liteaux.', 'C', 4, true),
('Chatière', 'Tuile spéciale perforée permettant la ventilation des combles sous la couverture.', 'C', 5, true),

-- D
('Descente EP', 'Tuyau vertical évacuant les eaux pluviales de la gouttière vers le sol ou le réseau d''évacuation.', 'D', 1, true),
('Doublis', 'Pièce de bois fixée sous les chevrons en pied de versant pour redresser la pente.', 'D', 2, true),
('DTU', 'Documents Techniques Unifiés. Normes de référence pour la mise en œuvre des travaux de bâtiment.', 'D', 3, true),

-- E
('Écran de sous-toiture', 'Film souple placé entre la charpente et la couverture pour assurer l''étanchéité à l''air et à l''eau.', 'E', 1, true),
('Égout', 'Partie basse d''un versant de toiture où s''écoulent les eaux pluviales.', 'E', 2, true),
('Embrasure', 'Espace pratiqué dans l''épaisseur d''un mur pour recevoir une fenêtre de toit.', 'E', 3, true),

-- F
('Faîtage', 'Ligne de rencontre haute de deux versants de toiture. Élément décoratif et fonctionnel au sommet du toit.', 'F', 1, true),
('Fenêtre de toit', 'Châssis vitré installé dans la pente du toit pour apporter lumière et ventilation aux combles.', 'F', 2, true),
('Ferme', 'Élément triangulé de charpente qui assure la stabilité de la structure et porte les pannes.', 'F', 3, true),
('Flashing', 'Bande d''étanchéité souple qui entoure les fenêtres de toit pour garantir l''étanchéité.', 'F', 4, true),

-- G
('Gouttière', 'Canal disposé en bas de pente pour recueillir et évacuer les eaux de pluie.', 'G', 1, true),
('Grille anti-rongeurs', 'Protection grillagée empêchant les nuisibles d''accéder aux combles.', 'G', 2, true),

-- H
('HPV', 'Hautement Perméable à la Vapeur d''eau. Qualifie un écran de sous-toiture respirant.', 'H', 1, true),

-- I
('Isolation', 'Ensemble des matériaux et techniques visant à limiter les déperditions thermiques par la toiture.', 'I', 1, true),
('ITE', 'Isolation Thermique par l''Extérieur. Technique d''isolation par le dessus de la toiture.', 'I', 2, true),

-- L
('Larmier', 'Saillie au bord d''un toit permettant d''éloigner l''eau de ruissellement de la façade.', 'L', 1, true),
('Liteau', 'Tasseau de bois fixé sur les chevrons et servant de support aux tuiles ou ardoises.', 'L', 2, true),
('Lucarne', 'Petite ouverture dans la pente d''un toit pour éclairer et aérer les combles.', 'L', 3, true),

-- N
('Noue', 'Ligne d''intersection de deux versants formant un angle rentrant, nécessitant une étanchéité renforcée.', 'N', 1, true),

-- P
('Panne', 'Pièce de charpente horizontale posée sur les fermes et supportant les chevrons.', 'P', 1, true),
('Pare-vapeur', 'Film étanche à la vapeur d''eau placé côté intérieur pour éviter la condensation dans l''isolant.', 'P', 2, true),
('Pente', 'Inclinaison d''un versant de toiture, exprimée en pourcentage ou en degrés.', 'P', 3, true),
('Photovoltaïque', 'Technologie permettant de convertir l''énergie solaire en électricité via des panneaux installés en toiture.', 'P', 4, true),

-- R
('Rive', 'Bord latéral d''un versant de toiture nécessitant une protection et finition particulières.', 'R', 1, true),
('RGE', 'Reconnu Garant de l''Environnement. Label qualifiant les artisans pour les travaux de rénovation énergétique.', 'R', 2, true),

-- S
('Solin', 'Ouvrage d''étanchéité réalisé au raccord entre la toiture et un élément vertical (mur, cheminée).', 'S', 1, true),
('Sous-toiture', 'Ensemble des éléments placés entre la charpente et la couverture (écran, contre-liteaux, liteaux).', 'S', 2, true),

-- T
('Tuile', 'Élément de couverture en terre cuite, béton ou autre matériau, de formes variées selon les régions.', 'T', 1, true),
('Tuile canal', 'Tuile en forme de gouttière, typique du Sud de la France.', 'T', 2, true),
('Tuile mécanique', 'Tuile à emboîtement avec système d''accroche intégré, facilitant la pose.', 'T', 3, true),

-- V
('Velux', 'Marque déposée désignant couramment les fenêtres de toit.', 'V', 1, true),
('Ventilation', 'Circulation d''air sous la couverture pour éviter la condensation et préserver la charpente.', 'V', 2, true),
('Versant', 'Surface inclinée d''un pan de toiture.', 'V', 3, true),
('Volige', 'Planche de bois formant un support continu sous la couverture.', 'V', 4, true),

-- Z
('Zinc', 'Métal utilisé pour les couvertures, gouttières et éléments de zinguerie. Matériau durable et esthétique.', 'Z', 1, true),
('Zinguerie', 'Ensemble des travaux et éléments métalliques assurant l''étanchéité et l''évacuation des eaux (gouttières, chéneaux, solins).', 'Z', 2, true);

-- ============================================
-- 6. VERIFY
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'lexique_terms'
ORDER BY policyname;

-- Expected: 2 policies (lexique_terms_select_public, lexique_terms_all_authenticated)

SELECT letter, COUNT(*) as term_count
FROM lexique_terms
GROUP BY letter
ORDER BY letter;

-- Expected: Multiple letters with term counts
