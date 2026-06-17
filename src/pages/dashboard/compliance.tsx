import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { complianceService } from "@/services/complianceService";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import {
  PillarCompliance,
  PillarComplianceDetail,
  CriteriaCompliance,
  SubIndicatorCompliance,
} from "@/types/compliance";

import JourneyMap from "@/components/gamification/JourneyMap";
import LevelProgress from "@/components/gamification/LevelProgress";

export default function CompliancePage() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  const [pillars, setPillars] = useState<PillarCompliance[]>([]);
  const [selectedPillarId, setSelectedPillarId] = useState<number | null>(null);
  const [pillarDetails, setPillarDetails] = useState<Record<number, PillarComplianceDetail>>({});
  
  // Accordion open/close state by criteria ID
  const [expandedCriteria, setExpandedCriteria] = useState<Record<number, boolean>>({});
  
  // Evidence submission state
  const [submittingForId, setSubmittingForId] = useState<number | null>(null);
  const [evidenceAnswer, setEvidenceAnswer] = useState("");
  const [evidenceType, setEvidenceType] = useState<"file" | "url">("file");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  
  // UI States
  const [isLoadingPillars, setIsLoadingPillars] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Document Viewer Modal State
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState("");

  // Translatable terms
  const labels = {
    id: {
      title: "Papan Tugas Pertanian",
      subtitle: "Kumpulkan bukti untuk menyelesaikan tugas di setiap area pertanian",
      overallProgress: "Progress Tugas Keseluruhan",
      selectPillar: "Peta Perjalanan:",
      statusNotStarted: "Belum Dikerjakan",
      statusInProgress: "Dalam Pengerjaan",
      statusCompleted: "Tugas Selesai",
      criteriaTitle: "Daftar Tugas",
      subIndicators: "Rincian Tugas",
      uploadEvidence: "Serahkan Barang Bukti",
      evidenceDesc: "Catatan Petani / Penjelasan",
      evidenceFileLabel: "File Barang Bukti (Gambar/PDF)",
      evidenceUrlLabel: "Tautan URL Bukti",
      dragDrop: "Klik untuk memilih file",
      exampleDoc: "Dokumen Panduan",
      viewExample: "Lihat Panduan",
      submitBtn: "Serahkan Bukti",
      activityLog: "Riwayat Perjalanan",
      close: "Tutup",
      evidenceSubmitted: "Bukti berhasil diserahkan!",
      selectFilePrompt: "Silakan pilih file terlebih dahulu.",
      selectUrlPrompt: "Silakan masukkan tautan URL terlebih dahulu.",
      submittedEvidence: "Bukti yang Diserahkan:",
      answerLabel: "Catatan:",
    },
    en: {
      title: "Farm Task Board",
      subtitle: "Collect evidence to complete tasks in each farm area",
      overallProgress: "Overall Task Progress",
      selectPillar: "Journey Map:",
      statusNotStarted: "Not Started",
      statusInProgress: "In Progress",
      statusCompleted: "Task Completed",
      criteriaTitle: "Task List",
      subIndicators: "Task Details",
      uploadEvidence: "Hand In Evidence",
      evidenceDesc: "Farmer's Note / Explanation",
      evidenceFileLabel: "Evidence File (Image/PDF)",
      evidenceUrlLabel: "Evidence URL Link",
      dragDrop: "Click to select a file",
      exampleDoc: "Guide Document",
      viewExample: "View Guide",
      submitBtn: "Hand In",
      activityLog: "Journey Log",
      close: "Close",
      evidenceSubmitted: "Evidence submitted successfully!",
      selectFilePrompt: "Please select a file first.",
      selectUrlPrompt: "Please input a URL first.",
      submittedEvidence: "Submitted Evidence:",
      answerLabel: "Note:",
    },
  }[locale === "id" ? "id" : "en"];

  // Fetch initial pillars
  const fetchPillars = async () => {
    setIsLoadingPillars(true);
    setErrorMsg("");
    try {
      const response = await complianceService.getPillars();
      if (response.status === "success" && response.data) {
        setPillars(response.data);
        // Select first pillar by default if none selected
        if (response.data.length > 0 && selectedPillarId === null) {
          setSelectedPillarId(response.data[0].id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoadingPillars(false);
    }
  };

  // Fetch detail of selected pillar
  const fetchPillarDetail = async (pillarId: number) => {
    setIsLoadingDetail(true);
    setErrorMsg("");
    try {
      const response = await complianceService.getPillarDetail(pillarId);
      if (response.status === "success" && response.data) {
        setPillarDetails((prev) => ({
          ...prev,
          [pillarId]: response.data!,
        }));
        
        // Auto-expand first criteria
        if (response.data.criteria && response.data.criteria.length > 0) {
          const firstCriteriaId = response.data.criteria[0].id;
          setExpandedCriteria((prev) => ({
            ...prev,
            [firstCriteriaId]: true,
          }));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  useEffect(() => {
    if (selectedPillarId !== null) {
      fetchPillarDetail(selectedPillarId);
    }
  }, [selectedPillarId]);

  const toggleCriteria = (criteriaId: number) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [criteriaId]: !prev[criteriaId],
    }));
  };

  const handleEvidenceSubmit = async (e: React.FormEvent, subIndicatorId: number) => {
    e.preventDefault();
    if (!evidenceAnswer.trim()) {
      setErrorMsg(t.common.validationRequired);
      return;
    }

    let payloadFileOrUrl: File | string | undefined = undefined;
    if (evidenceType === "file") {
      if (!evidenceFile) {
        setErrorMsg(labels.selectFilePrompt);
        return;
      }
      payloadFileOrUrl = evidenceFile;
    } else {
      if (!evidenceUrl.trim()) {
        setErrorMsg(labels.selectUrlPrompt);
        return;
      }
      payloadFileOrUrl = evidenceUrl;
    }

    setIsActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await complianceService.submitEvidence(
        subIndicatorId,
        evidenceAnswer,
        payloadFileOrUrl
      );

      if (response.status === "success") {
        setSuccessMsg(labels.evidenceSubmitted);
        setSubmittingForId(null);
        setEvidenceAnswer("");
        setEvidenceFile(null);
        setEvidenceUrl("");
        
        // Refresh data to show changes
        if (selectedPillarId) {
          await fetchPillarDetail(selectedPillarId);
          await fetchPillars();
        }
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsActionLoading(false);
    }
  };

  const activePillarDetail = selectedPillarId ? pillarDetails[selectedPillarId] : null;

  // Calculate overall compliance average
  const totalPillarsCount = pillars.length;
  const overallComplianceProgress = totalPillarsCount > 0 
    ? Math.round(pillars.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / totalPillarsCount)
    : 0;

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-8">
        
        <LevelProgress 
          title={labels.title}
          subtitle={labels.subtitle}
          progressPercentage={overallComplianceProgress}
          completedAreas={pillars.filter(p => p.progress_percentage === 100).length}
          totalAreas={totalPillarsCount}
          levelName={overallComplianceProgress === 100 ? "Petani Ahli" : "Pekerja Keras"}
        />

        {/* Banner Alert Messages */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-800 hover:text-black font-bold">×</button>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-800 hover:text-black font-bold">×</button>
          </div>
        )}

        {/* Pillars Tab Selector -> Replaced with JourneyMap */}
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
            onSelectPillar={setSelectedPillarId}
            isLoading={isLoadingPillars}
          />
        </div>

        {/* Criteria & Sub-Indicators Accordion Section */}
        <div className="bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-farm-green border-t-transparent" />
              <p className="text-xs text-farm-text-light">{t.common.loading}</p>
            </div>
          ) : activePillarDetail ? (
            <div className="divide-y-2 divide-farm-border/60">
              {/* Pillar Title Banner */}
              <div className="bg-farm-cream p-5">
                <span className="text-xs font-bold text-farm-gold uppercase tracking-widest block">
                  Pilar {activePillarDetail.code}
                </span>
                <h2 className="font-serif text-xl font-bold text-farm-text mt-1">
                  {activePillarDetail.name}
                </h2>
              </div>

              {activePillarDetail.criteria?.length === 0 ? (
                <div className="p-10 text-center text-sm text-farm-text-light">
                  Tidak ada kriteria untuk pilar ini.
                </div>
              ) : (
                activePillarDetail.criteria?.map((crit) => {
                  const isExpanded = !!expandedCriteria[crit.id];
                  const progressColor =
                    crit.completed_sub_indicators === crit.total_sub_indicators
                      ? "text-farm-green"
                      : "text-farm-gold";
                  
                  return (
                    <div key={crit.id} className="flex flex-col">
                      {/* Accordion Trigger Header */}
                      <button
                        onClick={() => toggleCriteria(crit.id)}
                        className={`flex items-center justify-between p-5 text-left transition-colors w-full border-l-4 ${
                          isExpanded ? "bg-[#FAF8F5] border-farm-gold" : "hover:bg-farm-cream/50 border-transparent"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border-2 border-farm-border flex items-center justify-center shrink-0 shadow-sm text-farm-gold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 15.75h3.75M18 19.5a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15 4.05q-.298.026-.6.06c-.19.021-.38.042-.569.066M15 4.05V5.625c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.05M15 4.05q-1.353-.13-2.733-.13-1.38 0-2.733.13M8.831 3.522c.19-.024.38-.045.57-.066M9 4.05v1.575c0 .828.672 1.5 1.5 1.5h3c.828 0 1.5-.672 1.5-1.5V4.05M8.831 3.522q.298-.035.6-.06M9 4.05q-1.353-.13-2.733-.13-1.38 0-2.733.13" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-bold text-xs text-farm-gold uppercase tracking-widest block mb-0.5">
                              Kelompok Tugas {crit.code}
                            </span>
                            <span className="font-serif font-bold text-base text-farm-text truncate block">
                              {crit.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            crit.completed_sub_indicators === crit.total_sub_indicators 
                              ? "bg-farm-green text-white" 
                              : "bg-farm-cream border border-farm-border text-farm-text"
                          }`}>
                            {crit.completed_sub_indicators} / {crit.total_sub_indicators} Tugas
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className={`w-4 h-4 text-farm-gold transition-transform duration-300 ${isExpanded ? "transform rotate-180" : ""}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </button>

                      {/* Accordion Content (Sub-indicators list) */}
                      {isExpanded && (
                        <div className="bg-farm-cream/30 px-6 pb-6 pt-2 divide-y divide-farm-border/40">
                          {crit.sub_indicators?.map((sub) => {
                            const isSubmitted = sub.status === "Selesai" || !!sub.attached_evidence_url;
                            const isSubmitting = submittingForId === sub.id;
                            
                            return (
                              <div key={sub.id} className="py-5 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                  <div className="flex gap-3 min-w-0">
                                    <span className="text-xs font-bold text-farm-text bg-farm-border/40 h-6 px-1.5 flex items-center justify-center rounded shrink-0 mt-0.5">
                                      {sub.code}
                                    </span>
                                    <p className="text-xs text-farm-text leading-relaxed font-medium">
                                      {sub.description}
                                    </p>
                                  </div>

                                  {/* Status & Action Badge */}
                                  <div className="flex items-center gap-3 shrink-0 ml-12 sm:ml-0">
                                    {sub.example_document_url && (
                                      <button
                                        onClick={() => {
                                          setPreviewDocUrl(sub.example_document_url);
                                          setPreviewDocTitle(`${labels.exampleDoc} - ${sub.code}`);
                                        }}
                                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border-2 border-farm-gold px-3 text-[10px] font-bold text-farm-gold bg-white hover:bg-farm-gold/10 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
                                        </svg>
                                        {labels.viewExample}
                                      </button>
                                    )}

                                    <div
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                        isSubmitted
                                          ? "bg-farm-green text-white shadow-sm"
                                          : "bg-white border-2 border-dashed border-farm-border text-farm-text-light"
                                      }`}
                                    >
                                      {isSubmitted && <span className="text-white">✓</span>}
                                      {isSubmitted ? labels.statusCompleted : labels.statusNotStarted}
                                    </div>
                                  </div>
                                </div>

                                {/* Submitted evidence details */}
                                {isSubmitted && (sub.attached_evidence_answer || sub.attached_evidence_url) && (
                                  <div className="ml-9 p-4 rounded-xl border border-farm-border bg-white flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider">
                                      {labels.submittedEvidence}
                                    </span>
                                    {sub.attached_evidence_answer && (
                                      <p className="text-xs text-farm-text">
                                        <span className="font-semibold">{labels.answerLabel}</span> "{sub.attached_evidence_answer}"
                                      </p>
                                    )}
                                    {sub.attached_evidence_url && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-farm-green">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                        </svg>
                                        <a
                                          href={sub.attached_evidence_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs text-farm-green font-bold hover:underline"
                                        >
                                          Buka Berkas Bukti
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Action submit form toggle */}
                                {!isSubmitting ? (
                                  <button
                                    onClick={() => {
                                      setSubmittingForId(sub.id);
                                      setEvidenceAnswer(sub.attached_evidence_answer || "");
                                      setEvidenceUrl(sub.attached_evidence_url || "");
                                      setEvidenceFile(null);
                                      setErrorMsg("");
                                      setSuccessMsg("");
                                    }}
                                    className="ml-9 w-fit text-xs font-bold text-farm-green hover:underline flex items-center gap-1"
                                  >
                                    {isSubmitted ? "Perbarui Bukti Kepatuhan" : "Kirim Bukti Kepatuhan"} →
                                  </button>
                                ) : (
                                  /* Form submission modal */
                                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <form
                                      onSubmit={(e) => handleEvidenceSubmit(e, sub.id)}
                                      className="w-full max-w-lg p-6 rounded-2xl border border-farm-border bg-white space-y-5 shadow-2xl relative"
                                    >
                                      <div className="flex justify-between items-center border-b border-farm-border pb-3">
                                        <h4 className="text-sm font-bold text-farm-text uppercase tracking-wider">
                                        {labels.uploadEvidence} ({sub.code})
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => setSubmittingForId(null)}
                                        className="text-farm-text-light hover:text-red-700 text-xs font-semibold"
                                      >
                                        Batal
                                      </button>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-farm-text uppercase mb-1">
                                        {labels.evidenceDesc} *
                                      </label>
                                      <textarea
                                        rows={3}
                                        value={evidenceAnswer}
                                        onChange={(e) => setEvidenceAnswer(e.target.value)}
                                        required
                                        className="block w-full p-3 border border-farm-border rounded-lg bg-farm-cream text-xs focus:outline-none focus:ring-1 focus:ring-farm-green"
                                        placeholder="Masukkan penjelasan mengenai kepatuhan indikator ini..."
                                      />
                                    </div>

                                    {/* Tab toggle for evidence source */}
                                    <div className="flex border border-farm-border rounded-lg p-0.5 bg-farm-cream w-fit">
                                      <button
                                        type="button"
                                        onClick={() => setEvidenceType("file")}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                          evidenceType === "file" ? "bg-farm-green text-white shadow" : "text-farm-text/60"
                                        }`}
                                      >
                                        Upload File (PDF/Gambar)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEvidenceType("url")}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                          evidenceType === "url" ? "bg-farm-green text-white shadow" : "text-farm-text/60"
                                        }`}
                                      >
                                        Tautan URL Bukti
                                      </button>
                                    </div>

                                    {evidenceType === "file" ? (
                                      <div>
                                        <label className="block text-[10px] font-bold text-farm-text uppercase mb-1">
                                          {labels.evidenceFileLabel}
                                        </label>
                                        <div className="flex items-center gap-3">
                                          <label className="inline-flex h-9 items-center justify-center rounded-lg border border-farm-border px-4 text-xs font-semibold text-farm-text bg-farm-cream hover:bg-white hover:border-farm-green transition-all cursor-pointer">
                                            {labels.dragDrop}
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept=".pdf,image/*"
                                              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                                            />
                                          </label>
                                          <span className="text-xs text-farm-text-light truncate">
                                            {evidenceFile ? evidenceFile.name : "Belum ada berkas dipilih"}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <label className="block text-[10px] font-bold text-farm-text uppercase mb-1">
                                          {labels.evidenceUrlLabel}
                                        </label>
                                        <input
                                          type="url"
                                          value={evidenceUrl}
                                          onChange={(e) => setEvidenceUrl(e.target.value)}
                                          className="block w-full px-4 h-9 border border-farm-border rounded-lg bg-farm-cream text-xs focus:outline-none focus:ring-1 focus:ring-farm-green"
                                          placeholder="https://example.com/bukti-anda"
                                        />
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-farm-border/60 flex justify-end">
                                      <button
                                        type="submit"
                                        disabled={isActionLoading}
                                        className="inline-flex h-9 items-center justify-center rounded-lg bg-farm-green px-5 text-xs font-semibold text-white hover:bg-farm-green-hover disabled:opacity-50 transition-colors shadow"
                                      >
                                        {isActionLoading ? (
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                          labels.submitBtn
                                        )}
                                      </button>
                                    </div>
                                  </form>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-farm-text-light">
              Pilar tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* 5. PDF/Document Viewer Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white border border-farm-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="bg-farm-cream border-b border-farm-border p-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-farm-text">{previewDocTitle}</h3>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="text-xs font-bold text-farm-text hover:text-red-700 bg-farm-border/40 hover:bg-farm-border/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                {labels.close}
              </button>
            </div>

            {/* Document Iframe Viewer */}
            <div className="flex-1 bg-zinc-100 p-2 relative">
              {previewDocUrl.toLowerCase().endsWith(".pdf") || previewDocUrl.includes("drive.google.com") ? (
                <iframe
                  src={previewDocUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="Document Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-farm-gold">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-farm-text">Unduh Dokumen Contoh</h4>
                    <p className="text-xs text-farm-text-light mt-1 max-w-sm">
                      Dokumen ini tidak dapat di-preview secara langsung. Silakan klik tombol di bawah untuk membukanya.
                    </p>
                  </div>
                  <a
                    href={previewDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-farm-green px-6 text-sm font-semibold text-white hover:bg-farm-green-hover transition-colors shadow"
                  >
                    Buka Dokumen di Tab Baru
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
