#!/usr/bin/env node

/**
 * Vérifier la table FAQ en détail
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Vérification détaillée de la table FAQ...\n');

async function checkFAQ() {
  // Test 1: Essayer 'faq'
  console.log('📋 Test 1: Table "faq"');
  const { data: faq1, error: error1 } = await supabase
    .from('faq')
    .select('*')
    .limit(3);

  if (error1) {
    console.log(`   ❌ Erreur: ${error1.message}`);
  } else {
    console.log(`   ✅ Trouvé ${faq1?.length || 0} éléments`);
    if (faq1 && faq1.length > 0) {
      console.log(`   📊 Colonnes:`, Object.keys(faq1[0]).join(', '));
      console.log(`   🔍 Premier élément:`, JSON.stringify(faq1[0], null, 2));
    }
  }

  console.log('');

  // Test 2: Essayer 'faqs'
  console.log('📋 Test 2: Table "faqs"');
  const { data: faq2, error: error2 } = await supabase
    .from('faqs')
    .select('*')
    .limit(3);

  if (error2) {
    console.log(`   ❌ Erreur: ${error2.message}`);
  } else {
    console.log(`   ✅ Trouvé ${faq2?.length || 0} éléments`);
    if (faq2 && faq2.length > 0) {
      console.log(`   📊 Colonnes:`, Object.keys(faq2[0]).join(', '));
      console.log(`   🔍 Premier élément:`, JSON.stringify(faq2[0], null, 2));
    }
  }

  console.log('\n✅ Tests terminés!');
}

checkFAQ().catch(console.error);
