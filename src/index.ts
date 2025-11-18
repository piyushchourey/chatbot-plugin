/**
 * ChatBot Plugin - Main Entry Point
 * Export all plugin components, hooks, and utilities
 */

// Components
export { default as ChatBot } from './ChatBot';
export { ChatBotProvider, useChatBot, useChatBotSocket } from './ChatBotProvider';

// Types
export type {
  ChatBotConfig,
  ChatBotProps,
  ChatBotContextType,
  FormUpdateResponse,
  ChatBotProviderProps,
} from './types';

// Utilities
export { sendFormFieldUpdate, sendChatMessage } from './api-utils';
export { defaultChatBotConfig, mergeConfig } from './config';

// Re-export for convenience
export { default } from './ChatBot';

