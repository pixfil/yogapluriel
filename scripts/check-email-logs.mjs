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

async function checkEmailLogs() {
  console.log('📧 Vérification des emails logs...\n');

  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (data.length === 0) {
    console.log('⚠️ Aucun email dans les logs');
    return;
  }

  console.log(`✅ ${data.length} emails trouvés:\n`);

  data.forEach((email, index) => {
    console.log(`${index + 1}. ${email.template_name}`);
    console.log(`   À: ${email.to_email}`);
    console.log(`   De: ${email.from_email}`);
    console.log(`   Statut: ${email.status}`);
    console.log(`   Resend ID: ${email.resend_id}`);
    console.log(`   Date: ${new Date(email.created_at).toLocaleString('fr-FR')}`);
    console.log('');
  });
}

checkEmailLogs();
