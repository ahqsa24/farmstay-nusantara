import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import { ForumStory, CreateForumStoryPayload, VerifyForumStoryPayload } from "../types/forum";

export const forumService = {
  /**
   * Fetch approved sharing stories from public (Public/Visitor feed)
   */
  async getStories(page = 1, limit = 10, search = ""): Promise<ApiResponse<ForumStory[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);

    const response = await apiClient.get<ApiResponse<ForumStory[]>>(
      `/forum/stories?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Fetch visitor's own published stories
   */
  async getMyStories(page = 1, limit = 10): Promise<ApiResponse<ForumStory[]>> {
    const response = await apiClient.get<ApiResponse<ForumStory[]>>(
      `/forum/stories/mine?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Submit a new story/experience.
   * Supports both JSON with image_url or FormData with image file.
   */
  async createStory(payload: CreateForumStoryPayload | FormData): Promise<ApiResponse<ForumStory>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<ForumStory>>(
      "/forum/stories",
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Fetch a single story details
   */
  async getStoryDetail(id: number | string): Promise<ApiResponse<ForumStory>> {
    const response = await apiClient.get<ApiResponse<ForumStory>>(`/forum/stories/${id}`);
    return response.data;
  },

  // ==========================================
  // ADMIN FORUM STORIES MODERATION
  // ==========================================

  /**
   * Admin: List stories by moderation status
   */
  async adminGetStories(page = 1, limit = 10, status = ""): Promise<ApiResponse<ForumStory[]>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) query.append("status", status);

    const response = await apiClient.get<ApiResponse<ForumStory[]>>(
      `/admin/forum/stories?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Admin: Approve or Reject a user story
   */
  async adminVerifyStory(
    id: number | string,
    payload: VerifyForumStoryPayload
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(
      `/admin/forum/stories/${id}/verify`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete a story
   */
  async adminDeleteStory(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/forum/stories/${id}`);
    return response.data;
  },
};

export default forumService;
