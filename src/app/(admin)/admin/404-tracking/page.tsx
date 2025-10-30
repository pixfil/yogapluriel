import { getAll404Logs, get404Stats } from "@/app/actions/redirects";
import Admin404TrackingClient from "@/components/admin/Admin404TrackingClient";

export default async function Tracking404Page() {
  // Fetch all 404 logs
  const logs = await getAll404Logs();
  const stats = await get404Stats();

  return <Admin404TrackingClient initialLogs={logs} initialStats={stats} />;
}
