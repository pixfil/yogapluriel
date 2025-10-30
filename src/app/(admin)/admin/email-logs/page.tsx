import { Suspense } from "react";
import AdminEmailLogsClient from "@/components/admin/AdminEmailLogsClient";
import { getAllEmailLogs, getEmailLogsStats } from "@/app/actions/messages";

export const metadata = {
  title: "Email Logs - Admin FormDeToit",
  description: "Historique des emails envoyés",
};

async function EmailLogsContent() {
  const [emailLogs, stats] = await Promise.all([
    getAllEmailLogs(true), // Include deleted logs for trash view
    getEmailLogsStats(),
  ]);

  return (
    <AdminEmailLogsClient
      initialEmailLogs={emailLogs}
      stats={stats}
    />
  );
}

export default function AdminEmailLogsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Logs</h1>
        <p className="text-gray-600 mt-2">
          Historique de tous les emails envoyés via Resend
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
          </div>
        }
      >
        <EmailLogsContent />
      </Suspense>
    </div>
  );
}
