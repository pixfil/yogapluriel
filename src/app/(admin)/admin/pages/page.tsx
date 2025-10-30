import { getAllPages, getPageStats } from '@/app/actions/pages';
import AdminPagesClient from '@/components/admin/AdminPagesClient';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Pages & SEO - Admin FormDeToit',
  description: 'Gérer le référencement de toutes les pages du site',
};

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all pages and stats
  const [pages, stats] = await Promise.all([
    getAllPages(false),
    getPageStats(),
  ]);

  return <AdminPagesClient initialPages={pages} stats={stats} />;
}
