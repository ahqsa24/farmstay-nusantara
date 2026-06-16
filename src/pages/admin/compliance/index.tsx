import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { complianceService } from "@/services/complianceService";
import { useTranslation } from "@/hooks/useTranslation";

type ViewLevel = "pillars" | "criteria" | "subIndicators";

export default function AdminCompliancePage() {
  const { locale } = useTranslation();
  const isId = locale === "id";

  const [pillars, setPillars] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [subIndicators, setSubIndicators] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"structure" | "responses">("structure");
  const [responsePage, setResponsePage] = useState(1);

  // Drill-down state
  const [viewLevel, setViewLevel] = useState<ViewLevel>("pillars");
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<any>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalEntity, setModalEntity] = useState<"pillar" | "criteria" | "subIndicator">("pillar");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pillars
  const fetchPillars = async () => {
    setIsLoading(true);
    try {
      const res = await complianceService.getPillars();
      if (res.status === "success" && res.data) setPillars(res.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  // Fetch criteria for a pillar
  const fetchCriteria = async (pillarId: number) => {
    setIsLoading(true);
    try {
      const res = await complianceService.getPillarDetail(pillarId);
      if (res.status === "success" && res.data) setCriteria(res.data.criteria || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  // Fetch responses
  const fetchResponses = async () => {
    try {
      const res = await complianceService.adminGetResponses(responsePage, 10);
      if (res.status === "success" && res.data) {
        setResponses(Array.isArray(res.data) ? res.data : res.data?.data || []);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPillars(); fetchResponses(); }, [responsePage]);

  // Navigation
  const drillIntoPillar = (pillar: any) => {
    setSelectedPillar(pillar);
    setViewLevel("criteria");
    fetchCriteria(pillar.id);
  };

  const drillIntoCriteria = (crit: any) => {
    setSelectedCriteria(crit);
    setSubIndicators(crit.sub_indicators || []);
    setViewLevel("subIndicators");
  };

  const goBack = () => {
    if (viewLevel === "subIndicators") { setViewLevel("criteria"); setSelectedCriteria(null); }
    else if (viewLevel === "criteria") { setViewLevel("pillars"); setSelectedPillar(null); }
  };

  // CRUD handlers
  const openAdd = (entity: "pillar" | "criteria" | "subIndicator") => {
    setModalMode("add"); setModalEntity(entity); setCurrentItem(null); setSelectedFile(null);
    if (entity === "pillar") setFormData({ code: "", name: "", description: "", order_number: pillars.length + 1, is_active: true });
    else if (entity === "criteria") setFormData({ pillar_id: selectedPillar?.id, code: "", name: "", description: "", order_number: criteria.length + 1, is_active: true });
    else setFormData({ criteria_id: selectedCriteria?.id, code: "", description: "", order_number: subIndicators.length + 1, is_active: true });
    setIsModalOpen(true);
  };

  const openEdit = (entity: "pillar" | "criteria" | "subIndicator", item: any) => {
    setModalMode("edit"); setModalEntity(entity); setCurrentItem(item); setSelectedFile(null);
    if (entity === "pillar") setFormData({ code: item.code || "", name: item.name || "", description: item.description || "", order_number: item.order_number || 1, is_active: item.is_active !== false });
    else if (entity === "criteria") setFormData({ pillar_id: selectedPillar?.id, code: item.code || "", name: item.name || "", description: item.description || "", order_number: item.order_number || 1, is_active: item.is_active !== false });
    else setFormData({ criteria_id: selectedCriteria?.id, code: item.code || "", description: item.description || "", order_number: item.order_number || 1, is_active: item.is_active !== false });
    setIsModalOpen(true);
  };

  const handleDelete = async (entity: "pillar" | "criteria" | "subIndicator", id: number) => {
    if (!window.confirm(isId ? "Yakin ingin menghapus?" : "Are you sure?")) return;
    try {
      if (entity === "pillar") { await complianceService.adminDeletePillar(id); setPillars(p => p.filter(x => x.id !== id)); }
      else if (entity === "criteria") { await complianceService.adminDeleteCriteria(id); setCriteria(c => c.filter(x => x.id !== id)); }
      else { await complianceService.adminDeleteSubIndicator(id); setSubIndicators(s => s.filter(x => x.id !== id)); }
    } catch (e) { console.error(e); alert(isId ? "Gagal menghapus." : "Failed to delete."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (modalEntity === "pillar") {
        if (modalMode === "add") {
          const res = await complianceService.adminCreatePillar(formData);
          if (res.status === "success" && res.data) setPillars([...pillars, res.data]);
        } else {
          await complianceService.adminUpdatePillar(currentItem.id, formData);
          setPillars(pillars.map(p => p.id === currentItem.id ? { ...p, ...formData } : p));
        }
      } else if (modalEntity === "criteria") {
        if (modalMode === "add") {
          const res = await complianceService.adminCreateCriteria(formData);
          if (res.status === "success" && res.data) setCriteria([...criteria, res.data]);
        } else {
          await complianceService.adminUpdateCriteria(currentItem.id, formData);
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
          const res = await complianceService.adminCreateSubIndicator(payload);
          if (res.status === "success" && res.data) setSubIndicators([...subIndicators, res.data]);
        } else {
          await complianceService.adminUpdateSubIndicator(currentItem.id, payload);
          setSubIndicators(subIndicators.map(s => s.id === currentItem.id ? { ...s, ...formData } : s));
        }
      }
      setIsModalOpen(false);
    } catch (e) { console.error(e); alert(isId ? "Gagal menyimpan." : "Failed to save."); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdateStatus = async (id: number, status: "draft" | "submitted" | "reviewed") => {
    try {
      await complianceService.adminUpdateResponseStatus(id, status);
      setResponses(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { console.error(e); }
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

  // Card renderer
  const ItemCard = ({ item, entity, onDrill }: { item: any; entity: "pillar" | "criteria" | "subIndicator"; onDrill?: () => void }) => (
    <div className="bg-white border border-farm-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onDrill}>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entity === "pillar" ? "text-farm-green bg-emerald-50" : entity === "criteria" ? "text-blue-700 bg-blue-50" : "text-amber-700 bg-amber-50"}`}>{item.code}</span>
          <h4 className="text-sm font-bold text-farm-text mt-2 hover:text-farm-green transition-colors">{item.name || item.description}</h4>
          {item.description && item.name && <p className="text-xs text-farm-text-light font-light mt-1 line-clamp-2">{item.description}</p>}
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <button onClick={() => openEdit(entity, item)} className="text-farm-green hover:text-farm-green-hover p-1.5 rounded-lg hover:bg-farm-beige transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
          </button>
          <button onClick={() => handleDelete(entity, item.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-farm-text-light">
        <span className={`font-bold px-2 py-0.5 rounded-full ${(item.is_active !== false) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {(item.is_active !== false) ? "Active" : "Inactive"}
        </span>
        <span>• Order: {item.order_number}</span>
        {item.total_sub_indicators !== undefined && <span>• {item.total_sub_indicators} Sub-indicators</span>}
        {item.example_document_url && <span>• 📄 Doc</span>}
      </div>
      {onDrill && (
        <button onClick={onDrill} className="text-xs font-bold text-farm-green hover:underline text-left mt-1 flex items-center gap-1">
          {isId ? "Lihat detail →" : "View details →"}
        </button>
      )}
    </div>
  );

  const currentItems = viewLevel === "pillars" ? pillars : viewLevel === "criteria" ? criteria : subIndicators;
  const currentEntity = viewLevel === "pillars" ? "pillar" as const : viewLevel === "criteria" ? "criteria" as const : "subIndicator" as const;
  const levelLabels = { pillars: isId ? "Pilar" : "Pillar", criteria: isId ? "Kriteria" : "Criteria", subIndicators: "Sub-Indicator" };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head><title>Standard Compliance — Farmstay Nusantara</title></Head>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">Standard Compliance</h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Kelola hierarki Pilar > Kriteria > Sub-Indikator" : "Manage Pillar > Criteria > Sub-Indicator hierarchy"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-farm-beige p-1 rounded-lg w-fit">
            <button onClick={() => setActiveTab("structure")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "structure" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70"}`}>
              {isId ? "Struktur Konten" : "Content Structure"}
            </button>
            <button onClick={() => setActiveTab("responses")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "responses" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70"}`}>
              {isId ? "Review Bukti" : "Review Evidence"}
            </button>
          </div>

          {activeTab === "structure" ? (
            <>
              <Breadcrumb />
              <div className="flex justify-between items-center">
                {viewLevel !== "pillars" && (
                  <button onClick={goBack} className="h-9 px-4 text-xs font-bold text-farm-text border border-farm-border rounded-lg hover:bg-farm-beige transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    {isId ? "Kembali" : "Back"}
                  </button>
                )}
                <button onClick={() => openAdd(currentEntity)} className="h-9 px-4 bg-farm-green text-white text-xs font-bold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2 ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  {isId ? `Tambah ${levelLabels[viewLevel]}` : `Add ${levelLabels[viewLevel]}`}
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div></div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-12 text-farm-text-light text-sm bg-white border border-farm-border rounded-2xl">
                  {isId ? `Belum ada ${levelLabels[viewLevel]}.` : `No ${levelLabels[viewLevel]} found.`}
                </div>
              ) : (
                <div className={`grid gap-4 ${viewLevel === "subIndicators" ? "grid-cols-1" : viewLevel === "criteria" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                  {currentItems.map((item: any) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      entity={currentEntity}
                      onDrill={viewLevel === "pillars" ? () => drillIntoPillar(item) : viewLevel === "criteria" ? () => drillIntoCriteria(item) : undefined}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Responses tab */
            <div className="bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-farm-border bg-farm-beige/50">
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">ID</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Pengguna" : "User"}</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">Sub Indicator</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Jawaban" : "Answer"}</th>
                      <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase">Status</th>
                      <th className="text-right px-5 py-3 font-semibold text-farm-text text-xs uppercase">{isId ? "Aksi" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-farm-text-light text-sm">{isId ? "Belum ada respon." : "No responses."}</td></tr>
                    ) : responses.map((r: any) => (
                      <tr key={r.id} className="border-b border-farm-border/50 hover:bg-farm-beige/30 transition-colors">
                        <td className="px-5 py-3 text-farm-text-light">#{r.id}</td>
                        <td className="px-5 py-3 font-medium text-farm-text">{r.user?.nama || r.user_id || "-"}</td>
                        <td className="px-5 py-3 text-farm-text-light text-xs">{r.sub_indicator?.code || r.sub_indicator_id || "-"}</td>
                        <td className="px-5 py-3 text-farm-text text-xs max-w-[200px] truncate">{r.answer || "-"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${r.status === "reviewed" ? "bg-green-100 text-green-800" : r.status === "submitted" ? "bg-blue-100 text-blue-800" : "bg-zinc-100 text-zinc-800"}`}>{r.status}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {r.status !== "reviewed" && (
                            <button onClick={() => handleUpdateStatus(r.id, "reviewed")} className="text-xs font-bold text-farm-green hover:underline">{isId ? "Setujui" : "Approve"}</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* CRUD Modal */}
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

                {modalEntity !== "subIndicator" && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Nama" : "Name"} *</label>
                    <input type="text" required value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Deskripsi" : "Description"} {modalEntity === "subIndicator" ? "*" : ""}</label>
                  <textarea rows={3} value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} required={modalEntity === "subIndicator"} className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 resize-none"></textarea>
                </div>

                {modalEntity === "subIndicator" && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Contoh Dokumen (PDF)" : "Example Document (PDF)"}</label>
                    <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-sm text-farm-text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-farm-green/10 file:text-farm-green" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="modalActive" checked={formData.is_active !== false} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-farm-green border-farm-border rounded" />
                  <label htmlFor="modalActive" className="text-sm font-medium text-farm-text cursor-pointer">{isId ? "Aktif" : "Active"}</label>
                </div>

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
      </DashboardLayout>
    </RoleGuard>
  );
}
