#!/usr/bin/env node

/**
 * Tester la recherche RAG en appelant searchEmbeddings()
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env first
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Now import after env is loaded
const { searchEmbeddings } = await import('../src/app/actions/embeddings.ts');

async function testSearch(query, threshold) {
  console.log(`\n🔍 Recherche: "${query}"`);
  console.log(`   Threshold: ${threshold}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const results = await searchEmbeddings(query, { threshold, limit: 5 });

    console.log(`✅ Résultats trouvés: ${results?.length || 0}`);

    if (results && results.length > 0) {
      results.forEach((result, i) => {
        console.log(`\n   ${i + 1}. Type: ${result.content_type} (ID: ${result.content_id})`);
        console.log(`      Similarité: ${(result.similarity * 100).toFixed(2)}%`);
        console.log(`      Texte: ${result.content_text.substring(0, 100).replace(/\n/g, ' ')}...`);
      });
    } else {
      console.log('   ⚠️  Aucun résultat au-dessus du threshold');
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function main() {
  console.log('🚀 Test de recherche RAG\n');

  const tests = [
    { query: 'quelles sont les horaires de formdetoit ?', thresholds: [0.7, 0.6, 0.5, 0.4, 0.3] },
    { query: 'quelle est l\'adresse ?', thresholds: [0.7, 0.5] },
    { query: 'horaires', thresholds: [0.5] },
  ];

  for (const test of tests) {
    for (const threshold of test.thresholds) {
      await testSearch(test.query, threshold);
    }
  }

  console.log('\n\n✅ Tests terminés!');
}

main().catch(console.error);
