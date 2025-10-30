'use client';

import { useChat } from '@ai-sdk/react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatbotWindowProps {
  isOpen: boolean;
  providerName?: string;
}

export default function AIChatbotWindow({ isOpen, providerName = 'AI' }: AIChatbotWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input quand le chatbot s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'in_progress') return;

    sendMessage({ text: input });
    setInput('');
  };

  // Gérer Enter pour soumettre (sans Shift)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 right-6 z-40 w-96 h-[500px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)]"
        >
          {/* Main chatbot window */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow to-yellow/90 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-yellow font-bold text-lg">F</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Form-E</h3>
                <p className="text-gray-700 text-xs">L'assistant IA de Formdetoit</p>
                <p className="text-gray-600 text-xs flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Propulsé par IA
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <div className="mb-3">👋</div>
                  <p className="font-medium">Bonjour ! Comment puis-je vous aider ?</p>
                  <p className="text-xs mt-1">Posez-moi vos questions sur la toiture, les matériaux, ou demandez un devis.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-yellow text-black'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {message.parts?.map((part, i) => {
                        if (part.type === 'text') {
                          return (
                            <p key={i} className="text-sm whitespace-pre-wrap">
                              {part.text}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Loading indicator */}
              {status === 'in_progress' && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow" />
                    <span className="text-sm text-gray-600">L'assistant réfléchit...</span>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-start gap-2 max-w-[90%]">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Erreur</p>
                      <p className="text-xs text-red-700 mt-0.5">
                        {error.message || 'Une erreur est survenue. Veuillez réessayer.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  disabled={status === 'in_progress'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow focus:border-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={status === 'in_progress' || !input.trim()}
                  className="p-2 bg-yellow hover:bg-yellow-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {status === 'in_progress' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Appuyez sur Entrée pour envoyer, Shift+Entrée pour sauter une ligne
              </p>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
