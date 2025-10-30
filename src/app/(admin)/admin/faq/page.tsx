import { Suspense } from "react";
import AdminFAQClient from "@/components/admin/AdminFAQClient";
import { getCategoriesWithQuestions, getCategoryStats } from "@/app/actions/faq";
import { AlertTriangle, Database } from "lucide-react";

export const metadata = {
  title: "FAQ - Admin FormDeToit",
  description: "Gestion des questions fréquentes",
};

async function FAQContent() {
  try {
    const [categoriesWithQuestions, stats] = await Promise.all([
      getCategoriesWithQuestions(true), // Include deleted for trash view
      getCategoryStats(),
    ]);

    return (
      <AdminFAQClient
        initialCategories={categoriesWithQuestions}
        stats={stats}
      />
    );
  } catch (error) {
    // Check if it's a "table not found" error
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Tables FAQ non configurées
            </h3>
            <p className="text-orange-800 mb-4">
              Les tables de base de données pour la FAQ n'ont pas encore été créées.
            </p>
            <div className="bg-white border border-orange-200 rounded-md p-4 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Instructions pour créer les tables:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Allez sur votre tableau de bord Supabase</li>
                <li>Ouvrez l'éditeur SQL</li>
                <li>Exécutez le fichier: <code className="bg-gray-100 px-2 py-1 rounded text-xs">supabase/migrations/20251021_create_faq_tables.sql</code></li>
                <li>Rafraîchissez cette page</li>
              </ol>
            </div>
            <p className="text-xs text-orange-700">
              Erreur technique: {errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default function AdminFAQPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FAQ</h1>
        <p className="text-gray-600 mt-2">
          Gérez les catégories et questions fréquentes
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
          </div>
        }
      >
        <FAQContent />
      </Suspense>
    </div>
  );
}
