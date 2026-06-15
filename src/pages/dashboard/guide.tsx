import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import guideService from "@/services/guideService";
import { GuideData } from "@/types/guide";

export default function GuidePage() {
  const { user } = useAuth();
  const { locale } = useTranslation();
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  useEffect(() => {
    async function loadGuide() {
      setIsLoading(true);
      try {
        const response = await guideService.getGuideData(user?.role || "owner", locale || "id");
        if (response.status === "success" && response.data) {
          setGuideData(response.data);
        }
      } catch (err) {
        console.error("Failed to load guide data", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (user?.role) {
      loadGuide();
    }
  }, [user?.role, locale]);

  const toggleAccordion = (idx: number) => {
    setActiveAccordion(activeAccordion === idx ? null : idx);
  };

  if (isLoading || !guideData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-farm-green border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Dynamic Header Card with Books Background */}
        <div className="relative rounded-2xl overflow-hidden bg-farm-green-dark text-white p-8 md:p-10 shadow-md">
          {/* Background image overlay */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
            style={{ backgroundImage: "url('/images/books-bg.png')" }}
          ></div>
          {/* Content */}
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="text-[11px] font-extrabold tracking-widest text-farm-cream/80 uppercase flex items-center gap-1.5">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                {locale === "id" ? "Dashboard" : "Dashboard"}
              </Link>
              <span className="text-farm-cream/50">/</span>
              <span className="text-farm-gold">{locale === "id" ? "Panduan" : "User Guide"}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-farm-cream mt-2 tracking-tight">
              {guideData.title}
            </h1>
            <p className="text-xs sm:text-sm font-light text-farm-cream/90 mt-1 max-w-2xl leading-relaxed">
              {guideData.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-farm-border rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col gap-8">
          {/* Welcome Section */}
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-farm-text mb-4">
              {guideData.welcomeTitle}
            </h2>
            <div className="flex flex-col gap-4 text-xs sm:text-sm text-farm-text-light font-light leading-relaxed">
              <p>{guideData.welcomeText1}</p>
              <p>{guideData.welcomeText2}</p>
            </div>
          </div>

          {/* Getting Started Section */}
          <div className="border-t border-farm-border/60 pt-8">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-farm-text mb-6">
              {guideData.gettingStartedTitle}
            </h3>
            
            <div className="flex flex-col gap-8">
              {guideData.steps.map((step) => (
                <div key={step.number} className="flex gap-4 items-start">
                  {/* Step Number Circle */}
                  <div className="h-7 w-7 rounded-full bg-farm-green text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    {step.number}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex flex-col gap-2 min-w-0">
                    <h4 className="font-serif text-sm sm:text-base font-extrabold text-farm-text">
                      {step.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-farm-text-light font-light leading-relaxed">
                      {step.content}
                    </p>
                    
                    {/* Pillar Badges for Step 2 */}
                    {step.showPillBadges && (
                      <div className="flex flex-wrap gap-2.5 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold bg-[#FFF3E0] text-[#EF6C00] border border-[#FFE0B2] shadow-sm">
                          <span className="w-4 h-4 rounded bg-[#EF6C00] text-white font-extrabold flex items-center justify-center text-[9px]">A</span>
                          {locale === "id" ? "Pengelolaan Berkelanjutan" : "Sustainable Management"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] shadow-sm">
                          <span className="w-4 h-4 rounded bg-[#2E7D32] text-white font-extrabold flex items-center justify-center text-[9px]">B</span>
                          {locale === "id" ? "Sosial-Ekonomi" : "Socio-economic"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB] shadow-sm">
                          <span className="w-4 h-4 rounded bg-[#1565C0] text-white font-extrabold flex items-center justify-center text-[9px]">C</span>
                          {locale === "id" ? "Budaya" : "Cultural"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold bg-[#E0F2F1] text-[#00695C] border border-[#B2DFDB] shadow-sm">
                          <span className="w-4 h-4 rounded bg-[#00695C] text-white font-extrabold flex items-center justify-center text-[9px]">D</span>
                          {locale === "id" ? "Lingkungan" : "Environmental"}
                        </span>
                      </div>
                    )}
                    
                    {/* Subpoints/Bullets for Step 3 */}
                    {step.subPoints && step.subPoints.length > 0 && (
                      <ul className="flex flex-col gap-2 mt-2 pl-4 list-disc text-xs sm:text-sm text-farm-text-light font-light leading-relaxed">
                        {step.subPoints.map((bullet, bIdx) => {
                          // Parse markdown bold **text** in bullets
                          const parts = bullet.split("**");
                          return (
                            <li key={bIdx}>
                              {parts.map((part, pIdx) => 
                                pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-farm-text">{part}</strong> : part
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consultant Interaction Section */}
          {guideData.interactionTitle && (
            <div className="border-t border-farm-border/60 pt-8">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-farm-text mb-4">
                {guideData.interactionTitle}
              </h3>
              <div className="flex flex-col gap-4 text-xs sm:text-sm text-farm-text-light font-light leading-relaxed">
                <p>{guideData.interactionText1}</p>
                <p>{guideData.interactionText2}</p>
              </div>
            </div>
          )}

          {/* Other Supporting Features Section */}
          <div className="border-t border-farm-border/60 pt-8">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-farm-text mb-4">
              {guideData.otherFeaturesTitle}
            </h3>
            
            <ul className="flex flex-col gap-4 pl-4 list-disc text-xs sm:text-sm text-farm-text-light font-light leading-relaxed">
              {guideData.otherFeatures.map((feat, idx) => (
                <li key={idx}>
                  <strong className="font-extrabold text-farm-text">{feat.title}: </strong>
                  {feat.content}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-farm-border rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2.5 border-b border-farm-border/60 pb-4 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-farm-green shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-farm-text">
              {guideData.faqTitle}
            </h3>
          </div>
          
          <div className="flex flex-col divide-y divide-farm-border/60">
            {guideData.faqs.map((faq, idx) => {
              const isOpen = activeAccordion === idx;
              return (
                <div key={idx} className="flex flex-col py-3.5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="flex items-center justify-between text-left font-serif font-extrabold text-sm sm:text-base text-farm-text hover:text-farm-green transition-all duration-200 w-full focus:outline-none py-1"
                  >
                    <span>{faq.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className={`w-4 h-4 text-farm-text-light transition-transform duration-300 ${isOpen ? "transform rotate-180 text-farm-green" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  {/* Smooth height transition wrapper */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 mt-2.5" : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="text-xs sm:text-sm text-farm-text-light leading-relaxed font-light pl-1 pb-1">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
