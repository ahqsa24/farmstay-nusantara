export type ConsultationStatus = "open" | "in_progress" | "closed";

export interface ConsultationSession {
  id: number;
  subject: string; // matches endpoint spec where subject/topic can be used
  topic?: string;
  status: ConsultationStatus;
  user_id: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationMessage {
  id: number;
  consultation_id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  sender_role: "owner" | "visitor" | "admin";
  attachment_url: string | null;
  created_at: string;
}

export interface CreateConsultationPayload {
  subject?: string;
  topic?: string;
  message: string;
  attachment_url?: string;
}

export interface ReplyConsultationPayload {
  message: string;
  attachment_url?: string;
}

export interface AdminUpdateConsultationStatusPayload {
  status: ConsultationStatus;
}
