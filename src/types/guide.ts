export interface GuideSection {
  title: string;
  content: string;
  bullets?: string[];
}

export interface GuideStep {
  number: number;
  title: string;
  content: string;
  subPoints?: string[];
  showPillBadges?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GuideData {
  title: string;
  subtitle: string;
  welcomeTitle: string;
  welcomeText1: string;
  welcomeText2: string;
  gettingStartedTitle: string;
  steps: GuideStep[];
  interactionTitle?: string;
  interactionText1?: string;
  interactionText2?: string;
  otherFeaturesTitle: string;
  otherFeatures: GuideSection[];
  faqTitle: string;
  faqs: FaqItem[];
}
