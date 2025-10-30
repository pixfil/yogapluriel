-- =============================================================================
-- YOGA PLURIEL - TABLES PRINCIPALES
-- =============================================================================
-- Tables pour la gestion des cours, professeurs, séances et réservations
-- =============================================================================

-- =============================================================================
-- 1. PROFESSEURS / INSTRUCTEURS
-- =============================================================================

CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations personnelles
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Profil professionnel
  bio TEXT,
  specialties TEXT[], -- Ex: ['Hatha', 'Vinyasa', 'Yin']
  certifications TEXT[],
  years_experience INTEGER,
  photo_url TEXT,

  -- Liens externes
  website_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,

  -- Paramètres
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  color_code TEXT, -- Couleur pour le calendrier

  -- Métadonnées
  notes TEXT, -- Notes admin
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_instructors_active ON instructors(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_instructors_user ON instructors(user_id) WHERE deleted_at IS NULL;

-- Trigger
CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les instructeurs actifs
CREATE POLICY "Public can view active instructors"
ON instructors FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

-- Admins/editors peuvent tout gérer
CREATE POLICY "Admins can manage instructors"
ON instructors FOR ALL
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
-- 2. TYPES DE COURS
-- =============================================================================

CREATE TABLE IF NOT EXISTS class_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations
  name TEXT NOT NULL UNIQUE, -- Ex: "Hatha Yoga", "Vinyasa Flow"
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Détails pratiques
  duration_minutes INTEGER DEFAULT 60,
  level TEXT, -- débutant, intermédiaire, avancé, tous niveaux
  max_participants INTEGER DEFAULT 15,

  -- Média
  image_url TEXT,
  icon TEXT, -- Nom icône Lucide
  color TEXT DEFAULT '#8B5CF6',

  -- Paramètres
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Métadonnées
  benefits TEXT[], -- Bienfaits du cours
  prerequisites TEXT, -- Prérequis
  equipment_needed TEXT[], -- Matériel nécessaire

  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_class_types_active ON class_types(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_class_types_slug ON class_types(slug) WHERE deleted_at IS NULL;

-- Trigger
CREATE TRIGGER update_class_types_updated_at
  BEFORE UPDATE ON class_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active class types"
ON class_types FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage class types"
ON class_types FOR ALL
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
-- 3. SALLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  location TEXT, -- Adresse ou bâtiment
  floor TEXT,

  -- Équipements
  amenities TEXT[], -- Ex: ['tapis fournis', 'vestiaire', 'douche']

  is_active BOOLEAN DEFAULT true,
  color_code TEXT,
  notes TEXT,

  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active rooms"
ON rooms FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage rooms"
ON rooms FOR ALL
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
-- 4. SÉANCES (instances de cours planifiés)
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  class_type_id UUID NOT NULL REFERENCES class_types(id) ON DELETE RESTRICT,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE RESTRICT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,

  -- Horaire
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Capacité et inscription
  max_participants INTEGER DEFAULT 15,
  current_participants INTEGER DEFAULT 0,
  waiting_list_enabled BOOLEAN DEFAULT true,

  -- Statut
  status TEXT DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'cancelled', 'completed', 'in_progress')
  ),
  cancellation_reason TEXT,

  -- Informations complémentaires
  notes TEXT, -- Notes admin
  special_instructions TEXT, -- Instructions pour participants

  -- Récurrence (si applicable)
  recurring_event_id UUID, -- ID pour lier les séances récurrentes
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- Format iCal RRULE

  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Contraintes
  CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime)
);

-- Index
CREATE INDEX idx_sessions_start_time ON sessions(start_datetime) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_instructor ON sessions(instructor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_class_type ON sessions(class_type_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_status ON sessions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_recurring ON sessions(recurring_event_id) WHERE is_recurring = true;

-- Trigger
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view future sessions"
ON sessions FOR SELECT
TO public
USING (
  deleted_at IS NULL
  AND status != 'cancelled'
  AND start_datetime >= NOW() - INTERVAL '24 hours'
);

CREATE POLICY "Admins can manage sessions"
ON sessions FOR ALL
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
-- 5. RÉSERVATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Informations participant (pour users non connectés)
  participant_name TEXT,
  participant_email TEXT,
  participant_phone TEXT,

  -- Statut réservation
  status TEXT DEFAULT 'confirmed' CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'attended', 'no_show', 'waiting_list')
  ),

  -- Position dans la liste d'attente
  waiting_list_position INTEGER,

  -- Paiement
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'free')
  ),
  payment_method TEXT, -- carte, espèces, abonnement
  amount_paid DECIMAL(10, 2),

  -- Métadonnées
  notes TEXT,
  special_needs TEXT, -- Besoins spéciaux / blessures
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Confirmation et rappels
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Contrainte: un user ou des infos participant
  CONSTRAINT booking_has_participant CHECK (
    user_id IS NOT NULL OR (
      participant_name IS NOT NULL AND
      participant_email IS NOT NULL
    )
  )
);

