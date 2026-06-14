import apiClient from "./apiClient";
import { ApiResponse } from "../types/auth";
import {
  PillarAssessment,
  PillarAssessmentDetail,
  SubmitAssessmentBatchPayload,
  AssessmentScore,
  AdminAssessmentPillarPayload,
  AdminAssessmentCriteriaPayload,
  AdminAssessmentQuestionPayload,
  AdminAssessmentOptionPayload,
} from "../types/assessment";

export const assessmentService = {
  /**
   * Fetch self-assessment pillars summary
   */
  async getPillars(): Promise<ApiResponse<PillarAssessment[]>> {
    const response = await apiClient.get<ApiResponse<PillarAssessment[]>>(
      "/self-assessments/pillars"
    );
    return response.data;
  },

  /**
   * Fetch detail of an assessment pillar (including criteria and questions)
   */
  async getPillarQuestions(id: number | string): Promise<ApiResponse<PillarAssessmentDetail>> {
    const response = await apiClient.get<ApiResponse<PillarAssessmentDetail>>(
      `/self-assessments/pillars/${id}`
    );
    return response.data;
  },

  /**
   * Submit/save a single question response
   */
  async submitResponse(questionId: number, optionId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/self-assessments/responses",
      { question_id: questionId, option_id: optionId }
    );
    return response.data;
  },

  /**
   * Submit a batch of answers for a pillar
   */
  async submitBatch(payload: SubmitAssessmentBatchPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/self-assessments/submit",
      payload
    );
    return response.data;
  },

  /**
   * Get overall self-assessment sustainability score
   */
  async getScore(): Promise<ApiResponse<AssessmentScore>> {
    const response = await apiClient.get<ApiResponse<AssessmentScore>>(
      "/self-assessments/score"
    );
    return response.data;
  },

  /**
   * Fetch all answer responses (drafts/history) for reference
   */
  async getMyResponses(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(
      "/self-assessments/responses"
    );
    return response.data;
  },

  // ==========================================
  // ADMIN SELF-ASSESSMENT MANAGEMENT
  // ==========================================

  /**
   * Admin: List all user individual answer responses
   */
  async adminGetResponses(page = 1, limit = 10): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/self-assessments/responses?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Admin: List all user overall test submissions
   */
  async adminGetSubmissions(page = 1, limit = 10): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/self-assessments/submissions?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Admin: Fetch detailed scores of a specific user
   */
  async adminGetUserScore(userId: number | string): Promise<ApiResponse<AssessmentScore>> {
    const response = await apiClient.get<ApiResponse<AssessmentScore>>(
      `/admin/self-assessments/users/${userId}/score`
    );
    return response.data;
  },

  /**
   * Admin: Create an assessment pillar
   */
  async adminCreatePillar(payload: AdminAssessmentPillarPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/self-assessments/pillars",
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update assessment pillar
   */
  async adminUpdatePillar(
    id: number | string,
    payload: Partial<AdminAssessmentPillarPayload>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/self-assessments/pillars/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete assessment pillar
   */
  async adminDeletePillar(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/self-assessments/pillars/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Create assessment criteria
   */
  async adminCreateCriteria(payload: AdminAssessmentCriteriaPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/self-assessments/criteria",
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update assessment criteria
   */
  async adminUpdateCriteria(
    id: number | string,
    payload: Partial<AdminAssessmentCriteriaPayload>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/self-assessments/criteria/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete assessment criteria
   */
  async adminDeleteCriteria(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/self-assessments/criteria/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Create assessment question (supports guide document upload)
   */
  async adminCreateQuestion(
    payload: AdminAssessmentQuestionPayload | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/self-assessments/questions",
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Update assessment question
   */
  async adminUpdateQuestion(
    id: number | string,
    payload: Partial<AdminAssessmentQuestionPayload> | FormData
  ): Promise<ApiResponse<any>> {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/self-assessments/questions/${id}`,
      payload,
      { headers }
    );
    return response.data;
  },

  /**
   * Admin: Delete assessment question
   */
  async adminDeleteQuestion(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/self-assessments/questions/${id}`
    );
    return response.data;
  },

  /**
   * Admin: Create assessment answer option
   */
  async adminCreateOption(payload: AdminAssessmentOptionPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/admin/self-assessments/options",
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update assessment answer option
   */
  async adminUpdateOption(
    id: number | string,
    payload: Partial<AdminAssessmentOptionPayload>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/self-assessments/options/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete assessment answer option
   */
  async adminDeleteOption(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/self-assessments/options/${id}`
    );
    return response.data;
  },
};

export default assessmentService;
