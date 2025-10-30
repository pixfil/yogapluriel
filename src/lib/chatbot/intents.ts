import { Intent, BotResponse } from './types';
import { SERVICES, BOT_RESPONSES, QUICK_ACTIONS } from './responses';
import { containsKeywords, normalizeText } from './utils';

// Keywords for intent detection
const KEYWORDS = {
  services: {
    ardoise: ['ardoise', 'schiste'],
    tuile_plate: ['tuile plate', 'biberschwanz', 'plate'],
    tuile_mecanique: ['tuile mecanique', 'mecanique', 'modern'],
    zinc: ['zinc', 'metal', 'metallique'],
    cuivre: ['cuivre', 'rouge'],
    alu_prefa: ['aluminium', 'alu', 'prefa', 'prefabrique'],
    isolation: ['isolation', 'isoler', 'thermique', 'biosource'],
    velux: ['velux', 'fenetre toit', 'fenetre de toit', 'lucarne'],
    zinguerie: ['zinguerie', 'gouttiere', 'cheneau', 'evacuation'],
    epdm: ['epdm', 'etancheite', 'toit plat', 'membrane', 'terrasse']
  },

  intentions: {
    devis: ['devis', 'prix', 'tarif', 'cout', 'couter', 'budget', 'combien', 'estimation'],
    urgence: ['urgence', 'urgent', 'fuite', 'fuir', 'tempete', 'degat', 'casse', 'reparer vite', 'rapidement', 'emergency'],
    contact: ['contact', 'telephone', 'appeler', 'joindre', 'rdv', 'rendez-vous', 'horaire'],
    navigation: ['voir', 'montrer', 'realisation', 'exemple', 'photo', 'travaux'],
    delai: ['delai', 'duree', 'temps', 'quand', 'planning'],
    general: ['bonjour', 'salut', 'hello', 'formdetoit', 'qui etes vous', 'presentation']
  }
};

export function detectIntent(message: string): Intent {
  const normalizedMessage = normalizeText(message);

  // Check for service-specific queries
  for (const [serviceKey, serviceKeywords] of Object.entries(KEYWORDS.services)) {
    if (containsKeywords(normalizedMessage, serviceKeywords)) {
      // Determine sub-intent for this service
      if (containsKeywords(normalizedMessage, KEYWORDS.intentions.devis)) {
        return { type: 'devis', confidence: 0.9, service: serviceKey };
      }
      if (containsKeywords(normalizedMessage, KEYWORDS.intentions.delai)) {
        return { type: 'delai', confidence: 0.8, service: serviceKey };
      }
      return { type: 'service_info', confidence: 0.8, service: serviceKey };
    }
  }

  // Check for general intents
  if (containsKeywords(normalizedMessage, KEYWORDS.intentions.urgence)) {
    return { type: 'urgence', confidence: 0.9 };
  }

  if (containsKeywords(normalizedMessage, KEYWORDS.intentions.devis)) {
    return { type: 'devis', confidence: 0.8 };
  }

  if (containsKeywords(normalizedMessage, KEYWORDS.intentions.contact)) {
    return { type: 'contact', confidence: 0.8 };
  }

  if (containsKeywords(normalizedMessage, KEYWORDS.intentions.navigation)) {
    return { type: 'navigation', confidence: 0.7 };
  }

  if (containsKeywords(normalizedMessage, KEYWORDS.intentions.general)) {
    return { type: 'general', confidence: 0.9 };
  }

  if (containsKeywords(normalizedMessage, ['prix', 'tarif', 'cout'])) {
    return { type: 'prix', confidence: 0.8 };
  }

  // Default fallback
  return { type: 'general', confidence: 0.3 };
}

export function generateResponse(intent: Intent): BotResponse {
  switch (intent.type) {
    case 'service_info':
      if (intent.service && SERVICES[intent.service]) {
        const service = SERVICES[intent.service];
        return {
          content: `🏠 **${service.title}**\n\n${service.description}\n\n✨ **Avantages :**\n${service.avantages.map(a => `• ${a}`).join('\n')}\n\n💰 **Prix moyen :** ${service.prix_moyen}\n⏱️ **Délai :** ${service.delai}`,
          quickActions: QUICK_ACTIONS.service_info,
          context: intent.service
        };
      }
      return BOT_RESPONSES.general_info;

    case 'devis':
      if (intent.service && SERVICES[intent.service]) {
        const service = SERVICES[intent.service];
        return {
          content: `💰 **Devis ${service.title}**\n\nPour vous donner un prix précis, nous devons évaluer :\n• La surface exacte\n• L'état de votre toiture\n• Les spécificités du chantier\n\n➡️ **Devis gratuit sous 24h !**`,
          quickActions: [
            { id: "devis_form", label: "Demander un devis", action: "navigate", value: "/contact", icon: "calculator" },
            { id: "appeler", label: "Appeler maintenant", action: "call", value: "0388756653", icon: "phone" }
          ]
        };
      }
      return {
        content: "💰 **Devis gratuit FormDeToit**\n\nNous vous proposons un devis gratuit et sans engagement sous 24h pour tous nos services !\n\n📋 **Inclus dans le devis :**\n• Diagnostic complet\n• Détail des matériaux\n• Planning d'intervention\n• Garanties",
        quickActions: QUICK_ACTIONS.prix
      };

    case 'urgence':
      return BOT_RESPONSES.urgence_response;

    case 'contact':
      return BOT_RESPONSES.contact_info;

    case 'navigation':
      return {
        content: "🔍 **Que souhaitez-vous voir ?**\n\nExplorez nos réalisations et découvrez notre savoir-faire à travers nos projets récents !",
        quickActions: [
          { id: "realisations", label: "Nos réalisations", action: "navigate", value: "/nos-realisations", icon: "eye" },
          { id: "prestations", label: "Nos prestations", action: "navigate", value: "/nos-prestations", icon: "wrench" },
          { id: "equipe", label: "Notre équipe", action: "navigate", value: "/notre-equipe", icon: "users" }
        ]
      };

    case 'prix':
      return BOT_RESPONSES.prix_info;

    case 'delai':
      if (intent.service && SERVICES[intent.service]) {
        const service = SERVICES[intent.service];
        return {
          content: `⏱️ **Délai pour ${service.title}**\n\n**Délai moyen :** ${service.delai}\n\n⚠️ *Les délais peuvent varier selon :*\n• La saison (forte demande automne/hiver)\n• La complexité du chantier\n• Les conditions météorologiques\n\nContactez-nous pour un planning précis !`,
          quickActions: QUICK_ACTIONS.service_info
        };
      }
      return {
        content: "⏱️ **Nos délais d'intervention**\n\n• **Devis :** Sous 24h\n• **Urgences :** Intervention rapide\n• **Travaux :** Variable selon le projet\n\nContactez-nous pour connaître nos disponibilités actuelles !",
        quickActions: QUICK_ACTIONS.welcome
      };

    case 'general':
      if (intent.confidence > 0.7) {
        return BOT_RESPONSES.welcome;
      }
      return BOT_RESPONSES.general_info;

    default:
      return BOT_RESPONSES.not_understood;
  }
}