-- =============================================================================
-- YOGAPLURIEL V2 - SETUP COMPLET ALL-IN-ONE
-- =============================================================================
-- Ce script configure TOUT en une seule exécution :
-- 1. Reset du schéma (DÉTRUIT TOUTES LES DONNÉES!)
-- 2. Extensions PostgreSQL
-- 3. Fonctions helper
-- 4. Tables core (user_profiles, site_settings, faq)
-- 5. Tables communication (inbox, email_logs)
-- 6. Tables SEO (seo_pages)
-- 7. Tables YOGA (instructors, classes, sessions, bookings, memberships)
-- 8. RLS policies
-- 9. Storage buckets
-- 10. Données d'exemple
--
-- IMPORTANT: Ce script va DÉTRUIRE toutes les données existantes !
-- =============================================================================

-- =============================================================================
-- STEP 1: RESET (DÉTRUIT TOUT!)
-- =============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- =============================================================================
-- STEP 2: EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- STEP 3: FONCTIONS HELPER
-- =============================================================================

-- Fonction: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Générer un slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[àáâãäå]', 'a', 'g'),
        '[èéêë]', 'e', 'g'
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Type ENUM pour statut email
CREATE TYPE email_status AS ENUM (
  'pending', 'sent', 'delivered', 'opened',
  'clicked', 'bounced', 'failed', 'spam'
);

-- =============================================================================
-- STEP 4: TABLES CORE
-- =============================================================================

-- USER PROFILES (Profils utilisateurs + RBAC)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  roles JSONB DEFAULT '["viewer"]'::jsonb NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_profiles_status ON user_profiles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_roles ON user_profiles USING gin(roles);

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- USER ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_activity_user ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_created ON user_activity_logs(created_at);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonctions helper pour site_settings
CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT) RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT value FROM site_settings WHERE key = setting_key);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_maintenance_mode() RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((get_setting('maintenance')->'enabled')::boolean, false);
END;
$$ LANGUAGE plpgsql;

-- FAQ CATEGORIES
CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_faq_categories_updated_at
  BEFORE UPDATE ON faq_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- FAQ
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_faq_category ON faq(category_id) WHERE deleted_at IS NULL;

CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 5: TABLES COMMUNICATION
-- =============================================================================

-- INBOX
CREATE TABLE IF NOT EXISTS inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  form_type TEXT DEFAULT 'contact' NOT NULL,
  form_data JSONB,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'normal',
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  replied_at TIMESTAMP WITH TIME ZONE,
  spam_score INTEGER DEFAULT 0,
  is_spam BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_inbox_status ON inbox(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inbox_created ON inbox(created_at);

CREATE TRIGGER update_inbox_updated_at
  BEFORE UPDATE ON inbox
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- EMAIL LOGS
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT UNIQUE,
  message_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT,
  template_name TEXT,
  related_type TEXT,
  related_id UUID,
  status TEXT DEFAULT 'pending',
  delivery_status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  error_message TEXT,
  webhook_events JSONB DEFAULT '[]'::jsonb,
  metadata JSONB,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_email_logs_to ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);

CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 6: TABLES SEO
-- =============================================================================

-- SEO PAGES
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  parent_path TEXT,
  is_dynamic BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  include_in_sitemap BOOLEAN DEFAULT true,
  sitemap_priority DECIMAL(2,1) DEFAULT 0.5,
  sitemap_changefreq TEXT DEFAULT 'monthly',
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_seo_pages_path ON seo_pages(path) WHERE deleted_at IS NULL;

CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 7: TABLES YOGA
-- =============================================================================

-- INSTRUCTORS (Professeurs de yoga)
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  years_experience INTEGER,
  photo_url TEXT,
  website_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  color_code TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_instructors_active ON instructors(is_active) WHERE deleted_at IS NULL;

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CLASS TYPES (Types de cours)
CREATE TABLE IF NOT EXISTS class_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  level TEXT,
  max_participants INTEGER DEFAULT 15,
  image_url TEXT,
  icon TEXT,
  color TEXT DEFAULT '#8B5CF6',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  benefits TEXT[],
  prerequisites TEXT,
  equipment_needed TEXT[],
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_class_types_slug ON class_types(slug) WHERE deleted_at IS NULL;