-- Index
CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_waiting_list ON bookings(waiting_list_position)
  WHERE status = 'waiting_list';

-- Trigger
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users peuvent voir leurs propres réservations
CREATE POLICY "Users can view their bookings"
ON bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users peuvent créer des réservations
CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users peuvent annuler leurs réservations
CREATE POLICY "Users can cancel their bookings"
ON bookings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND status = 'cancelled');

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage all bookings"
ON bookings FOR ALL
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
-- 6. FONCTIONS UTILES
-- =============================================================================

-- Fonction: Mettre à jour le compteur de participants d'une séance
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE sessions
    SET current_participants = (
      SELECT COUNT(*)
      FROM bookings
      WHERE session_id = NEW.session_id
      AND status IN ('confirmed', 'attended')
    )
    WHERE id = NEW.session_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE sessions
    SET current_participants = (
      SELECT COUNT(*)
      FROM bookings
      WHERE session_id = OLD.session_id
      AND status IN ('confirmed', 'attended')
    )
    WHERE id = OLD.session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update participant count
CREATE TRIGGER trigger_update_session_count
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participant_count();

-- Fonction: Vérifier si une séance est complète
CREATE OR REPLACE FUNCTION is_session_full(session_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  session_max INTEGER;
  session_current INTEGER;
BEGIN
  SELECT max_participants, current_participants
  INTO session_max, session_current
  FROM sessions
  WHERE id = session_uuid;

  RETURN session_current >= session_max;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Obtenir les prochaines séances d'un type de cours
CREATE OR REPLACE FUNCTION get_upcoming_sessions(
  class_type_slug TEXT DEFAULT NULL,
  days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  session_id UUID,
  class_name TEXT,
  instructor_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  room_name TEXT,
  available_spots INTEGER,
  is_full BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as session_id,
    ct.name as class_name,
    i.first_name || ' ' || i.last_name as instructor_name,
    s.start_datetime as start_time,
    ct.duration_minutes as duration,
    r.name as room_name,
    (s.max_participants - s.current_participants) as available_spots,
    (s.current_participants >= s.max_participants) as is_full
  FROM sessions s
  JOIN class_types ct ON s.class_type_id = ct.id
  JOIN instructors i ON s.instructor_id = i.id
  LEFT JOIN rooms r ON s.room_id = r.id
  WHERE
    s.deleted_at IS NULL
    AND s.status = 'scheduled'
    AND s.start_datetime >= NOW()
    AND s.start_datetime <= NOW() + (days_ahead || ' days')::INTERVAL
    AND (class_type_slug IS NULL OR ct.slug = class_type_slug)
  ORDER BY s.start_datetime ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

-- Vérifier les tables créées
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN (
  'instructors',
  'class_types',
  'rooms',
  'sessions',
  'bookings'
)
ORDER BY tablename;

-- =============================================================================
-- ✅ TABLES YOGA CRÉÉES
-- =============================================================================
-- Tables:
--   1. instructors - Professeurs de yoga
--   2. class_types - Types de cours (Hatha, Vinyasa, etc.)
--   3. rooms - Salles de cours
--   4. sessions - Séances planifiées
--   5. bookings - Réservations des participants
--
-- Fonctionnalités:
--   - RLS activé sur toutes les tables
--   - Soft delete pattern sur tables principales
--   - Auto-update du compteur de participants
--   - Fonctions helper pour requêtes courantes
--   - Support liste d'attente
--   - Support cours récurrents
--
-- À faire ensuite:
--   - Créer seeds avec exemples de cours
--   - Créer composants React pour booking
--   - Implémenter système de paiement si nécessaire
-- =============================================================================
