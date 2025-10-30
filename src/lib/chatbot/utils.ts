import { ChatMessage, QuickAction } from './types';

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createMessage(
  content: string,
  sender: 'user' | 'bot',
  quickActions?: QuickAction[]
): ChatMessage {
  return {
    id: generateMessageId(),
    content,
    sender,
    timestamp: new Date(),
    quickActions
  };
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsKeywords(text: string, keywords: string[]): boolean {
  const normalizedText = normalizeText(text);
  return keywords.some(keyword =>
    normalizedText.includes(normalizeText(keyword))
  );
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

export function saveConversationToStorage(messages: ChatMessage[]): void {
  try {
    localStorage.setItem('formdetoit_chat_history', JSON.stringify(messages));
  } catch (error) {
    console.warn('Impossible de sauvegarder l\'historique de conversation:', error);
  }
}

export function loadConversationFromStorage(): ChatMessage[] {
  try {
    const stored = localStorage.getItem('formdetoit_chat_history');
    if (stored) {
      const messages = JSON.parse(stored);
      // Convert string dates back to Date objects
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.warn('Impossible de charger l\'historique de conversation:', error);
  }
  return [];
}