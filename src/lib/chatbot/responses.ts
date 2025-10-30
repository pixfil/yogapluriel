import { ServiceInfo, ContactInfo, QuickAction } from './types';

export const CONTACT_INFO: ContactInfo = {
  telephone: "03 88 75 66 53",
  email: "contact@formdetoit.fr",
  adresse: "4 rue Bernard Stalter, 67114 Eschau",
  horaires: {
    ouverture: "8h30",
    fermeture: "17h00",
    jours: "Lundi au Vendredi"
  },
  zone_intervention: "Tout le Bas-Rhin (67)"
};

export const SERVICES: Record<string, ServiceInfo> = {
  ardoise: {
    title: "Ardoise",
    description: "Couverture traditionnelle en ardoise naturelle, durable et élégante pour votre toiture.",
    prix_moyen: "60-120€/m²",
    delai: "1-2 semaines",
    avantages: ["Naturelle et durable", "Résistante aux intempéries", "Esthétique authentique"],
    url: "/nos-prestations/ardoise"
  },
  tuile_plate: {
    title: "Tuile Plate",
    description: "Tuiles plates traditionnelles, idéales pour l'architecture alsacienne et les toitures à forte pente.",
    prix_moyen: "40-80€/m²",
    delai: "1-2 semaines",
    avantages: ["Style traditionnel", "Adaptée aux fortes pentes", "Résistance optimale"],
    url: "/nos-prestations/tuile-plate"
  },
  tuile_mecanique: {
    title: "Tuile Mécanique",
    description: "Solution moderne et économique pour une couverture performante et esthétique.",
    prix_moyen: "25-50€/m²",
    delai: "5-10 jours",
    avantages: ["Pose rapide", "Excellent rapport qualité/prix", "Large choix de coloris"],
    url: "/nos-prestations/tuile-mecanique"
  },
  zinc: {
    title: "Couverture Zinc",
    description: "Couverture moderne en zinc, matériau noble offrant durabilité et modernité.",
    prix_moyen: "70-150€/m²",
    delai: "2-3 semaines",
    avantages: ["Longévité exceptionnelle", "Design contemporain", "Recyclable à 100%"],
    url: "/nos-prestations/zinc"
  },
  cuivre: {
    title: "Cuivre",
    description: "Le cuivre, matériau d'exception pour une toiture unique qui se patine avec le temps.",
    prix_moyen: "100-200€/m²",
    delai: "2-4 semaines",
    avantages: ["Patine naturelle", "Matériau noble", "Résistance exceptionnelle"],
    url: "/nos-prestations/cuivre"
  },
  alu_prefa: {
    title: "Alu Préfa",
    description: "Couverture aluminium préfabriquée, légère et résistante pour toitures modernes.",
    prix_moyen: "50-100€/m²",
    delai: "1-2 semaines",
    avantages: ["Très léger", "Résistant à la corrosion", "Installation rapide"],
    url: "/nos-prestations/alu-prefa"
  },
  isolation: {
    title: "Isolation",
    description: "Isolation biosourcée certifiée RGE pour améliorer le confort et réduire les dépenses énergétiques.",
    prix_moyen: "30-60€/m²",
    delai: "3-7 jours",
    avantages: ["Matériaux biosourcés", "Eligible aux aides", "Confort thermique"],
    url: "/nos-prestations/isolation"
  },
  velux: {
    title: "Velux",
    description: "Installation de fenêtres de toit Velux pour apporter lumière naturelle et aération.",
    prix_moyen: "800-1500€/fenêtre",
    delai: "1-3 jours",
    avantages: ["Plus de lumière", "Aération optimale", "Confort d'utilisation"],
    url: "/nos-prestations/velux"
  },
  zinguerie: {
    title: "Zinguerie",
    description: "Étanchéité et évacuation des eaux par des éléments métalliques sur-mesure : gouttières, cheminées, habillages.",
    prix_moyen: "20-80€/ml",
    delai: "3-5 jours",
    avantages: ["Solutions sur-mesure", "Qualibat RGE", "Savoir-faire traditionnel"],
    url: "/nos-prestations/zinguerie"
  },
  epdm: {
    title: "EPDM Étanchéité",
    description: "Étanchéité membrane EPDM pour toits plats, balcons et terrasses, garantie longue durée.",
    prix_moyen: "40-70€/m²",
    delai: "2-5 jours",
    avantages: ["Étanchéité parfaite", "Résistance UV", "Garantie 20 ans"],
    url: "/nos-prestations/epdm-etancheite"
  }
};

