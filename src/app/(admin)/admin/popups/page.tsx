import { getAllPopups } from '@/app/actions/popups';
import AdminPopupsClient from '@/components/admin/AdminPopupsClient';

export const metadata = {
  title: 'Gestion des Popups - Admin FormDeToit',
  description: 'Gérer les popups du site FormDeToit',
};

export const dynamic = 'force-dynamic';

export default async function AdminPopupsPage() {
  const popups = await getAllPopups(true); // Include deleted for trash view

  return <AdminPopupsClient initialPopups={popups} />;
}
