-- =============================================================================
-- DEMO CONTENT SEEDS - Données d'Exemple (OPTIONNEL)
-- =============================================================================
-- Ce fichier crée des données de démonstration pour tester l'application.
-- ⚠️ À NE PAS utiliser en production ! Seulement pour DEV/STAGING.
-- =============================================================================

-- =============================================================================
-- 1. TEAM / ÉQUIPE (Exemples)
-- =============================================================================

INSERT INTO team (name, role, bio, email, photo_url, is_active, display_order) VALUES
(
  'John Doe',
  'CEO & Founder',
  'Passionné par l''innovation et la technologie, John a fondé l''entreprise en 2020 avec la vision de créer des solutions exceptionnelles.',
  'john@example.com',
  'https://i.pravatar.cc/300?img=12',
  true,
  1
),
(
  'Jane Smith',
  'CTO',
  'Experte en architecture logicielle avec 15 ans d''expérience. Jane dirige notre équipe technique avec brio.',
  'jane@example.com',
  'https://i.pravatar.cc/300?img=45',
  true,
  2
),
(
  'Mike Johnson',
  'Lead Developer',
  'Développeur fullstack passionné, spécialisé en Next.js et Supabase. Mike aime résoudre des problèmes complexes.',
  'mike@example.com',
  'https://i.pravatar.cc/300?img=33',
  true,
  3
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 2. FAQ (Exemples)
-- =============================================================================

INSERT INTO faq (question, answer, category, published, order_index) VALUES
(
  'Comment démarrer avec ce boilerplate ?',
  'Suivez le guide de démarrage rapide dans la documentation (docs/01-QUICK-START.md). En 30 minutes, votre application sera opérationnelle !',
  'Démarrage',
  true,
  1
),
(
  'Puis-je utiliser ce boilerplate pour un projet commercial ?',
  'Oui ! Ce boilerplate est sous licence MIT, vous êtes libre de l''utiliser pour vos projets personnels et commerciaux.',
  'Licence',
  true,
  2
),
(
  'Comment personnaliser les couleurs ?',
  'Modifiez les variables CSS dans src/app/globals.css. Les couleurs principales sont définies en tant que variables CSS (--primary, --secondary, etc.).',
  'Personnalisation',
  true,
  3
),
(
  'Le boilerplate est-il optimisé pour le SEO ?',
  'Oui ! Il inclut des meta tags dynamiques, génération de sitemap, structured data (Schema.org), et redirections SEO.',
  'SEO',
  true,
  4
),
(
  'Puis-je ajouter mes propres tables ?',
  'Absolument ! Créez simplement une nouvelle migration SQL dans supabase/migrations_organized/, appliquez-la, et régénérez les types TypeScript.',
  'Base de données',
  true,
  5
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. LEXIQUE / GLOSSAIRE (Exemples)
-- =============================================================================

INSERT INTO lexique (term, definition, category, published) VALUES
(
  'Next.js',
  'Framework React pour le développement d''applications web modernes avec rendu côté serveur (SSR) et génération statique (SSG).',
  'Technologies',
  true
),
(
  'Supabase',
  'Alternative open-source à Firebase. Fournit une base de données PostgreSQL, authentification, storage et functions.',
  'Technologies',
  true
),
(
  'RLS',
  'Row Level Security - Sécurité au niveau des lignes dans PostgreSQL. Permet de définir des règles d''accès aux données directement dans la base de données.',
  'Sécurité',
  true
),
(
  'Server Actions',
  'Fonctions serveur dans Next.js 15 qui permettent d''exécuter du code côté serveur directement depuis les composants React.',
  'Technologies',
  true
),
(
  'Soft Delete',
  'Pattern de suppression où les données ne sont pas réellement supprimées mais marquées comme "deleted" avec une date. Permet la récupération.',
  'Patterns',
  true
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. CERTIFICATIONS / LABELS (Exemples)
-- =============================================================================

-- INSERT INTO certifications (name, description, logo_url, url, is_active, order_index) VALUES
-- (
--   'ISO 9001',
--   'Certification qualité internationale',
--   '/certifications/iso-9001.png',
--   'https://www.iso.org',
--   true,
--   1
-- ),
-- (
--   'RGPD Compliant',
--   'Conformité au Règlement Général sur la Protection des Données',
--   '/certifications/rgpd.png',
--   'https://www.cnil.fr',
--   true,
--   2
-- )
-- ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. CATEGORIES (Exemples)
-- =============================================================================

-- INSERT INTO categories (name, slug, description, color, order_index) VALUES
-- ('Web Development', 'web-dev', 'Projets de développement web', '#3B82F6', 1),
-- ('Mobile Apps', 'mobile', 'Applications mobiles', '#8B5CF6', 2),
-- ('Design', 'design', 'Projets de design UI/UX', '#EC4899', 3)
-- ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 6. PORTFOLIO / PROJECTS (Exemples)
-- =============================================================================

-- Décommentez si vous avez une table projects ou portfolio_items
/*
INSERT INTO projects (title, slug, description, published, featured, main_image) VALUES
(
  'Application E-commerce',
  'app-ecommerce',
  'Plateforme e-commerce moderne avec Next.js, Supabase et Stripe. Gestion complète des produits, panier, paiements et commandes.',
  true,
  true,
  'https://images.unsplash.com/photo-1557821552-17105176677c?w=800'
),
(
  'Dashboard Analytics',
  'dashboard-analytics',
  'Dashboard d''analytics en temps réel avec graphiques interactifs, exportation PDF et notifications.',
  true,
  false,
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
),
(
  'Site Vitrine Premium',
  'site-vitrine-premium',
  'Site vitrine haut de gamme avec animations, dark mode et optimisation SEO avancée.',
  true,
  true,
  'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800'
)
ON CONFLICT (slug) DO NOTHING;
*/

-- =============================================================================
-- 7. POPUPS (Exemples)
-- =============================================================================

-- INSERT INTO popups (
--   title,
--   message,
--   cta_text,
--   cta_url,
--   style,
--   position,
--   start_date,
--   end_date,
--   is_active
-- ) VALUES
-- (
--   '🎉 Bienvenue !',
--   'Découvrez notre nouveau boilerplate Next.js + Supabase',
--   'En savoir plus',
--   '/docs',
--   'info',
--   'top',
--   NOW(),
--   NOW() + INTERVAL '30 days',
--   true
-- )
-- ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. REDIRECTIONS (Exemples)
-- =============================================================================

-- INSERT INTO redirects (from_path, to_path, type, notes) VALUES
-- ('/old-page', '/new-page', 301, 'Migration ancien site'),
-- ('/blog/*', '/articles/*', 301, 'Wildcard redirect pour blog')
-- ON CONFLICT (from_path) DO NOTHING;

-- =============================================================================
-- 9. NEWSLETTER SUBSCRIBERS (Exemples)
-- =============================================================================

-- INSERT INTO newsletter_subscribers (email, name, status, source) VALUES
-- ('test1@example.com', 'Test User 1', 'active', 'homepage_footer'),
-- ('test2@example.com', 'Test User 2', 'active', 'popup'),
-- ('test3@example.com', 'Test User 3', 'unsubscribed', 'contact_form')
-- ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- VÉRIFICATIONS
-- =============================================================================

-- Compter les données insérées
SELECT
  'Team members' as table_name,
  COUNT(*) as count
FROM team
WHERE deleted_at IS NULL

UNION ALL

SELECT
  'FAQ items',
  COUNT(*)
FROM faq
WHERE deleted_at IS NULL

UNION ALL

SELECT
  'Lexique terms',
  COUNT(*)
FROM lexique
WHERE deleted_at IS NULL;

-- =============================================================================
-- ✅ DEMO CONTENT SEEDS APPLIQUÉS
-- =============================================================================
-- Vous pouvez maintenant :
-- 1. Tester l'admin avec ces données
-- 2. Voir comment les CRUD fonctionnent
-- 3. Supprimer ces données avant de passer en production
--
-- Pour supprimer les données de démo :
-- DELETE FROM team WHERE email LIKE '%@example.com';
-- DELETE FROM faq WHERE category IN ('Démarrage', 'Licence', 'Personnalisation');
-- DELETE FROM lexique WHERE category IN ('Technologies', 'Sécurité', 'Patterns');
-- =============================================================================
