export interface ActivityLog {
  id: number;
  action: string; // e.g., "created", "evidence_submitted", "status_changed"
  user_name: string;
  timestamp: string;
  notes?: string;
}

export interface SubIndicatorCompliance {
  id: number;
  code: string; // e.g., "a", "b", "c"
  description: string;
  example_document_url: string | null;
  status: "Belum Dikerjakan" | "Selesai" | string;
  attached_evidence_url: string | null;
  attached_evidence_answer?: string | null;
  activity_log?: ActivityLog[];
}

export interface CriteriaCompliance {
  id: number;
  code: string; // e.g., "A1", "A2"
  name: string;
  status: "Belum Dimulai" | "Dalam Proses" | "Selesai" | string;
  total_sub_indicators: number;
  completed_sub_indicators: number;
  sub_indicators: SubIndicatorCompliance[];
}

export interface PillarCompliance {
  id: number;
  code: string; // e.g., "A", "B", "C", "D"
  name: string;
  progress_percentage: number;
  total_criteria: number;
  completed_criteria: number;
}

export interface PillarComplianceDetail extends Omit<PillarCompliance, "progress_percentage" | "total_criteria" | "completed_criteria"> {
  criteria: CriteriaCompliance[];
}

export interface SubmitEvidencePayload {
  answer?: string;
  evidence_url?: string;
}

export interface ComplianceResponseSummary {
  id: number;
  user_id: number;
  sub_indicator_id: number;
  answer: string;
  evidence_url: string | null;
  status: "draft" | "submitted" | "reviewed";
  created_at: string;
  updated_at: string;
}

// Admin payloads
export interface AdminCompliancePillarPayload {
  code: string;
  name: string;
  description?: string;
  order_number: number;
  is_active: boolean;
}

export interface AdminComplianceCriteriaPayload {
  pillar_id: number;
  code: string;
  name: string;
  description?: string;
  order_number: number;
  is_active: boolean;
}

export interface AdminComplianceSubIndicatorPayload {
  criteria_id: number;
  code: string;
  description: string;
  order_number: number;
  is_active: boolean;
  example_document_url?: string | null;
}
