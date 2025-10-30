export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: 'navigate' | 'message' | 'call' | 'form';
  value: string;
  icon?: string;
}

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  currentContext?: string;
}

export interface BotResponse {
  content: string;
  quickActions?: QuickAction[];
  context?: string;
}

export interface ServiceInfo {
  title: string;
  description: string;
  prix_moyen?: string;
  delai?: string;
  avantages: string[];
  url: string;
}

export interface ContactInfo {
  telephone: string;
  email: string;
  adresse: string;
  horaires: {
    ouverture: string;
    fermeture: string;
    jours: string;
  };
  zone_intervention: string;
}

export interface Intent {
  type: 'service_info' | 'devis' | 'urgence' | 'contact' | 'navigation' | 'prix' | 'delai' | 'general';
  confidence: number;
  service?: string;
}