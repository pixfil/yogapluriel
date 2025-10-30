#!/usr/bin/env node

/**
 * Tester la recherche RAG avec différents thresholds
 */

import { createClient } from '@supabase/supabase-js';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.DEFAULT_OPENAI_API_KEY;

if (!openaiKey) {
  console.error('❌ DEFAULT_OPENAI_API_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testSearch(query, threshold) {
  console.log(`\n🔍 Recherche: "${query}"`);
  console.log(`   Threshold: ${threshold}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Générer l'embedding de la requête
  const openai = createOpenAI({ apiKey: openaiKey });
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Rechercher
  const { data, error } = await supabase.rpc('search_content_embeddings', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: 5,
    filter_content_type: null,
  });

  if (error) {
    console.log('❌ Erreur:', error.message);
    return;
  }

  console.log(`✅ Résultats trouvés: ${data?.length || 0}`);

  if (data && data.length > 0) {
    data.forEach((result, i) => {
      console.log(`\n   ${i + 1}. Type: ${result.content_type} (ID: ${result.content_id})`);
      console.log(`      Similarité: ${(result.similarity * 100).toFixed(2)}%`);
      console.log(`      Texte: ${result.content_text.substring(0, 80)}...`);
    });
  } else {
    console.log('   ⚠️  Aucun résultat au-dessus du threshold');
  }
}

async function main() {
  console.log('🚀 Test de recherche RAG\n');

  const queries = [
    'quelles sont les horaires de formdetoit ?',
    'quelle est l\'adresse ?',
    'horaires',
    'contact',
  ];

  const thresholds = [0.7, 0.5, 0.3, 0.1];

  for (const query of queries) {
    for (const threshold of thresholds) {
      await testSearch(query, threshold);
    }
  }

  console.log('\n\n✅ Tests terminés!');
}

main().catch(console.error);
