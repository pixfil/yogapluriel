#!/usr/bin/env node

/**
 * Test direct de la table lexique avec service role
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

console.log('🔍 Test direct de la table lexique...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public'
  }
});

async function testLexique() {
  // Test avec select *
  console.log('📋 Test 1: SELECT * avec service role');
  const { data: data1, error: error1, count: count1 } = await supabase
    .from('lexique')
    .select('*', { count: 'exact' })
    .limit(3);

  console.log('   Résultat:', {
    count: count1,
    hasData: !!data1,
    dataLength: data1?.length,
    error: error1?.message || 'none'
  });

  if (data1 && data1.length > 0) {
    console.log('   📊 Colonnes:', Object.keys(data1[0]).join(', '));
    console.log('   🔍 Premier élément:', data1[0]);
  }

  console.log('');

  // Test via RPC pour bypass RLS
  console.log('📋 Test 2: Via fonction SQL (bypass RLS)');
  const { data: data2, error: error2 } = await supabase
    .rpc('exec_sql', {
      query: 'SELECT * FROM lexique LIMIT 3'
    });

  console.log('   Résultat:', {
    hasData: !!data2,
    error: error2?.message || 'none'
  });

  console.log('\n✅ Tests terminés!');
}

testLexique().catch(console.error);
