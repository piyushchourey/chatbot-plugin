/**
 * ChatBot Plugin - Provider Component
 * Standalone provider with socket management
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { ChatBotConfig, ChatBotContextType, FormUpdateResponse } from "./types";

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export interface ChatBotProviderProps {
  children: ReactNode;
  config: ChatBotConfig;
  socketServer?: string;
  enableSocket?: boolean;
}

export const ChatBotProvider: React.FC<ChatBotProviderProps> = ({
  children,
  config,
  socketServer,
  enableSocket = true,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [infoQuestion, setInfoQuestion] = useState("");
  const [formUpdateResponse, setFormUpdateResponse] =
    useState<FormUpdateResponse | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => {
    return config.sessionIdGenerator?.() || `session-${Date.now()}`;
  });

  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection if enabled
  useEffect(() => {
    const serverUrl = socketServer || config.socketServer;
    if (!enableSocket || !serverUrl) {
      return;
    }

    const socket = io(serverUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ ChatBot Plugin: Connected:", socket.id);
      setSocketId(socket.id || null);
    });

    socket.on("disconnect", () => {
      console.log("❌ ChatBot Plugin: Disconnected");
      setSocketId(null);
    });

    const handleFormUpdate = (data: Record<string, any>) => {
      console.log("📥 ChatBot Plugin: Received formUpdate:", data);

      if (!data || Object.keys(data).length === 0) {
        console.warn("Received empty formUpdate data");
        return;
      }

      // Apply field mapping if configured
      const mappedData: Record<string, any> = {};
      const fieldMapping = config.fieldMapping || {};

      Object.entries(data).forEach(([field, value]) => {
        const mappedField = fieldMapping[field] || field;
        mappedData[mappedField] = value;
      });

      console.log("📝 ChatBot Plugin: Mapped form update data:", mappedData);

      // Call custom callback if provided
      if (config.onFormUpdate) {
        config.onFormUpdate(mappedData);
      }
    };

    socket.on("formUpdate", handleFormUpdate);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("formUpdate", handleFormUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enableSocket, socketServer, config]);

  // Update session ID if generator changes
  useEffect(() => {
    if (config.sessionIdGenerator) {
      setSessionId(config.sessionIdGenerator());
    }
  }, [config.sessionIdGenerator]);

  const value: ChatBotContextType = {
    isChatOpen,
    setIsChatOpen,
    infoQuestion,
    setInfoQuestion,
    formUpdateResponse,
    setFormUpdateResponse,
    socketId,
    sessionId,
    config,
  };

  return (
    <ChatBotContext.Provider value={value}>{children}</ChatBotContext.Provider>
  );
};

export const useChatBot = (): ChatBotContextType => {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error("useChatBot must be used within a ChatBotProvider");
  }
  return context;
};

/**
 * Hook to get socket instance (for advanced usage)
 */
export const useChatBotSocket = (): Socket | null => {
  const context = useContext(ChatBotContext);
  return context ? (context as any).socketRef?.current || null : null;
};
