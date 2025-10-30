#!/usr/bin/env node

/**
 * Script de diagnostic - Vérifier le contenu de la BDD
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Vérification du contenu de la base de données...\n');

async function checkTable(tableName, columns = '*') {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select(columns, { count: 'exact', head: false });

    if (error) {
      console.error(`❌ ${tableName}:`, error.message);
      return;
    }

    console.log(`✅ ${tableName}: ${count || 0} éléments`);

    if (data && data.length > 0) {
      console.log(`   Premier élément:`, JSON.stringify(data[0], null, 2).slice(0, 200) + '...');
    }

    console.log('');
  } catch (error) {
    console.error(`❌ ${tableName}:`, error.message);
  }
}

async function main() {
  await checkTable('projects', 'id, title, published');
  await checkTable('faq', 'id, question, published');
  await checkTable('lexique', 'id, terme, published');
  await checkTable('certifications', 'id, title, published');
  await checkTable('content_embeddings', 'id, content_type, content_id');

  console.log('✅ Diagnostic terminé!');
}

main().catch(console.error);
