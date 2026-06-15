import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { farmstayService } from "@/services/farmstayService";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";
import { adminService } from "@/services/adminService";

export default function AdminFarmstaysPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";
  const { showToast } = useToast();

  const [farmstays, setFarmstays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFarmstay, setCurrentFarmstay] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "local",
    location: "",
    city: "",
    province: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFarmstays = async () => {
    setIsLoading(true);
    try {
      const response = await farmstayService.adminGetFarmstays(page, 10, search, category);
      if (response.status === "success") {
        const data = response.data;
        setFarmstays(Array.isArray(data) ? data : (data as any)?.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch farmstays:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchFarmstays(); 
  }, [page, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFarmstays();
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await farmstayService.adminDeleteFarmstay(id);
      setFarmstays((prev) => prev.filter((f) => f.id !== id));
      showToast(isId ? "Farmstay berhasil dihapus" : "Farmstay deleted successfully", "success");
    } catch (e) {
      console.error("Failed to delete farmstay:", e);
      showToast(isId ? "Gagal menghapus farmstay" : "Failed to delete farmstay", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ name: "", description: "", category: "local", location: "", city: "", province: "" });
    setSelectedFile(null);
    setSelectedGalleryFiles([]);
    setExistingGalleryUrls([]);
    setIsModalOpen(true);
  };

  const openEditModal = (farmstay: any) => {
    setModalMode("edit");
    setCurrentFarmstay(farmstay);
    setFormData({
      name: farmstay.name || "",
      description: farmstay.description || "",
      category: farmstay.category || "local",
      location: farmstay.location || "",
      city: farmstay.city || "",
      province: farmstay.province || "",
    });
    setSelectedFile(null);
    setSelectedGalleryFiles([]);
    setExistingGalleryUrls(farmstay.gallery || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPayload: any;
      
      const payloadData: any = { ...formData };

      const hasFiles = selectedFile || selectedGalleryFiles.length > 0 || existingGalleryUrls.length > 0;

      if (hasFiles) {
        finalPayload = new FormData();
        Object.entries(payloadData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            finalPayload.append(key, String(value));
          }
        });
        if (selectedFile) finalPayload.append("image", selectedFile);
        selectedGalleryFiles.forEach(file => finalPayload.append("gallery", file));
        
        if (existingGalleryUrls.length === 0 && modalMode === "edit") {
          finalPayload.append("gallery", "[]");
        } else {
          existingGalleryUrls.forEach(url => finalPayload.append("gallery", url));
        }
      } else {
        // Send as JSON if no file is uploaded and no gallery array
        // Clean up empty strings to avoid Zod issues for optional fields if needed
        finalPayload = { ...payloadData };
        if (modalMode === "edit") {
          finalPayload.gallery = existingGalleryUrls;
        }
        if (!finalPayload.website_url) delete finalPayload.website_url;
      }

      if (modalMode === "add") {
        const res = await farmstayService.adminCreateFarmstay(finalPayload);
        if (res.status === "success" && res.data) {
          fetchFarmstays(); // Refetch to ensure proper ordering and mapping
          showToast(isId ? "Farmstay berhasil ditambahkan" : "Farmstay added successfully", "success");
        }
      } else {
        if (finalPayload instanceof FormData) {
          finalPayload.append("_method", "PUT");
        }
        const res = await farmstayService.adminUpdateFarmstay(currentFarmstay.id, finalPayload);
        if (res.status === "success") {
          fetchFarmstays();
          showToast(isId ? "Farmstay berhasil diperbarui" : "Farmstay updated successfully", "success");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save farmstay:", err);
      showToast(isId ? "Gagal menyimpan data farmstay" : "Failed to save farmstay data", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Profile Farmstay — Farmstay Nusantara" : "Profile Farmstay — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">
                {isId ? "Profile Farmstay" : "Profile Farmstay"}
              </h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Manajemen daftar farmstay (Tambah, Edit, Hapus)" : "Manage farmstay list (Add, Edit, Delete)"}
              </p>
            </div>
            <button 
              onClick={openAddModal}
              className="h-10 px-4 bg-farm-green text-white text-xs font-bold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isId ? "Tambah Farmstay" : "Add Farmstay"}
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
                  placeholder={isId ? "Cari farmstay..." : "Search farmstays..."}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-farm-border bg-white text-sm text-farm-text placeholder:text-farm-text-light/60 focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                />
              </div>
              <button type="submit" className="h-10 px-5 bg-farm-green text-white text-sm font-semibold rounded-lg hover:bg-farm-green-hover transition-colors">
                {isId ? "Cari" : "Search"}
              </button>
            </form>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="h-10 px-4 appearance-none rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30 cursor-pointer"
            >
              <option value="">{isId ? "Semua Kategori" : "All Categories"}</option>
              <option value="local">Local</option>
              <option value="global">Global</option>
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div>
            </div>
          ) : farmstays.length === 0 ? (
            <div className="text-center py-12 text-farm-text-light text-sm bg-white border border-farm-border rounded-2xl">
              {isId ? "Belum ada data farmstay." : "No farmstays found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {farmstays.map((f: any) => (
                <div key={f.id} className="bg-white border border-farm-border rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 group relative">
                  {/* Image Area (Carousel) */}
                  <div className="h-48 bg-zinc-100 flex overflow-hidden relative group/carousel">
                    {(() => {
                      const allImages = [f.image_url, ...(f.gallery || [])].filter(Boolean);
                      if (allImages.length > 0) {
                        return (
                          <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                            {allImages.map((img: string, idx: number) => (
                              <div key={idx} className="min-w-full h-full snap-center relative">
                                <img src={img} alt={`${f.name} ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                              </div>
                            ))}
                            
                            {/* Simple visual indicator for multiple images */}
                            {allImages.length > 1 && (
                              <div className="absolute top-4 left-4 flex gap-1 z-10">
                                {allImages.map((_, idx) => (
                                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm backdrop-blur-sm"></div>
                                ))}
                              </div>
                            )}
                            {/* Helper hint */}
                            {allImages.length > 1 && (
                               <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity pointer-events-none z-10">
                                 <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                   </svg>
                                 </div>
                               </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="w-full h-full bg-farm-beige flex items-center justify-center relative">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-farm-green/20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
                          </svg>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                        </div>
                      );
                    })()}
                    
                    {/* Top Right Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                       <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase bg-white/95 backdrop-blur-md text-farm-green shadow-sm tracking-wider">
                         {f.category}
                       </span>
                    </div>

                    {/* Bottom Left Title (Inside Image) */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                       <h4 className="text-xl font-serif font-bold line-clamp-1 drop-shadow-lg">{f.name}</h4>
                       <div className="text-[11px] font-medium flex items-center gap-1.5 opacity-90 mt-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                           <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                         </svg>
                         <span className="truncate">
                           {[f.location, f.city, f.province].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ") || (isId ? "Lokasi belum diatur" : "Location not set")}
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-3 flex-1 bg-white">
                    <p className="text-sm text-farm-text-light font-light line-clamp-3 leading-relaxed flex-1 mt-1">
                       {f.description || (isId ? "Tidak ada deskripsi." : "No description.")}
                    </p>
                    
                    <div className="flex gap-2 pt-4 mt-auto border-t border-farm-border/60">
                      <button onClick={() => openEditModal(f)} className="flex-1 h-9 text-xs font-bold text-farm-green border border-farm-green/30 rounded-xl hover:bg-farm-green/10 transition-colors">
                        {isId ? "Edit" : "Edit"}
                      </button>
                      <button onClick={() => setShowDeleteConfirm(f.id)} className="flex-1 h-9 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                        {isId ? "Hapus" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Tambah/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {modalMode === "add" ? (isId ? "Tambah Farmstay" : "Add Farmstay") : (isId ? "Edit Farmstay" : "Edit Farmstay")}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-farm-text-light hover:text-farm-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Nama Farmstay" : "Farmstay Name"} *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Kategori" : "Category"} *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 px-4 appearance-none rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green cursor-pointer"
                    >
                      <option value="local">Local</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Deskripsi" : "Description"}</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Alamat Spesifik" : "Specific Location"}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Kota/Kabupaten" : "City"}</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Provinsi" : "Province"}</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Gambar Utama" : "Main Image"}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-farm-text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-farm-green/10 file:text-farm-green hover:file:bg-farm-green/20"
                    />
                    {modalMode === "edit" && currentFarmstay?.image_url && !selectedFile && (
                      <p className="text-[10px] text-farm-text-light mt-2 italic">
                        {isId ? "* Biarkan kosong untuk gambar lama" : "* Leave empty for current image"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Galeri Tambahan (Max 5)" : "Additional Gallery (Max 5)"}</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        // Limit total to 5
                        const totalAllowed = 5 - existingGalleryUrls.length;
                        setSelectedGalleryFiles(files.slice(0, totalAllowed));
                      }}
                      className="w-full text-sm text-farm-text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-farm-green/10 file:text-farm-green hover:file:bg-farm-green/20"
                    />
                    <p className="text-[10px] text-farm-text-light mt-2 italic">
                      {isId ? `* Dipilih: ${selectedGalleryFiles.length} file baru` : `* Selected: ${selectedGalleryFiles.length} new files`}
                    </p>
                  </div>
                </div>

                {existingGalleryUrls.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-farm-text mb-2">{isId ? "Galeri Tersimpan" : "Saved Gallery"}</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {existingGalleryUrls.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-farm-border group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setExistingGalleryUrls(prev => prev.filter(u => u !== url))}
                            className="absolute inset-0 bg-red-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 6l-15 15M5.5 6l15 15" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  {isId ? "Hapus Farmstay?" : "Delete Farmstay?"}
                </h3>
                <p className="text-sm text-farm-text-light">
                  {isId 
                    ? "Tindakan ini tidak dapat dibatalkan. Data farmstay akan terhapus secara permanen dari sistem." 
                    : "This action cannot be undone. The farmstay data will be permanently deleted from the system."}
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
