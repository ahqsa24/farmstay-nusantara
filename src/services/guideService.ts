import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { GuideSection, FaqItem, AdminGuideSectionPayload, AdminFaqItemPayload } from "../types/guide";

export const guideService = {
  // ─── Public / Read-Only ───
  async getGuideSections(role?: string): Promise<ApiResponse<GuideSection[]>> {
    const query = role ? `?role=${role}` : "";
    const response = await apiClient.get<ApiResponse<GuideSection[]>>(`/guide/sections${query}`);
    return response.data;
  },

  async getFaqItems(role?: string): Promise<ApiResponse<FaqItem[]>> {
    const query = role ? `?role=${role}` : "";
    const response = await apiClient.get<ApiResponse<FaqItem[]>>(`/guide/faq${query}`);
    return response.data;
  },

  // ─── Admin Guide Sections ───
  async adminGetGuideSections(role?: string): Promise<ApiResponse<GuideSection[]>> {
    const query = role ? `?role=${role}` : "";
    const response = await apiClient.get<ApiResponse<GuideSection[]>>(`/admin/guide/sections${query}`);
    return response.data;
  },

  async adminCreateGuideSection(payload: AdminGuideSectionPayload): Promise<ApiResponse<GuideSection>> {
    const response = await apiClient.post<ApiResponse<GuideSection>>("/admin/guide/sections", payload);
    return response.data;
  },

  async adminUpdateGuideSection(id: number, payload: Partial<AdminGuideSectionPayload>): Promise<ApiResponse<GuideSection>> {
    const response = await apiClient.put<ApiResponse<GuideSection>>(`/admin/guide/sections/${id}`, payload);
    return response.data;
  },

  async adminDeleteGuideSection(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/guide/sections/${id}`);
    return response.data;
  },

  // ─── Admin FAQ Items ───
  async adminGetFaqItems(role?: string): Promise<ApiResponse<FaqItem[]>> {
    const query = role ? `?role=${role}` : "";
    const response = await apiClient.get<ApiResponse<FaqItem[]>>(`/admin/guide/faq${query}`);
    return response.data;
  },

  async adminCreateFaqItem(payload: AdminFaqItemPayload): Promise<ApiResponse<FaqItem>> {
    const response = await apiClient.post<ApiResponse<FaqItem>>("/admin/guide/faq", payload);
    return response.data;
  },

  async adminUpdateFaqItem(id: number, payload: Partial<AdminFaqItemPayload>): Promise<ApiResponse<FaqItem>> {
    const response = await apiClient.put<ApiResponse<FaqItem>>(`/admin/guide/faq/${id}`, payload);
    return response.data;
  },

  async adminDeleteFaqItem(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/guide/faq/${id}`);
    return response.data;
  }
};

export default guideService;
