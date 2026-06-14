export interface AssessmentOption {
  id: number;
  label: string;
  score_value: number;
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  guide_text: string | null;
  guide_document_url: string | null;
  options: AssessmentOption[];
  user_answer_option_id: number | null;
}

export interface CriteriaAssessment {
  id: number;
  code: string; // e.g., "A.1"
  name: string;
  guide_document_url: string | null;
  questions: AssessmentQuestion[];
}

export interface PillarAssessment {
  id: number;
  code: string; // e.g., "A", "B"
  name: string;
  score_percentage: number;
  filled_questions: number;
  total_questions: number;
}

export interface PillarAssessmentDetail {
  id: number;
  code: string;
  name: string;
  criteria: CriteriaAssessment[];
}

export interface SubmitAssessmentResponsePayload {
  question_id: number;
  option_id: number;
}

export interface AssessmentAnswerItem {
  question_id: number;
  option_id: number;
}

export interface SubmitAssessmentBatchPayload {
  pillar_id: number;
  answers: AssessmentAnswerItem[];
}

export interface AssessmentScore {
  total_score: number;
  max_score: number;
  percentage: number;
  readiness_level: "Sangat Baik" | "Perlu Peningkatan" | string;
}

// Admin payloads
export interface AdminAssessmentPillarPayload {
  code: string;
  name: string;
  description?: string;
  order_number: number;
  is_active: boolean;
}

export interface AdminAssessmentCriteriaPayload {
  pillar_id: number;
  code: string;
  name: string;
  guide_document_url?: string | null;
  order_number: number;
  is_active: boolean;
}

export interface AdminAssessmentQuestionPayload {
  criteria_id: number;
  question_text: string;
  guide_text?: string | null;
  guide_document_url?: string | null;
  is_required: boolean;
  order_number: number;
}

export interface AdminAssessmentOptionPayload {
  question_id: number;
  label: string;
  score_value: number;
  order_number: number;
}
