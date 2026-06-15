import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { Farmstay, AdminFarmstayPayload } from "../types/resources";

export const farmstayService = {
  /**
   * Fetch farmstay listings (Public/User directory list)
   */
  async getFarmstays(
    page = 1,
    limit = 10,
    search = "",
    location = "",
    category = ""
  ): Promise<ApiResponse<Farmstay[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);
    if (location) query.append("location", location);
    if (category) query.append("category", category);

    const response = await apiClient.get<ApiResponse<Farmstay[]>>(
      `/farmstays?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Fetch single farmstay details by ID
   */
  async getFarmstayDetail(id: number | string): Promise<ApiResponse<Farmstay>> {
    const response = await apiClient.get<ApiResponse<Farmstay>>(`/farmstays/${id}`);
    return response.data;
  },

  // ==========================================
  // ADMIN FARMSTAY MANAGEMENT
  // ==========================================

  /**
   * Admin: List all farmstay listings with owners info
   */
  async adminGetFarmstays(
    page = 1,
    limit = 10,
    search = "",
    category = ""
  ): Promise<ApiResponse<Farmstay[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);
    if (category) query.append("category", category);

    const response = await apiClient.get<ApiResponse<Farmstay[]>>(
      `/admin/farmstays?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Admin: Register a new reference Farmstay (local/global)
   */
  async adminCreateFarmstay(payload: AdminFarmstayPayload | FormData): Promise<ApiResponse<any>> {
    // Let Axios set the Content-Type automatically for FormData to include the boundary
    const headers = payload instanceof FormData ? undefined : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/farmstays",
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Update reference farmstay listing details
   */
  async adminUpdateFarmstay(
    id: number | string,
    payload: Partial<AdminFarmstayPayload> | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? undefined : undefined;
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/farmstays/${id}`,
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Delete reference farmstay listing
   */
  async adminDeleteFarmstay(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/farmstays/${id}`);
    return response.data;
  },
};

export default farmstayService;
