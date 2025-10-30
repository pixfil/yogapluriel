# 🧘 Yoga Pluriel - Plateforme de Gestion

> Plateforme web moderne pour la gestion de l'association Yoga Pluriel à Strasbourg Neudorf

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-latest-green)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⚡ Quick Start (30 minutes)

```bash
# 1. Cloner le projet
git clone https://github.com/votre-org/boilerplate-nextjs-supabase.git mon-projet
cd mon-projet

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# → Remplir avec vos clés Supabase

# 4. Créer la base de données
# → Suivre le guide : docs/01-QUICK-START.md

# 5. Lancer le projet
npm run dev
```

**🎉 Votre app tourne sur http://localhost:3000**

👉 **Guide complet** : [docs/01-QUICK-START.md](./docs/01-QUICK-START.md)

---

## ✨ Ce que vous Obtenez

### 💰 Économisez 10-16 Semaines

**Sans ce boilerplate :**
- Auth + RBAC : **2-3 semaines**
- Admin complet : **4-6 semaines**
- Emails : **2 semaines**
- Sécurité : **2 semaines**
- **Total : 10-16 semaines** ⏱️

**Avec ce boilerplate :**
- Installation : **30 min**
- Personnalisation : **1-2 jours**
- **Total : ~3 jours** ✨

### 🎯 Features Principales

```
✅ Authentification Supabase (SSR + 4 rôles)
✅ Admin Panel (15+ modules CRUD)
✅ Email System (Resend + tracking)
✅ Sécurité (rate limiting, spam, reCAPTCHA)
✅ UI/UX (shadcn/ui + dark mode)
✅ SEO (redirects, 404 tracking)
✅ Documentation (12 guides)
```

---

## 📚 Documentation

| Guide | Priorité |
|-------|----------|
| [Quick Start](./docs/01-QUICK-START.md) | 🔥 **START HERE** |
| [Overview](./docs/00-OVERVIEW.md) | ⭐⭐⭐ |
| [Database](./docs/03-DATABASE.md) | ⭐⭐⭐ |
| [Customization](./docs/09-CUSTOMIZATION.md) | ⭐⭐⭐ |
| [Deployment](./docs/08-DEPLOYMENT.md) | ⭐⭐⭐ |

**Tous les guides** : [docs/](./docs)

---

## 🏗️ Stack

- **Framework** : Next.js 15.5.2 (App Router)
- **Language** : TypeScript 5
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **UI** : Tailwind CSS + shadcn/ui
- **Email** : Resend + React Email
- **Security** : Upstash Redis + reCAPTCHA

---

## 📁 Structure

```
src/
├── app/
│   ├── (admin)/        # Routes protégées (15+ modules)
│   ├── (public)/       # Routes publiques
│   ├── actions/        # Server Actions
│   └── api/            # API routes
├── components/
│   ├── admin/          # Composants admin
│   └── ui/             # UI (shadcn)
├── lib/                # Utils, Supabase, validations
├── emails/             # Templates email
└── middleware.ts       # Auth

supabase/
├── migrations/         # SQL migrations (25+ tables)
├── seeds/              # Données de démo
└── rls/                # RLS policies

docs/                   # 12 guides complets
```

---

## ⚙️ Commandes

```bash
npm run dev          # Dev server
npm run build        # Build prod
npm run start        # Start prod
npm run lint         # ESLint
npm run type-check   # TypeScript
npm run db:types     # Régénérer types Supabase
```

---

## 🚀 Déploiement

```bash
# Vercel (recommandé)
git push
# → Importer sur vercel.com
# → Configurer env vars
# → Deploy !
```

**Guide complet** : [docs/08-DEPLOYMENT.md](./docs/08-DEPLOYMENT.md)

---

## 🎯 Parfait Pour

- 🌐 Sites vitrine avec admin
- 📝 Applications SaaS
- 🏢 Plateformes de gestion
- 🚀 MVPs rapides

---

## 📄 License

MIT - Libre d'utilisation

---

## 🙏 Crédits

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Resend](https://resend.com)

---

**🚀 Prêt ? → [Quick Start](./docs/01-QUICK-START.md)**
