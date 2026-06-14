import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assessmentService } from "@/services/assessmentService";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import {
  PillarAssessment,
  PillarAssessmentDetail,
  CriteriaAssessment,
  AssessmentQuestion,
  AssessmentScore,
} from "@/types/assessment";

export default function AssessmentPage() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  // Core assessment states
  const [pillars, setPillars] = useState<PillarAssessment[]>([]);
  const [selectedPillarId, setSelectedPillarId] = useState<number | null>(null);
  const [pillarDetails, setPillarDetails] = useState<Record<number, PillarAssessmentDetail>>({});
  
  // Navigation states
  const [activeCriteriaId, setActiveCriteriaId] = useState<number | null>(null);
  
  // Scoring / Readiness state
  const [scoreData, setScoreData] = useState<AssessmentScore | null>(null);
  const [showScoreSummary, setShowScoreSummary] = useState(false);

  // UI States
  const [isLoadingPillars, setIsLoadingPillars] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({}); // Track question autosave per ID
  const [saveSuccess, setSaveSuccess] = useState<Record<number, boolean>>({}); // Flashes green on save
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const labels = {
    id: {
      title: "Penilaian Mandiri Keberlanjutan",
      subtitle: "Uji dan evaluasi praktek keberlanjutan akomodasi agrowisata Anda secara berkala",
      selectPillar: "Pilih Pilar Penilaian:",
      criteriaSidebar: "Navigasi Kriteria",
      guideDoc: "Unduh Panduan Resmi",
      guideHint: "Klik untuk membaca penjelasan lengkap",
      autosaveText: "Jawaban disimpan otomatis",
      savingText: "Menyimpan...",
      savedText: "Tersimpan!",
      submitBatchBtn: "Kirim Evaluasi & Lihat Skor Kelayakan",
      viewScoreBtn: "Lihat Ringkasan Hasil Skor",
      backToForm: "Kembali ke Pertanyaan",
      readinessTitle: "Tingkat Kelayakan Sertifikasi",
      scoreTitle: "Detail Perolehan Nilai",
      totalScore: "Total Skor",
      maxScore: "Skor Maksimal",
      readinessLevel: "Tingkat Kesiapan",
      completedPillarText: "Pertanyaan Terisi",
      assessmentInfoText: "Pastikan Anda menjawab seluruh kriteria untuk mendapatkan analisis tingkat kesiapan akomodasi yang akurat.",
    },
    en: {
      title: "Sustainability Self-Assessment",
      subtitle: "Test and evaluate your agritourism accommodation sustainability practices",
      selectPillar: "Select Assessment Pillar:",
      criteriaSidebar: "Criteria Navigation",
      guideDoc: "Download Official Guide",
      guideHint: "Click to view detailed guidelines",
      autosaveText: "Answers are saved automatically",
      savingText: "Saving...",
      savedText: "Saved!",
      submitBatchBtn: "Submit Assessment & View Readiness Score",
      viewScoreBtn: "View Score Summary",
      backToForm: "Back to Questions",
      readinessTitle: "Certification Readiness Level",
      scoreTitle: "Score Distribution Details",
      totalScore: "Total Score",
      maxScore: "Max Score",
      readinessLevel: "Readiness Level",
      completedPillarText: "Filled Questions",
      assessmentInfoText: "Make sure to answer all criteria questions to get an accurate evaluation of your sustainability readiness level.",
    },
  }[locale === "id" ? "id" : "en"];

  // Fetch pillars and overall score on mount
  const fetchData = async () => {
    setIsLoadingPillars(true);
    setErrorMsg("");
    try {
      const pillarsResponse = await assessmentService.getPillars();
      if (pillarsResponse.status === "success" && pillarsResponse.data) {
        setPillars(pillarsResponse.data);
        if (pillarsResponse.data.length > 0 && selectedPillarId === null) {
          setSelectedPillarId(pillarsResponse.data[0].id);
        }
      }

      // Fetch latest score
      const scoreResponse = await assessmentService.getScore();
      if (scoreResponse.status === "success" && scoreResponse.data) {
        setScoreData(scoreResponse.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoadingPillars(false);
    }
  };

  // Fetch pillar detailed questions
  const fetchQuestions = async (pillarId: number) => {
    setIsLoadingDetail(true);
    setErrorMsg("");
    try {
      const response = await assessmentService.getPillarQuestions(pillarId);
      if (response.status === "success" && response.data) {
        setPillarDetails((prev) => ({
          ...prev,
          [pillarId]: response.data!,
        }));

        // Set active criteria
        if (response.data.criteria && response.data.criteria.length > 0) {
          setActiveCriteriaId(response.data.criteria[0].id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPillarId !== null) {
      fetchQuestions(selectedPillarId);
    }
  }, [selectedPillarId]);

  // Handle option click with Autosave trigger
  const handleOptionSelect = async (questionId: number, optionId: number) => {
    setIsSaving((prev) => ({ ...prev, [questionId]: true }));
    try {
      const response = await assessmentService.submitResponse(questionId, optionId);
      if (response.status === "success") {
        // Show saved feedback briefly
        setSaveSuccess((prev) => ({ ...prev, [questionId]: true }));
        setTimeout(() => {
          setSaveSuccess((prev) => ({ ...prev, [questionId]: false }));
        }, 1500);

        // Update local memory cache values
        if (selectedPillarId) {
          const detail = pillarDetails[selectedPillarId];
          if (detail) {
            const updatedCriteria = detail.criteria.map((crit) => {
              const updatedQuestions = crit.questions.map((q) => {
                if (q.id === questionId) {
                  return { ...q, user_answer_option_id: optionId };
                }
                return q;
              });
              return { ...crit, questions: updatedQuestions };
            });

            setPillarDetails((prev) => ({
              ...prev,
              [selectedPillarId]: { ...detail, criteria: updatedCriteria },
            }));
          }
        }

        // Refresh pillars to update counts dynamically
        const pillarsResponse = await assessmentService.getPillars();
        if (pillarsResponse.status === "success" && pillarsResponse.data) {
          setPillars(pillarsResponse.data);
        }
      }
    } catch (err) {
      console.error("Autosave failed:", err);
      setErrorMsg(t.common.errorOccurred);
    } finally {
      setIsSaving((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Submit assessment and display readiness score
  const handleFinalSubmit = async () => {
    if (!selectedPillarId) return;
    
    setIsLoadingDetail(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Fetch user answers for this pillar to assemble batch payload
      const detail = pillarDetails[selectedPillarId];
      if (!detail) return;

      const answersList = [];
      for (const crit of detail.criteria) {
        for (const q of crit.questions) {
          if (q.user_answer_option_id !== null) {
            answersList.push({
              question_id: q.id,
              option_id: q.user_answer_option_id,
            });
          }
        }
      }

      // Submit batch answer payload
      const response = await assessmentService.submitBatch({
        pillar_id: selectedPillarId,
        answers: answersList,
      });

      if (response.status === "success") {
        // Fetch fresh scores
        const scoreResponse = await assessmentService.getScore();
        if (scoreResponse.status === "success" && scoreResponse.data) {
          setScoreData(scoreResponse.data);
        }
        setShowScoreSummary(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const activePillarDetail = selectedPillarId ? pillarDetails[selectedPillarId] : null;
  const activeCriteria = activePillarDetail?.criteria?.find(
    (crit) => crit.id === activeCriteriaId
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header Title & Switch View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-farm-border/60 pb-5 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-farm-text">{labels.title}</h1>
            <p className="text-sm text-farm-text-light mt-1 font-light">{labels.subtitle}</p>
          </div>

          <button
            onClick={() => setShowScoreSummary(!showScoreSummary)}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-farm-border bg-white px-5 text-xs font-bold text-farm-text hover:bg-farm-cream shadow-sm transition-colors shrink-0 gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-farm-green">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            {showScoreSummary ? labels.backToForm : labels.viewScoreBtn}
          </button>
        </div>

        {/* Banner Alert Messages */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-800 hover:text-black font-bold">×</button>
          </div>
        )}

        {showScoreSummary ? (
          /* READINESS SCORE SUMMARY DASHBOARD VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Score Ring Section (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-farm-border rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <h3 className="font-serif text-lg font-bold text-farm-text mb-4">
                {labels.readinessTitle}
              </h3>
              
              {scoreData ? (
                <div className="flex flex-col items-center gap-5 my-2">
                  <div className="relative h-40 w-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#E8F3EC" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#1E5E3A"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 70}
                        strokeDashoffset={2 * Math.PI * 70 * (1 - (scoreData.percentage || 0) / 100)}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-extrabold text-farm-text">{Math.round(scoreData.percentage || 0)}%</span>
                      <span className="text-[10px] text-farm-text-light font-bold uppercase mt-1">Readiness</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-farm-text-light block uppercase tracking-wider">
                      {labels.readinessLevel}
                    </span>
                    <span className="text-xl font-extrabold text-farm-green block mt-1">
                      {scoreData.readiness_level}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-farm-text-light">
                  Belum ada hasil penilaian mandiri.
                </div>
              )}
            </div>

            {/* Score Breakdowns (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-farm-border rounded-2xl p-6 sm:p-8 flex flex-col shadow-sm">
              <h3 className="font-serif text-lg font-bold text-farm-text mb-6">
                {labels.scoreTitle}
              </h3>

              {scoreData ? (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 border-b border-farm-border pb-5 mb-5">
                    <div className="bg-farm-cream p-4 rounded-xl border border-farm-border">
                      <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider block">
                        {labels.totalScore}
                      </span>
                      <span className="text-2xl font-extrabold text-farm-text mt-1 block">
                        {scoreData.total_score}
                      </span>
                    </div>
                    <div className="bg-farm-cream p-4 rounded-xl border border-farm-border">
                      <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider block">
                        {labels.maxScore}
                      </span>
                      <span className="text-2xl font-extrabold text-farm-text mt-1 block">
                        {scoreData.max_score}
                      </span>
                    </div>
                  </div>

                  {/* Pillars progress representation */}
                  <div className="space-y-4">
                    {pillars.map((p) => (
                      <div key={p.id} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-farm-text">Pilar {p.code} - {p.name}</span>
                          <span className="font-bold text-farm-green">
                            {p.score_percentage !== undefined ? `${Math.round(p.score_percentage)}%` : `${p.filled_questions}/${p.total_questions}`}
                          </span>
                        </div>
                        <div className="w-full bg-farm-border/40 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-farm-green h-full rounded-full transition-all duration-500"
                            style={{ width: `${p.score_percentage !== undefined ? p.score_percentage : (p.filled_questions/p.total_questions)*100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-farm-text-light font-light mt-6 bg-farm-green-light/20 p-4 border border-farm-green/10 rounded-xl leading-relaxed">
                    {labels.assessmentInfoText}
                  </p>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-farm-text-light">
                  Silakan isi penilaian terlebih dahulu untuk melihat analisis kelayakan.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SELF ASSESSMENT QUESTIONNAIRE VIEW */
          <div className="flex flex-col gap-6">
            {/* Pillar Top Tab Selectors */}
            <div>
              <h3 className="text-xs font-bold text-farm-text-light uppercase tracking-wider mb-3">
                {labels.selectPillar}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoadingPillars && pillars.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-white border border-farm-border/60 animate-pulse" />
                  ))
                ) : (
                  pillars.map((pillar) => {
                    const isSelected = selectedPillarId === pillar.id;
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => setSelectedPillarId(pillar.id)}
                        className={`flex flex-col p-3 border-2 rounded-xl text-left transition-all shadow-sm ${
                          isSelected
                            ? "border-farm-green bg-white ring-1 ring-farm-green"
                            : "border-farm-border bg-farm-cream hover:border-farm-green hover:bg-white"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider block">
                          Pilar {pillar.code}
                        </span>
                        <span className="text-xs font-bold text-farm-text truncate mt-0.5 w-full">
                          {pillar.name}
                        </span>
                        <span className="text-[10px] text-farm-text-light mt-2 font-medium">
                          {labels.completedPillarText}: {pillar.filled_questions} / {pillar.total_questions}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Questionnaire Split Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Criteria Navigation Sidebar (3 cols) */}
              <aside className="lg:col-span-3 bg-white border border-farm-border rounded-2xl p-5 shadow-sm h-fit space-y-4">
                <h4 className="font-serif text-sm font-extrabold text-farm-text border-b border-farm-border pb-2">
                  {labels.criteriaSidebar}
                </h4>

                {isLoadingDetail && !activePillarDetail ? (
                  <div className="space-y-2 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 rounded bg-farm-border/30 animate-pulse" />
                    ))}
                  </div>
                ) : activePillarDetail?.criteria?.length === 0 ? (
                  <span className="text-xs text-farm-text-light font-light block">Tidak ada kriteria.</span>
                ) : (
                  <nav className="flex flex-col gap-1.5 max-h-[300px] lg:max-h-none overflow-y-auto">
                    {activePillarDetail?.criteria?.map((crit) => {
                      const isActive = activeCriteriaId === crit.id;
                      // Calculate answers count for this criteria
                      const answeredCount = crit.questions?.filter((q) => q.user_answer_option_id !== null).length || 0;
                      const totalQuestions = crit.questions?.length || 0;
                      const isFinished = answeredCount === totalQuestions && totalQuestions > 0;

                      return (
                        <button
                          key={crit.id}
                          onClick={() => setActiveCriteriaId(crit.id)}
                          className={`w-full flex items-center justify-between text-left px-3 h-10 rounded-lg text-xs font-semibold transition-all border ${
                            isActive
                              ? "bg-farm-green border-farm-green text-white shadow-sm"
                              : "border-transparent text-farm-text/80 hover:bg-farm-border/30 hover:text-farm-text"
                          }`}
                        >
                          <span className="truncate pr-2">{crit.code} - {crit.name}</span>
                          <span
                            className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : isFinished
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-farm-border/40 text-farm-text-light"
                            }`}
                          >
                            {answeredCount}/{totalQuestions}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                )}
              </aside>

              {/* Right Questions Panel (9 cols) */}
              <div className="lg:col-span-9 bg-white border border-farm-border rounded-2xl p-6 sm:p-8 shadow-sm min-h-[350px] flex flex-col justify-between">
                {isLoadingDetail ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-farm-green border-t-transparent" />
                    <p className="text-xs text-farm-text-light">{t.common.loading}</p>
                  </div>
                ) : activeCriteria ? (
                  <div className="space-y-6">
                    {/* Criteria Info Banner */}
                    <div className="bg-farm-cream border border-farm-border rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider">
                          Kriteria {activeCriteria.code}
                        </span>
                        <h4 className="font-serif text-base font-extrabold text-farm-text mt-0.5">
                          {activeCriteria.name}
                        </h4>
                      </div>
                      
                      {activeCriteria.guide_document_url && (
                        <a
                          href={activeCriteria.guide_document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-farm-green bg-white px-3 text-[10px] font-bold text-farm-green hover:bg-farm-green-light shrink-0 transition-colors w-fit"
                        >
                          {labels.guideDoc}
                        </a>
                      )}
                    </div>

                    {/* Questions loop */}
                    <div className="divide-y divide-farm-border/60">
                      {activeCriteria.questions?.length === 0 ? (
                        <div className="py-10 text-center text-sm text-farm-text-light">
                          Tidak ada pertanyaan di kriteria ini.
                        </div>
                      ) : (
                        activeCriteria.questions?.map((q, idx) => {
                          const isSavingThis = !!isSaving[q.id];
                          const isSavedThis = !!saveSuccess[q.id];
                          
                          return (
                            <div key={q.id} className={`py-6 ${idx === 0 ? "pt-0" : ""}`}>
                              {/* Question description */}
                              <div className="flex flex-col gap-1 mb-3.5">
                                <div className="flex items-start justify-between gap-4">
                                  <h5 className="font-semibold text-sm text-farm-text leading-snug">
                                    {idx + 1}. {q.question_text}
                                  </h5>

                                  {/* Autosave status text */}
                                  <div className="shrink-0 flex items-center text-[10px] font-bold h-5 select-none">
                                    {isSavingThis && (
                                      <span className="text-farm-gold animate-pulse">● {labels.savingText}</span>
                                    )}
                                    {isSavedThis && (
                                      <span className="text-emerald-600">✓ {labels.savedText}</span>
                                    )}
                                    {!isSavingThis && !isSavedThis && q.user_answer_option_id !== null && (
                                      <span className="text-farm-text-light font-light text-[9px] uppercase tracking-wider">{labels.autosaveText}</span>
                                    )}
                                  </div>
                                </div>

                                {q.guide_text && (
                                  <p className="text-[11px] text-farm-text-light italic bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 mt-1 leading-relaxed">
                                    <span className="font-semibold text-[10px] text-farm-gold not-italic block uppercase tracking-wider mb-0.5">{labels.guideHint}:</span>
                                    {q.guide_text}
                                  </p>
                                )}
                              </div>

                              {/* Multiple choice options */}
                              <div className="grid grid-cols-1 gap-2.5">
                                {q.options?.map((opt) => {
                                  const isChecked = q.user_answer_option_id === opt.id;
                                  return (
                                    <button
                                      type="button"
                                      key={opt.id}
                                      onClick={() => handleOptionSelect(q.id, opt.id)}
                                      className={`flex items-center text-left p-3.5 border rounded-xl transition-all ${
                                        isChecked
                                          ? "border-farm-green bg-farm-green-light/25 font-bold"
                                          : "border border-farm-border bg-farm-cream hover:border-farm-green hover:bg-white"
                                      }`}
                                    >
                                      {/* Custom Radio Circle */}
                                      <div className={`h-4.5 w-4.5 rounded-full border-2 shrink-0 flex items-center justify-center mr-3 transition-colors ${
                                        isChecked ? "border-farm-green" : "border-farm-border"
                                      }`}>
                                        {isChecked && (
                                          <div className="h-2 w-2 rounded-full bg-farm-green" />
                                        )}
                                      </div>
                                      <span className="text-xs text-farm-text leading-snug">{opt.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Bottom Submit trigger */}
                    <div className="pt-6 border-t border-farm-border flex justify-end">
                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-farm-green px-6 text-xs font-semibold text-white hover:bg-farm-green-hover shadow transition-colors"
                      >
                        {labels.submitBatchBtn}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-sm text-farm-text-light">
                    Silakan pilih pilar penilaian terlebih dahulu.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
