import apiClient from "./apiClient";
import Cookies from "js-cookie";
import {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
  User,
  UserProfile,
} from "../types/auth";

export const authService = {
  /**
   * Log in user and save token to cookies
   */
  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      payload
    );
    const { data } = response;
    
    if (data.status === "success" && data.data?.token) {
      // Set cookie to expire in 7 days (standard setting, can be adjusted)
      Cookies.set("token", data.data.token, { expires: 7, secure: true, sameSite: "strict" });
    }
    
    return data;
  },

  /**
   * Register a new user (owner or visitor)
   */
  async register(payload: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  /**
   * Send link for resetting password
   */
  async forgotPassword(payload: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      payload
    );
    return response.data;
  },

  /**
   * Reset password using token sent to email
   */
  async resetPassword(payload: ResetPasswordRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/reset-password",
      payload
    );
    return response.data;
  },

  /**
   * Log out user by removing tokens
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      await apiClient.post<ApiResponse<null>>("/auth/logout");
    } catch (e) {
      // Even if network logout fails, clear local credentials
      console.error("Logout request failed, cleaning up locally anyway:", e);
    } finally {
      Cookies.remove("token");
    }
    return {
      status: "success",
      code: 200,
      message: "Logout berhasil",
    };
  },

  /**
   * Get current authenticated user profile details
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/profile");
    return response.data;
  },
};

export default authService;
