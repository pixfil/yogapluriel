'use client';

import { useState, useEffect } from 'react';
import { Brain, Key, Settings as SettingsIcon, CheckCircle2, XCircle } from 'lucide-react';
import Toggle from '@/components/ui/toggle';
import {
  AIChatbotSettings,
  checkApiKeyExists,
} from '@/app/actions/ai-chatbot-settings';
import { getAvailableModels, getProviderDisplayName } from '@/lib/ai-helpers';
import ApiKeysModal from './ApiKeysModal';
import RAGManagement from './RAGManagement';

interface AIChatbotConfigProps {
  settings: AIChatbotSettings;
  onUpdate: (settings: AIChatbotSettings) => void;
}

export default function AIChatbotConfig({ settings, onUpdate }: AIChatbotConfigProps) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<{
    openai: boolean;
    anthropic: boolean;
    mistral: boolean;
  }>({
    openai: false,
    anthropic: false,
    mistral: false,
  });

  // Charger le statut des clés API au montage
  useEffect(() => {
    async function checkKeys() {
      const [openaiExists, anthropicExists, mistralExists] = await Promise.all([
        checkApiKeyExists('openai'),
        checkApiKeyExists('anthropic'),
        checkApiKeyExists('mistral'),
      ]);

      setApiKeysStatus({
        openai: openaiExists,
        anthropic: anthropicExists,
        mistral: mistralExists,
      });
    }

    checkKeys();
  }, [showKeyModal]); // Recharger après la fermeture du modal

  const availableModels = getAvailableModels(settings.ai_provider);
  const currentProviderHasKey = apiKeysStatus[settings.ai_provider];

  return (
    <div className="ml-8 mt-4 space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-blue-200">
        <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900">Configuration Chatbot AI</h3>
          <p className="text-sm text-gray-600">Personnalisez l'intelligence artificielle de votre chatbot</p>
        </div>
      </div>

      {/* Alert si pas de clé API pour le provider actif */}
      {!currentProviderHasKey && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Clé API manquante pour {getProviderDisplayName(settings.ai_provider)}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Le chatbot AI ne fonctionnera pas sans clé API. Cliquez sur "Gérer les clés API" ci-dessous.
            </p>
          </div>
        </div>
      )}

      {/* 1. Choix du provider */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Provider AI
        </label>
        <select
          value={settings.ai_provider}
          onChange={(e) =>
            onUpdate({ ...settings, ai_provider: e.target.value as 'openai' | 'anthropic' | 'mistral' })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow focus:border-yellow transition-all"
        >
          <option value="openai">
            🤖 OpenAI (GPT-4, GPT-4o) {apiKeysStatus.openai ? '✓' : ''}
          </option>
          <option value="anthropic">
            🧠 Anthropic Claude (3.5 Sonnet) {apiKeysStatus.anthropic ? '✓' : ''}
          </option>
          <option value="mistral">
            🇫🇷 Mistral AI {apiKeysStatus.mistral ? '✓' : ''}
          </option>
        </select>
        <p className="text-xs text-gray-500 mt-1.5">
          Le provider AI qui alimentera les réponses du chatbot
        </p>
      </div>

      {/* 2. Choix du modèle */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Modèle {getProviderDisplayName(settings.ai_provider)}
        </label>
        <select
          value={settings.ai_model}
          onChange={(e) => onUpdate({ ...settings, ai_model: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow focus:border-yellow transition-all"
        >
          {availableModels.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1.5">
          Modèle spécifique à utiliser (impact sur la qualité et le coût)
        </p>
      </div>

      {/* 3. Gestion des clés API */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Clés API
        </label>
        <button
          onClick={() => setShowKeyModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-yellow transition-all text-sm font-medium"
        >
          <Key className="w-4 h-4 text-yellow" />
          Gérer les clés API
        </button>

        {/* Statut des clés */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {apiKeysStatus.openai ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={apiKeysStatus.openai ? 'text-green-700' : 'text-gray-500'}>
              OpenAI {apiKeysStatus.openai ? '(configurée)' : '(non configurée)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {apiKeysStatus.anthropic ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={apiKeysStatus.anthropic ? 'text-green-700' : 'text-gray-500'}>
              Anthropic {apiKeysStatus.anthropic ? '(configurée)' : '(non configurée)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {apiKeysStatus.mistral ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={apiKeysStatus.mistral ? 'text-green-700' : 'text-gray-500'}>
              Mistral AI {apiKeysStatus.mistral ? '(configurée)' : '(non configurée)'}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          🔒 Les clés sont stockées chiffrées en base de données (AES-256). Elles ne sont jamais exposées côté client.
        </p>
      </div>

      {/* 4. Prompt système */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Prompt système
        </label>
        <textarea
          value={settings.system_prompt}
          onChange={(e) => onUpdate({ ...settings, system_prompt: e.target.value })}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-yellow focus:border-yellow transition-all resize-y"
          placeholder="Tu es un assistant virtuel pour FormDeToit..."
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Définit la personnalité, le ton et le comportement du chatbot. Soyez précis et clair.
        </p>
      </div>

      {/* 5. RAG Toggle */}
      <div className="border border-blue-200 rounded-lg p-4 bg-white/50">
        <Toggle
          checked={settings.rag_enabled}
          onChange={(checked) => onUpdate({ ...settings, rag_enabled: checked })}
          label="RAG (Retrieval Augmented Generation)"
          description="Le chatbot recherche automatiquement dans vos projets, FAQ, lexique et certifications avant de répondre. Plus intelligent et contextuel."
        />
      </div>

      {/* 6. Gestion RAG (si activé) */}
      {settings.rag_enabled && (
        <div className="border-t border-gray-200 pt-6">
          <RAGManagement />
        </div>
      )}

      {/* Info sécurité */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Sécurité et confidentialité</p>
            <ul className="text-xs text-green-700 mt-1.5 space-y-1 ml-1">
              <li>• Les clés API sont chiffrées en BDD avec AES-256</li>
              <li>• Les conversations sont privées et jamais partagées</li>
              <li>• Seuls les admins peuvent configurer le chatbot</li>
              <li>• Rate limiting automatique pour éviter les abus</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de gestion des clés */}
      {showKeyModal && (
        <ApiKeysModal
          onClose={() => setShowKeyModal(false)}
          onSuccess={() => {
            setShowKeyModal(false);
            // Recharger le statut des clés
          }}
        />
      )}
    </div>
  );
}
