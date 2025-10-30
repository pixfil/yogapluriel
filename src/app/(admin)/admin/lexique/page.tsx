import { getLexiqueTerms } from '@/app/actions/lexique';
import AdminLexiqueClient from '@/components/admin/AdminLexiqueClient';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Lexique - Admin FormDeToit',
  description: 'Gérer les termes techniques du lexique',
};

export default async function AdminLexiquePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all terms (including deleted ones for trash view)
  const terms = await getLexiqueTerms(true);

  return <AdminLexiqueClient initialTerms={terms} />;
}
