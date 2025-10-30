#!/usr/bin/env node

/**
 * Lister toutes les tables Supabase
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Liste des tables dans le schéma public...\n');

async function listTables() {
  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

  if (error) {
    // Fallback : essayer quelques noms de tables courants
    console.log('⚠️  Impossible de lister via SQL, essayons manuellement...\n');

    const tablesToTest = [
      'projects',
      'faq',
      'faqs',
      'lexique',
      'certifications',
      'certificates',
      'team_members',
      'job_openings',
      'contacts',
      'quotes',
      'content_embeddings',
      'ai_chatbot_settings'
    ];

    for (const table of tablesToTest) {
      try {
        const { error: testError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!testError) {
          console.log(`✅ ${table}`);
        }
      } catch (e) {
        // Table n'existe pas
      }
    }
  } else {
    console.log('📋 Tables trouvées:');
    data.forEach((row) => console.log(`  - ${row.table_name}`));
  }
}

listTables().catch(console.error);
