"use client";

import { MessageSquare, Brain, Bot } from "lucide-react";
import SettingsSection from "./SettingsSection";
import Toggle from "@/components/ui/toggle";
import { FeaturesSettings } from "./types";
import AIChatbotConfig from "./AIChatbotConfig";
import { AIChatbotSettings } from "@/app/actions/ai-chatbot-settings";

interface FeaturesSettingsTabProps {
  settings: FeaturesSettings;
  aiSettings: AIChatbotSettings;
  onUpdate: (settings: FeaturesSettings) => void;
  onUpdateAI: (aiSettings: AIChatbotSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

export default function FeaturesSettingsTab({
  settings,
  aiSettings,
  onUpdate,
  onUpdateAI,
  onSave,
  isSaving,
  error
}: FeaturesSettingsTabProps) {
  // Protection: si settings est undefined, utiliser valeur par défaut
  const safeSettings = settings || { chatbot_enabled: true };

  return (
    <SettingsSection
      title="Fonctionnalités du Site"
      description="Activez ou désactivez les fonctionnalités du site web"
      onSave={onSave}
      isSaving={isSaving}
      error={error}
    >
      {/* Chatbot Toggle */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-yellow" />
          </div>
          <div className="flex-1">
            <Toggle
              checked={safeSettings.chatbot_enabled}
              onChange={(checked) => onUpdate({ ...safeSettings, chatbot_enabled: checked })}
              label="Chatbot d'assistance"
              description="Active ou désactive le chatbot en bas à droite du site. Le chatbot aide les visiteurs à trouver des informations et répondre à leurs questions."
            />
          </div>
        </div>

        {/* Choix du type de chatbot (si activé) */}
        {safeSettings.chatbot_enabled && (
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Type de chatbot</h4>
            <div className="space-y-3">
              {/* Radio: Chatbot classique */}
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-yellow hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="chatbot_mode"
                  value="classic"
                  checked={aiSettings.chatbot_mode === 'classic'}
                  onChange={(e) => onUpdateAI({ ...aiSettings, chatbot_mode: 'classic' })}
                  className="mt-1 w-4 h-4 text-yellow focus:ring-yellow"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Chatbot classique</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Chatbot simple avec réponses pré-programmées. Gratuit, rapide, mais limité.
                  </p>
                </div>
              </label>

              {/* Radio: Chatbot AI avancé */}
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-yellow hover:bg-gray-50 transition-all">
                <input
                  type="radio"
                  name="chatbot_mode"
                  value="ai"
                  checked={aiSettings.chatbot_mode === 'ai'}
                  onChange={(e) => onUpdateAI({ ...aiSettings, chatbot_mode: 'ai' })}
                  className="mt-1 w-4 h-4 text-yellow focus:ring-yellow"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-yellow" />
                    <span className="text-sm font-medium text-gray-900">Chatbot AI avancé</span>
                    <span className="px-2 py-0.5 bg-yellow text-black text-xs font-semibold rounded-full">
                      Nouveau
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Intelligence artificielle (OpenAI, Claude, Mistral) avec RAG. Conversations naturelles et intelligentes. Nécessite une clé API.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Configuration AI Chatbot (si mode AI sélectionné) */}
      {safeSettings.chatbot_enabled && aiSettings.chatbot_mode === 'ai' && (
        <AIChatbotConfig
          settings={aiSettings}
          onUpdate={onUpdateAI}
        />
      )}

      {/* Info notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Les modifications prendront effet immédiatement pour tous les visiteurs du site.
        </p>
      </div>
    </SettingsSection>
  );
}
