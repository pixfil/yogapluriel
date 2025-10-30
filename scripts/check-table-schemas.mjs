#!/usr/bin/env node

/**
 * Vérifier le schéma de chaque table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Vérification des schémas de tables...\n');

async function checkTableSchema(tableName) {
  console.log(`📋 Table: ${tableName}`);

  // Tenter de récupérer le premier élément pour voir les colonnes
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .limit(1);

  if (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
    return;
  }

  console.log(`   ✅ ${count || 0} éléments dans la table`);

  if (data && data.length > 0) {
    console.log(`   📊 Colonnes disponibles:`, Object.keys(data[0]).join(', '));
    console.log(`   🔍 Premier élément:`, JSON.stringify(data[0], null, 2));
  } else {
    console.log(`   ⚠️  Table vide, impossible de voir les colonnes`);
  }

  console.log('');
}

async function main() {
  await checkTableSchema('projects');
  await checkTableSchema('faq');
  await checkTableSchema('lexique');
  await checkTableSchema('certifications');

  console.log('✅ Diagnostic terminé!');
}

main().catch(console.error);
