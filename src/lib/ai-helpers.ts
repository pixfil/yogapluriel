/**
 * Helpers pour AI Chatbot (côté client)
 * Ces fonctions ne sont PAS des server actions, donc pas de 'use server'
 */

/**
 * Obtenir le nom d'affichage d'un provider
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      return 'Anthropic Claude';
    case 'mistral':
      return 'Mistral AI';
    default:
      return 'Unknown';
  }
}

/**
 * Obtenir la liste des modèles disponibles pour un provider
 */
export function getAvailableModels(provider: 'openai' | 'anthropic' | 'mistral'): Array<{ value: string; label: string }> {
  switch (provider) {
    case 'openai':
      return [
        { value: 'gpt-4o', label: 'GPT-4o (Recommandé - Rapide)' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-4', label: 'GPT-4 (Classique)' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Économique)' },
      ];
    case 'anthropic':
      return [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recommandé)' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Plus puissant)' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Rapide)' },
      ];
    case 'mistral':
      return [
        { value: 'mistral-large-latest', label: 'Mistral Large (Recommandé)' },
        { value: 'mistral-medium-latest', label: 'Mistral Medium' },
        { value: 'mistral-small-latest', label: 'Mistral Small (Économique)' },
      ];
    default:
      return [];
  }
}
