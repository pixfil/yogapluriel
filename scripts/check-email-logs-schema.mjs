import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('📋 Vérification du schéma email_logs...\n');

  // Essayer d'insérer un email log de test pour voir quelle colonne manque
  const { data, error } = await supabase
    .from('email_logs')
    .insert({
      to_email: 'test@example.com',
      from_email: 'test@formdetoit.fr',
      subject: 'Test',
      status: 'sent',
    })
    .select();

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Test insert réussi:', data);
  }
}

checkSchema();
