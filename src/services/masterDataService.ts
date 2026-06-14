import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { MasterDataItem, AdminMasterDataPayload } from "../types/resources";

export const masterDataService = {
  /**
   * Fetch master data options for registration and profile forms
   * e.g., type = 'province', 'city', 'accommodation_type'
   */
  async getMasterData(type: string): Promise<ApiResponse<MasterDataItem[]>> {
    const response = await apiClient.get<ApiResponse<MasterDataItem[]>>(
      `/master-data/${type}`
    );
    return response.data;
  },

  // ==========================================
  // ADMIN MASTER DATA MANAGEMENT
  // ==========================================

  /**
   * Admin: List options for a master data type (supports pagination and search)
   */
  async adminGetMasterData(
    type: string,
    page = 1,
    limit = 10,
    search = ""
  ): Promise<ApiResponse<MasterDataItem[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);

    const response = await apiClient.get<ApiResponse<MasterDataItem[]>>(
      `/admin/master-data/${type}?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Admin: Add a new master data dropdown option
   */
  async adminCreateMasterData(
    type: string,
    payload: AdminMasterDataPayload
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/admin/master-data/${type}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update master data option label
   */
  async adminUpdateMasterData(
    type: string,
    id: number | string,
    payload: AdminMasterDataPayload
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/master-data/${type}/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete master data option
   */
  async adminDeleteMasterData(
    type: string,
    id: number | string
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/master-data/${type}/${id}`
    );
    return response.data;
  },
};

export default masterDataService;
