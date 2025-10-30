import { Suspense } from "react";
import AdminTeamClient from "@/components/admin/AdminTeamClient";
import { getAllTeamMembers, getTeamStats } from "@/app/actions/team";

export const metadata = {
  title: "Équipe - Admin FormDeToit",
  description: "Gestion de l'équipe Formdetoit",
};

async function TeamContent() {
  const [members, stats] = await Promise.all([
    getAllTeamMembers(true), // Include deleted for trash view
    getTeamStats(),
  ]);

  return (
    <AdminTeamClient
      initialMembers={members}
      stats={stats}
    />
  );
}

export default function AdminTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
