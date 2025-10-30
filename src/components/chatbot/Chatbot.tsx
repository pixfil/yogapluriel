"use client";

import { useChatbot } from "@/hooks/useChatbot";
import ChatbotButton from "./ChatbotButton";
import dynamic from "next/dynamic";

// Lazy load ChatbotWindow uniquement quand necessaire (economie ~20KB)
const ChatbotWindow = dynamic(() => import("./ChatbotWindow"), {
  ssr: false,
  loading: () => null
});

const Chatbot = () => {
  const {
    isOpen,
    messages,
    isTyping,
    toggleChatbot,
    sendMessage,
    handleQuickAction,
    hasMessages
  } = useChatbot();

  return (
    <>
      <ChatbotButton
        isOpen={isOpen}
        onClick={toggleChatbot}
        hasNewMessage={!hasMessages && !isOpen}
      />

      {isOpen && (
        <ChatbotWindow
          isOpen={isOpen}
          messages={messages}
          isTyping={isTyping}
          onSendMessage={sendMessage}
          onQuickAction={handleQuickAction}
        />
      )}
    </>
  );
};

export default Chatbot;