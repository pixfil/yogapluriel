#!/usr/bin/env node

/**
 * Script de correction de la contrainte CHECK sur certifications.category
 * Permet d'accepter les nouvelles catégories: quality, expertise, territorial, network
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env.local') });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixConstraint() {
  console.log('🔧 Correction de la contrainte CHECK sur certifications.category...\n');

  try {
    // Supprimer l'ancienne contrainte
    console.log('1️⃣  Suppression de l\'ancienne contrainte...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE certifications DROP CONSTRAINT IF EXISTS certifications_category_check;'
    });

    if (dropError) {
      // Si la fonction n'existe pas, on utilise une requête directe
      console.log('   ⚠️  Fonction RPC non disponible, utilisation de la méthode alternative...');

      // On va utiliser une table temporaire pour exécuter le SQL
      const sql1 = `
        ALTER TABLE certifications
        DROP CONSTRAINT IF EXISTS certifications_category_check;
      `;

      console.log('   Requête SQL:', sql1);
      console.log('   ⚠️  Exécutez cette requête manuellement dans Supabase SQL Editor\n');
    } else {
      console.log('   ✅ Ancienne contrainte supprimée\n');
    }

    // Ajouter la nouvelle contrainte
    console.log('2️⃣  Ajout de la nouvelle contrainte...');
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE certifications ADD CONSTRAINT certifications_category_check CHECK (category IN ('quality', 'expertise', 'territorial', 'network'));`
    });

    if (addError) {
      const sql2 = `
        ALTER TABLE certifications
        ADD CONSTRAINT certifications_category_check
        CHECK (category IN ('quality', 'expertise', 'territorial', 'network'));
      `;

      console.log('   Requête SQL:', sql2);
      console.log('\n📋 COPIEZ ET EXÉCUTEZ CES REQUÊTES dans Supabase Dashboard → SQL Editor:\n');
      console.log('-- 1. Supprimer ancienne contrainte');
      console.log('ALTER TABLE certifications DROP CONSTRAINT IF EXISTS certifications_category_check;\n');
      console.log('-- 2. Ajouter nouvelle contrainte');
      console.log('ALTER TABLE certifications ADD CONSTRAINT certifications_category_check');
      console.log('CHECK (category IN (\'quality\', \'expertise\', \'territorial\', \'network\'));\n');

      console.log('💡 Ensuite, relancez le script: node scripts/insert-certifications.mjs');
    } else {
      console.log('   ✅ Nouvelle contrainte ajoutée\n');
      console.log('✅ Migration terminée ! Vous pouvez maintenant exécuter:');
      console.log('   node scripts/insert-certifications.mjs');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
fixConstraint();
