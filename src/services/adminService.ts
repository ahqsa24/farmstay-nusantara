import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";

export interface AdminUser {
  id: number;
  nama: string;
  email: string;
  status: string;
  role: { id: number; name: string } | string;
  profile?: any;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  nama: string;
  email: string;
  password: string;
  role: string;
  status?: string;
}

export interface UpdateUserPayload {
  nama?: string;
  role?: string;
  status?: string;
}

export const adminService = {
  /**
   * Admin: List all registered users with pagination, search, and role filter
   */
  async getUsers(
    page = 1,
    limit = 10,
    search = "",
    role = ""
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);
    if (role) query.append("role", role);

    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/users?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Admin: Get detailed information of a specific user
   */
  async getUserDetail(id: number | string): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(
      `/admin/users/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.post<ApiResponse<AdminUser>>(
      "/admin/users",
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update user (nama, role, status only — email & password cannot be changed)
   */
  async updateUser(
    id: number | string,
    payload: UpdateUserPayload
  ): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `/admin/users/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete a user
   */
  async deleteUser(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/users/${id}`
    );
    return response.data;
  },
};

export default adminService;
