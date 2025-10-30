"use client";

import { useState } from "react";
import {
  Settings,
  Wrench,
  Save,
  AlertTriangle,
  Building2,
  BarChart3,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Shield,
} from "lucide-react";
import {
  MaintenanceSettings,
  GeneralSettings,
  AnalyticsSettings,
  SeoSettings,
  SecuritySettings,
  FeaturesSettings,
  EmailSettings,
  updateMaintenanceSettings,
  updateGeneralSettings,
  updateAnalyticsSettings,
  updateSeoSettings,
  updateSecuritySettings,
  updateFeaturesSettings,
  updateEmailSettings,
} from "@/app/actions/settings";
import {
  AIChatbotSettings,
  updateAIChatbotSettings,
} from "@/app/actions/ai-chatbot-settings";
import FeaturesSettingsTab from "./settings/FeaturesSettingsTab";

interface AdminSettingsClientProps {
  initialMaintenanceSettings: MaintenanceSettings;
  initialGeneralSettings: GeneralSettings;
  initialAnalyticsSettings: AnalyticsSettings;
  initialSeoSettings: SeoSettings;
  initialSecuritySettings: SecuritySettings;
  initialFeaturesSettings: FeaturesSettings;
  initialEmailSettings: EmailSettings;
  initialAiSettings: AIChatbotSettings;
}

type TabType = "general" | "analytics" | "seo" | "security" | "maintenance" | "features" | "emails";

