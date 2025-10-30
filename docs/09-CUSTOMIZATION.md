# 🎨 Guide de Personnalisation

> Comment adapter ce boilerplate à votre projet spécifique

---

## 📋 Vue d'Ensemble

Ce guide vous montre comment:
1. Renommer et rebrand le projet
2. Personnaliser les couleurs et le design
3. Adapter la base de données
4. Modifier les fonctionnalités
5. Ajouter vos propres features

---

## 🏷️ Étape 1: Renommer le Projet

### 1. Modifier package.json

```json
{
  "name": "votre-projet",  // ← Changer ici
  "version": "1.0.0",
  "description": "Votre description",  // ← Et ici
  "author": "Votre Nom",  // ← Et ici
  ...
}
```

### 2. Mettre à Jour app.config.ts

```typescript
// src/config/app.config.ts

const defaultConfig: AppConfig = {
  site: {
    name: 'Votre Nom de Site',      // ← Principal
    url: 'https://votre-site.com',   // ← URL
    description: 'Votre description',
    tagline: 'Votre tagline',
  },

  company: {
    name: 'Votre Société',           // ← Entreprise
    email: 'contact@votre-site.com',
    phone: '+33 X XX XX XX XX',
    address: 'Votre adresse',
  },

  branding: {
    primaryColor: '#3B82F6',         // ← Couleur principale
    // ...
  },
}
```

### 3. Rechercher et Remplacer (Global)

**Chercher dans tout le projet:**

```bash
# Rechercher "Mon Application" (nom par défaut)
# Remplacer par "Votre Projet"
```

**Fichiers concernés:**
- `src/config/app.config.ts`
- `supabase/seeds/01_core.sql`
- `README.md`
- Meta tags dans `app/layout.tsx`

### 4. Favicon & Logo

**Remplacer les fichiers:**
```
public/
├── favicon.ico          ← Votre favicon (16x16, 32x32)
├── apple-touch-icon.png ← 180x180 px
├── og-image.png         ← Open Graph 1200x630 px
└── logo.svg             ← Votre logo SVG
```