export const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  welcome: [
    { id: "devis", label: "Demander un devis", action: "navigate", value: "/contact", icon: "calculator" },
    { id: "prestations", label: "Nos prestations", action: "navigate", value: "/nos-prestations", icon: "wrench" },
    { id: "urgence", label: "Urgence", action: "message", value: "J'ai une urgence", icon: "alert-triangle" },
    { id: "contact", label: "Nous contacter", action: "message", value: "Comment vous contacter ?", icon: "phone" }
  ],
  service_info: [
    { id: "devis_service", label: "Devis pour ce service", action: "navigate", value: "/contact", icon: "calculator" },
    { id: "voir_realisations", label: "Voir nos réalisations", action: "navigate", value: "/nos-realisations", icon: "eye" },
    { id: "autres_services", label: "Autres services", action: "navigate", value: "/nos-prestations", icon: "grid" }
  ],
  urgence: [
    { id: "appeler", label: "Appeler maintenant", action: "call", value: CONTACT_INFO.telephone, icon: "phone-call" },
    { id: "message_urgence", label: "Envoyer un message", action: "navigate", value: "/contact", icon: "mail" }
  ],
  prix: [
    { id: "devis_gratuit", label: "Devis gratuit", action: "navigate", value: "/contact", icon: "calculator" },
    { id: "voir_prestations", label: "Voir toutes les prestations", action: "navigate", value: "/nos-prestations", icon: "list" }
  ]
};

export const BOT_RESPONSES = {
  welcome: {
    content: "👋 Bonjour ! Je suis l'assistant virtuel de FormDeToit. \n\nNous sommes spécialisés dans la couverture, l'isolation et la zinguerie dans le Bas-Rhin. Comment puis-je vous aider aujourd'hui ?",
    quickActions: QUICK_ACTIONS.welcome
  },

  general_info: {
    content: "🏠 FormDeToit est un artisan couvreur-zingueur certifié RGE Qualibat, spécialisé dans :\n\n• Couverture (ardoise, tuiles, zinc, cuivre)\n• Isolation biosourcée\n• Zinguerie et étanchéité\n• Fenêtres de toit Velux\n\nNous intervenons dans tout le Bas-Rhin avec un devis gratuit sous 24h !",
    quickActions: QUICK_ACTIONS.welcome
  },

  contact_info: {
    content: `📞 **Contactez FormDeToit :**\n\n• **Téléphone :** ${CONTACT_INFO.telephone}\n• **Email :** ${CONTACT_INFO.email}\n• **Horaires :** ${CONTACT_INFO.horaires.jours} de ${CONTACT_INFO.horaires.ouverture} à ${CONTACT_INFO.horaires.fermeture}\n• **Zone :** ${CONTACT_INFO.zone_intervention}\n\n📍 ${CONTACT_INFO.adresse}`,
    quickActions: [
      { id: "appeler", label: "Appeler maintenant", action: "call", value: CONTACT_INFO.telephone, icon: "phone" },
      { id: "devis", label: "Demander un devis", action: "navigate", value: "/contact", icon: "calculator" }
    ]
  },

  urgence_response: {
    content: `🚨 **Urgence toiture ?**\n\nContactez-nous immédiatement au **${CONTACT_INFO.telephone}**\n\nNous intervenons rapidement dans tout le Bas-Rhin pour les fuites, dégâts de tempête et autres urgences.`,
    quickActions: QUICK_ACTIONS.urgence
  },

  prix_info: {
    content: "💰 **Nos tarifs varient selon :**\n\n• Le type de matériau choisi\n• La surface à couvrir\n• La complexité du chantier\n• L'état de la charpente\n\nNous proposons un **devis gratuit** personnalisé sous 24h pour vous donner un prix précis !",
    quickActions: QUICK_ACTIONS.prix
  },

  certifications: {
    content: "🏆 **Nos certifications :**\n\n✅ **RGE Qualibat** - Reconnu Garant de l'Environnement\n✅ **Garantie décennale** sur tous nos travaux\n✅ **Eligible aux aides de l'État** (MaPrimeRénov', etc.)\n✅ **Artisan local** depuis plusieurs années\n\nVotre tranquillité d'esprit est notre priorité !",
    quickActions: QUICK_ACTIONS.welcome
  },

  not_understood: {
    content: "🤔 Je ne suis pas sûr de comprendre votre question.\n\nPouvez-vous me préciser ce que vous recherchez ? Ou contactez-nous directement pour une réponse personnalisée !",
    quickActions: [
      { id: "prestations", label: "Voir nos services", action: "navigate", value: "/nos-prestations", icon: "wrench" },
      { id: "contact", label: "Nous contacter", action: "navigate", value: "/contact", icon: "phone" }
    ]
  }
};