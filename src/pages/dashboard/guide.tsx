import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { guideService } from "@/services/guideService";
import { GuideSection, FaqItem } from "@/types/guide";

export default function GuidePage() {
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isId = locale === "id";

  const [sections, setSections] = useState<GuideSection[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch specific to role, and also fallback 'all' is handled by backend
        const role = user?.role || "visitor";
        const [secRes, faqRes] = await Promise.all([
          guideService.getGuideSections(role),
          guideService.getFaqItems(role)
        ]);

        if (secRes.status === "success" && secRes.data) {
          setSections(secRes.data);
        }
        if (faqRes.status === "success" && faqRes.data) {
          setFaqs(faqRes.data);
        }
      } catch (e) {
        console.error("Failed to fetch guide data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Hero Banner Card */}
        <div className="bg-[#122A23] rounded-2xl p-8 relative overflow-hidden shadow-lg">
          {/* Subtle background pattern/overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Link href="/dashboard" className="hover:text-amber-400 transition-colors">DASHBOARD</Link> 
              <span>/</span> 
              <span>{isId ? "PANDUAN" : "GUIDE"}</span>
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              {isId ? "Panduan Pengguna" : "User Guide"}
            </h1>
            
            <p className="text-sm md:text-base text-gray-300 font-light max-w-2xl">
              {isId 
                ? "Panduan lengkap untuk memulai, mengelola, dan memaksimalkan platform Farmstay Nusantara." 
                : "A complete guide to starting, managing, and maximizing the Farmstay Nusantara platform."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-farm-green border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Guide Sections Card */}
            {sections.length > 0 && (
              <div className="bg-white border border-farm-border rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-8">
                {sections.map((section, idx) => (
                  <div key={section.id} className="flex flex-col gap-3">
                    {/* Render title with bold serif font like the design */}
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-farm-text">
                      {section.title}
                    </h2>
                    <div className="text-sm md:text-base text-farm-text-light font-light leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ Card */}
            {faqs.length > 0 && (
              <div className="bg-[#FAF9F5] border border-farm-border rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-farm-green">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <h3 className="font-serif text-lg font-bold text-farm-text">
                    {isId ? "Pertanyaan yang Sering Diajukan (FAQ)" : "Frequently Asked Questions (FAQ)"}
                  </h3>
                </div>

                <div className="flex flex-col border-t border-farm-border/60">
                  {faqs.map((faq, idx) => {
                    const isOpen = activeFaq === idx;
                    return (
                      <div key={faq.id} className="border-b border-farm-border/60 last:border-0">
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="flex items-center justify-between w-full py-4 text-left group focus:outline-none"
                        >
                          <span className="font-bold text-sm md:text-base text-farm-text group-hover:text-farm-green transition-colors pr-4">
                            {faq.question}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-4 h-4 text-farm-text-light transition-transform duration-300 shrink-0 ${
                              isOpen ? "transform rotate-180 text-farm-green" : ""
                            }`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
                          }`}
                        >
                          <p className="text-sm md:text-base text-farm-text-light font-light leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fallback if both empty */}
            {!isLoading && sections.length === 0 && faqs.length === 0 && (
              <div className="bg-white border border-farm-border rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-farm-text-light/50 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25M10.125 5.17l-1.672-1.04A9.047 9.047 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.378 0 2.682.31 3.846.862l1.672-1.04m-1.393-12.652A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-3.846.862l-1.672-1.04" />
                </svg>
                <h3 className="text-lg font-bold text-farm-text mb-1">{isId ? "Belum Ada Panduan" : "No Guides Yet"}</h3>
                <p className="text-sm text-farm-text-light">{isId ? "Admin sedang menyusun panduan untuk Anda." : "Admins are preparing the guides for you."}</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