**Générer favicon:**
- Outil: [realfavicongenerator.net](https://realfavicongenerator.net)
- Upload votre logo
- Télécharger le package
- Remplacer dans `/public`

---

## 🎨 Étape 2: Personnaliser les Couleurs

### 1. Tailwind Config

```javascript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        // Vos couleurs principales
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // ← Principale
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Couleur secondaire
        secondary: {
          500: '#8b5cf6',
          // ...
        },

        // Couleur accent
        accent: {
          500: '#f59e0b',
        }
      }
    }
  }
}
```

**Générateur de palette:** [uicolors.app](https://uicolors.app/create)

### 2. CSS Variables (Dark Mode)

```css
/* app/globals.css */

@layer base {
  :root {
    /* Light mode */
    --primary: 221 83% 53%;        /* Votre couleur */
    --secondary: 262 83% 58%;
    --accent: 38 92% 50%;

    --background: 0 0% 100%;
    --foreground: 222 47% 11%;

    /* ... autres variables */
  }

  .dark {
    /* Dark mode */
    --primary: 217 91% 60%;
    --secondary: 263 70% 50%;

    --background: 222 47% 11%;
    --foreground: 213 31% 91%;

    /* ... autres variables */
  }
}
```

### 3. App Config Colors

```typescript
// src/config/app.config.ts

branding: {
  primaryColor: '#3B82F6',  // ← Votre couleur principale (hex)
  logo: '/logo.svg',
  favicon: '/favicon.ico',
}
```

---

## 🗄️ Étape 3: Personnaliser la Base de Données

### Scénario 1: Utiliser Tel Quel

**Si le schéma convient parfaitement:**
1. Appliquer toutes les migrations
2. Modifier seulement les données (seeds)
3. Cacher les modules non utilisés dans l'admin

**Désactiver un module:**
```typescript
// src/config/app.config.ts

features: {
  blog: false,           // ← Désactiver blog
  chatbot: false,
  newsletter: true,
  jobs: false,           // ← Désactiver recrutement
  // ...
}
```

### Scénario 2: Supprimer des Tables

**Exemple: Supprimer les tables `job_openings` et `job_applications`:**

1. **NE PAS appliquer** `01_content/001_team.sql` (ou commenter les sections jobs)
2. Supprimer les components admin liés
3. Supprimer les routes API liées

**Ou créer une migration custom:**
```sql
-- supabase/migrations_organized/99_custom/001_remove_jobs.sql

DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_openings CASCADE;
```

### Scénario 3: Ajouter des Colonnes

**Exemple: Ajouter `specialty` à `team`:**

```sql
-- supabase/migrations_organized/99_custom/002_add_team_specialty.sql

ALTER TABLE team
ADD COLUMN specialty TEXT;

CREATE INDEX idx_team_specialty
ON team(specialty)
WHERE deleted_at IS NULL;

COMMENT ON COLUMN team.specialty IS 'Spécialité du membre (ex: "Yoga Ashtanga", "Pilates")';
```

### Scénario 4: Créer Nouvelle Table

**Exemple: Ajouter table `services`:**

```sql
-- supabase/migrations_organized/99_custom/003_create_services.sql

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  duration_minutes INTEGER,

  -- Image
  image_url TEXT,

  -- Publication
  is_active BOOLEAN DEFAULT true,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_services_slug ON services(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_active ON services(is_active) WHERE deleted_at IS NULL;

-- Trigger updated_at
CREATE TRIGGER trigger_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND deleted_at IS NULL
      AND (roles ? 'super_admin' OR roles ? 'admin')
    )
  );
```

**Puis régénérer les types:**
```bash
npm run db:types
```

---

## 📝 Étape 4: Adapter les Textes

### 1. Meta Tags & SEO

**Modifier dans chaque page:**

```typescript
// app/page.tsx

export const metadata: Metadata = {
  title: 'Accueil | Votre Site',      // ← Personnaliser
  description: 'Votre description SEO unique en 150-160 caractères.',
  openGraph: {
    title: 'Votre Site - Tagline',
    description: 'Description pour réseaux sociaux',
    url: 'https://votre-site.com',
    images: ['/og-image.png'],
  },
}
```

### 2. Footer & Header

```typescript
// components/layout/Footer.tsx

export function Footer() {
  return (
    <footer>
      <div>
        <h3>Votre Entreprise</h3>           {/* ← Personnaliser */}
        <p>Votre slogan ou description</p>   {/* ← Personnaliser */}
      </div>

      <div>
        <h4>Navigation</h4>
        {/* Vos liens */}
      </div>

      <div>
        <p>&copy; {new Date().getFullYear()} Votre Entreprise. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
```

### 3. Pages Légales

**Modifier:**
- `app/(public)/mentions-legales/page.tsx`
- `app/(public)/politique-confidentialite/page.tsx`
- `app/(public)/cgu/page.tsx` (si existe)

**Modèle mentions légales:**
```typescript
// Remplacer toutes les occurrences de:
- Nom entreprise
- Adresse
- SIRET
- Email contact
- Hébergeur
```

### 4. Emails Templates

**Fichiers à personnaliser:**
```
emails/
├── welcome.tsx              ← Email bienvenue
├── contact-confirmation.tsx ← Confirmation contact
├── admin-notification.tsx   ← Notification admin
└── password-reset.tsx       ← Réinit mot de passe
```

**Dans chaque template:**
```typescript
// emails/welcome.tsx

<Html>
  <Head>
    <title>Bienvenue sur Votre Site</title>  {/* ← Changer */}
  </Head>
  <Body>
    <Container>
      <Heading>Bienvenue !</Heading>
      <Text>
        Merci de vous être inscrit sur Votre Site.  {/* ← Changer */}
      </Text>
      {/* ... */}
    </Container>
  </Body>
</Html>
```

---

## 🧩 Étape 5: Ajouter des Fonctionnalités

### Exemple: Ajouter un Blog

#### 1. Créer Migration

```sql
-- supabase/migrations_organized/99_custom/010_create_blog.sql

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,  -- Markdown
  cover_image TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Auteur
  author_id UUID REFERENCES user_profiles(id),

  -- Publication
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Stats
  view_count INTEGER DEFAULT 0,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Categories blog
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relation many-to-many
CREATE TABLE blog_post_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Index & RLS
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ... policies ...
```

#### 2. Créer Routes Next.js

```typescript
// app/(public)/blog/page.tsx - Liste articles

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return <div>{/* Liste des articles */}</div>
}
```

```typescript
// app/(public)/blog/[slug]/page.tsx - Article

export default async function BlogPostPage({ params }) {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  return <article>{/* Afficher article */}</article>
}
```

#### 3. Créer Admin Panel

```typescript
// app/(admin)/admin/blog/page.tsx - Liste admin

export default async function AdminBlogPage() {
  // CRUD complet pour gérer les articles
}
```

#### 4. Activer dans Config

```typescript
// src/config/app.config.ts

features: {
  blog: true,  // ← Activer
  // ...
}
```

---

## 🎭 Étape 6: Personnaliser l'Admin Panel

### 1. Modifier la Navigation

```typescript
// components/admin/Sidebar.tsx (ou équivalent)

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Vos Services', href: '/admin/services', icon: Package },  // ← Custom
  { name: 'Équipe', href: '/admin/team', icon: Users },
  { name: 'Messages', href: '/admin/inbox', icon: Mail },
  // Ajouter/supprimer selon besoins
]
```

### 2. Personnaliser le Dashboard

```typescript
// app/(admin)/admin/page.tsx

export default async function AdminDashboard() {
  // Vos stats personnalisées
  const stats = {
    totalServices: await getServicesCount(),     // ← Custom
    totalMembers: await getTeamCount(),
    newMessages: await getUnreadMessagesCount(),
    // ...
  }

  return (
    <div>
      <h1>Tableau de Bord - Votre Site</h1>  {/* ← Personnaliser */}
      {/* Vos composants stats */}
    </div>
  )
}
```

### 3. Branding Admin

**Couleurs admin (si différent du site public):**

```css
/* app/(admin)/admin/globals-admin.css */

.admin-sidebar {
  background: #1e293b;  /* ← Votre couleur */
}

.admin-header {
  background: #0f172a;  /* ← Votre couleur */
}
```

---

## 🔌 Étape 7: Intégrations Tierces

### Ajouter Stripe (Paiements)

```bash
npm install @stripe/stripe-js stripe
```

```typescript
// lib/stripe.ts

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})
```

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Ajouter Google Maps

```bash
npm install @googlemaps/js-api-loader
```

```typescript
// components/Map.tsx

import { Loader } from '@googlemaps/js-api-loader'

export function Map() {
  // Votre composant Google Maps
}
```

### Ajouter Analytics

**Google Analytics 4:**
```typescript
// app/layout.tsx

import Script from 'next/script'

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

---

## 🌐 Étape 8: Multi-Langue (i18n)

### Option 1: next-intl (Recommandé)

```bash
npm install next-intl
```

```typescript
// middleware.ts

import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
})
```

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
```