CREATE TRIGGER update_class_types_updated_at
  BEFORE UPDATE ON class_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ROOMS (Salles)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  location TEXT,
  floor TEXT,
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  color_code TEXT,
  notes TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- SESSIONS (Séances planifiées)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_type_id UUID NOT NULL REFERENCES class_types(id) ON DELETE RESTRICT,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE RESTRICT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 15,
  current_participants INTEGER DEFAULT 0,
  waiting_list_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'cancelled', 'completed', 'in_progress')
  ),
  cancellation_reason TEXT,
  notes TEXT,
  special_instructions TEXT,
  recurring_event_id UUID,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime)
);

CREATE INDEX idx_sessions_start ON sessions(start_datetime) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_instructor ON sessions(instructor_id);
CREATE INDEX idx_sessions_class_type ON sessions(class_type_id);

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- BOOKINGS (Réservations)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_name TEXT,
  participant_email TEXT,
  participant_phone TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'attended', 'no_show', 'waiting_list')
  ),
  waiting_list_position INTEGER,
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'free')
  ),
  payment_method TEXT,
  amount_paid DECIMAL(10, 2),
  notes TEXT,
  special_needs TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT booking_has_participant CHECK (
    user_id IS NOT NULL OR (
      participant_name IS NOT NULL AND
      participant_email IS NOT NULL
    )
  )
);

CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- MEMBERSHIP PLANS (Formules d'abonnement)
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (
    plan_type IN ('unlimited', 'credit_based', 'time_based')
  ),
  credits INTEGER,
  credits_validity_days INTEGER,
  duration_days INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  allowed_class_types UUID[],
  max_bookings_per_week INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  benefits TEXT[],
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_membership_plans_slug ON membership_plans(slug);

CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- MEMBERSHIPS (Adhésions utilisateurs)
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  credits_total INTEGER,
  credits_remaining INTEGER,
  credits_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'cancelled', 'suspended')
  ),
  auto_renew BOOLEAN DEFAULT false,
  renewal_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'failed')
  ),
  payment_method TEXT,
  amount_paid DECIMAL(10, 2),
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ATTENDANCE (Présences)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_name TEXT,
  participant_email TEXT,
  status TEXT DEFAULT 'present' CHECK (
    status IN ('present', 'absent', 'late', 'left_early')
  ),
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  credits_used INTEGER DEFAULT 1,
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT attendance_has_participant CHECK (
    user_id IS NOT NULL OR participant_name IS NOT NULL
  )
);

CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_user ON attendance(user_id);

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- SESSION REVIEWS (Avis sur les cours)
CREATE TABLE IF NOT EXISTS session_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_session_reviews_session ON session_reviews(session_id);

CREATE TRIGGER update_session_reviews_updated_at
  BEFORE UPDATE ON session_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 8: FONCTIONS YOGA
-- =============================================================================

-- Fonction: Mettre à jour le compteur de participants
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

-- =============================================================================
-- STEP 9: RLS POLICIES
-- =============================================================================

-- USER PROFILES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by everyone"
ON user_profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- INSTRUCTORS
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active instructors"
ON instructors FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

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

-- CLASS TYPES
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

-- ROOMS
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

-- SESSIONS
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

-- BOOKINGS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their bookings"
ON bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

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

-- MEMBERSHIPS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their memberships"
ON memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid());

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

-- MEMBERSHIP PLANS
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active plans"
ON membership_plans FOR SELECT
TO public
USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage plans"
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

-- ATTENDANCE
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their attendance"
ON attendance FOR SELECT
TO authenticated
USING (user_id = auth.uid());

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

