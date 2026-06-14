import apiClient from "./apiClient";
import {
  UserProfile,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  ApiResponse,
} from "../types/auth";

export const profileService = {
  /**
   * Fetch current user profile details
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/profile");
    return response.data;
  },

  /**
   * Update profile details (both Owner & Visitor details)
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>("/profile", payload);
    return response.data;
  },

  /**
   * Upload and update profile picture
   */
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ profile_picture_url: string }>> {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("picture", file); // Include fallbacks for alternative file fields
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<{ profile_picture_url: string }>>(
      "/profile/picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Update account password
   */
  async updatePassword(payload: UpdatePasswordRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>("/profile/password", payload);
    return response.data;
  },
};

export default profileService;
