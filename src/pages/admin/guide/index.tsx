import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { guideService } from "@/services/guideService";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";

export default function AdminGuidePage() {
  const { locale } = useTranslation();
  const isId = locale === "id";
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"sections" | "faq">("sections");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const [sections, setSections] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "sections") {
        const res = await guideService.adminGetGuideSections(roleFilter === "all" ? undefined : roleFilter);
        if (res.status === "success" && res.data) setSections(res.data);
      } else {
        const res = await guideService.adminGetFaqItems(roleFilter === "all" ? undefined : roleFilter);
        if (res.status === "success" && res.data) setFaqs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, roleFilter]);

  // CRUD Handlers
  const openAdd = () => {
    setModalMode("add");
    setCurrentItem(null);
    if (activeTab === "sections") {
      setFormData({ role: "all", title: "", content: "", order_number: sections.length + 1, is_active: true });
    } else {
      setFormData({ role: "all", question: "", answer: "", order_number: faqs.length + 1, is_active: true });
    }
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setModalMode("edit");
    setCurrentItem(item);
    if (activeTab === "sections") {
      setFormData({ role: item.role || "all", title: item.title || "", content: item.content || "", order_number: item.orderNumber || 1, is_active: item.isActive !== false });
    } else {
      setFormData({ role: item.role || "all", question: item.question || "", answer: item.answer || "", order_number: item.orderNumber || 1, is_active: item.isActive !== false });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isId ? "Yakin ingin menghapus item ini?" : "Are you sure you want to delete this item?")) return;
    try {
      if (activeTab === "sections") {
        await guideService.adminDeleteGuideSection(id);
        setSections(s => s.filter(x => x.id !== id));
      } else {
        await guideService.adminDeleteFaqItem(id);
        setFaqs(f => f.filter(x => x.id !== id));
      }
      showToast(isId ? "Data berhasil dihapus" : "Data deleted successfully", "success");
    } catch (e) {
      console.error(e);
      showToast(isId ? "Gagal menghapus data" : "Failed to delete data", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === "sections") {
        if (modalMode === "add") {
          const res = await guideService.adminCreateGuideSection(formData);
          if (res.status === "success" && res.data) setSections([...sections, res.data]);
        } else {
          await guideService.adminUpdateGuideSection(currentItem.id, formData);
          setSections(sections.map(s => s.id === currentItem.id ? { ...s, ...formData, orderNumber: formData.order_number, isActive: formData.is_active } : s));
        }
      } else {
        if (modalMode === "add") {
          const res = await guideService.adminCreateFaqItem(formData);
          if (res.status === "success" && res.data) setFaqs([...faqs, res.data]);
        } else {
          await guideService.adminUpdateFaqItem(currentItem.id, formData);
          setFaqs(faqs.map(f => f.id === currentItem.id ? { ...f, ...formData, orderNumber: formData.order_number, isActive: formData.is_active } : f));
        }
      }
      setIsModalOpen(false);
      fetchData(); // Refresh to get proper mapped entity
      showToast(isId ? "Data berhasil disimpan" : "Data saved successfully", "success");
    } catch (e) {
      console.error(e);
      showToast(isId ? "Gagal menyimpan data" : "Failed to save data", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentItems = activeTab === "sections" ? sections : faqs;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Panduan & FAQ" : "Guide & FAQ"} — Farmstay Nusantara</title>
        </Head>
        
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">{isId ? "Panduan & FAQ" : "Guide & FAQ"}</h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Kelola konten panduan website dan pertanyaan umum untuk pengguna." : "Manage website guide content and frequently asked questions for users."}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-farm-border shadow-sm">
            <div className="flex gap-2 bg-farm-beige p-1 rounded-lg w-fit">
              <button onClick={() => setActiveTab("sections")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "sections" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70"}`}>
                {isId ? "Panduan Website" : "Website Guide"}
              </button>
              <button onClick={() => setActiveTab("faq")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "faq" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70"}`}>
                {isId ? "FAQ (Tanya Jawab)" : "FAQ (Q&A)"}
              </button>
            </div>

            <div className="flex gap-3">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-3 appearance-none rounded-lg border border-farm-border text-xs text-farm-text bg-white focus:outline-none focus:ring-2 focus:ring-farm-green/30"
              >
                <option value="all">{isId ? "Semua Pengguna" : "All Users"}</option>
                <option value="owner">{isId ? "Hanya Owner" : "Owner Only"}</option>
                <option value="visitor">{isId ? "Hanya Visitor" : "Visitor Only"}</option>
              </select>

              <button onClick={openAdd} className="h-9 px-4 bg-farm-green text-white text-xs font-bold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {isId ? "Tambah Baru" : "Add New"}
              </button>
            </div>
          </div>

          {/* Content List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div></div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-12 text-farm-text-light text-sm bg-white border border-farm-border rounded-2xl shadow-sm">
              {isId ? "Belum ada data." : "No data found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentItems.map((item: any) => (
                <div key={item.id} className="bg-white border border-farm-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.role === 'all' ? 'bg-purple-100 text-purple-800' : 
                          item.role === 'owner' ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.role === 'all' ? (isId ? 'Semua' : 'All') : item.role}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.isActive !== false ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[10px] text-farm-text-light/50 font-medium ml-1">Ord: {item.orderNumber}</span>
                      </div>
                      <h4 className="text-sm font-bold text-farm-text">{activeTab === "sections" ? item.title : item.question}</h4>
                      <p className="text-xs text-farm-text-light font-light mt-1.5 whitespace-pre-wrap">{activeTab === "sections" ? item.content : item.answer}</p>
                    </div>
                    
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(item)} className="text-farm-green hover:text-farm-green-hover p-1.5 rounded-lg hover:bg-farm-beige transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden my-8">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {modalMode === "add" ? (isId ? "Tambah Data" : "Add Data") : (isId ? "Edit Data" : "Edit Data")}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-farm-text-light hover:text-farm-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Target Role" : "Target Role"} *</label>
                    <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 bg-white">
                      <option value="all">{isId ? "Semua (Visitor & Owner)" : "All (Visitor & Owner)"}</option>
                      <option value="owner">Owner</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Urutan" : "Order"}</label>
                    <input type="number" min="1" value={formData.order_number} onChange={e => setFormData({ ...formData, order_number: parseInt(e.target.value) || 1 })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{activeTab === "sections" ? (isId ? "Judul Bagian" : "Section Title") : (isId ? "Pertanyaan" : "Question")} *</label>
                  <input type="text" required value={activeTab === "sections" ? formData.title : formData.question} onChange={e => setFormData({ ...formData, [activeTab === "sections" ? "title" : "question"]: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{activeTab === "sections" ? (isId ? "Isi Panduan" : "Guide Content") : (isId ? "Jawaban" : "Answer")} *</label>
                  <textarea rows={5} required value={activeTab === "sections" ? formData.content : formData.answer} onChange={e => setFormData({ ...formData, [activeTab === "sections" ? "content" : "answer"]: e.target.value })} className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 resize-none"></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="modalActive" checked={formData.is_active !== false} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-farm-green border-farm-border rounded" />
                  <label htmlFor="modalActive" className="text-sm font-medium text-farm-text cursor-pointer">{isId ? "Aktif (Ditampilkan)" : "Active (Visible)"}</label>
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
