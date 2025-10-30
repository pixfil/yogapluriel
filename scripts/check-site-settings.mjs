#!/usr/bin/env node

/**
 * Vérifier les données dans site_settings
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

console.log('🔍 Vérification de site_settings...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkSettings() {
  // Test 1: Voir toutes les clés
  console.log('📋 Test 1: Toutes les clés dans site_settings');
  const { data: allSettings, error: error1 } = await supabase
    .from('site_settings')
    .select('key, description')
    .order('key');

  if (error1) {
    console.log('   ❌ Erreur:', error1.message);
  } else {
    console.log(`   ✅ ${allSettings?.length || 0} entrées trouvées:`);
    allSettings?.forEach(s => console.log(`      - ${s.key}: ${s.description}`));
  }

  console.log('');

  // Test 2: Vérifier 'general'
  console.log('📋 Test 2: Contenu de la clé "general"');
  const { data: general, error: error2 } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'general')
    .single();

  if (error2) {
    console.log('   ❌ Erreur:', error2.message);
  } else if (general) {
    console.log('   ✅ Données trouvées:');
    console.log(JSON.stringify(general.value, null, 2));
  } else {
    console.log('   ⚠️  Aucune donnée pour la clé "general"');
  }

  console.log('');

  // Test 3: Vérifier les embeddings company-info
  console.log('📋 Test 3: Embeddings de type "company-info"');
  const { data: embeddings, error: error3 } = await supabase
    .from('content_embeddings')
    .select('id, content_type, content_id, content_text')
    .eq('content_type', 'company-info');

  if (error3) {
    console.log('   ❌ Erreur:', error3.message);
  } else {
    console.log(`   ✅ ${embeddings?.length || 0} embeddings trouvés`);
    embeddings?.forEach(e => {
      console.log(`      - ID: ${e.content_id}`);
      console.log(`        Texte: ${e.content_text.substring(0, 100)}...`);
    });
  }

  console.log('\n✅ Tests terminés!');
}

checkSettings().catch(console.error);
