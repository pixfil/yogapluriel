import { getCertifications } from '@/app/actions/certifications';
import AdminCertificationsClient from '@/components/admin/AdminCertificationsClient';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Certifications - Admin FormDeToit',
  description: 'Gérer les certifications et labels',
};

export default async function AdminCertificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all certifications (including deleted ones for trash view)
  const certifications = await getCertifications(true);

  return <AdminCertificationsClient initialCertifications={certifications} />;
}
