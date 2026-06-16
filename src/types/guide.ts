export interface GuideSection {
  id: number;
  role: string;
  title: string;
  content: string;
  orderNumber?: number;
  isActive?: boolean;
}

export interface FaqItem {
  id: number;
  role: string;
  question: string;
  answer: string;
  orderNumber?: number;
  isActive?: boolean;
}

export interface AdminGuideSectionPayload {
  role: string;
  title: string;
  content: string;
  order_number?: number;
  is_active?: boolean;
}

export interface AdminFaqItemPayload {
  role: string;
  question: string;
  answer: string;
  order_number?: number;
  is_active?: boolean;
}
