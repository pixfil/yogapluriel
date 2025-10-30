import { Suspense } from "react";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";
import {
  getMaintenanceSettings,
  getGeneralSettings,
  getAnalyticsSettings,
  getSeoSettings,
  getSecuritySettings,
  getFeaturesSettings,
  getEmailSettings,
} from "@/app/actions/settings";
import { getAIChatbotSettings } from "@/app/actions/ai-chatbot-settings";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Paramètres - Admin FormDeToit",
  description: "Configuration du site",
};

async function SettingsContent() {
  // Fetch all settings types in parallel
  const [maintenanceSettings, generalSettings, analyticsSettings, seoSettings, securitySettings, featuresSettings, emailSettings, aiSettings] =
    await Promise.all([
      getMaintenanceSettings(),
      getGeneralSettings(),
      getAnalyticsSettings(),
      getSeoSettings(),
      getSecuritySettings(),
      getFeaturesSettings(),
      getEmailSettings(),
      getAIChatbotSettings(),
    ]);

  return (
    <AdminSettingsClient
      initialMaintenanceSettings={maintenanceSettings}
      initialGeneralSettings={generalSettings}
      initialAnalyticsSettings={analyticsSettings}
      initialSeoSettings={seoSettings}
      initialSecuritySettings={securitySettings}
      initialFeaturesSettings={featuresSettings}
      initialEmailSettings={emailSettings}
      initialAiSettings={aiSettings}
    />
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-yellow" />
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Gérez la configuration globale du site
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}
