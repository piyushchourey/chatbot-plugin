/**
 * ChatBot Plugin - Main Component
 * Standalone, pluggable chatbot component
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, ArrowDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatBotProps, ChatBotContextType } from "./types";
import { useChatBot } from "./ChatBotProvider";
import { sendChatMessage } from "./api-utils";
import "./ChatBot.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot: React.FC<ChatBotProps> = ({
  apiEndpoint,
  infoQuestion,
  setInfoQuestion,
  SocketId: propSocketId,
  sessionId: propSessionId,
  formData,
  setFormData,
  onChatOpenChange,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
  flowType: propFlowType,
  config: propConfig,
  onFormUpdate,
}) => {
  // Get context values (with fallbacks for standalone usage)
  let context: ChatBotContextType | null = null;
  try {
    context = useChatBot();
  } catch (e) {
    // Context not available, use props only
  }

  // Use context or props (props take precedence)
  const config = propConfig || context?.config;
  const apiEndpointFinal = apiEndpoint || config?.apiEndpoint || "/api/chat";
  const flowType =
    propFlowType || config?.defaultFlowType || "loan-application";
  const socketId = propSocketId || context?.socketId || null;
  const sessionId =
    propSessionId || context?.sessionId || `session-${Date.now()}`;
  const formUpdateResponse = context?.formUpdateResponse || null;
  const setFormUpdateResponse = context?.setFormUpdateResponse || (() => {});

  const [isOpen, setIsOpen] = useState(propIsOpen ?? false);

  // Sync with prop changes
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  // Initialize messages based on flow type
  const [messages, setMessages] = useState<Message[]>(() => {
    const greeting =
      flowType === "loan-application"
        ? "Hello! How can I assist you with your loan journey today?"
        : "Hello! Thank you for submitting your loan application. Please wait for your loan offer to be generated.";

    return [
      {
        id: 1,
        text: greeting,
        sender: "bot",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (config?.theme === "dark") return "dark";
    if (config?.theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "light"
      : "light";
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (config?.theme === "auto") {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [config?.theme]);

  // Theme config
  const themeConfig = {
    light: {
      bg: "bg-white",
      chatBg: "bg-gray-50",
      userBubble: "text-white",
      botBubble: "bg-white text-gray-800 border border-gray-200",
      systemBubble: "bg-gray-100 text-gray-500",
      inputBg: "bg-gray-50",
      headerBg:
        config?.customStyles?.headerGradient ||
        "bg-gradient-to-br from-blue-700 via-blue-500 to-green-400",
      shadow: "shadow-2xl",
      accent: "from-[#1b703b] to-[#4f9970]",
      button: config?.customStyles?.primaryColor
        ? `bg-[${config.customStyles.primaryColor}]`
        : "bg-gradient-to-br from-blue-700 via-blue-500 to-green-400",
      disabled: "bg-gray-400",
      focus: "focus:ring-green-700",
    },
    dark: {
      bg: "bg-gray-900",
      chatBg: "bg-gray-800",
      userBubble: "text-white",
      botBubble: "bg-gray-700 text-gray-100 border border-gray-600",
      systemBubble: "bg-gray-700 text-gray-400",
      inputBg: "bg-gray-900",
      headerBg: "bg-gradient-to-r from-[#1b703b] to-[#4f9970]",
      shadow: "shadow-2xl",
      accent: "from-[#1b703b] to-[#4f9970]",
      button: "bg-[#1b703b] hover:bg-[#4f9970]",
      disabled: "bg-gray-600",
      focus: "focus:ring-green-700",
    },
  };
  const t = themeConfig[theme];

  const fontScale = {
    heading: "font-sans text-lg md:text-xl font-semibold",
    bubble: "font-sans text-sm md:text-base",
    input: "font-sans text-sm",
    system: "font-sans text-xs italic",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    SubmitUserMessage(userMessage);
  };

  const SubmitUserMessage = async (userMessage: Message) => {
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    // Check if socketId is available before sending
    if (!socketId) {
      setIsLoading(false);
      setError(
        "Please wait for the connection to establish before sending messages."
      );
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm connecting to the server. Please wait a moment and try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    let userMsgText = userMessage.text;
    if (formData && Object.keys(formData).length > 0) {
      userMsgText = `${userMessage.text}`;
    }

    // Call onMessageSent callback
    if (config?.onMessageSent) {
      config.onMessageSent(userMessage.text);
    }

    try {
      const data = await sendChatMessage(
        userMsgText,
        sessionId,
        socketId,
        apiEndpointFinal,
        flowType
      );

      const botMessage: Message = {
        id: Date.now() + 1,
        text:
          data.response ||
          "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Call onMessageReceived callback
      if (config?.onMessageReceived) {
        config.onMessageReceived(data.response);
      }
    } catch (err) {
      setError("Sorry, I encountered an error. Please try again later.");
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInfoQuestion && setInfoQuestion("");
      setFormData && setFormData({});
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    propSetIsOpen?.(newIsOpen);
    onChatOpenChange?.(newIsOpen);
    setError(null);

    // Call onChatOpen callback
    if (config?.onChatOpen) {
      config.onChatOpen(newIsOpen);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    if (infoQuestion) {
      setIsOpen(true);
      propSetIsOpen?.(true);
      onChatOpenChange?.(true);
      const infoMsg: Message = {
        id: Date.now(),
        text: infoQuestion,
        sender: "user",
        timestamp: new Date(),
      };
      SubmitUserMessage(infoMsg);
    }
  }, [infoQuestion]);

  // Handle form update responses
  useEffect(() => {
    if (formUpdateResponse && formUpdateResponse.response) {
      if (formUpdateResponse.triggerApiCall) {
        const userMessage: Message = {
          id: Date.now(),
          text: formUpdateResponse.response,
          sender: "user",
          timestamp: new Date(),
        };
        SubmitUserMessage(userMessage);
        setFormUpdateResponse(null);
      } else if (formUpdateResponse.field) {
        const contextualMessage = `📝 **Form Update**: I've noted that you updated the ${formUpdateResponse.field} field to "${formUpdateResponse.value}".\n\n${formUpdateResponse.response}`;

        const botMessage: Message = {
          id: Date.now(),
          text: contextualMessage,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setFormUpdateResponse(null);
      } else {
        const botMessage: Message = {
          id: Date.now(),
          text: formUpdateResponse.response,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setFormUpdateResponse(null);
      }
    }
  }, [formUpdateResponse, setFormUpdateResponse]);

  const title = config?.title || "Loan Assistant";
  const subtitle = config?.subtitle || "Powered by LendingLogik";

  // Floating mode for all pages
  return (
    <div
      className={`fixed bottom-6 rounded-t-2xl right-6 z-50 ${t.bg} transition-all duration-500 font-sans chatbot-floating-container`}
      style={{ height: "82%" }}
    >
      {isOpen && (
        <div
          className={`bottom-0 right-0 w-full max-w-[420px] h-100 mx-auto ${
            t.bg
          } rounded-3xl ${
            t.shadow
          } border border-gray-200 dark:border-gray-700 transform transition-all duration-500 origin-bottom-right ${
            isOpen
              ? "scale-100 opacity-100 visible"
              : "scale-75 opacity-0 invisible"
          } ${theme === "dark" ? "text-gray-100" : ""} chatbot-main-container`}
        >
          {isOpen && (
            <button
              onClick={toggleChat}
              className={`w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-purple-500/50 chatbot-toggle-btn ${
                isOpen ? "rotate-0" : "rotate-0"
              }`}
              style={{
                position: "absolute",
                top: "-65px",
                right: "0.5rem",
                zIndex: 1000,
              }}
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          )}
          <div
            className={`bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between shadow-lg border-b border-white/20 chatbot-header`}
            style={{ minHeight: "64px" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center border border-white/30 shadow-lg chatbot-avatar">
                <Bot className="w-6 h-6 text-white chatbot-icon" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-sans font-bold text-base md:text-lg leading-tight chatbot-title">
                  {title}
                </h3>
                <span className="text-[11px] text-purple-100 mt-0.5 chatbot-subtitle">
                  {subtitle}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block px-2 py-0.5 bg-green-500 text-[10px] rounded-full text-white font-semibold shadow-lg chatbot-status">
                Online
              </span>
              {formUpdateResponse && (
                <span className="inline-block px-2 py-0.5 bg-blue-500 text-[10px] rounded-full text-white font-semibold shadow-lg animate-pulse chatbot-sync">
                  Syncing
                </span>
              )}
            </div>
          </div>
          <div
            className={`flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white mx-auto chatbot-messages`}
            style={{ height: "70%", maxWidth: "420px" }}
            ref={(el) => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
          >
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user"
                      ? "justify-end"
                      : message.sender === "bot"
                      ? "justify-start"
                      : "justify-center"
                  } w-full `}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div
                    className={`w-fit max-w-[80vw] md:max-w-md px-4 py-3 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                      message.sender === "user"
                        ? `rounded-br-2xl ml-auto bg-gradient-to-r from-purple-600 to-pink-500 text-white`
                        : message.sender === "bot"
                        ? `bg-white text-gray-800 border border-gray-200 rounded-bl-2xl mr-auto`
                        : `bg-gray-100 text-gray-500 mx-auto`
                    }
                    ${fontScale.bubble} chatbot-message-bubble`}
                    style={
                      message.sender === "user"
                        ? {
                            minHeight: "36px",
                            lineHeight: "1.4",
                          }
                        : { minHeight: "36px", lineHeight: "1.4" }
                    }
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === "bot" && (
                        <Bot className="w-4 h-4 mt-1 text-blue-400 dark:text-blue-300 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className={`leading-relaxed ${fontScale.bubble}`}>
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                        <p
                          className={`mt-2 text-xs ${
                            message.sender === "user"
                              ? "text-blue-200 dark:text-blue-300"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <User className="w-4 h-4 mt-1 text-blue-200 dark:text-blue-300 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div
                    className={`px-4 py-3 rounded-2xl ${t.botBubble} ${t.shadow} flex items-center space-x-2`}
                  >
                    <Bot className="w-4 h-4 text-blue-400 dark:text-blue-300" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center animate-fade-in">
                  <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-sm font-sans">
                    {error}
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
          <div
            className={`flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-white px-2 py-2 mx-auto chatbot-input-container`}
            style={{ height: "15%", maxWidth: "420px" }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={2}
              className={`flex-1 px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${fontScale.input} resize-none transition-all duration-300 hover:shadow-md chatbot-textarea`}
              style={{
                minHeight: "44px",
                maxHeight: "120px",
                overflow: "hidden",
                fontFamily: "Inter, Roboto, Open Sans, sans-serif",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`m-1 bg-gradient-to-r from-purple-600 to-pink-500 disabled:bg-gray-400 text-white p-3 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-lg hover:scale-105 chatbot-send-btn`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`absolute bottom-0 right-0 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-purple-500/50 chatbot-main-toggle ${
            isOpen ? "rotate-0" : "rotate-0"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatBot;
