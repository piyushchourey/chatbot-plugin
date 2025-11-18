/**
 * ChatBot Plugin - Type Definitions
 * Configuration and interface types for the pluggable chatbot
 */

export interface ChatBotConfig {
  // API Configuration
  apiEndpoint: string;
  socketServer?: string;
  
  // Feature Flags
  enabled?: boolean;
  
  // UI Configuration
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark' | 'auto';
  
  // Flow Configuration
  defaultFlowType?: 'loan-application' | 'loan-offer' | string;
  
  // Callbacks
  onFormUpdate?: (data: Record<string, any>) => void;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (response: string) => void;
  onChatOpen?: (isOpen: boolean) => void;
  onNavigate?: (path: string) => void;
  
  // Field Mapping (for form synchronization)
  fieldMapping?: Record<string, string>;
  
  // Session Management
  sessionIdGenerator?: () => string;
  
  // Customization
  customStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    headerGradient?: string;
  };
}

export interface FormUpdateResponse {
  success: boolean;
  response: string;
  field?: string;
  value?: any;
  triggerApiCall?: boolean;
}

export interface ChatBotContextType {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  infoQuestion: string;
  setInfoQuestion: (question: string) => void;
  formUpdateResponse: FormUpdateResponse | null;
  setFormUpdateResponse: (response: FormUpdateResponse | null) => void;
  socketId: string | null;
  sessionId: string;
  config: ChatBotConfig;
}

export interface ChatBotProps {
  // Core props
  apiEndpoint?: string;
  infoQuestion?: string;
  setInfoQuestion?: (question: string) => void;
  SocketId?: string | null;
  sessionId?: string;
  formData?: Record<string, any>;
  setFormData?: (data: Record<string, any>) => void;
  onChatOpenChange?: (isOpen: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  flowType: string;
  
  // Plugin-specific props
  config?: Partial<ChatBotConfig>;
  onFormUpdate?: (data: Record<string, any>) => void;
}

export interface ChatBotProviderProps {
  children: React.ReactNode;
  config: ChatBotConfig;
  socketServer?: string;
  enableSocket?: boolean;
}

