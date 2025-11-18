/**
 * ChatBot Plugin - Default Configuration
 */

import { ChatBotConfig } from './types';

export const defaultChatBotConfig: ChatBotConfig = {
  apiEndpoint: '/api/chat',
  socketServer: 'http://20.20.20.90:7000',
  enabled: true,
  title: 'Loan Assistant',
  subtitle: 'Powered by LendingLogik',
  theme: 'auto',
  defaultFlowType: 'loan-application',
  fieldMapping: {
    LoanDuration: 'loanRepayments',
  },
  sessionIdGenerator: () => `session-${Date.now()}`,
};

/**
 * Merge user config with defaults
 */
export const mergeConfig = (userConfig: Partial<ChatBotConfig>): ChatBotConfig => {
  return {
    ...defaultChatBotConfig,
    ...userConfig,
    fieldMapping: {
      ...defaultChatBotConfig.fieldMapping,
      ...userConfig.fieldMapping,
    },
  };
};

