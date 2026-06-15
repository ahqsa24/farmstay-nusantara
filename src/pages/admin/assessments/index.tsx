import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { assessmentService } from "@/services/assessmentService";
import { useTranslation } from "@/hooks/useTranslation";

type ViewLevel = "pillars" | "criteria" | "questions";

export default function AdminAssessmentsPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";

  const [pillars, setPillars] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"structure" | "submissions">("structure");
  const [responsePage, setResponsePage] = useState(1);

  // Drill-down state
  const [viewLevel, setViewLevel] = useState<ViewLevel>("pillars");
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalEntity, setModalEntity] = useState<"pillar" | "criteria" | "question">("pillar");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Option Modal State
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [optionMode, setOptionMode] = useState<"add" | "edit">("add");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentOption, setCurrentOption] = useState<any>(null);
  const [optionFormData, setOptionFormData] = useState<any>({});

  // Document Upload Modal (Pillar level)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Fetching Data
  const fetchPillars = async () => {
    setIsLoading(true);
    try {
      const res = await assessmentService.getPillars();
      if (res.status === "success" && res.data) setPillars(res.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchCriteria = async (pillarId: number) => {
    setIsLoading(true);
    try {
      const res = await assessmentService.getPillarQuestions(pillarId);
      if (res.status === "success" && res.data) setCriteria(res.data.criteria || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await assessmentService.adminGetSubmissions(responsePage, 10);
      if (res.status === "success" && res.data) {
        setSubmissions(Array.isArray(res.data) ? res.data : res.data?.data || []);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPillars(); fetchSubmissions(); }, [responsePage]);

  // Navigation
  const drillIntoPillar = (pillar: any) => {
    setSelectedPillar(pillar);
    setViewLevel("criteria");
    fetchCriteria(pillar.id);
  };

  const drillIntoCriteria = (crit: any) => {
    setSelectedCriteria(crit);
    setQuestions(crit.questions || []);
    setViewLevel("questions");
  };

  const goBack = () => {
    if (viewLevel === "questions") { setViewLevel("criteria"); setSelectedCriteria(null); }
    else if (viewLevel === "criteria") { setViewLevel("pillars"); setSelectedPillar(null); }
  };

  // CRUD Handlers - Structure
  const openAdd = (entity: "pillar" | "criteria" | "question") => {
    setModalMode("add"); setModalEntity(entity); setCurrentItem(null); setSelectedFile(null);
    if (entity === "pillar") setFormData({ code: "", name: "", description: "", order_number: pillars.length + 1, is_active: true });
    else if (entity === "criteria") setFormData({ pillar_id: selectedPillar?.id, code: "", name: "", order_number: criteria.length + 1, is_active: true });
    else setFormData({ criteria_id: selectedCriteria?.id, question_text: "", guide_text: "", is_required: true, order_number: questions.length + 1 });
    setIsModalOpen(true);
  };

  const openEdit = (entity: "pillar" | "criteria" | "question", item: any) => {
    setModalMode("edit"); setModalEntity(entity); setCurrentItem(item); setSelectedFile(null);
    if (entity === "pillar") setFormData({ code: item.code || "", name: item.name || "", description: item.description || "", order_number: item.order_number || 1, is_active: item.is_active !== false });
    else if (entity === "criteria") setFormData({ pillar_id: selectedPillar?.id, code: item.code || "", name: item.name || "", order_number: item.order_number || 1, is_active: item.is_active !== false });
    else setFormData({ criteria_id: selectedCriteria?.id, question_text: item.question_text || "", guide_text: item.guide_text || "", is_required: item.is_required !== false, order_number: item.order_number || 1 });
    setIsModalOpen(true);
  };

  const handleDelete = async (entity: "pillar" | "criteria" | "question", id: number) => {
    if (!window.confirm(isId ? "Yakin ingin menghapus?" : "Are you sure?")) return;
    try {
      if (entity === "pillar") { await assessmentService.adminDeletePillar(id); setPillars(p => p.filter(x => x.id !== id)); }
      else if (entity === "criteria") { await assessmentService.adminDeleteCriteria(id); setCriteria(c => c.filter(x => x.id !== id)); }
      else { await assessmentService.adminDeleteQuestion(id); setQuestions(q => q.filter(x => x.id !== id)); }
    } catch (e) { console.error(e); alert(isId ? "Gagal menghapus." : "Failed to delete."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (modalEntity === "pillar") {
        if (modalMode === "add") {
          const res = await assessmentService.adminCreatePillar(formData);
          if (res.status === "success" && res.data) setPillars([...pillars, res.data]);
        } else {
          await assessmentService.adminUpdatePillar(currentItem.id, formData);
          setPillars(pillars.map(p => p.id === currentItem.id ? { ...p, ...formData } : p));
        }
      } else if (modalEntity === "criteria") {
        if (modalMode === "add") {
          const res = await assessmentService.adminCreateCriteria(formData);
          if (res.status === "success" && res.data) setCriteria([...criteria, res.data]);
        } else {
          await assessmentService.adminUpdateCriteria(currentItem.id, formData);
          setCriteria(criteria.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
        }
      } else {
        let payload: any;
        if (selectedFile) {
          payload = new FormData();
          Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== "") payload.append(k, String(v)); });
          payload.append("file", selectedFile);
        } else {
          payload = { ...formData };
        }
        if (modalMode === "add") {
          const res = await assessmentService.adminCreateQuestion(payload);
          if (res.status === "success" && res.data) setQuestions([...questions, { ...res.data, options: [] }]);
        } else {
          await assessmentService.adminUpdateQuestion(currentItem.id, payload);
          setQuestions(questions.map(q => q.id === currentItem.id ? { ...q, ...formData } : q));
        }
      }
      setIsModalOpen(false);
    } catch (e) { console.error(e); alert(isId ? "Gagal menyimpan." : "Failed to save."); }
    finally { setIsSubmitting(false); }
  };

  // Option Handlers
  const openOptionAdd = (question: any) => {
    setCurrentQuestion(question); setOptionMode("add"); setCurrentOption(null);
    setOptionFormData({ question_id: question.id, label: "", score_value: 0, order_number: (question.options?.length || 0) + 1 });
    setIsOptionModalOpen(true);
  };
  
  const openOptionEdit = (question: any, option: any) => {
    setCurrentQuestion(question); setOptionMode("edit"); setCurrentOption(option);
    setOptionFormData({ question_id: question.id, label: option.label || "", score_value: option.score_value || 0, order_number: option.order_number || 1 });
    setIsOptionModalOpen(true);
  };

  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (optionMode === "add") {
        const res = await assessmentService.adminCreateOption(optionFormData);
        if (res.status === "success" && res.data) {
          setQuestions(qs => qs.map(q => q.id === currentQuestion.id ? { ...q, options: [...(q.options || []), res.data] } : q));
        }
      } else {
        await assessmentService.adminUpdateOption(currentOption.id, optionFormData);
        setQuestions(qs => qs.map(q => q.id === currentQuestion.id ? { ...q, options: q.options.map((o: any) => o.id === currentOption.id ? { ...o, ...optionFormData } : o) } : q));
      }
      setIsOptionModalOpen(false);
    } catch (e) { console.error(e); alert("Failed to save option."); }
    finally { setIsSubmitting(false); }
  };

  const handleOptionDelete = async (questionId: number, optionId: number) => {
    if (!window.confirm("Delete this option?")) return;
    try {
      await assessmentService.adminDeleteOption(optionId);
      setQuestions(qs => qs.map(q => q.id === questionId ? { ...q, options: q.options.filter((o: any) => o.id !== optionId) } : q));
    } catch (e) { console.error(e); alert("Failed to delete option."); }
  };

  // Breadcrumb
  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-xs text-farm-text-light mb-4 flex-wrap">
      <button onClick={() => { setViewLevel("pillars"); setSelectedPillar(null); setSelectedCriteria(null); }} className="hover:text-farm-green font-semibold">
        {isId ? "Pilar" : "Pillars"}
      </button>
      {selectedPillar && (
        <>
          <span>/</span>
          <button onClick={() => { setViewLevel("criteria"); setSelectedCriteria(null); }} className="hover:text-farm-green font-semibold">
            {selectedPillar.code} - {selectedPillar.name}
          </button>
        </>
      )}
      {selectedCriteria && (
        <>
          <span>/</span>
          <span className="text-farm-text font-bold">{selectedCriteria.code} - {selectedCriteria.name}</span>
        </>
      )}
    </div>
  );

  const levelLabels = { pillars: isId ? "Pilar" : "Pillar", criteria: isId ? "Kriteria" : "Criteria", questions: isId ? "Pertanyaan" : "Question" };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head><title>Self Assessment — Farmstay Nusantara</title></Head>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">Self Assessment</h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Kelola daftar assessment dan dokumen panduan" : "Manage assessment lists and guide documents"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-farm-beige p-1 rounded-lg w-fit">
            <button onClick={() => setActiveTab("structure")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "structure" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70"}`}>
              {isId ? "Daftar Assessment" : "Assessment List"}
            </button>
            <button onClick={() => setActiveTab("submissions")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "submissions" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70"}`}>
              {isId ? "Lihat Jawaban User" : "View User Answers"}
            </button>
          </div>

          {activeTab === "structure" ? (
            <>
              <Breadcrumb />
              <div className="flex justify-between items-center flex-wrap gap-2">
                {viewLevel !== "pillars" && (
                  <button onClick={goBack} className="h-9 px-4 text-xs font-bold text-farm-text border border-farm-border rounded-lg hover:bg-farm-beige transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    {isId ? "Kembali" : "Back"}
                  </button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  {viewLevel === "pillars" && (
                    <button onClick={() => alert("Gunakan edit pilar untuk upload panduan")} className="h-9 px-4 bg-white border border-farm-border text-farm-text text-xs font-bold rounded-lg hover:bg-farm-beige transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      {isId ? "Upload Panduan Global" : "Upload Global Guide"}
                    </button>
                  )}
                  <button onClick={() => openAdd(viewLevel === "pillars" ? "pillar" : viewLevel === "criteria" ? "criteria" : "question")} className="h-9 px-4 bg-farm-green text-white text-xs font-bold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {isId ? `Tambah ${levelLabels[viewLevel]}` : `Add ${levelLabels[viewLevel]}`}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div></div>
              ) : (viewLevel === "pillars" && pillars.length === 0) || (viewLevel === "criteria" && criteria.length === 0) || (viewLevel === "questions" && questions.length === 0) ? (
                <div className="text-center py-12 text-farm-text-light text-sm bg-white border border-farm-border rounded-2xl">
                  {isId ? `Belum ada ${levelLabels[viewLevel]}.` : `No ${levelLabels[viewLevel]} found.`}
                </div>
              ) : (
                <div className={`grid gap-4 ${viewLevel === "questions" ? "grid-cols-1" : viewLevel === "criteria" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                  {(viewLevel === "pillars" ? pillars : viewLevel === "criteria" ? criteria : questions).map((item: any) => (
                    <div key={item.id} className="bg-white border border-farm-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0" onClick={viewLevel !== "questions" ? () => viewLevel === "pillars" ? drillIntoPillar(item) : drillIntoCriteria(item) : undefined} style={{ cursor: viewLevel !== "questions" ? "pointer" : "default" }}>
                          {item.code && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${viewLevel === "pillars" ? "text-amber-700 bg-amber-50" : "text-blue-700 bg-blue-50"}`}>{item.code}</span>}
                          <h4 className="text-sm font-bold text-farm-text mt-2">{item.name || item.question_text}</h4>
                          {(item.description || item.guide_text) && <p className="text-xs text-farm-text-light font-light mt-1 line-clamp-2">{item.description || item.guide_text}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                          <button onClick={() => openEdit(viewLevel === "pillars" ? "pillar" : viewLevel === "criteria" ? "criteria" : "question", item)} className="text-farm-green hover:text-farm-green-hover p-1.5 rounded-lg hover:bg-farm-beige transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                          </button>
                          <button onClick={() => handleDelete(viewLevel === "pillars" ? "pillar" : viewLevel === "criteria" ? "criteria" : "question", item.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-farm-text-light">
                        {item.is_active !== undefined && (
                          <span className={`font-bold px-2 py-0.5 rounded-full ${(item.is_active !== false) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {(item.is_active !== false) ? "Active" : "Inactive"}
                          </span>
                        )}
                        {item.is_required !== undefined && (
                          <span className={`font-bold px-2 py-0.5 rounded-full ${(item.is_required !== false) ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-800"}`}>
                            {(item.is_required !== false) ? "Required" : "Optional"}
                          </span>
                        )}
                        <span>• Order: {item.order_number}</span>
                        {item.guide_document_url && <span>• 📄 Guide Doc</span>}
                      </div>

                      {viewLevel !== "questions" && (
                         <button onClick={viewLevel === "pillars" ? () => drillIntoPillar(item) : () => drillIntoCriteria(item)} className="text-xs font-bold text-farm-green hover:underline text-left mt-1 w-fit">
                           {isId ? "Lihat detail →" : "View details →"}
                         </button>
                      )}

                      {/* Options List (Only for Questions) */}
                      {viewLevel === "questions" && (
                        <div className="mt-4 pt-4 border-t border-farm-border bg-farm-beige/30 -mx-5 px-5 pb-1 rounded-b-2xl">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-xs font-bold text-farm-text">{isId ? "Opsi Jawaban" : "Options"}</h5>
                            <button onClick={() => openOptionAdd(item)} className="text-[10px] font-bold text-farm-green hover:underline flex items-center gap-1">
                              + {isId ? "Tambah Opsi" : "Add Option"}
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-2 mb-4">
                            {(!item.options || item.options.length === 0) ? (
                              <p className="text-xs text-farm-text-light italic">{isId ? "Belum ada opsi." : "No options."}</p>
                            ) : (
                              item.options.map((opt: any) => (
                                <div key={opt.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-farm-border shadow-sm text-xs">
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="font-bold text-farm-green min-w-[30px] text-center bg-emerald-50 py-1 rounded">+{opt.score_value}</span>
                                    <span className="font-medium text-farm-text">{opt.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-farm-text-light/50">Ord: {opt.order_number}</span>
                                    <button onClick={() => openOptionEdit(item, opt)} className="text-farm-text-light hover:text-farm-green transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg></button>
                                    <button onClick={() => handleOptionDelete(item.id, opt.id)} className="text-farm-text-light hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-farm-border bg-farm-beige/50">
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">ID</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Pengguna" : "User"}</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Pilar" : "Pillar"}</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Skor" : "Score"}</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Tanggal" : "Date"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-farm-text-light text-sm">{isId ? "Belum ada jawaban." : "No submissions found."}</td></tr>
                    ) : submissions.map((s: any, idx: number) => (
                      <tr key={s.id || idx} className="border-b border-farm-border/50 hover:bg-farm-beige/30 transition-colors">
                        <td className="px-5 py-3 text-farm-text-light">#{s.id || idx + 1}</td>
                        <td className="px-5 py-3 font-medium text-farm-text">{s.user?.nama || s.user_id || "-"}</td>
                        <td className="px-5 py-3 text-farm-text-light text-xs">{s.pillar?.name || s.pillar_id || "-"}</td>
                        <td className="px-5 py-3"><span className="font-bold text-farm-green">{s.score || s.percentage || "-"}</span></td>
                        <td className="px-5 py-3 text-farm-text-light text-xs">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Structure CRUD Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden my-8">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {modalMode === "add" ? `${isId ? "Tambah" : "Add"} ${levelLabels[viewLevel]}` : `Edit ${levelLabels[viewLevel]}`}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-farm-text-light hover:text-farm-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                {modalEntity !== "question" && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Kode" : "Code"} *</label>
                      <input type="text" required value={formData.code || ""} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Urutan" : "Order"}</label>
                      <input type="number" min="1" value={formData.order_number || 1} onChange={e => setFormData({ ...formData, order_number: parseInt(e.target.value) || 1 })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                    </div>
                  </div>
                )}

                {modalEntity !== "question" ? (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Nama" : "Name"} *</label>
                    <input type="text" required value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Pertanyaan" : "Question"} *</label>
                      <textarea rows={3} required value={formData.question_text || ""} onChange={e => setFormData({ ...formData, question_text: e.target.value })} className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 resize-none"></textarea>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24">
                        <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Urutan" : "Order"}</label>
                        <input type="number" min="1" value={formData.order_number || 1} onChange={e => setFormData({ ...formData, order_number: parseInt(e.target.value) || 1 })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                      </div>
                      <div className="flex-1 flex items-center pt-5">
                        <input type="checkbox" id="modalRequired" checked={formData.is_required !== false} onChange={e => setFormData({ ...formData, is_required: e.target.checked })} className="w-4 h-4 text-farm-green border-farm-border rounded mr-2" />
                        <label htmlFor="modalRequired" className="text-sm font-medium text-farm-text cursor-pointer">{isId ? "Wajib Diisi" : "Required"}</label>
                      </div>
                    </div>
                  </>
                )}

                {(modalEntity === "pillar" || modalEntity === "question") && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? (modalEntity === "pillar" ? "Deskripsi" : "Teks Panduan") : (modalEntity === "pillar" ? "Description" : "Guide Text")}</label>
                    <textarea rows={2} value={formData.description || formData.guide_text || ""} onChange={e => setFormData({ ...formData, [modalEntity === "pillar" ? "description" : "guide_text"]: e.target.value })} className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 resize-none"></textarea>
                  </div>
                )}

                {(modalEntity === "criteria" || modalEntity === "question") && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Dokumen Panduan (PDF)" : "Guide Document (PDF)"}</label>
                    <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-sm text-farm-text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-farm-green/10 file:text-farm-green" />
                  </div>
                )}

                {modalEntity !== "question" && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="modalActive" checked={formData.is_active !== false} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-farm-green border-farm-border rounded" />
                    <label htmlFor="modalActive" className="text-sm font-medium text-farm-text cursor-pointer">{isId ? "Aktif" : "Active"}</label>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-farm-border/60">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-farm-text hover:bg-farm-beige rounded-lg transition-colors">{isId ? "Batal" : "Cancel"}</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover rounded-lg transition-colors disabled:opacity-50">
                    {isSubmitting ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan" : "Save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Option CRUD Modal */}
        {isOptionModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {optionMode === "add" ? (isId ? "Tambah Opsi" : "Add Option") : (isId ? "Edit Opsi" : "Edit Option")}
                </h3>
                <button onClick={() => setIsOptionModalOpen(false)} className="text-farm-text-light hover:text-farm-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleOptionSubmit} className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Label Jawaban" : "Option Label"} *</label>
                  <input type="text" required value={optionFormData.label} onChange={e => setOptionFormData({ ...optionFormData, label: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Nilai Skor" : "Score Value"} *</label>
                    <input type="number" required value={optionFormData.score_value} onChange={e => setOptionFormData({ ...optionFormData, score_value: parseInt(e.target.value) || 0 })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Urutan" : "Order"}</label>
                    <input type="number" min="1" value={optionFormData.order_number} onChange={e => setOptionFormData({ ...optionFormData, order_number: parseInt(e.target.value) || 1 })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-farm-border/60">
                  <button type="button" onClick={() => setIsOptionModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-farm-text hover:bg-farm-beige rounded-lg transition-colors">{isId ? "Batal" : "Cancel"}</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover rounded-lg transition-colors disabled:opacity-50">
                    {isSubmitting ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan" : "Save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </DashboardLayout>
    </RoleGuard>
  );
}