### Option 2: next-i18next

Pour des projets plus complexes nécessitant namespaces et contextes avancés.

---

## 📱 Étape 9: PWA (Progressive Web App)

```bash
npm install next-pwa
```

```javascript
// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // ... votre config
})
```

**Créer `public/manifest.json`:**
```json
{
  "name": "Votre Application",
  "short_name": "VotreApp",
  "description": "Description de votre app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Étape 10: Tests (Optionnel)

### Vitest (Unit Tests)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// __tests__/example.test.ts

import { describe, it, expect } from 'vitest'

describe('Example', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Playwright (E2E Tests)

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/login.spec.ts

import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/admin/login')
  await page.fill('input[name="email"]', 'admin@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/admin')
})
```

---

## 📚 Ressources & Outils

### Design

- **Couleurs:** [coolors.co](https://coolors.co), [uicolors.app](https://uicolors.app)
- **Icons:** [lucide.dev](https://lucide.dev), [heroicons.com](https://heroicons.com)
- **Fonts:** [fonts.google.com](https://fonts.google.com)
- **Illustrations:** [undraw.co](https://undraw.co), [storyset.com](https://storyset.com)

### Composants UI

- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com) (déjà inclus)
- **Headless UI:** [headlessui.com](https://headlessui.com)
- **Radix UI:** [radix-ui.com](https://radix-ui.com) (déjà inclus)

### Outils Dev

- **Type Generation:** `npm run db:types`
- **Linting:** `npm run lint`
- **Formatting:** `npm run format` (si Prettier configuré)

---

## ✅ Checklist de Personnalisation

**Branding:**
- [ ] Nom du projet changé (package.json)
- [ ] App config personnalisé
- [ ] Favicon & logo remplacés
- [ ] Couleurs adaptées (Tailwind + CSS vars)
- [ ] Meta tags & SEO personnalisés

**Contenu:**
- [ ] Textes génériques remplacés
- [ ] Pages légales modifiées
- [ ] Footer & Header adaptés
- [ ] Templates email personnalisés

**Base de Données:**
- [ ] Tables non utilisées supprimées (ou migrations non appliquées)
- [ ] Colonnes custom ajoutées si besoin
- [ ] Nouvelles tables créées si besoin
- [ ] Types régénérés (`npm run db:types`)

**Admin:**
- [ ] Navigation admin adaptée
- [ ] Dashboard personnalisé
- [ ] Modules inutiles cachés

**Fonctionnalités:**
- [ ] Features activées/désactivées (app.config.ts)
- [ ] Intégrations tierces configurées
- [ ] Nouveaux modules ajoutés si besoin

---

## 🎓 Bonnes Pratiques

1. **Tester en Local D'Abord**
   - Toujours tester chaque modif localement
   - Vérifier que le build fonctionne (`npm run build`)

2. **Git Commits Atomiques**
   - Un commit par feature/modif
   - Messages clairs: "feat: add services table"

3. **Documentation**
   - Documenter vos ajouts custom
   - Mettre à jour README si changements majeurs

4. **Sauvegarde BDD**
   - Exporter schema avant grosses modifs
   - Tester migrations sur copie de BDD

5. **Environment Séparés**
   - DEV: Tests et expérimentations
   - STAGING: Validation finale
   - PRODUCTION: Stable et testé

---

**🚀 Votre boilerplate est maintenant adapté à votre projet !**

→ Prochaine étape: [Déploiement](./08-DEPLOYMENT.md)
→ Retour à la [Documentation](../README.md)
