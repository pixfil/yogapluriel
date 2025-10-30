import { getAllRedirects, getRedirectStats } from "@/app/actions/redirects";
import AdminRedirectsClient from "@/components/admin/AdminRedirectsClient";

export default async function RedirectionsPage() {
  // Fetch all redirects including deleted ones
  const redirects = await getAllRedirects(true);
  const stats = await getRedirectStats();

  return <AdminRedirectsClient initialRedirects={redirects} initialStats={stats} />;
}
