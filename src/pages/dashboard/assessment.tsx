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

import JourneyMap from "@/components/gamification/JourneyMap";
import LevelProgress from "@/components/gamification/LevelProgress";
import QuestCard from "@/components/gamification/QuestCard";

export default function AssessmentPage() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  // Core assessment states
  const [pillars, setPillars] = useState<PillarAssessment[]>([]);
  const [selectedPillarId, setSelectedPillarId] = useState<number | null>(null);
  const [pillarDetails, setPillarDetails] = useState<Record<number, PillarAssessmentDetail>>({});
  
  // Navigation states
  const [activeCriteriaId, setActiveCriteriaId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Scoring / Readiness state
  const [scoreData, setScoreData] = useState<AssessmentScore | null>(null);
  const [showScoreSummary, setShowScoreSummary] = useState(false);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPillars, setIsLoadingPillars] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({}); // Track question autosave per ID
  const [saveSuccess, setSaveSuccess] = useState<Record<number, boolean>>({}); // Flashes green on save
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const labels = {
    id: {
      title: "Petualangan Sertifikasi Agrowisata",
      subtitle: "Jelajahi area pertanian Anda dan kumpulkan hasil panen berupa poin keberlanjutan",
      selectPillar: "Peta Perjalanan",
      criteriaSidebar: "Buku Catatan Quest",
      guideDoc: "Peta Panduan",
      guideHint: "Petunjuk Quest",
      autosaveText: "Progress tercatat",
      savingText: "Mencatat...",
      savedText: "Tercatat!",
      submitBatchBtn: "Selesaikan Area & Cek Level Pertanian",
      viewScoreBtn: "Lihat Sertifikat Panen",
      backToForm: "Kembali Bertualang",
      readinessTitle: "Sertifikat Kelayakan Pertanian",
      scoreTitle: "Rincian Hasil Panen",
      totalScore: "Total Panen",
      maxScore: "Panen Maksimal",
      readinessLevel: "Level Pertanian",
      completedPillarText: "Quest Selesai",
      assessmentInfoText: "Pastikan Anda menyelesaikan seluruh quest di setiap area untuk membuka sertifikasi akurat.",
    },
    en: {
      title: "Agritourism Certification Adventure",
      subtitle: "Explore your farm areas and harvest sustainability points",
      selectPillar: "Journey Map",
      criteriaSidebar: "Quest Logbook",
      guideDoc: "Guide Map",
      guideHint: "Quest Hint",
      autosaveText: "Progress recorded",
      savingText: "Recording...",
      savedText: "Recorded!",
      submitBatchBtn: "Complete Area & Check Farm Level",
      viewScoreBtn: "View Harvest Certificate",
      backToForm: "Back to Adventure",
      readinessTitle: "Farm Readiness Certificate",
      scoreTitle: "Harvest Details",
      totalScore: "Total Harvest",
      maxScore: "Max Harvest",
      readinessLevel: "Farm Level",
      completedPillarText: "Completed Quests",
      assessmentInfoText: "Make sure to complete all quests in every area to unlock accurate certification.",
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

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [activeCriteriaId]);

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
        setIsModalOpen(false); // Close modal on submit
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

  // Compute overall progress
  const completedAreas = pillars.filter(p => p.score_percentage === 100 || (p.filled_questions === p.total_questions && p.total_questions !== undefined && p.total_questions > 0)).length;
  const overallProgressPercent = pillars.length > 0 
    ? Math.round(pillars.reduce((acc, p) => acc + (p.score_percentage !== undefined ? p.score_percentage : ((p.filled_questions || 0) / (p.total_questions || 1)) * 100), 0) / pillars.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-8">
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
            <div className="lg:col-span-5 bg-white border border-farm-border rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-farm-gold via-farm-green to-farm-gold" />
              
              <h3 className="font-serif text-2xl font-bold text-farm-text mb-2 z-10">
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
            
            <LevelProgress 
              title={locale === "id" ? "Level Perjalanan Anda" : "Your Journey Level"}
              subtitle={locale === "id" ? "Selesaikan semua area untuk membuka sertifikasi." : "Complete all areas to unlock certification."}
              progressPercentage={overallProgressPercent}
              completedAreas={completedAreas}
              totalAreas={pillars.length}
              levelName={scoreData?.readiness_level || "Pemula"}
            />

            {/* Pillar Top Tab Selectors -> Replaced with JourneyMap */}
            <div className="bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden pt-6">
              <h3 className="text-sm font-black text-farm-text-light uppercase tracking-wider px-8 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
                {labels.selectPillar}
              </h3>
              
              <JourneyMap 
                pillars={pillars}
                selectedPillarId={selectedPillarId}
                onSelectPillar={(id) => {
                  setSelectedPillarId(id);
                  setIsModalOpen(true);
                }}
                isLoading={isLoadingPillars}
              />
            </div>

            {/* Main Questionnaire Split Panel - MODAL VIEW */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-farm-border/60 bg-farm-cream">
                    <h3 className="font-serif font-bold text-lg text-farm-text">
                      {activePillarDetail ? activePillarDetail.name : "Memuat..."}
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-farm-text-light hover:text-red-600 bg-white border border-farm-border px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Tutup
                    </button>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Criteria Navigation Sidebar (3 cols) */}
                      <aside className="lg:col-span-3 bg-[#FAF8F5] border border-farm-border rounded-2xl p-5 shadow-inner h-fit space-y-4">
                        <h4 className="font-serif text-base font-extrabold text-farm-text border-b border-farm-border/60 pb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
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
                  <nav className="flex flex-col gap-1.5 max-h-[300px] lg:max-h-none overflow-y-auto overflow-x-hidden pr-1">
                    {activePillarDetail?.criteria?.map((crit) => {
                      const isActive = activeCriteriaId === crit.id;
                      // Calculate answers count for this criteria
                      const answeredCount = crit.questions?.filter((q) => q.user_answer_option_id != null).length || 0;
                      const totalQuestions = crit.questions?.length || 0;
                      const isFinished = answeredCount === totalQuestions && totalQuestions > 0;

                      return (
                        <button
                          key={crit.id}
                          onClick={() => setActiveCriteriaId(crit.id)}
                          className={`w-full flex items-center justify-between text-left px-3 h-10 rounded-lg text-xs font-semibold transition-all border ${
                            isActive
                                ? "bg-farm-green border-farm-green text-white shadow-md transform scale-105"
                                : "border-transparent text-farm-text/80 hover:bg-white hover:border-farm-border/50 hover:shadow-sm"
                            }`}
                          >
                            <span className="truncate pr-2">{crit.code} - {crit.name}</span>
                            <span
                              className={`shrink-0 text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-extrabold transition-colors ${
                                isActive
                                  ? "bg-white text-farm-green shadow-sm"
                                  : isFinished
                                  ? "bg-farm-gold text-white"
                                  : "bg-farm-border/40 text-farm-text-light"
                              }`}
                            >
                              {isFinished ? "✓" : totalQuestions - answeredCount}
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

                    {/* Questions loop - Pagination View */}
                    <div className="space-y-4 min-h-[250px]">
                      {(!activeCriteria.questions || activeCriteria.questions.length === 0) ? (
                        <div className="py-10 text-center text-sm text-farm-text-light">
                          Tidak ada quest di area ini.
                        </div>
                      ) : (
                        (() => {
                          const currentQuestion = activeCriteria.questions[currentQuestionIndex];
                          if (!currentQuestion) return null;
                          
                          const isSavingThis = !!isSaving[currentQuestion.id];
                          const isSavedThis = !!saveSuccess[currentQuestion.id];
                          
                          return (
                            <QuestCard 
                              key={currentQuestion.id}
                              index={currentQuestionIndex}
                              questionId={currentQuestion.id}
                              questionText={currentQuestion.question_text}
                              guideText={currentQuestion.guide_text}
                              options={currentQuestion.options || []}
                              selectedOptionId={currentQuestion.user_answer_option_id}
                              isSaving={isSavingThis}
                              isSaved={isSavedThis}
                              onSelectOption={handleOptionSelect}
                              labels={{
                                savingText: labels.savingText,
                                savedText: labels.savedText,
                                autosaveText: labels.autosaveText,
                                guideHint: labels.guideHint,
                              }}
                            />
                          );
                        })()
                      )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-farm-border">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 text-sm font-semibold text-farm-text border border-farm-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-farm-cream transition-colors"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-xs font-bold text-farm-text-light bg-farm-cream px-3 py-1.5 rounded-md border border-farm-border/60">
                        {activeCriteria.questions && activeCriteria.questions.length > 0 
                          ? `${currentQuestionIndex + 1} / ${activeCriteria.questions.length}` 
                          : "0 / 0"}
                      </span>
                      {currentQuestionIndex === (activeCriteria.questions?.length || 1) - 1 || !activeCriteria.questions || activeCriteria.questions.length === 0 ? (
                        <button
                          type="button"
                          onClick={handleFinalSubmit}
                          className="px-6 py-2 text-sm font-bold text-white bg-farm-gold rounded-lg hover:bg-farm-gold-hover hover:-translate-y-1 hover:shadow-lg transition-all"
                        >
                          {labels.submitBatchBtn}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex(prev => Math.min((activeCriteria.questions?.length || 1) - 1, prev + 1))}
                          className="px-4 py-2 text-sm font-semibold text-white bg-farm-green border border-farm-green rounded-lg hover:bg-farm-green-hover transition-colors"
                        >
                          Selanjutnya
                        </button>
                      )}
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
        </div>
      </div>
    )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
