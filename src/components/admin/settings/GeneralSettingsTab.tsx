"use client";

import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { GeneralSettings } from "./types";

interface GeneralSettingsTabProps {
  settings: GeneralSettings;
  onUpdate: (settings: GeneralSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

export default function GeneralSettingsTab({
  settings,
  onUpdate,
  onSave,
  isSaving,
  error
}: GeneralSettingsTabProps) {
  return (
    <SettingsSection
      title="Informations Générales"
      description="Coordonnées de l'entreprise, horaires et réseaux sociaux"
      onSave={onSave}
      isSaving={isSaving}
      error={error}
    >
      {/* Phone */}
      <div>
        <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4" />
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          value={settings.phone}
          onChange={(e) => onUpdate({ ...settings, phone: e.target.value })}
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
          value={settings.email}
          onChange={(e) => onUpdate({ ...settings, email: e.target.value })}
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
          value={settings.address}
          onChange={(e) => onUpdate({ ...settings, address: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent resize-none"
          placeholder="Rue, Code postal, Ville"
        />
      </div>

      {/* Hours - INCREASED FROM 3 TO 5 ROWS */}
      <div>
        <label htmlFor="hours" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4" />
          Horaires d'ouverture
        </label>
        <textarea
          id="hours"
          value={settings.hours}
          onChange={(e) => onUpdate({ ...settings, hours: e.target.value })}
          rows={5}
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
              value={settings.facebook}
              onChange={(e) => onUpdate({ ...settings, facebook: e.target.value })}
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
              value={settings.instagram}
              onChange={(e) => onUpdate({ ...settings, instagram: e.target.value })}
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
              value={settings.linkedin}
              onChange={(e) => onUpdate({ ...settings, linkedin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
              placeholder="https://linkedin.com/company/formdetoit"
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
