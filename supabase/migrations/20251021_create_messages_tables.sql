-- =============================================
-- Phase 3 - Messages/Inbox System
-- Tables: contacts, calculator_submissions, quote_requests, email_logs
-- Date: 2025-10-21
-- =============================================

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Table: Contacts (formulaire contact)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Admin notes
  admin_notes TEXT,
  assigned_to UUID,

  -- Metadata
  source TEXT DEFAULT 'contact_form',
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  replied_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- Table: Calculator Submissions (calculateur aides)
CREATE TABLE IF NOT EXISTS calculator_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Project info
  project_type TEXT NOT NULL, -- 'isolation', 'toiture', 'velux', etc.
  surface NUMERIC,
  address TEXT,
  zip_code TEXT,

  -- Calculation results (stored as JSONB for flexibility)
  calculation_data JSONB NOT NULL,
  estimated_cost NUMERIC,
  total_aids NUMERIC,
  aids_details JSONB,

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quote_sent', 'converted', 'archived')),

  -- Admin notes
  admin_notes TEXT,
  assigned_to UUID,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- Table: Quote Requests (demandes de devis)
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  zip_code TEXT,
  city TEXT,

  -- Project info
  service_type TEXT NOT NULL, -- 'ardoise', 'tuile', 'zinc', 'isolation', etc.
  project_description TEXT NOT NULL,
  surface NUMERIC,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  preferred_date DATE,

  -- Budget
  estimated_budget TEXT, -- '< 5000', '5000-10000', '10000-20000', '> 20000'

  -- Additional info
  additional_info JSONB,
  photos TEXT[], -- Array of photo URLs if uploaded

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'quote_sent', 'accepted', 'rejected', 'archived')),

  -- Quote details
  quote_sent_at TIMESTAMP WITH TIME ZONE,
  quote_amount NUMERIC,
  quote_pdf_url TEXT,

  -- Admin tracking
  admin_notes TEXT,
  assigned_to UUID,

  -- Metadata
  source TEXT DEFAULT 'quote_form',
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- Table: Email Logs (logs des emails envoyés via Resend)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email identification
  resend_id TEXT UNIQUE, -- ID retourné par Resend
  message_id TEXT, -- Message-ID header

  -- Sender/Recipient
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  reply_to TEXT,

  -- Email content
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,

  -- Related record (optional)
  related_type TEXT, -- 'contact', 'calculator', 'quote', 'manual'
  related_id UUID, -- ID of related record

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'failed')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'queued', 'sent', 'delivered', 'delayed', 'bounced', 'complained')),

  -- Webhook tracking
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,

  -- Counters
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Bounce info
  bounce_type TEXT CHECK (bounce_type IS NULL OR bounce_type IN ('hard', 'soft')),
  bounce_reason TEXT,

  -- Error tracking
  error_message TEXT,
  error_code TEXT,

  -- Webhook events history
  webhook_events JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  tags TEXT[],
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

-- Contacts indexes
CREATE INDEX idx_contacts_status ON contacts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_priority ON contacts(priority) WHERE deleted_at IS NULL;

