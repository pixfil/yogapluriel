"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, MessageCircle, ClipboardList, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { DetailedQuoteData } from "@/lib/types/detailed-quote";

// Lazy load formulaires (economie ~30-40KB)
const SimpleDevisForm = dynamic(() => import("./simple-devis-form"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-[400px]" />
});

const DetailedQuoteForm = dynamic(() => import("./detailed-quote-form"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-[600px]" />
});

type TabType = 'quick' | 'standard' | 'detailed';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  duration: string;
  description: string;
  bestFor: string;
}

const TABS: Tab[] = [
  {
    id: 'quick',
    label: 'Urgence',
    icon: AlertCircle,
    duration: '< 1 min',
    description: 'Pour une situation urgente nécessitant une intervention rapide',
    bestFor: 'Fuite, dégât des eaux, problème urgent'
  },
  {
    id: 'standard',
    label: 'Contact',
    icon: MessageCircle,
    duration: '2-3 min',
    description: 'Pour une demande d\'information ou prise de contact',
    bestFor: 'Question générale, premier contact'
  },
  {
    id: 'detailed',
    label: 'Demande complète',
    icon: ClipboardList,
    duration: '5-7 min',
    description: 'Questionnaire détaillé pour un devis précis et personnalisé',
    bestFor: 'Projet précis, besoin de devis complet'
  }
];

export default function ContactTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('standard');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuoteSubmit = async (data: {
    nom: string;
    telephone: string;
    email: string;
    message: string;
    isUrgent: boolean;
    recaptchaToken: string | null;
  }) => {
    try {
      // Ajouter tracking source
      const payload = {
        ...data,
        sourceUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
        sourceFormType: data.isUrgent ? 'urgence_contact_page' : 'simple_devis_contact_page',
        referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined,
      };

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('Erreur de validation:', result.details); // Log des détails Zod

        // Formater le message d'erreur avec les détails
        let errorMsg = result.error || 'Erreur envoi';
        if (result.details) {
          const details = Object.entries(result.details)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('\n');
          errorMsg += '\n\nDétails:\n' + details;
        }

        throw new Error(errorMsg);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('standard');
      }, 5000);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
      throw error;
    }
  };

  const handleDetailedSubmit = async (data: DetailedQuoteData) => {
    try {
      // Ajouter tracking source
      const payload = {
        ...data,
        sourceUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
        sourceFormType: 'detailed_quote_contact_page',
        referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined,
      };

      const response = await fetch('/api/detailed-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('Erreur de validation:', result.details); // Log des détails Zod

        // Formater le message d'erreur avec les détails
        let errorMsg = result.error || 'Erreur envoi';
        if (result.details) {
          const details = Object.entries(result.details)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('\n');
          errorMsg += '\n\nDétails:\n' + details;
        }

        throw new Error(errorMsg);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('standard');
      }, 5000);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
      throw error;
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-4">Demande envoyée avec succès !</h3>
        <p className="text-gray-600 mb-6">
          Nous avons bien reçu votre demande détaillée. Notre équipe va l'étudier et vous recontacter sous 24h.
        </p>
        <p className="text-sm text-gray-500">
          Vous allez recevoir un email de confirmation dans quelques instants.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs Header */}
      <div className="flex flex-col gap-4">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold mb-2">Choisissez votre type de demande</h3>
          <p className="text-gray-600">Selon le temps dont vous disposez et vos besoins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative p-6 rounded-xl border-2 text-left transition-all",
                  activeTab === tab.id
                    ? tab.id === 'quick'
                      ? "border-red-500 bg-white shadow-lg"
                      : "border-yellow bg-white shadow-lg"
                    : "border-gray-200 hover:border-yellow hover:bg-white hover:shadow-md"
                )}
              >
                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      "absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                      tab.id === 'quick' ? "bg-red-500" : "bg-yellow"
                    )}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <CheckCircle2 className={cn(
                      "w-5 h-5",
                      tab.id === 'quick' ? "text-white" : "text-black"
                    )} />
                  </motion.div>
                )}

                {/* Icon & Duration */}
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    activeTab === tab.id
                      ? tab.id === 'quick' ? "bg-red-500/20" : "bg-yellow/20"
                      : tab.id === 'quick' ? "bg-red-50" : "bg-gray-100"
                  )}>
                    <IconComponent className={cn(
                      "w-6 h-6",
                      activeTab === tab.id
                        ? tab.id === 'quick' ? "text-red-500" : "text-yellow"
                        : "text-gray-600"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    activeTab === tab.id
                      ? tab.id === 'quick' ? "bg-red-500 text-white" : "bg-yellow text-black"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {tab.duration}
                  </span>
                </div>

                {/* Label */}
                <h4 className={cn(
                  "text-lg font-bold mb-2",
                  activeTab === tab.id ? "text-gray-900" : "text-gray-700"
                )}>
                  {tab.label}
                </h4>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">
                  {tab.description}
                </p>

                {/* Best For */}
                <div className={cn(
                  "text-xs px-3 py-2 rounded-lg",
                  activeTab === tab.id
                    ? tab.id === 'quick' ? "bg-red-50 text-red-700" : "bg-yellow/10 text-yellow-800"
                    : "bg-gray-50 text-gray-600"
                )}>
                  <strong>Idéal pour :</strong> {tab.bestFor}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'quick' && (
          <SimpleDevisForm isUrgent={true} onSubmit={handleQuoteSubmit} />
        )}

        {activeTab === 'standard' && (
          <SimpleDevisForm isUrgent={false} onSubmit={handleQuoteSubmit} />
        )}

        {activeTab === 'detailed' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Demande complète</h3>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Prenez 5-7 minutes pour remplir notre questionnaire détaillé. Cela nous permettra
                de mieux comprendre votre projet et de vous proposer la solution la plus adaptée.
              </p>
            </div>
            <DetailedQuoteForm
              onSubmit={handleDetailedSubmit}
              onCancel={() => setActiveTab('quick')}
            />
          </div>
        )}
      </motion.div>

      {/* Additional Info */}
      {activeTab !== 'detailed' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Vous avez 5 minutes de plus ?
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Passez au formulaire détaillé pour recevoir un audit complet et des recommandations
                personnalisées sur vos travaux, les matériaux et les aides financières disponibles.
              </p>
              <button
                onClick={() => setActiveTab('detailed')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Remplir le questionnaire détaillé →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