-- SESSION REVIEWS
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verified reviews"
ON session_reviews FOR SELECT
TO public
USING (is_public = true AND is_verified = true);

CREATE POLICY "Users can manage their reviews"
ON session_reviews FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- FAQ
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published FAQ"
ON faq FOR SELECT
TO public
USING (published = true AND deleted_at IS NULL);

-- FAQ CATEGORIES
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published categories"
ON faq_categories FOR SELECT
TO public
USING (published = true AND deleted_at IS NULL);

-- INBOX
ALTER TABLE inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inbox"
ON inbox FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND (roles ? 'super_admin' OR roles ? 'admin')
  )
);

-- SEO PAGES
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view SEO pages"
ON seo_pages FOR SELECT
TO public
USING (deleted_at IS NULL);

-- =============================================================================
-- STEP 10: DONNÉES D'EXEMPLE
-- =============================================================================

-- Site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('general', '{"siteName": "Yoga Pluriel", "tagline": "Pratique du yoga accessible à tous"}', 'Configuration générale'),
  ('maintenance', '{"enabled": false}', 'Mode maintenance')
ON CONFLICT (key) DO NOTHING;

-- Types de cours
INSERT INTO class_types (name, slug, description, duration_minutes, level, color, benefits)
VALUES
  ('Hatha Yoga', 'hatha-yoga', 'Pratique traditionnelle douce axée sur les postures et la respiration', 75, 'Tous niveaux', '#8B5CF6', ARRAY['Améliore la souplesse', 'Renforce les muscles', 'Réduit le stress']),
  ('Vinyasa Flow', 'vinyasa-flow', 'Yoga dynamique où les postures s''enchaînent de manière fluide', 60, 'Intermédiaire', '#EC4899', ARRAY['Cardio doux', 'Améliore l''endurance', 'Renforce tout le corps']),
  ('Yin Yoga', 'yin-yoga', 'Pratique méditative où les postures sont tenues longuement', 90, 'Tous niveaux', '#06B6D4', ARRAY['Mobilité articulaire', 'Relaxation profonde', 'Réduit les tensions'])
ON CONFLICT (slug) DO NOTHING;

-- Salles
INSERT INTO rooms (name, capacity, location, amenities)
VALUES
  ('Salle Lotus', 20, '10 rue du Rhin, 67100 Strasbourg', ARRAY['Tapis fournis', 'Vestiaire', 'Eau fraîche']),
  ('Salle Mandala', 15, '10 rue du Rhin, 67100 Strasbourg', ARRAY['Tapis fournis', 'Coussins', 'Blocs et sangles'])
ON CONFLICT (name) DO NOTHING;

-- Formules d'abonnement
INSERT INTO membership_plans (name, slug, plan_type, credits, credits_validity_days, price)
VALUES
  ('Cours à l''unité', 'cours-unite', 'credit_based', 1, 30, 18.00),
  ('Carte 10 séances', 'carte-10', 'credit_based', 10, 90, 150.00),
  ('Abonnement Mensuel', 'abonnement-mensuel', 'unlimited', NULL, 30, 75.00)
ON CONFLICT (slug) DO NOTHING;

-- FAQ Categories
INSERT INTO faq_categories (title, icon, description, display_order)
VALUES
  ('Cours & Pratique', 'Activity', 'Questions sur nos cours et la pratique du yoga', 1),
  ('Réservations & Tarifs', 'CreditCard', 'Tout savoir sur les inscriptions et les tarifs', 2)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ✅ SETUP COMPLET !
-- =============================================================================
-- Tables créées : 21 tables
-- RLS activé sur toutes les tables
-- Données d'exemple insérées
--
-- PROCHAINE ÉTAPE:
-- Donner les droits super_admin à votre utilisateur :
--
-- UPDATE user_profiles
-- SET roles = '["super_admin"]'::jsonb
-- WHERE email = 'VOTRE_EMAIL@example.com';
-- =============================================================================
