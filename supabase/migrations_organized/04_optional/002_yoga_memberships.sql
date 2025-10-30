-- =============================================================================
-- YOGA PLURIEL - ADHÉSIONS ET SUIVI
-- =============================================================================
-- Tables pour gérer les adhésions, abonnements, et suivi de présence
-- =============================================================================

-- =============================================================================
-- 1. FORMULES D'ABONNEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations
  name TEXT NOT NULL UNIQUE, -- Ex: "Carte 10 séances", "Abonnement mensuel"
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Type
  plan_type TEXT NOT NULL CHECK (
    plan_type IN ('unlimited', 'credit_based', 'time_based')
  ),
  -- unlimited: accès illimité pendant la période
  -- credit_based: X séances utilisables
  -- time_based: accès limité dans le temps

  -- Crédits (pour credit_based)
  credits INTEGER, -- Nombre de séances incluses
  credits_validity_days INTEGER, -- Validité des crédits

  -- Durée (pour unlimited et time_based)
  duration_days INTEGER, -- Ex: 30 jours, 365 jours

  -- Prix
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',

  -- Restrictions
  allowed_class_types UUID[], -- NULL = tous les cours autorisés
  max_bookings_per_week INTEGER, -- NULL = illimité

  -- Paramètres
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Avantages
  benefits TEXT[], -- Liste des avantages

  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_membership_plans_active ON membership_plans(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_membership_plans_type ON membership_plans(plan_type) WHERE deleted_at IS NULL;

-- Trigger
CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active membership plans"
ON membership_plans FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage membership plans"
ON membership_plans FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- =============================================================================
-- 2. ADHÉSIONS UTILISATEURS
-- =============================================================================

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Crédits (pour plans credit_based)
  credits_total INTEGER, -- Total de crédits achetés
  credits_remaining INTEGER, -- Crédits restants
  credits_used INTEGER DEFAULT 0,

  -- Statut
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'cancelled', 'suspended')
  ),

  -- Renouvellement
  auto_renew BOOLEAN DEFAULT false,
  renewal_date DATE,

  -- Paiement
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'failed')
  ),
  payment_method TEXT,
  amount_paid DECIMAL(10, 2),
  payment_date DATE,
  payment_reference TEXT, -- ID transaction Stripe/autre

  -- Métadonnées
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Index
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_dates ON memberships(start_date, end_date);
CREATE INDEX idx_memberships_active ON memberships(user_id, status)
  WHERE status = 'active';

-- Trigger
CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Users peuvent voir leurs propres adhésions
CREATE POLICY "Users can view their memberships"
ON memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage memberships"
ON memberships FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- =============================================================================
-- 3. PRÉSENCES (Attendance)
-- =============================================================================

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Informations participant (si pas de user_id)
  participant_name TEXT,
  participant_email TEXT,

  -- Statut
  status TEXT DEFAULT 'present' CHECK (
    status IN ('present', 'absent', 'late', 'left_early')
  ),

  -- Horaires
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,

  -- Utilisation crédits
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  credits_used INTEGER DEFAULT 1,

  -- Métadonnées
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id), -- Admin qui a marqué présence

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Contrainte: soit user_id soit participant_name
  CONSTRAINT attendance_has_participant CHECK (
    user_id IS NOT NULL OR participant_name IS NOT NULL
  )
);

-- Index
CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_booking ON attendance(booking_id);
CREATE INDEX idx_attendance_membership ON attendance(membership_id);
CREATE INDEX idx_attendance_date ON attendance(check_in_time);

-- Trigger
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Users peuvent voir leur propre présence
CREATE POLICY "Users can view their attendance"
ON attendance FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins et instructeurs peuvent gérer les présences
CREATE POLICY "Admins can manage attendance"
ON attendance FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin' OR roles ? 'editor')
  )
);

-- =============================================================================
-- 4. COMMENTAIRES / FEEDBACK SUR LES COURS
-- =============================================================================

CREATE TABLE IF NOT EXISTS session_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Note et commentaire
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Paramètres
  is_public BOOLEAN DEFAULT true, -- Afficher publiquement
  is_verified BOOLEAN DEFAULT false, -- Vérifié par admin

  -- Métadonnées
  helpful_count INTEGER DEFAULT 0, -- Nombre de "utile"

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Un seul avis par user par session
  UNIQUE(session_id, user_id)
);

