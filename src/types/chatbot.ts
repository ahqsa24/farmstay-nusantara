export interface ChatbotConfig {
  id: number;
  key: string;
  isEnabled: boolean;
  whatsappNumber: string;
  welcomeTitle: string;
  welcomeMessage: string;
  fallbackMessage: string;
}

export interface AdminChatbotConfigPayload {
  isEnabled?: boolean;
  whatsappNumber?: string;
  welcomeTitle?: string;
  welcomeMessage?: string;
  fallbackMessage?: string;
}