import { Suspense } from "react";
import AdminJobsClient from "@/components/admin/AdminJobsClient";
import { getAllJobOpenings, getJobOpeningsStats } from "@/app/actions/team";

export const metadata = {
  title: "Recrutement - Admin FormDeToit",
  description: "Gestion des offres d'emploi",
};

async function JobsContent() {
  const [jobs, stats] = await Promise.all([
    getAllJobOpenings(true), // Include deleted for trash view
    getJobOpeningsStats(),
  ]);

  return (
    <AdminJobsClient
      initialJobs={jobs}
      stats={stats}
    />
  );
}

export default function AdminJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
