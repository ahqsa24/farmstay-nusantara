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
      title: "Kepatuhan Standar",
      subtitle: "Evaluasi kepatuhan akomodasi Anda terhadap standar keberlanjutan",
      overallProgress: "Kemajuan Kepatuhan Keseluruhan",
      selectPillar: "Pilih pilar untuk melihat kriteria & sub-indikator:",
      statusNotStarted: "Belum Dimulai",
      statusInProgress: "Dalam Proses",
      statusCompleted: "Selesai",
      criteriaTitle: "Kriteria",
      subIndicators: "Sub-Indikator Kepatuhan",
      uploadEvidence: "Kirim Bukti Kepatuhan",
      evidenceDesc: "Deskripsi Jawaban / Penjelasan",
      evidenceFileLabel: "File Bukti (Gambar/PDF)",
      evidenceUrlLabel: "Link URL Bukti",
      dragDrop: "Klik untuk memilih file",
      exampleDoc: "Dokumen Contoh",
      viewExample: "Pratinjau Contoh",
      submitBtn: "Kirim Bukti",
      activityLog: "Riwayat Aktivitas",
      close: "Tutup",
      evidenceSubmitted: "Bukti berhasil dikirim!",
      selectFilePrompt: "Silakan pilih file terlebih dahulu.",
      selectUrlPrompt: "Silakan masukkan URL terlebih dahulu.",
      submittedEvidence: "Bukti yang dikirim:",
      answerLabel: "Jawaban:",
    },
    en: {
      title: "Standard Compliance",
      subtitle: "Evaluate your farmstay sustainability standards compliance",
      overallProgress: "Overall Compliance Progress",
      selectPillar: "Select a pillar to view its criteria & sub-indicators:",
      statusNotStarted: "Not Started",
      statusInProgress: "In Progress",
      statusCompleted: "Completed",
      criteriaTitle: "Criteria",
      subIndicators: "Compliance Sub-Indicators",
      uploadEvidence: "Submit Compliance Evidence",
      evidenceDesc: "Answer / Explanation Description",
      evidenceFileLabel: "Evidence File (Image/PDF)",
      evidenceUrlLabel: "Evidence URL Link",
      dragDrop: "Click to select a file",
      exampleDoc: "Example Document",
      viewExample: "Preview Example",
      submitBtn: "Submit Evidence",
      activityLog: "Activity Log",
      close: "Close",
      evidenceSubmitted: "Evidence submitted successfully!",
      selectFilePrompt: "Please select a file first.",
      selectUrlPrompt: "Please input a URL first.",
      submittedEvidence: "Submitted evidence:",
      answerLabel: "Answer:",
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
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-farm-border/60 pb-5 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-farm-text">{labels.title}</h1>
            <p className="text-sm text-farm-text-light mt-1 font-light">{labels.subtitle}</p>
          </div>

          {/* Quick Overall stats */}
          <div className="bg-white border border-farm-border/80 rounded-xl p-4 flex items-center gap-4 shadow-sm w-fit shrink-0">
            <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#E8F3EC" strokeWidth="5" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="#1E5E3A"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - overallComplianceProgress / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[11px] font-extrabold text-farm-text">{overallComplianceProgress}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider block">
                {labels.overallProgress}
              </span>
              <span className="text-sm font-extrabold text-farm-text">
                {pillars.filter(p => p.progress_percentage === 100).length} / {totalPillarsCount} Pillars Completed
              </span>
            </div>
          </div>
        </div>

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

        {/* Pillars Tab Selector */}
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
                    className={`flex flex-col p-3 border rounded-xl text-left transition-all shadow-sm ${
                      isSelected
                        ? "border-farm-green bg-white ring-1 ring-farm-green"
                        : "border border-farm-border bg-farm-cream hover:border-farm-green hover:bg-white"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider block">
                      Pilar {pillar.code}
                    </span>
                    <span className="text-xs font-bold text-farm-text truncate mt-0.5 w-full">
                      {pillar.name}
                    </span>
                    <div className="w-full bg-farm-border/40 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-farm-green h-full rounded-full transition-all duration-500"
                        style={{ width: `${pillar.progress_percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-farm-text-light mt-1 text-right block w-full">
                      {pillar.progress_percentage || 0}%
                    </span>
                  </button>
                );
              })
            )}
          </div>
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
                        className="flex items-center justify-between p-5 text-left hover:bg-farm-cream/50 transition-colors w-full"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                          <span className="font-serif font-extrabold text-sm text-farm-green bg-farm-green-light px-2.5 py-1 rounded-md shrink-0">
                            {crit.code}
                          </span>
                          <span className="font-semibold text-sm text-farm-text truncate">
                            {crit.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 ml-2">
                          <span className={`text-[11px] font-bold ${progressColor}`}>
                            {crit.completed_sub_indicators} / {crit.total_sub_indicators} Selesai
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-4 h-4 text-farm-text-light transition-transform ${isExpanded ? "transform rotate-180" : ""}`}
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
                                  <div className="flex items-center gap-3 shrink-0 ml-9 sm:ml-0">
                                    {sub.example_document_url && (
                                      <button
                                        onClick={() => {
                                          setPreviewDocUrl(sub.example_document_url);
                                          setPreviewDocTitle(`${labels.exampleDoc} - ${sub.code}`);
                                        }}
                                        className="inline-flex h-7 items-center justify-center rounded-lg border border-farm-green px-3 text-[10px] font-semibold text-farm-green bg-white hover:bg-farm-green-light transition-colors"
                                      >
                                        {labels.viewExample}
                                      </button>
                                    )}

                                    <span
                                      className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                        isSubmitted
                                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                          : "bg-zinc-100 border border-zinc-200 text-zinc-600"
                                      }`}
                                    >
                                      {isSubmitted ? labels.statusCompleted : labels.statusNotStarted}
                                    </span>
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
                                  /* Form submission box */
                                  <form
                                    onSubmit={(e) => handleEvidenceSubmit(e, sub.id)}
                                    className="ml-9 p-5 rounded-xl border border-farm-border bg-white space-y-4 shadow-sm"
                                  >
                                    <div className="flex justify-between items-center border-b border-farm-border pb-2">
                                      <h4 className="text-xs font-bold text-farm-text uppercase tracking-wider">
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
