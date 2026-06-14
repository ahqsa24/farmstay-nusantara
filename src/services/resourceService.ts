import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { Resource, AdminResourcePayload } from "../types/resources";

export const resourceService = {
  /**
   * Fetch resources list (Guides, documents, videos, articles)
   */
  async getResources(
    page = 1,
    limit = 10,
    search = "",
    type = ""
  ): Promise<ApiResponse<Resource[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);
    if (type) query.append("type", type);

    const response = await apiClient.get<ApiResponse<Resource[]>>(
      `/resources?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Fetch single resource detail by ID
   */
  async getResourceDetail(id: number | string): Promise<ApiResponse<Resource>> {
    const response = await apiClient.get<ApiResponse<Resource>>(`/resources/${id}`);
    return response.data;
  },

  // ==========================================
  // ADMIN RESOURCE MANAGEMENT
  // ==========================================

  /**
   * Admin: Add a new learning resource (supports PDF/media upload)
   */
  async adminCreateResource(payload: AdminResourcePayload | FormData): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/resources",
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Update learning resource
   */
  async adminUpdateResource(
    id: number | string,
    payload: Partial<AdminResourcePayload> | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/resources/${id}`,
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Delete resource from standard list
   */
  async adminDeleteResource(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/resources/${id}`);
    return response.data;
  },
};

export default resourceService;
