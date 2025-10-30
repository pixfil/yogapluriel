// Import types from actions instead of redefining them
export type {
  GeneralSettings,
  AnalyticsSettings,
  SeoSettings,
  SecuritySettings,
  MaintenanceSettings,
} from "@/app/actions/settings";

// Type for Features settings (new)
export interface FeaturesSettings {
  chatbot_enabled: boolean;
}

// Props pour SettingsSection
export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => void;
  isSaving?: boolean;
  error?: string | null;
}
