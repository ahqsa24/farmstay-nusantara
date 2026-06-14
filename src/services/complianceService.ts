import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import {
  PillarCompliance,
  PillarComplianceDetail,
  ComplianceResponseSummary,
  AdminCompliancePillarPayload,
  AdminComplianceCriteriaPayload,
  AdminComplianceSubIndicatorPayload,
} from "../types/compliance";

export const complianceService = {
  /**
   * Fetch standard compliance pillars summary
   */
  async getPillars(): Promise<ApiResponse<PillarCompliance[]>> {
    const response = await apiClient.get<ApiResponse<PillarCompliance[]>>(
      "/standard-compliances/pillars"
    );
    return response.data;
  },

  /**
   * Fetch detail of a compliance pillar (including criteria and sub-indicators)
   */
  async getPillarDetail(id: number | string): Promise<ApiResponse<PillarComplianceDetail>> {
    const response = await apiClient.get<ApiResponse<PillarComplianceDetail>>(
      `/standard-compliances/pillars/${id}`
    );
    return response.data;
  },

  /**
   * Submit/attach evidence to a sub-indicator.
   * Supports both URL text submission or physical file uploads.
   */
  async submitEvidence(
    subIndicatorId: number | string,
    answer: string,
    fileOrUrl?: File | string
  ): Promise<ApiResponse<ComplianceResponseSummary>> {
    if (fileOrUrl instanceof File) {
      const formData = new FormData();
      formData.append("answer", answer);
      formData.append("evidence_file", fileOrUrl);
      formData.append("file", fileOrUrl);

      const response = await apiClient.post<ApiResponse<ComplianceResponseSummary>>(
        `/standard-compliances/sub-indicators/${subIndicatorId}/evidence`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } else {
      const payload: Record<string, string> = { answer };
      if (typeof fileOrUrl === "string") {
        payload.evidence_url = fileOrUrl;
      }

      const response = await apiClient.post<ApiResponse<ComplianceResponseSummary>>(
        `/standard-compliances/sub-indicators/${subIndicatorId}/evidence`,
        payload
      );
      return response.data;
    }
  },

  /**
   * Fetch all owner standard compliance responses (Owner dashboard)
   */
  async getMyResponses(): Promise<ApiResponse<ComplianceResponseSummary[]>> {
    const response = await apiClient.get<ApiResponse<ComplianceResponseSummary[]>>(
      "/standard-compliances/responses"
    );
    return response.data;
  },

  // ==========================================
  // ADMIN COMPLIANCE MANAGEMENT ENDPOINTS
  // ==========================================

  /**
   * Admin: List all compliance responses for review
   */
  async adminGetResponses(page = 1, limit = 10): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/standard-compliances/responses?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Admin: Update compliance response status
   */
  async adminUpdateResponseStatus(
    id: number | string,
    status: "draft" | "submitted" | "reviewed"
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(
      `/admin/standard-compliances/responses/${id}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Admin: Create a new compliance pillar
   */
  async adminCreatePillar(payload: AdminCompliancePillarPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/standard-compliances/pillars",
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update compliance pillar
   */
  async adminUpdatePillar(
    id: number | string,
    payload: Partial<AdminCompliancePillarPayload>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/standard-compliances/pillars/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete compliance pillar
   */
  async adminDeletePillar(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/standard-compliances/pillars/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Create a new compliance criteria
   */
  async adminCreateCriteria(payload: AdminComplianceCriteriaPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/standard-compliances/criteria",
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update compliance criteria
   */
  async adminUpdateCriteria(
    id: number | string,
    payload: Partial<AdminComplianceCriteriaPayload>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/standard-compliances/criteria/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete compliance criteria
   */
  async adminDeleteCriteria(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/standard-compliances/criteria/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Create a compliance sub-indicator (supports example file upload)
   */
  async adminCreateSubIndicator(
    payload: AdminComplianceSubIndicatorPayload | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/standard-compliances/sub-indicators",
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Update compliance sub-indicator
   */
  async adminUpdateSubIndicator(
    id: number | string,
    payload: Partial<AdminComplianceSubIndicatorPayload> | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/standard-compliances/sub-indicators/${id}`,
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Delete compliance sub-indicator
   */
  async adminDeleteSubIndicator(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/standard-compliances/sub-indicators/${id}`
    );
    return response.data;
  },
};

export default complianceService;