-- Calculator submissions indexes
CREATE INDEX idx_calculator_status ON calculator_submissions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_calculator_created_at ON calculator_submissions(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_calculator_email ON calculator_submissions(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_calculator_project_type ON calculator_submissions(project_type) WHERE deleted_at IS NULL;

-- Quote requests indexes
CREATE INDEX idx_quotes_status ON quote_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_created_at ON quote_requests(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_email ON quote_requests(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_service_type ON quote_requests(service_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_urgency ON quote_requests(urgency) WHERE deleted_at IS NULL;

-- Email logs indexes
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_logs_status ON email_logs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_logs_delivery_status ON email_logs(delivery_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_logs_related ON email_logs(related_type, related_id) WHERE related_id IS NOT NULL;
CREATE INDEX idx_email_logs_opened_at ON email_logs(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX idx_email_logs_clicked_at ON email_logs(clicked_at) WHERE clicked_at IS NOT NULL;
CREATE INDEX idx_email_logs_bounced_at ON email_logs(bounced_at) WHERE bounced_at IS NOT NULL;

-- Full-text search indexes
CREATE INDEX idx_contacts_search ON contacts
  USING gin(to_tsvector('french', name || ' ' || email || ' ' || COALESCE(message, '')))
  WHERE deleted_at IS NULL;

CREATE INDEX idx_quotes_search ON quote_requests
  USING gin(to_tsvector('french', name || ' ' || email || ' ' || COALESCE(project_description, '')))
  WHERE deleted_at IS NULL;

-- =============================================
-- 3. RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "contacts_insert_public" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contacts_select_authenticated" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contacts_update_authenticated" ON contacts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "contacts_delete_authenticated" ON contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- Calculator submissions policies
CREATE POLICY "calculator_insert_public" ON calculator_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "calculator_select_authenticated" ON calculator_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "calculator_update_authenticated" ON calculator_submissions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "calculator_delete_authenticated" ON calculator_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Quote requests policies
CREATE POLICY "quotes_insert_public" ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "quotes_select_authenticated" ON quote_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "quotes_update_authenticated" ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "quotes_delete_authenticated" ON quote_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Email logs policies (only authenticated users can access)
CREATE POLICY "email_logs_select_authenticated" ON email_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "email_logs_insert_authenticated" ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "email_logs_update_authenticated" ON email_logs
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "email_logs_delete_authenticated" ON email_logs
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 4. INSERT SAMPLE DATA (for testing)
-- =============================================

-- Sample contacts
INSERT INTO contacts (name, email, phone, subject, message, status, priority) VALUES
  ('Jean Dupont', 'jean.dupont@example.com', '0612345678', 'Question sur devis', 'Bonjour, j''aimerais obtenir un devis pour une rénovation de toiture en ardoise.', 'new', 'normal'),
  ('Marie Martin', 'marie.martin@example.com', '0687654321', 'Urgence fuite', 'Fuite importante sur ma toiture après les intempéries. Besoin d''une intervention rapide.', 'new', 'urgent'),
  ('Pierre Lefebvre', 'pierre.lefebvre@example.com', '0698765432', 'Demande d''information', 'Je souhaite des informations sur l''isolation de toiture avec aides financières.', 'read', 'normal');

-- Sample calculator submissions
INSERT INTO calculator_submissions (name, email, phone, project_type, surface, address, zip_code, calculation_data, estimated_cost, total_aids, status) VALUES
  ('Sophie Bernard', 'sophie.bernard@example.com', '0623456789', 'isolation', 120, '12 Rue de la Paix', '67000',
   '{"revenue_fiscal": 35000, "household_size": 4, "work_type": "isolation_combles"}'::jsonb,
   8000, 3500, 'new'),
  ('Luc Moreau', 'luc.moreau@example.com', '0634567890', 'toiture', 80, '5 Avenue des Vosges', '67100',
   '{"revenue_fiscal": 45000, "household_size": 2, "work_type": "renovation_toiture"}'::jsonb,
   15000, 2000, 'contacted');

-- Sample quote requests
INSERT INTO quote_requests (name, email, phone, address, zip_code, city, service_type, project_description, surface, urgency, status) VALUES
  ('François Petit', 'francois.petit@example.com', '0645678901', '28 Rue du Château', '67200', 'Strasbourg',
   'ardoise', 'Remplacement complet de la toiture en ardoise. Maison de 150m² au sol.', 150, 'normal', 'new'),
  ('Catherine Roux', 'catherine.roux@example.com', '0656789012', '7 Impasse des Lilas', '67300', 'Schiltigheim',
   'velux', 'Installation de 3 fenêtres de toit VELUX dans les combles.', 0, 'low', 'reviewed');

-- =============================================
-- 5. VERIFICATION QUERIES
-- =============================================

-- Count records in each table
SELECT 'Contacts' as table_name, COUNT(*) as count FROM contacts WHERE deleted_at IS NULL
UNION ALL
SELECT 'Calculator Submissions', COUNT(*) FROM calculator_submissions WHERE deleted_at IS NULL
UNION ALL
SELECT 'Quote Requests', COUNT(*) FROM quote_requests WHERE deleted_at IS NULL
UNION ALL
SELECT 'Email Logs', COUNT(*) FROM email_logs WHERE deleted_at IS NULL
ORDER BY table_name;

-- Show status distribution
SELECT
  'Contacts' as type,
  status,
  COUNT(*) as count
FROM contacts
WHERE deleted_at IS NULL
GROUP BY status
UNION ALL
SELECT
  'Calculator',
  status,
  COUNT(*)
FROM calculator_submissions
WHERE deleted_at IS NULL
GROUP BY status
UNION ALL
SELECT
  'Quotes',
  status,
  COUNT(*)
FROM quote_requests
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY type, status;

-- Show recent messages (unified view preview)
SELECT
  'contact' as type,
  id,
  name,
  email,
  created_at,
  status
FROM contacts
WHERE deleted_at IS NULL
UNION ALL
SELECT
  'calculator',
  id,
  name,
  email,
  created_at,
  status
FROM calculator_submissions
WHERE deleted_at IS NULL
UNION ALL
SELECT
  'quote',
  id,
  name,
  email,
  created_at,
  status
FROM quote_requests
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