-- Index
CREATE INDEX idx_session_reviews_session ON session_reviews(session_id);
CREATE INDEX idx_session_reviews_user ON session_reviews(user_id);
CREATE INDEX idx_session_reviews_public ON session_reviews(is_public, is_verified)
  WHERE is_public = true;

-- Trigger
CREATE TRIGGER update_session_reviews_updated_at
  BEFORE UPDATE ON session_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;

-- Public peut voir les avis publics vérifiés
CREATE POLICY "Public can view verified reviews"
ON session_reviews FOR SELECT
TO public
USING (is_public = true AND is_verified = true);

-- Users peuvent voir leurs propres avis
CREATE POLICY "Users can view their reviews"
ON session_reviews FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users peuvent créer/modifier leurs avis
CREATE POLICY "Users can manage their reviews"
ON session_reviews FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage all reviews"
ON session_reviews FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- =============================================================================
-- 5. FONCTIONS UTILES
-- =============================================================================

-- Fonction: Déduire crédits lors d'une réservation confirmée
CREATE OR REPLACE FUNCTION deduct_membership_credits()
RETURNS TRIGGER AS $$
DECLARE
  active_membership UUID;
  credits_to_use INTEGER;
BEGIN
  -- Seulement si réservation confirmée
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Trouver adhésion active de l'utilisateur
    SELECT id INTO active_membership
    FROM memberships
    WHERE user_id = NEW.user_id
      AND status = 'active'
      AND start_date <= CURRENT_DATE
      AND end_date >= CURRENT_DATE
      AND plan_id IN (
        SELECT id FROM membership_plans WHERE plan_type = 'credit_based'
      )
      AND credits_remaining > 0
    ORDER BY end_date ASC
    LIMIT 1;

    IF active_membership IS NOT NULL THEN
      -- Déduire 1 crédit
      UPDATE memberships
      SET
        credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1
      WHERE id = active_membership;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-deduct credits on booking confirmation
CREATE TRIGGER trigger_deduct_credits
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION deduct_membership_credits();

-- Fonction: Vérifier si user a adhésion valide
CREATE OR REPLACE FUNCTION has_valid_membership(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  membership_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO membership_count
  FROM memberships
  WHERE user_id = user_uuid
    AND status = 'active'
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE;

  RETURN membership_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Obtenir statistiques utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_bookings BIGINT,
  attended_sessions BIGINT,
  credits_remaining INTEGER,
  membership_expires DATE,
  favorite_class_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM bookings WHERE user_id = user_uuid) as total_bookings,
    (SELECT COUNT(*) FROM attendance WHERE user_id = user_uuid AND status = 'present') as attended_sessions,
    (SELECT COALESCE(SUM(credits_remaining), 0)::INTEGER FROM memberships WHERE user_id = user_uuid AND status = 'active') as credits_remaining,
    (SELECT MAX(end_date) FROM memberships WHERE user_id = user_uuid AND status = 'active') as membership_expires,
    (
      SELECT ct.name
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      JOIN class_types ct ON s.class_type_id = ct.id
      WHERE b.user_id = user_uuid
      GROUP BY ct.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as favorite_class_type;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Expirer les adhésions automatiquement
CREATE OR REPLACE FUNCTION expire_old_memberships()
RETURNS void AS $$
BEGIN
  UPDATE memberships
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN (
  'membership_plans',
  'memberships',
  'attendance',
  'session_reviews'
)
ORDER BY tablename;

-- =============================================================================
-- ✅ TABLES ADHÉSIONS ET SUIVI CRÉÉES
-- =============================================================================
-- Tables:
--   1. membership_plans - Formules d'abonnement
--   2. memberships - Adhésions des utilisateurs
--   3. attendance - Suivi de présence aux cours
--   4. session_reviews - Avis et évaluations
--
-- Fonctionnalités:
--   - 3 types d'abonnements (illimité, crédits, durée)
--   - Déduction automatique des crédits
--   - Suivi présence avec check-in/out
--   - Système d'avis sur les cours
--   - Fonctions stats utilisateur
--   - Auto-expiration des adhésions
--
-- Types d'abonnements supportés:
--   - Carte 10 séances (credit_based)
--   - Abonnement mensuel illimité (unlimited)
--   - Essai 1 mois (time_based)
--
-- À faire ensuite:
--   - Créer seeds avec exemples d'abonnements
--   - Implémenter paiement Stripe
--   - Créer dashboard membre
--   - Système de notification (rappels, expirations)
-- =============================================================================
