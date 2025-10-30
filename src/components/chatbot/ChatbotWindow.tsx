"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage as ChatMessageType, QuickAction } from "@/lib/chatbot/types";
import ChatMessage from "./ChatMessage";
import QuickActions from "./QuickActions";
import { cn } from "@/lib/utils";

interface ChatbotWindowProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onQuickAction: (action: QuickAction) => void;
}

const ChatbotWindow = ({
  isOpen,
  messages,
  isTyping,
  onSendMessage,
  onQuickAction
}: ChatbotWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Get quick actions from the last bot message
  const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
  const quickActions = lastBotMessage?.quickActions || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
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
                <h3 className="font-bold text-gray-900 text-sm">FormDeToit</h3>
                <p className="text-gray-700 text-xs">Assistant virtuel</p>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-1">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  Commencez votre conversation...
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mb-4"
                >
                  <div className="w-8 h-8 bg-yellow rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-gray-900 animate-spin" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {quickActions.length > 0 && !isTyping && (
              <div className="border-t border-gray-200 bg-white">
                <QuickActions
                  actions={quickActions}
                  onActionClick={onQuickAction}
                />
              </div>
            )}

            {/* Input area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isTyping}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-full border border-gray-200",
                    "focus:outline-none focus:ring-2 focus:ring-yellow/30 focus:border-yellow",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "text-sm placeholder:text-gray-500"
                  )}
                />
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow/30",
                    inputValue.trim() && !isTyping
                      ? "bg-yellow hover:bg-yellow/90 text-gray-900"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotWindow;