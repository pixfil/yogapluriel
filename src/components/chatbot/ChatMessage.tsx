"use client";

import { motion } from "framer-motion";
import { ChatMessage as ChatMessageType } from "@/lib/chatbot/types";
import { formatPhoneNumber } from "@/lib/chatbot/utils";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isBot = message.sender === 'bot';
  const formattedTime = message.timestamp.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 mb-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-yellow rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-gray-900" />
        </div>
      )}

      <div className={cn(
        "max-w-[80%] group",
        isBot ? "order-2" : "order-1"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-lg shadow-sm relative",
          isBot
            ? "bg-white border border-gray-200 text-gray-800"
            : "bg-yellow text-gray-900"
        )}>
          {isBot ? (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed font-medium">
              {message.content}
            </p>
          )}

          {/* Speech bubble tail */}
          <div className={cn(
            "absolute top-3 w-2 h-2 rotate-45",
            isBot
              ? "-left-1 bg-white border-l border-b border-gray-200"
              : "-right-1 bg-yellow"
          )} />
        </div>

        <div className={cn(
          "text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isBot ? "text-left" : "text-right"
        )}>
          {formattedTime}
        </div>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center order-2">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;