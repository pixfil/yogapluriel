"use client";

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, QuickAction, ChatbotState } from '@/lib/chatbot/types';
import { createMessage, saveConversationToStorage, loadConversationFromStorage } from '@/lib/chatbot/utils';
import { detectIntent, generateResponse } from '@/lib/chatbot/intents';
import { BOT_RESPONSES } from '@/lib/chatbot/responses';
import { useRouter } from 'next/navigation';

export const useChatbot = () => {
  const router = useRouter();
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    currentContext: undefined
  });

  // Load conversation history on mount
  useEffect(() => {
    const savedMessages = loadConversationFromStorage();
    if (savedMessages.length > 0) {
      setState(prev => ({ ...prev, messages: savedMessages }));
    } else {
      // If no history, start with welcome message
      const welcomeMessage = createMessage(
        BOT_RESPONSES.welcome.content,
        'bot',
        BOT_RESPONSES.welcome.quickActions
      );
      setState(prev => ({ ...prev, messages: [welcomeMessage] }));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (state.messages.length > 0) {
      saveConversationToStorage(state.messages);
    }
  }, [state.messages]);

  const toggleChatbot = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const closeChatbot = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openChatbot = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    setState(prev => ({ ...prev, isTyping: typing }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMessage = createMessage(content, 'user');
    addMessage(userMessage);

    // Set typing indicator
    setTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Detect intent and generate response
    const intent = detectIntent(content);
    const response = generateResponse(intent);

    // Create bot message
    const botMessage = createMessage(
      response.content,
      'bot',
      response.quickActions
    );

    // Update context if provided
    if (response.context) {
      setState(prev => ({ ...prev, currentContext: response.context }));
    }

    // Add bot message and stop typing
    addMessage(botMessage);
    setTyping(false);
  }, [addMessage, setTyping]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    switch (action.action) {
      case 'navigate':
        router.push(action.value);
        closeChatbot();
        break;

      case 'call':
        window.open(`tel:${action.value}`, '_self');
        break;

      case 'message':
        sendMessage(action.value);
        break;

      case 'form':
        router.push(action.value);
        closeChatbot();
        break;

      default:
        console.warn('Unknown action type:', action.action);
    }
  }, [router, sendMessage, closeChatbot]);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      currentContext: undefined
    }));
    localStorage.removeItem('formdetoit_chat_history');

    // Add welcome message back
    setTimeout(() => {
      const welcomeMessage = createMessage(
        BOT_RESPONSES.welcome.content,
        'bot',
        BOT_RESPONSES.welcome.quickActions
      );
      addMessage(welcomeMessage);
    }, 100);
  }, [addMessage]);

  return {
    ...state,
    toggleChatbot,
    openChatbot,
    closeChatbot,
    sendMessage,
    handleQuickAction,
    clearHistory,
    hasMessages: state.messages.length > 0
  };
};