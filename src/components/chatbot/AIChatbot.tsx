'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import AIChatbotWindow from './AIChatbotWindow';

interface AIChatbotProps {
  providerName?: string;
}

/**
 * Wrapper pour AIChatbotWindow qui gère l'état ouvert/fermé
 * Similaire au Chatbot classique mais pour l'AI
 */
export default function AIChatbot({ providerName = 'AI' }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-110 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-yellow hover:bg-yellow-600'
        }`}
        aria-label={isOpen ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Chatbot Window */}
      <AIChatbotWindow isOpen={isOpen} providerName={providerName} />
    </>
  );
}
