"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { Json } from "@/lib/database.types";

/**
 * Helper pour convertir Json de Supabase vers un type typé
 */
function fromJson<T>(json: Json | null | undefined, defaultValue: T): T {
  if (json === null || json === undefined) {
    return defaultValue;
  }
  return json as unknown as T;
}

/**
 * Helper pour convertir un type typé vers Json de Supabase
 */
function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

export interface MaintenanceSettings {
  enabled: boolean;
  title: string;
  message: string;
}

export interface GeneralSettings {
  phone: string;
  email: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface AnalyticsSettings {
  google_analytics: string;
  google_tag_manager: string;
  meta_pixel: string;
  clarity: string;
}

export interface SeoSettings {
  default_title: string;
  default_description: string;
  default_og_image: string;
  company_name: string;
  service_area: string;
  keywords: string;
}

export interface SecuritySettings {
  recaptcha_enabled: boolean;
  recaptcha_site_key: string;
  recaptcha_secret_key: string;
  spam_filter_enabled: boolean;
}

export interface FeaturesSettings {
  chatbot_enabled: boolean;
}

export interface EmailSettings {
  notification_emails: string[];
  test_mode_enabled: boolean;
  test_mode_recipient: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Json; // Type BDD Supabase
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

/**
 * Get maintenance mode settings
 */
export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "maintenance")
    .single();

  if (error || !data) {
    // Silent fallback if table doesn't exist yet (before migration)
    // Only log if it's not a "table not found" error
    if (error && !error.message?.includes("site_settings")) {
      console.error("Error fetching maintenance settings:", error);
    }
    return {
      enabled: false,
      title: "Maintenance en cours",
      message: "Nous effectuons une maintenance pour améliorer votre expérience. Nous reviendrons très bientôt !",
    };
  }

  return data.value as unknown as MaintenanceSettings;
}

/**
 * Update maintenance mode settings
 */
export async function updateMaintenanceSettings(
  settings: MaintenanceSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "maintenance");

  if (error) {
    console.error("Error updating maintenance settings:", error);
    return { success: false, error: error.message };
  }

  // Revalidate all pages
  revalidatePath("/", "layout");

  return { success: true };
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const currentSettings = await getMaintenanceSettings();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: { ...currentSettings, enabled },
      updated_at: new Date().toISOString(),
    })
    .eq("key", "maintenance");

  if (error) {
    console.error("Error toggling maintenance mode:", error);
    return { success: false, error: error.message };
  }

  // Revalidate all pages
  revalidatePath("/", "layout");

  return { success: true };
}

/**
 * Get all site settings
 */
export async function getAllSettings(): Promise<SiteSetting[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching settings:", error);
    return [];
  }

  return data || [];
}

/**
 * Get general settings
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .single();

  if (error || !data) {
    console.error("Error fetching general settings:", error);
    return {
      phone: "",
      email: "",
      address: "",
      hours: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    };
  }

  return data.value as unknown as GeneralSettings;
}

/**
 * Update general settings
 */
export async function updateGeneralSettings(
  settings: GeneralSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "general");

  if (error) {
    console.error("Error updating general settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Get analytics settings
 */
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "analytics")
    .single();

  if (error || !data) {
    console.error("Error fetching analytics settings:", error);
    return {
      google_analytics: "",
      google_tag_manager: "",
      meta_pixel: "",
      clarity: "",
    };
  }

  return data.value as unknown as AnalyticsSettings;
}

/**
 * Update analytics settings
 */
export async function updateAnalyticsSettings(
  settings: AnalyticsSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "analytics");

  if (error) {
    console.error("Error updating analytics settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Get SEO settings
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "seo")
    .single();

  if (error || !data) {
    console.error("Error fetching SEO settings:", error);
    return {
      default_title: "FormDeToit - Couverture, Zinguerie, Isolation à Strasbourg",
      default_description: "Artisan couvreur à Strasbourg spécialisé en rénovation de toiture, zinguerie, isolation écologique. Devis gratuit.",
      default_og_image: "/og-image.jpg",
      company_name: "FormDeToit",
      service_area: "Strasbourg et environs (Bas-Rhin, 67)",
      keywords: "couvreur strasbourg, rénovation toiture, zinguerie, isolation biosourcée, velux",
    };
  }

  return data.value as unknown as SeoSettings;
}

/**
 * Update SEO settings
 */
export async function updateSeoSettings(
  settings: SeoSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "seo");

  if (error) {
    console.error("Error updating SEO settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Get security settings (reCAPTCHA)
 */
export async function getSecuritySettings(): Promise<SecuritySettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "security")
    .single();

  if (error || !data) {
    console.error("Error fetching security settings:", error);
    return {
      recaptcha_enabled: false,
      recaptcha_site_key: "",
      recaptcha_secret_key: "",
      spam_filter_enabled: true, // Activé par défaut
    };
  }

  return data.value as unknown as SecuritySettings;
}

/**
 * Update security settings (reCAPTCHA)
 */
export async function updateSecuritySettings(
  settings: SecuritySettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "security");

  if (error) {
    console.error("Error updating security settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Get features settings
 */
export async function getFeaturesSettings(): Promise<FeaturesSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "features")
    .single();

  if (error || !data) {
    console.error("Error fetching features settings:", error);
    return {
      chatbot_enabled: true, // Default to enabled
    };
  }

  return data.value as unknown as FeaturesSettings;
}

/**
 * Update features settings
 */
export async function updateFeaturesSettings(
  settings: FeaturesSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "features");

  if (error) {
    console.error("Error updating features settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Get email settings (notification recipients)
 */
export async function getEmailSettings(): Promise<EmailSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "emails")
    .single();

  if (error || !data) {
    console.error("Error fetching email settings:", error);
    return {
      notification_emails: ["contact@formdetoit.fr"],
      test_mode_enabled: false,
      test_mode_recipient: "philippeheit@gmail.com",
    };
  }

  return data.value as unknown as EmailSettings;
}

/**
 * Update email settings
 */
export async function updateEmailSettings(
  settings: EmailSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: toJson(settings),
      updated_at: new Date().toISOString(),
    })
    .eq("key", "emails");

  if (error) {
    console.error("Error updating email settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
