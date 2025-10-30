'use client';

import { useState } from 'react';
import { X, Key, Eye, EyeOff, AlertTriangle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { saveProviderApiKeys } from '@/app/actions/ai-chatbot-settings';

interface ApiKeysModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApiKeysModal({ onClose, onSuccess }: ApiKeysModalProps) {
  const [keys, setKeys] = useState({
    openai_api_key: '',
    anthropic_api_key: '',
    mistral_api_key: '',
  });

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    mistral: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    // Filtrer les clés vides (ne sauvegarder que celles remplies)
    const keysToSave: any = {};
    if (keys.openai_api_key.trim()) keysToSave.openai_api_key = keys.openai_api_key.trim();
    if (keys.anthropic_api_key.trim()) keysToSave.anthropic_api_key = keys.anthropic_api_key.trim();
    if (keys.mistral_api_key.trim()) keysToSave.mistral_api_key = keys.mistral_api_key.trim();

    // Vérifier qu'au moins une clé est fournie
    if (Object.keys(keysToSave).length === 0) {
      setError('Veuillez entrer au moins une clé API');
      setIsSaving(false);
      return;
    }

    const result = await saveProviderApiKeys(keysToSave);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setError(result.error || 'Erreur lors de la sauvegarde');
    }

    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow to-yellow/90 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestion des Clés API</h2>
              <p className="text-sm text-gray-700">Configurez vos accès aux providers AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert sécurité */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Sécurité des clés API</p>
              <ul className="text-xs text-amber-700 mt-1.5 space-y-1 ml-1">
                <li>• Les clés sont chiffrées avant stockage (AES-256)</li>
                <li>• Elles ne sont jamais exposées côté client</li>
                <li>• Ne partagez jamais vos clés avec des tiers</li>
              </ul>
            </div>
          </div>

          {/* OpenAI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  🤖 OpenAI API Key
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pour GPT-4, GPT-4o, etc.
                </p>
              </div>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow hover:underline flex items-center gap-1"
              >
                Obtenir une clé
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={keys.openai_api_key}
                onChange={(e) => setKeys({ ...keys, openai_api_key: e.target.value })}
                placeholder="sk-proj-..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-yellow focus:border-yellow"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showKeys.openai ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Anthropic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  🧠 Anthropic API Key
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pour Claude 3.5 Sonnet, Opus, etc.
                </p>
              </div>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow hover:underline flex items-center gap-1"
              >
                Obtenir une clé
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.anthropic ? 'text' : 'password'}
                value={keys.anthropic_api_key}
                onChange={(e) => setKeys({ ...keys, anthropic_api_key: e.target.value })}
                placeholder="sk-ant-api03-..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-yellow focus:border-yellow"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, anthropic: !showKeys.anthropic })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showKeys.anthropic ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Mistral */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  🇫🇷 Mistral AI API Key
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pour Mistral Large, Medium, etc.
                </p>
              </div>
              <a
                href="https://console.mistral.ai/api-keys/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow hover:underline flex items-center gap-1"
              >
                Obtenir une clé
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.mistral ? 'text' : 'password'}
                value={keys.mistral_api_key}
                onChange={(e) => setKeys({ ...keys, mistral_api_key: e.target.value })}
                placeholder="..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-yellow focus:border-yellow"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, mistral: !showKeys.mistral })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showKeys.mistral ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Clés sauvegardées avec succès !</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || success}
              className="px-6 py-2 text-sm font-medium text-black bg-yellow hover:bg-yellow-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sauvegardé !
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>

          {/* Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Note :</strong> Vous n'êtes pas obligé de remplir toutes les clés. Configurez uniquement les
              providers que vous souhaitez utiliser. Les clés existantes ne seront pas écrasées si vous les laissez vides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
