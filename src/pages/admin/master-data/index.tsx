import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { masterDataService } from "@/services/masterDataService";
import { useTranslation } from "@/hooks/useTranslation";
import { MasterDataItem } from "@/types/resources";

const MASTER_DATA_TYPES = [
  { value: "accommodation_type", label: "Tipe Akomodasi (Accommodation Type)" },
  { value: "province", label: "Provinsi (Province)" },
  { value: "city", label: "Kabupaten/Kota (City)" },
  { value: "rating_bintang", label: "Rating Bintang (Star Rating)" },
  { value: "bencana_alam", label: "Risiko Bencana Alam (Natural Disaster Risk)" },
  { value: "kawasan_khusus", label: "Status Kawasan Khusus (Special Area)" },
];

export default function AdminMasterDataPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";

  const [activeType, setActiveType] = useState(MASTER_DATA_TYPES[0].value);
  const [data, setData] = useState<MasterDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentItem, setCurrentItem] = useState<MasterDataItem | null>(null);
  const [formData, setFormData] = useState({ label: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await masterDataService.adminGetMasterData(activeType, page, 50, "");
      if (response.status === "success") {
        const resData = response.data;
        setData(Array.isArray(resData) ? resData : (resData as any)?.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch master data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [activeType]);

  const handleDelete = async (id: number) => {
    try {
      await masterDataService.adminDeleteMasterData(activeType, id);
      setData((prev) => prev.filter((item) => item.id !== id));
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error("Failed to delete master data:", e);
      alert(isId ? "Gagal menghapus data. Mungkin data sedang digunakan." : "Failed to delete data. It might be in use.");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ label: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterDataItem) => {
    setModalMode("edit");
    setCurrentItem(item);
    setFormData({ label: item.label });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        await masterDataService.adminCreateMasterData(activeType, { label: formData.label });
      } else if (currentItem) {
        await masterDataService.adminUpdateMasterData(activeType, currentItem.id, { label: formData.label });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save master data:", err);
      alert(isId ? "Gagal menyimpan data." : "Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTypeLabel = MASTER_DATA_TYPES.find(t => t.value === activeType)?.label;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Kelola Master Data — Farmstay Nusantara" : "Manage Master Data — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">
                {isId ? "Kelola Master Data" : "Manage Master Data"}
              </h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Manajemen dropdown dan opsi statis untuk form pengguna." : "Manage dropdowns and static options for user forms."}
              </p>
            </div>
            <button 
              onClick={openAddModal}
              className="h-10 px-4 bg-farm-green text-white text-xs font-bold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isId ? "Tambah Opsi" : "Add Option"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar for Types */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
              {MASTER_DATA_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActiveType(type.value)}
                  className={`px-4 py-3 text-left text-sm font-semibold rounded-xl transition-all ${
                    activeType === type.value
                      ? "bg-farm-green text-white shadow-md shadow-farm-green/20"
                      : "bg-white text-farm-text border border-farm-border hover:bg-farm-beige"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Content Table */}
            <div className="flex-1 bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  Data: {currentTypeLabel}
                </h3>
              </div>
              
              <div className="p-5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div>
                  </div>
                ) : data.length === 0 ? (
                  <div className="text-center py-12 text-farm-text-light text-sm">
                    {isId ? "Belum ada data untuk kategori ini." : "No data available for this category."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-farm-text-light uppercase bg-farm-beige/50 border-b border-farm-border">
                        <tr>
                          <th className="px-6 py-3 font-semibold w-16">ID</th>
                          <th className="px-6 py-3 font-semibold">{isId ? "Label (Teks)" : "Label (Text)"}</th>
                          <th className="px-6 py-3 font-semibold text-right w-48">{isId ? "Aksi" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item) => (
                          <tr key={item.id} className="border-b border-farm-border/60 hover:bg-farm-beige/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-farm-text-light">{item.id}</td>
                            <td className="px-6 py-4 font-semibold text-farm-text">{item.label}</td>
                            <td className="px-6 py-4 text-right">
                              {showDeleteConfirm === item.id ? (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleDelete(item.id)} className="h-7 px-3 text-[10px] font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                                    {isId ? "Yakin Hapus" : "Confirm"}
                                  </button>
                                  <button onClick={() => setShowDeleteConfirm(null)} className="h-7 px-3 text-[10px] font-bold text-farm-text border border-farm-border rounded hover:bg-farm-beige transition-colors">
                                    {isId ? "Batal" : "Cancel"}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="h-7 px-3 text-[10px] font-bold text-farm-green border border-farm-green/30 rounded hover:bg-farm-beige transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(item.id)}
                                    className="h-7 px-3 text-[10px] font-bold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Tambah/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b border-farm-border flex justify-between items-center bg-farm-beige/30">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {modalMode === "add" ? (isId ? "Tambah Opsi" : "Add Option") : (isId ? "Edit Opsi" : "Edit Option")}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-farm-text-light hover:text-farm-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-farm-text mb-1">{isId ? "Label / Nama Opsi" : "Option Label"} *</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder={isId ? "Contoh: Jawa Barat" : "Example: West Java"}
                    className="w-full h-10 px-3 rounded-lg border border-farm-border text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                  />
                  <p className="text-[10px] text-farm-text-light mt-1.5 italic">
                    {isId ? "* Opsi ini akan muncul di form pendaftaran owner" : "* This option will appear in owner forms"}
                  </p>
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
      </DashboardLayout>
    </RoleGuard>
  );
}
