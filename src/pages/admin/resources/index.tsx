import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { resourceService } from "@/services/resourceService";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";

export default function AdminResourcesPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";
  const { showToast } = useToast();

  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentResource, setCurrentResource] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "article",
    url: "",
    content: "",
    is_published: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await resourceService.getResources(page, 10, search, typeFilter);
      if (response.status === "success") {
        const data = response.data;
        setResources(Array.isArray(data) ? data : (data as any)?.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch resources:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await resourceService.adminDeleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast(isId ? "Resource berhasil dihapus" : "Resource deleted successfully", "success");
    } catch (e) {
      console.error("Failed to delete resource:", e);
      showToast(isId ? "Gagal menghapus resource" : "Failed to delete resource", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const openAddModal = (type: string = "article") => {
    setModalMode("add");
    setFormData({ title: "", description: "", resource_type: type, url: "", content: "", is_published: true });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (resource: any) => {
    setModalMode("edit");
    setCurrentResource(resource);
    setFormData({
      title: resource.title || "",
      description: resource.description || "",
      resource_type: resource.resource_type || resource.type || "article",
      url: resource.video_url || resource.url || "",
      content: resource.content || "",
      is_published: resource.is_published !== false,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPayload: any;
      
      // Clean up formData to match backend expectations
      const payloadData: any = { ...formData };
      if (payloadData.resource_type === 'video') {
        payloadData.video_url = payloadData.url;
      }

      if (selectedFile || payloadData.resource_type === 'document') {
        finalPayload = new FormData();
        Object.entries(payloadData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
             finalPayload.append(key, String(value));
          }
        });
        if (selectedFile) {
          finalPayload.append("file", selectedFile);
        }
      } else {
        // Send as JSON if no file is uploaded (like for Articles)
        finalPayload = payloadData;
      }

      if (modalMode === "add") {
        const res = await resourceService.adminCreateResource(finalPayload);
        if (res.status === "success") {
          fetchResources();
          showToast(isId ? "Resource berhasil ditambahkan" : "Resource added successfully", "success");
        }
      } else {
        // For updates, some backends need _method=PUT when using FormData
        if (finalPayload instanceof FormData) {
          finalPayload.append("_method", "PUT");
        }
        const res = await resourceService.adminUpdateResource(currentResource.id, finalPayload);
        if (res.status === "success") {
          fetchResources();
          showToast(isId ? "Resource berhasil diperbarui" : "Resource updated successfully", "success");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save resource:", err);
      showToast(isId ? "Gagal menyimpan data resource" : "Failed to save resource data", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292" />
          </svg>
        );
      case "video":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const renderPreview = (r: any) => {
    const type = r.resource_type || r.type;
    const url = r.url || r.video_url || r.file_url;
    
    if (type === 'video') {
      const ytThumb = getYouTubeThumbnail(url);
      if (ytThumb) {
        return (
          <div className="w-full h-40 bg-zinc-900 overflow-hidden relative group shrink-0">
            <img src={ytThumb} alt="Video thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm text-white group-hover:scale-110 transition-transform shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        );
      } else if (url && url.match(/\.(mp4|webm|ogg)$/i)) {
        return (
          <div className="w-full h-40 bg-black overflow-hidden relative group shrink-0">
            <video src={url} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
               </div>
            </div>
          </div>
        );
      } else {
         return (
          <div className="w-full h-40 bg-zinc-800 overflow-hidden relative flex flex-col items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-zinc-400 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            <span className="text-[11px] font-bold text-zinc-400 tracking-wider">VIDEO MEDIA</span>
          </div>
         );
      }
    }
    
    if (type === 'document') {
      return (
        <div className="w-full h-40 bg-gradient-to-br from-red-50 to-red-100 border-b border-red-200 overflow-hidden relative flex flex-col items-center justify-center shrink-0">
           <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
             </svg>
           </div>
           <span className="text-[11px] font-bold text-red-700 tracking-wider">DOCUMENT</span>
        </div>
      );
    }

    // Article
    return (
      <div className="w-full h-32 bg-farm-beige/30 border-b border-farm-border overflow-hidden relative flex flex-col items-center justify-center shrink-0">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-farm-green/5 rounded-full blur-xl"></div>
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-farm-green/5 rounded-full blur-xl"></div>
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-farm-green mb-2 relative z-10 shrink-0">
          {getTypeIcon(type)}
        </div>
        <span className="text-[10px] font-bold text-farm-green tracking-wider uppercase relative z-10">ARTICLE</span>
      </div>
    );
  };

  const renderDetailMedia = (r: any) => {
    const type = r.resource_type || r.type;
    const url = r.url || r.video_url || r.file_url;
    if (!url) return null;

    if (type === 'video') {
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (ytMatch) {
        return (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mb-4">
            <iframe 
              className="w-full h-full" 
              src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        );
      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mb-4">
            <video src={url} className="w-full h-full" controls preload="metadata" />
          </div>
        );
      }
    }
    
    if (type === 'document') {
       return (
         <div className="w-full h-32 bg-red-50 border border-red-200 rounded-xl mb-4 flex items-center justify-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-farm-text">Dokumen Terlampir</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-farm-green hover:underline font-semibold mt-1">Buka / Unduh Dokumen →</a>
            </div>
         </div>
       );
    }
    return null;
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Guide & Resource — Farmstay Nusantara" : "Guide & Resource — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">
                {isId ? "Guide & Resource" : "Guide & Resource"}
              </h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Kelola artikel, dokumen, dan video panduan" : "Manage articles, documents, and video guides"}
              </p>
            </div>
            <button 
                onClick={() => openAddModal("article")}
                className="h-10 px-4 bg-farm-green text-white text-xs font-bold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {isId ? "Tambah Resource" : "Add Resource"}
              </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-farm-text-light">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isId ? "Cari resource..." : "Search resources..."}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-farm-border bg-white text-sm text-farm-text placeholder:text-farm-text-light/60 focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                />
              </div>
              <button type="submit" className="h-10 px-5 bg-farm-green text-white text-sm font-semibold rounded-lg hover:bg-farm-green-hover transition-colors">
                {isId ? "Cari" : "Search"}
              </button>
            </form>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-10 px-4 appearance-none rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30 cursor-pointer"
            >
              <option value="">{isId ? "Semua Tipe" : "All Types"}</option>
              <option value="article">{isId ? "Artikel" : "Article"}</option>
              <option value="document">{isId ? "Dokumen" : "Document"}</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 text-farm-text-light text-sm bg-white border border-farm-border rounded-2xl">
              {isId ? "Belum ada resource." : "No resources found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {resources.map((r: any) => (
                <div key={r.id} className="bg-white border border-farm-border rounded-2xl shadow-sm flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden group" onClick={() => setSelectedResource(r)}>
                  
                  {/* Rich Preview Area */}
                  {renderPreview(r)}
                  
                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-farm-beige text-farm-text-light border border-farm-border/60">
                        {r.resource_type || r.type}
                      </span>
                      {r.is_published !== undefined && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.is_published ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"}`}>
                          {r.is_published ? (isId ? "Publik" : "Published") : (isId ? "Draft" : "Draft")}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-bold text-farm-text line-clamp-2 mb-3 group-hover:text-farm-green transition-colors">{r.title}</h4>
                    
                    <div className="flex flex-col gap-3 flex-1">
                      {r.description && (
                        <div>
                          <span className="text-[9px] font-bold text-farm-text-light/80 uppercase tracking-wider block mb-1">{isId ? "Deskripsi:" : "Description:"}</span>
                          <p className="text-[11px] text-farm-text-light font-light line-clamp-2 leading-relaxed">
                            {r.description}
                          </p>
                        </div>
                      )}

                      {r.content && (
                        <div>
                          <span className="text-[9px] font-bold text-farm-text-light/80 uppercase tracking-wider block mb-1">
                            {r.resource_type === "article" || r.type === "article" ? (isId ? "Konten Artikel:" : "Article Content:") : (isId ? "Catatan:" : "Notes:")}
                          </span>
                          <div className="text-[11px] text-farm-text-light font-medium italic line-clamp-2 leading-relaxed border-l-2 border-farm-green/30 pl-2">
                            <div dangerouslySetInnerHTML={{ __html: r.content }} />
                          </div>
                        </div>
                      )}

                    </div>
                    
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-farm-border/60" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => openEditModal(r)}
                        className="flex-1 h-8 text-xs font-bold text-farm-green border border-farm-green/30 rounded-lg hover:bg-farm-beige transition-colors"
                      >
                        {isId ? "Edit" : "Edit"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(r.id)}
                        className="flex-1 h-8 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {isId ? "Hapus" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Tambah/Edit Resource */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {modalMode === "add" ? (isId ? "Tambah Resource" : "Add Resource") : (isId ? "Edit Resource" : "Edit Resource")}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-farm-text-light hover:text-farm-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Judul" : "Title"} *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Tipe Resource" : "Resource Type"} *</label>
                    <select
                      value={formData.resource_type}
                      onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                      className="w-full h-10 px-4 appearance-none rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green cursor-pointer"
                    >
                      <option value="article">{isId ? "Artikel" : "Article"}</option>
                      <option value="document">{isId ? "Dokumen (PDF)" : "Document (PDF)"}</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="w-1/2 flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4 text-farm-green focus:ring-farm-green border-farm-border rounded"
                    />
                    <label htmlFor="isPublished" className="text-sm font-medium text-farm-text cursor-pointer">
                      {isId ? "Publikasikan" : "Publish"}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Deskripsi / Ringkasan" : "Description / Summary"}</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Tautan / URL (Opsional)" : "Link / URL (Optional)"}</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                  />
                  <p className="text-[10px] text-farm-text-light mt-1">
                    {isId ? "* Jika artikel atau video berasal dari sumber eksternal (misal YouTube)" : "* If article or video is from external source (e.g. YouTube)"}
                  </p>
                </div>

                {formData.resource_type === "document" && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Upload Dokumen (PDF)" : "Upload Document (PDF)"}</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-farm-text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-farm-green/10 file:text-farm-green hover:file:bg-farm-green/20"
                    />
                    {modalMode === "edit" && currentResource?.file_url && !selectedFile && (
                      <p className="text-[10px] text-farm-text-light mt-2 italic">
                        {isId ? "* Biarkan kosong jika tidak ingin mengubah dokumen" : "* Leave empty to keep current document"}
                      </p>
                    )}
                  </div>
                )}

                {formData.resource_type === "video" && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Upload File Video" : "Upload Video File"}</label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-farm-text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-farm-green/10 file:text-farm-green hover:file:bg-farm-green/20"
                    />
                    <p className="text-[10px] text-farm-text-light mt-1">
                      {isId ? "* Atau isi URL video di atas jika video dari YouTube/sumber eksternal" : "* Or fill in the URL above if video is from YouTube/external source"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">
                    {formData.resource_type === "article" ? (isId ? "Isi Artikel" : "Article Content") : (isId ? "Konten / Catatan (Opsional)" : "Content / Notes (Optional)")}
                  </label>
                  <textarea
                    rows={formData.resource_type === "article" ? 10 : 3}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={isId ? "Tulis isi atau catatan di sini..." : "Write content or notes here..."}
                    className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-farm-border/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-farm-text hover:bg-farm-beige rounded-lg transition-colors"
                  >
                    {isId ? "Batal" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan" : "Save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedResource(null)}>
            <div 
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white border-b border-farm-border p-4 px-6 flex justify-between items-center shrink-0">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {isId ? "Detail Resource" : "Resource Detail"}
                </h3>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="p-2 hover:bg-farm-beige rounded-full transition-colors text-farm-text-light hover:text-farm-text"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-farm-beige border border-farm-border flex items-center justify-center text-farm-text shrink-0">
                    {getTypeIcon(selectedResource.resource_type || selectedResource.type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-farm-text-light uppercase tracking-wider">{selectedResource.resource_type || selectedResource.type}</span>
                    <div className="mt-1">
                      {selectedResource.is_published !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedResource.is_published ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"}`}>
                          {selectedResource.is_published ? (isId ? "Publik" : "Published") : (isId ? "Draft" : "Draft")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-farm-text mb-2">{selectedResource.title}</h2>
                
                {/* Media Preview inside Detail Modal */}
                {renderDetailMedia(selectedResource)}
                
                {selectedResource.description && (
                  <div className="p-4 bg-farm-beige/50 rounded-xl border border-farm-border/50">
                    <h4 className="text-xs font-bold text-farm-text mb-2 uppercase tracking-wider">{isId ? "Deskripsi" : "Description"}</h4>
                    <p className="text-sm text-farm-text leading-relaxed">{selectedResource.description}</p>
                  </div>
                )}
                
                {selectedResource.content && (
                  <div>
                    <h4 className="text-xs font-bold text-farm-text mb-3 uppercase tracking-wider">
                      {selectedResource.resource_type === 'article' || selectedResource.type === 'article' ? (isId ? "Konten Artikel" : "Article Content") : (isId ? "Catatan Konten" : "Content Notes")}
                    </h4>
                    <div 
                      className="text-farm-text-light font-light leading-relaxed whitespace-pre-wrap text-sm border-l-2 border-farm-green/30 pl-4 py-1"
                      dangerouslySetInnerHTML={{ __html: selectedResource.content }}
                    />
                  </div>
                )}
                
                {/* Fallback old link just in case it's not a video or document but still has a url */}
                {(selectedResource.url || selectedResource.video_url || selectedResource.file_url) && selectedResource.resource_type === 'article' && (
                  <div className="mt-2 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-farm-text uppercase tracking-wider">{isId ? "Tautan Eksternal" : "External Link"}</h4>
                    <a 
                      href={selectedResource.url || selectedResource.video_url || selectedResource.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-farm-border rounded-xl hover:bg-farm-beige transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow text-farm-green">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      </div>
                      <span className="text-sm text-farm-text font-medium truncate flex-1">
                        {selectedResource.url || selectedResource.video_url || selectedResource.file_url}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-farm-text-light">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                )}
                
                <div className="mt-4 pt-6 border-t border-farm-border flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedResource(null);
                      openEditModal(selectedResource);
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-farm-green border border-farm-green/30 bg-white rounded-lg hover:bg-farm-beige transition-colors shadow-sm"
                  >
                    {isId ? "Edit Resource" : "Edit Resource"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedResource(null);
                      setShowDeleteConfirm(selectedResource.id);
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  >
                    {isId ? "Hapus" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white border border-farm-border rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-farm-text text-xl mb-2">
                  {isId ? "Hapus Resource?" : "Delete Resource?"}
                </h3>
                <p className="text-sm text-farm-text-light">
                  {isId 
                    ? "Tindakan ini tidak dapat dibatalkan. Data resource akan terhapus secara permanen dari sistem." 
                    : "This action cannot be undone. The resource data will be permanently deleted from the system."}
                </p>
              </div>
              
              <div className="p-4 border-t border-farm-border bg-farm-cream flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 h-11 bg-white border border-farm-border rounded-xl text-sm font-semibold text-farm-text hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  {isId ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 h-11 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    isId ? "Ya, Hapus" : "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
