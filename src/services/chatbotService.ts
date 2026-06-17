import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { ChatbotConfig, AdminChatbotConfigPayload } from "../types/chatbot";

export const chatbotService = {
  async getConfig(): Promise<ApiResponse<ChatbotConfig>> {
    const response = await apiClient.get<ApiResponse<ChatbotConfig>>("/chatbot/config");
    return response.data;
  },

  async adminGetConfig(): Promise<ApiResponse<ChatbotConfig>> {
    const response = await apiClient.get<ApiResponse<ChatbotConfig>>("/admin/chatbot/config");
    return response.data;
  },

  async adminUpdateConfig(payload: AdminChatbotConfigPayload): Promise<ApiResponse<ChatbotConfig>> {
    const response = await apiClient.put<ApiResponse<ChatbotConfig>>("/admin/chatbot/config", payload);
    return response.data;
  },
};

export default chatbotService;