import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import {
  ConsultationSession,
  ConsultationMessage,
  CreateConsultationPayload,
  ReplyConsultationPayload,
  ConsultationStatus,
} from "../types/consultation";

export const consultationService = {
  /**
   * Fetch all owner consultation sessions
   */
  async getSessions(): Promise<ApiResponse<ConsultationSession[]>> {
    const response = await apiClient.get<ApiResponse<ConsultationSession[]>>(
      "/consultations"
    );
    return response.data;
  },

  /**
   * Create a new consultation session (supports optional attachment upload)
   */
  async createSession(
    payload: CreateConsultationPayload | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      "/consultations",
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Fetch messages in a consultation thread
   */
  async getMessages(sessionId: number | string): Promise<ApiResponse<ConsultationMessage[]>> {
    const response = await apiClient.get<ApiResponse<ConsultationMessage[]>>(
      `/consultations/${sessionId}/messages`
    );
    return response.data;
  },

  /**
   * Send a reply message in a consultation thread (supports optional attachment upload)
   */
  async sendMessage(
    sessionId: number | string,
    payload: ReplyConsultationPayload | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      `/consultations/${sessionId}/messages`,
      payload,
      { headers }
    );
    return response.data;
  },

  // ==========================================
  // ADMIN CONSULTATION ENDPOINTS
  // ==========================================

  /**
   * Admin: List all consultation sessions across users
   */
  async adminGetSessions(
    page = 1,
    limit = 10,
    search = "",
    status = ""
  ): Promise<ApiResponse<ConsultationSession[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);
    if (status) query.append("status", status);

    const response = await apiClient.get<ApiResponse<ConsultationSession[]>>(
      `/admin/consultations?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Admin: Send a response message to user consultation thread
   */
  async adminReply(
    sessionId: number | string,
    payload: ReplyConsultationPayload | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      `/admin/consultations/${sessionId}/reply`,
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Update consultation thread status
   */
  async adminUpdateStatus(
    sessionId: number | string,
    status: ConsultationStatus
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(
      `/admin/consultations/${sessionId}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Admin: Mark a consultation thread as closed/resolved
   */
  async adminClose(sessionId: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(
      `/admin/consultations/${sessionId}/close`
    );
    return response.data;
  },

  /**
   * Admin: Delete a closed consultation session
   */
  async adminDelete(sessionId: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/consultations/${sessionId}`
    );
    return response.data;
  },
};

export default consultationService;
