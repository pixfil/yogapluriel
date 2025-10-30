import { Suspense } from "react";
import AdminAccountsClient from "@/components/admin/AdminAccountsClient";
import { getAllUsers, getUserStats } from "@/app/actions/users";

async function AccountsContent() {
  const [users, stats] = await Promise.all([
    getAllUsers(true), // Include deleted for trash view
    getUserStats()
  ]);

  return <AdminAccountsClient initialUsers={users} stats={stats} />;
}

export default function AdminAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow"></div>
        </div>
      }
    >
      <AccountsContent />
    </Suspense>
  );
}