export default function AdminSettingsClient({
  initialMaintenanceSettings,
  initialGeneralSettings,
  initialAnalyticsSettings,
  initialSeoSettings,
  initialSecuritySettings,
  initialFeaturesSettings,
  initialEmailSettings,
  initialAiSettings,
}: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Settings state
  const [maintenanceSettings, setMaintenanceSettings] = useState(initialMaintenanceSettings);
  const [generalSettings, setGeneralSettings] = useState(initialGeneralSettings);
  const [analyticsSettings, setAnalyticsSettings] = useState(initialAnalyticsSettings);
  const [seoSettings, setSeoSettings] = useState(initialSeoSettings);
  const [securitySettings, setSecuritySettings] = useState(initialSecuritySettings);
  const [featuresSettings, setFeaturesSettings] = useState(initialFeaturesSettings);
  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);
  const [aiSettings, setAiSettings] = useState(initialAiSettings);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Save handlers
  const handleSaveGeneral = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    const result = await updateGeneralSettings(generalSettings);

    if (result.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres généraux enregistrés avec succès !",
      });
    } else {
      setSaveStatus({
        type: "error",
        message: result.error || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const handleSaveAnalytics = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    const result = await updateAnalyticsSettings(analyticsSettings);

    if (result.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres analytics enregistrés avec succès !",
      });
    } else {
      setSaveStatus({
        type: "error",
        message: result.error || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const handleSaveSeo = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    const result = await updateSeoSettings(seoSettings);

    if (result.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres SEO enregistrés avec succès !",
      });
    } else {
      setSaveStatus({
        type: "error",
        message: result.error || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    const result = await updateSecuritySettings(securitySettings);

    if (result.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres de sécurité enregistrés avec succès !",
      });
    } else {
      setSaveStatus({
        type: "error",
        message: result.error || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const handleSaveMaintenance = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    const result = await updateMaintenanceSettings(maintenanceSettings);

    if (result.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres de maintenance enregistrés avec succès !",
      });
      // Refresh page to update header badge
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setSaveStatus({
        type: "error",
        message: result.error || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    // Sauvegarder les features settings
    const result = await updateFeaturesSettings(featuresSettings);

    // Sauvegarder aussi les AI chatbot settings
    const aiResult = await updateAIChatbotSettings(aiSettings);

    if (result.success && aiResult.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres de fonctionnalités et chatbot AI enregistrés avec succès !",
      });
    } else {
      const errors = [];
      if (!result.success) errors.push(result.error);
      if (!aiResult.success) errors.push(aiResult.error);

      setSaveStatus({
        type: "error",
        message: errors.join('. ') || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const handleSaveEmails = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    const result = await updateEmailSettings(emailSettings);

    if (result.success) {
      setSaveStatus({
        type: "success",
        message: "Paramètres d'emails enregistrés avec succès !",
      });
    } else {
      setSaveStatus({
        type: "error",
        message: result.error || "Erreur lors de l'enregistrement",
      });
    }

    setIsSaving(false);
  };

  const tabs = [
    { id: "general" as TabType, label: "Général", icon: Building2 },
    { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
    { id: "seo" as TabType, label: "SEO", icon: Search },
    { id: "security" as TabType, label: "Sécurité", icon: Shield },
    { id: "emails" as TabType, label: "Emails", icon: Mail },
    { id: "features" as TabType, label: "Fonctionnalités", icon: Settings },
    { id: "maintenance" as TabType, label: "Maintenance", icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaveStatus({ type: null, message: "" });
                }}
                className={`
                  group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "border-yellow text-black"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-yellow" : "text-gray-400 group-hover:text-gray-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content: Général */}
      {activeTab === "general" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-yellow" />
              <h2 className="text-xl font-semibold text-gray-900">
                Informations Générales
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Coordonnées de l'entreprise, horaires et réseaux sociaux
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                value={generalSettings.phone}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="03 XX XX XX XX"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={generalSettings.email}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="contact@formdetoit.fr"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Adresse complète
              </label>
              <textarea
                id="address"
                value={generalSettings.address}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, address: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                placeholder="Rue, Code postal, Ville"
              />
            </div>

            {/* Hours */}
            <div>
              <label htmlFor="hours" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Horaires d'ouverture
              </label>
              <textarea
                id="hours"
                value={generalSettings.hours}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, hours: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                placeholder="Lun-Ven: 8h-18h&#10;Sam: 9h-12h&#10;Dim: Fermé"
              />
            </div>

            {/* Social Media */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Réseaux sociaux</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="facebook" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    value={generalSettings.facebook}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, facebook: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="https://facebook.com/formdetoit"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    value={generalSettings.instagram}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, instagram: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="https://instagram.com/formdetoit"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    value={generalSettings.linkedin}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, linkedin: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="https://linkedin.com/company/formdetoit"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {saveStatus.type && (
                  <p
                    className={`text-sm ${
                      saveStatus.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {saveStatus.message}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Analytics */}
      {activeTab === "analytics" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-yellow" />
              <h2 className="text-xl font-semibold text-gray-900">
                Analytics & Tracking
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Identifiants des outils de suivi et d'analyse (Google Analytics, GTM, Meta Pixel, Clarity)
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Google Analytics */}
            <div>
              <label htmlFor="ga" className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                id="ga"
                value={analyticsSettings.google_analytics}
                onChange={(e) =>
                  setAnalyticsSettings({ ...analyticsSettings, google_analytics: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: G-XXXXXXXXXX (exemple: G-12345ABCDE)
              </p>
            </div>

            {/* Google Tag Manager */}
            <div>
              <label htmlFor="gtm" className="block text-sm font-medium text-gray-700 mb-2">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                id="gtm"
                value={analyticsSettings.google_tag_manager}
                onChange={(e) =>
                  setAnalyticsSettings({ ...analyticsSettings, google_tag_manager: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: GTM-XXXXXXX (exemple: GTM-ABC1234)
              </p>
            </div>

            {/* Meta Pixel */}
            <div>
              <label htmlFor="meta" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Pixel Facebook ID
              </label>
              <input
                type="text"
                id="meta"
                value={analyticsSettings.meta_pixel}
                onChange={(e) =>
                  setAnalyticsSettings({ ...analyticsSettings, meta_pixel: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="123456789012345"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format numérique (15-16 chiffres)
              </p>
            </div>

            {/* Microsoft Clarity */}
            <div>
              <label htmlFor="clarity" className="block text-sm font-medium text-gray-700 mb-2">
                Microsoft Clarity ID
              </label>
              <input
                type="text"
                id="clarity"
                value={analyticsSettings.clarity}
                onChange={(e) =>
                  setAnalyticsSettings({ ...analyticsSettings, clarity: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="abc123xyz"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: code alphanumérique (exemple: abc123xyz)
              </p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>ℹ️ Information :</strong>
              </p>
              <p className="text-sm text-blue-700">
                Les scripts de tracking seront automatiquement injectés dans le site
                dès que vous renseignerez les identifiants ci-dessus. Laissez vide
                pour désactiver un outil spécifique.
              </p>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {saveStatus.type && (
                  <p
                    className={`text-sm ${
                      saveStatus.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {saveStatus.message}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveAnalytics}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: SEO */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-yellow" />
              <h2 className="text-xl font-semibold text-gray-900">
                Référencement SEO
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Paramètres de référencement globaux (meta tags par défaut, Schema.org)
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Default Title */}
            <div>
              <label htmlFor="seo-title" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title par défaut
              </label>
              <input
                type="text"
                id="seo-title"
                value={seoSettings.default_title}
                onChange={(e) =>
                  setSeoSettings({ ...seoSettings, default_title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="FormDeToit - Couverture, Zinguerie, Isolation à Strasbourg"
                maxLength={70}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Titre affiché dans les résultats de recherche
                </p>
                <span
                  className={`text-xs font-medium ${
                    seoSettings.default_title.length <= 60
                      ? "text-green-600"
                      : seoSettings.default_title.length <= 70
                      ? "text-orange-500"
                      : "text-red-600"
                  }`}
                >
                  {seoSettings.default_title.length} / 60-70 caractères
                </span>
              </div>
            </div>

            {/* Default Description */}
            <div>
              <label htmlFor="seo-description" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description par défaut
              </label>
              <textarea
                id="seo-description"
                value={seoSettings.default_description}
                onChange={(e) =>
                  setSeoSettings({ ...seoSettings, default_description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                placeholder="Artisan couvreur à Strasbourg spécialisé en rénovation de toiture, zinguerie, isolation écologique. Devis gratuit."
                maxLength={200}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Description affichée dans les résultats de recherche
                </p>
                <span
                  className={`text-xs font-medium ${
                    seoSettings.default_description.length <= 160
                      ? "text-green-600"
                      : seoSettings.default_description.length <= 200
                      ? "text-orange-500"
                      : "text-red-600"
                  }`}
                >
                  {seoSettings.default_description.length} / 150-160 caractères
                </span>
              </div>
            </div>

            {/* Default OG Image */}
            <div>
              <label htmlFor="og-image" className="block text-sm font-medium text-gray-700 mb-2">
                Image OG par défaut
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Format recommandé: 1200x630px)
                </span>
              </label>
              <input
                type="text"
                id="og-image"
                value={seoSettings.default_og_image}
                onChange={(e) =>
                  setSeoSettings({ ...seoSettings, default_og_image: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="/og-image.jpg ou https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Image affichée lors du partage sur les réseaux sociaux (ratio 1.91:1)
              </p>

              {/* Image Preview */}
              {seoSettings.default_og_image && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Aperçu de l'image OG:</p>
                  <div className="relative w-full max-w-md mx-auto aspect-[1.91/1] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={seoSettings.default_og_image}
                      alt="Aperçu OG"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect fill='%23ddd' width='1200' height='630'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='40' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage non disponible%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Format optimal: 1200x630px • Poids max: 5MB • JPG, PNG ou WebP
                  </p>
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Schema.org / Données structurées</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    id="company-name"
                    value={seoSettings.company_name}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, company_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="FormDeToit"
                  />
                </div>

                <div>
                  <label htmlFor="service-area" className="block text-sm font-medium text-gray-700 mb-2">
                    Zone géographique
                  </label>
                  <input
                    type="text"
                    id="service-area"
                    value={seoSettings.service_area}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, service_area: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="Strasbourg et environs (Bas-Rhin, 67)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Zone d'intervention de l'entreprise (pour le référencement local)
                  </p>
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                    Mots-clés principaux
                  </label>
                  <textarea
                    id="keywords"
                    value={seoSettings.keywords}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, keywords: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                    placeholder="couvreur strasbourg, rénovation toiture, zinguerie, isolation biosourcée, velux"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mots-clés pour référence interne (séparés par des virgules)
                  </p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>ℹ️ Information :</strong>
              </p>
              <p className="text-sm text-blue-700">
                Ces paramètres sont utilisés comme valeurs par défaut pour les pages
                qui n'ont pas de meta tags spécifiques. Les pages individuelles peuvent
                surcharger ces valeurs.
              </p>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {saveStatus.type && (
                  <p
                    className={`text-sm ${
                      saveStatus.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {saveStatus.message}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveSeo}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Security */}
      {activeTab === "security" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-yellow" />
              <h2 className="text-xl font-semibold text-gray-900">
                Sécurité & Protection Anti-Spam
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Configuration de Google reCAPTCHA v3 pour protéger vos formulaires contre les spams
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* reCAPTCHA Activation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label htmlFor="recaptcha-enabled" className="text-sm font-medium text-gray-700">
                    Activer Google reCAPTCHA v3
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Protection automatique de tous les formulaires du site
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecuritySettings({
                    ...securitySettings,
                    recaptcha_enabled: !securitySettings.recaptcha_enabled
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow focus:ring-offset-2 ${
                    securitySettings.recaptcha_enabled ? "bg-yellow" : "bg-gray-300"
                  }`}
                  role="switch"
                  aria-checked={securitySettings.recaptcha_enabled}
                  aria-labelledby="recaptcha-enabled"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      securitySettings.recaptcha_enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {securitySettings.recaptcha_enabled && !securitySettings.recaptcha_site_key && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900">Configuration requise</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        reCAPTCHA est activé mais les clés API ne sont pas configurées. Les formulaires ne seront pas protégés tant que vous n'aurez pas saisi vos clés.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* reCAPTCHA Site Key */}
            <div>
              <label htmlFor="recaptcha_site_key" className="block text-sm font-medium text-gray-700 mb-2">
                Clé du site (Site Key) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="recaptcha_site_key"
                value={securitySettings.recaptcha_site_key}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, recaptcha_site_key: e.target.value })
                }
                disabled={!securitySettings.recaptcha_enabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
                placeholder="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Clé publique affichée côté client (visible dans le code HTML)
              </p>
            </div>

            {/* reCAPTCHA Secret Key */}
            <div>
              <label htmlFor="recaptcha_secret_key" className="block text-sm font-medium text-gray-700 mb-2">
                Clé secrète (Secret Key) <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="recaptcha_secret_key"
                value={securitySettings.recaptcha_secret_key}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, recaptcha_secret_key: e.target.value })
                }
                disabled={!securitySettings.recaptcha_enabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
                placeholder="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Clé secrète utilisée côté serveur (jamais exposée publiquement)
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Spam Filter Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-yellow" />
                    Filtrage Anti-Spam Intelligent
                  </h3>
                  <p className="text-xs text-gray-600">
                    Détection automatique des messages spam (mots-clés SEO, marketing, doublons, langue non-française)
                  </p>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setSecuritySettings({
                    ...securitySettings,
                    spam_filter_enabled: !securitySettings.spam_filter_enabled
                  })}
                  className={`
                    relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow focus:ring-offset-2
                    ${securitySettings.spam_filter_enabled ? "bg-yellow" : "bg-gray-300"}
                  `}
                  role="switch"
                  aria-checked={securitySettings.spam_filter_enabled}
                >
                  <span className="sr-only">Activer le filtrage anti-spam</span>
                  <span
                    className={`
                      inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                      ${securitySettings.spam_filter_enabled ? "translate-x-7" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>

              {/* Description détaillée */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Activé :</strong> Les messages suspects sont marqués comme spam et n'envoient pas de notification email admin.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Désactivé :</strong> Tous les messages sont traités normalement (pas de filtrage).
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Les messages spam restent sauvegardés en base de données et consultables dans l'admin avec un badge rouge.
                </p>
              </div>
            </div>

            {/* Info Box reCAPTCHA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Comment obtenir vos clés reCAPTCHA ?</h4>
              <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                <li>Rendez-vous sur <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google reCAPTCHA Admin</a></li>
                <li>Créez un nouveau site avec reCAPTCHA v3</li>
                <li>Ajoutez votre domaine (formdetoit.fr)</li>
                <li>Copiez la "Clé du site" et la "Clé secrète"</li>
                <li>Collez-les dans les champs ci-dessus</li>
              </ol>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSecurity}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-yellow text-black rounded-lg font-semibold hover:bg-yellow/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Maintenance */}
      {activeTab === "maintenance" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-5 h-5 text-yellow" />
              <h2 className="text-xl font-semibold text-gray-900">
                Mode Maintenance
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Activer le mode maintenance pour afficher une page d'information aux
              visiteurs pendant les mises à jour du site.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label
                  htmlFor="maintenance-toggle"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Activer le mode maintenance
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Le site sera inaccessible pour les visiteurs (l'admin reste
                  accessible)
                </p>
              </div>
              <button
                id="maintenance-toggle"
                onClick={() =>
                  setMaintenanceSettings({
                    ...maintenanceSettings,
                    enabled: !maintenanceSettings.enabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  maintenanceSettings.enabled ? "bg-yellow" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    maintenanceSettings.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Warning when enabled */}
            {maintenanceSettings.enabled && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Mode maintenance activé
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Les visiteurs verront la page de maintenance. Seuls les
                      administrateurs connectés peuvent accéder au site.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="maintenance-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titre de la page
              </label>
              <input
                type="text"
                id="maintenance-title"
                value={maintenanceSettings.title}
                onChange={(e) =>
                  setMaintenanceSettings({
                    ...maintenanceSettings,
                    title: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                placeholder="Maintenance en cours"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="maintenance-message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message affiché
              </label>
              <textarea
                id="maintenance-message"
                value={maintenanceSettings.message}
                onChange={(e) =>
                  setMaintenanceSettings({
                    ...maintenanceSettings,
                    message: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                placeholder="Message à afficher aux visiteurs..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Ce message sera affiché aux visiteurs sur la page de maintenance
              </p>
            </div>

            {/* Preview link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Prévisualiser la page de maintenance :</strong>
              </p>
              <a
                href="/maintenance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Ouvrir la page de maintenance dans un nouvel onglet
              </a>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {saveStatus.type && (
                  <p
                    className={`text-sm ${
                      saveStatus.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {saveStatus.message}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveMaintenance}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Emails */}
      {activeTab === "emails" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-yellow" />
              <h2 className="text-xl font-semibold text-gray-900">
                Configuration des Emails
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Gérez les adresses email qui recevront les notifications des formulaires
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Notification Emails */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Emails de notification admin
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Entrez les adresses email (séparées par des virgules) qui recevront les notifications lorsqu'un client remplit un formulaire (contact, devis, demande détaillée).
              </p>
              <textarea
                value={emailSettings.notification_emails.join(', ')}
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                  setEmailSettings({ ...emailSettings, notification_emails: emails });
                }}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
                placeholder="contact@formdetoit.fr, admin@formdetoit.fr"
              />
              <p className="text-xs text-gray-500 mt-2">
                Exemple : contact@formdetoit.fr, admin@formdetoit.fr
              </p>
            </div>

            {/* Mode Test Toggle */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label
                    htmlFor="test-mode-toggle"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Mode test des emails
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Redirige TOUS les emails (client + admin) vers une adresse de test
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailSettings.test_mode_enabled}
                  onClick={() =>
                    setEmailSettings({
                      ...emailSettings,
                      test_mode_enabled: !emailSettings.test_mode_enabled,
                    })
                  }
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow focus:ring-offset-2
                    ${emailSettings.test_mode_enabled ? "bg-yellow" : "bg-gray-200"}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                      transition duration-200 ease-in-out
                      ${emailSettings.test_mode_enabled ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>

              {/* Test Recipient Email (shown only if test mode is enabled) */}
              {emailSettings.test_mode_enabled && (
                <div className="mt-4">
                  <label htmlFor="test-recipient" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Adresse email de test
                  </label>
                  <input
                    type="email"
                    id="test-recipient"
                    value={emailSettings.test_mode_recipient}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, test_mode_recipient: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                    placeholder="votre-email-test@exemple.com"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    En mode test, tous les emails seront envoyés uniquement à cette adresse.
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Fonctionnement des emails :</strong>
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Les clients reçoivent un email de confirmation automatique</li>
                <li>Les adresses configurées ci-dessus reçoivent une notification admin</li>
                <li>Tous les emails sont enregistrés dans les logs pour suivi</li>
                <li><strong>Mode test</strong> : Active le toggle ci-dessus pour rediriger tous les emails vers une seule adresse (idéal pour le développement)</li>
              </ul>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {saveStatus.type && (
                  <p
                    className={`text-sm ${
                      saveStatus.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {saveStatus.message}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveEmails}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Features */}
      {activeTab === "features" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FeaturesSettingsTab
            settings={featuresSettings}
            aiSettings={aiSettings}
            onUpdate={setFeaturesSettings}
            onUpdateAI={setAiSettings}
            onSave={handleSaveFeatures}
            isSaving={isSaving}
            error={saveStatus.type === "error" ? saveStatus.message : null}
          />
        </div>
      )}
    </div>
  );
}
