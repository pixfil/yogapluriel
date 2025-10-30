#!/usr/bin/env node

/**
 * Afficher le contenu complet de l'embedding company-info
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
    persistSession: false,
  },
});

async function checkCompanyEmbedding() {
  console.log('🔍 Contenu de l\'embedding company-info...\n');

  const { data, error } = await supabase
    .from('content_embeddings')
    .select('*')
    .eq('content_type', 'company-info')
    .single();

  if (error) {
    console.log('❌ Erreur:', error.message);
    return;
  }

  if (!data) {
    console.log('⚠️  Aucun embedding company-info trouvé');
    return;
  }

  console.log('✅ Embedding trouvé:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ID:', data.id);
  console.log('Content Type:', data.content_type);
  console.log('Content ID:', data.content_id);
  console.log('Created At:', data.created_at);
  console.log('Updated At:', data.updated_at);
  console.log('\n📄 TEXTE COMPLET INDEXÉ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(data.content_text);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 METADATA:');
  console.log(JSON.stringify(data.metadata, null, 2));
  console.log('');

  console.log('🔍 Embedding vector length:', data.embedding?.length || 0);
}

checkCompanyEmbedding().catch(console.error);
