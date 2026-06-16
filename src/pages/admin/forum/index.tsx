import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { forumService } from "@/services/forumService";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";

export default function AdminForumPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";
  const { showToast } = useToast();

  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const response = await forumService.adminGetStories(page, 10, statusFilter);
      if (response.status === "success") {
        const data = response.data;
        setStories(Array.isArray(data) ? data : (data as any)?.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch stories:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, [page, statusFilter]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await forumService.adminVerifyStory(id, { status: "approved" });
      setStories((prev) => prev.filter((s) => s.id !== id));
      showToast(isId ? "Cerita berhasil disetujui" : "Story approved successfully", "success");
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
    } catch (e) {
      console.error("Failed to approve:", e);
      showToast(isId ? "Gagal menyetujui cerita" : "Failed to approve story", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    try {
      await forumService.adminVerifyStory(id, { status: "rejected", rejection_reason: rejectReason });
      setStories((prev) => prev.filter((s) => s.id !== id));
      setRejectId(null);
      setRejectReason("");
      showToast(isId ? "Cerita berhasil ditolak" : "Story rejected successfully", "success");
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
    } catch (e) {
      console.error("Failed to reject:", e);
      showToast(isId ? "Gagal menolak cerita" : "Failed to reject story", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      await forumService.adminDeleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmId(null);
      showToast(isId ? "Cerita berhasil dihapus" : "Story deleted successfully", "success");
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
    } catch (e) {
      console.error("Failed to delete:", e);
      showToast(isId ? "Gagal menghapus cerita" : "Failed to delete story", "error");
    } finally {
      setActionLoading(null);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": 
      case "published": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-amber-100 text-amber-800";
      default: return "bg-zinc-100 text-zinc-800";
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Sharing Session Verification — Farmstay Nusantara" : "Sharing Session Verification — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-farm-text">
              {isId ? "Sharing Session Verification" : "Sharing Session Verification"}
            </h1>
            <p className="text-sm text-farm-text-light mt-1 font-light">
              {isId ? "Review dan verifikasi cerita pengalaman dari visitor" : "Review and verify experience stories from visitors"}
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-1 bg-farm-beige p-1 rounded-lg w-fit overflow-x-auto max-w-full">
            {[
              { value: "pending", label: isId ? "Menunggu" : "Pending" },
              { value: "published", label: isId ? "Disetujui & Publik" : "Approved & Published" },
              { value: "rejected", label: isId ? "Ditolak" : "Rejected" },
              { value: "", label: isId ? "Semua" : "All" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${statusFilter === tab.value ? "bg-farm-green text-white shadow-sm" : "text-farm-text/70 hover:text-farm-text"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stories */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 text-farm-text-light text-sm bg-white border border-farm-border rounded-2xl">
              {isId ? "Tidak ada cerita ditemukan." : "No stories found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {stories.map((story: any) => (
                <div key={story.id} className="bg-white border border-farm-border rounded-2xl overflow-hidden shadow-sm flex flex-col transition-transform hover:shadow-md cursor-pointer" onClick={() => setSelectedStory(story)}>
                  {/* Image */}
                  {story.image_url ? (
                    <div className="w-full h-48 bg-farm-beige shrink-0 relative">
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase shadow-sm ${getStatusBadge(story.status)}`}>
                          {story.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-farm-beige shrink-0 flex items-center justify-center relative">
                      <span className="text-farm-text-light text-sm">{isId ? "Tidak ada gambar" : "No image"}</span>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase shadow-sm ${getStatusBadge(story.status)}`}>
                          {story.status}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif text-lg font-bold text-farm-text line-clamp-1">{story.title}</h4>
                    </div>
                    <p className="text-xs text-farm-text-light mt-1">
                      {isId ? "Oleh:" : "By:"} <span className="font-medium text-farm-text">{story.author?.nama || story.user?.nama || "-"}</span> •{" "}
                      {story.created_at ? new Date(story.created_at).toLocaleDateString(isId ? "id-ID" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                    </p>
                    <p className="text-sm text-farm-text-light font-light mt-3 line-clamp-3 leading-relaxed flex-1">
                      {story.content}
                    </p>

                    {/* Actions Inline */}
                    <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-farm-border/60" onClick={(e) => e.stopPropagation()}>
                      {story.status === "pending" && (
                        <div>
                          {rejectId === story.id ? (
                            <div className="flex-1 flex flex-col gap-2">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={isId ? "Alasan penolakan..." : "Rejection reason..."}
                                className="w-full h-8 px-3 rounded-lg border border-farm-border text-xs text-farm-text placeholder:text-farm-text-light/60 focus:outline-none focus:ring-2 focus:ring-red-200"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReject(story.id)}
                                  disabled={actionLoading === story.id}
                                  className="flex-1 h-8 px-3 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === story.id ? "..." : isId ? "Tolak" : "Reject"}
                                </button>
                                <button
                                  onClick={() => { setRejectId(null); setRejectReason(""); }}
                                  className="flex-1 h-8 px-3 text-xs font-bold text-farm-text border border-farm-border rounded-lg hover:bg-farm-beige transition-colors"
                                >
                                  {isId ? "Batal" : "Cancel"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex gap-2 mb-2">
                              <button
                                onClick={() => setRejectId(story.id)}
                                className="flex-1 h-8 px-4 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                {isId ? "Tolak" : "Reject"}
                              </button>
                              <button
                                onClick={() => handleApprove(story.id)}
                                disabled={actionLoading === story.id}
                                className="flex-1 h-8 px-4 text-xs font-bold text-white bg-farm-green rounded-lg hover:bg-farm-green-hover transition-colors disabled:opacity-50"
                              >
                                {actionLoading === story.id ? "..." : isId ? "Setujui" : "Approve"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delete action available for all statuses */}
                      {deleteConfirmId === story.id ? (
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleDelete(story.id)} disabled={actionLoading === story.id} className="flex-1 h-8 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                            {actionLoading === story.id ? "..." : (isId ? "Ya, Hapus" : "Yes, Delete")}
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="flex-1 h-8 text-xs font-bold text-farm-text border border-farm-border rounded-lg hover:bg-farm-beige transition-colors">
                            {isId ? "Batal" : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(story.id)} className="w-full h-8 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          {isId ? "Hapus Cerita" : "Delete Story"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStory(null)}>
            <div 
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white border-b border-farm-border p-4 px-6 flex justify-between items-center shrink-0">
                <h3 className="font-serif text-lg font-bold text-farm-text">
                  {isId ? "Detail Cerita" : "Story Detail"}
                </h3>
                <button 
                  onClick={() => setSelectedStory(null)}
                  className="p-2 hover:bg-farm-beige rounded-full transition-colors text-farm-text-light hover:text-farm-text"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                {selectedStory.image_url && (
                  <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden bg-farm-beige shrink-0">
                    <img src={selectedStory.image_url} alt={selectedStory.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-farm-text">{selectedStory.title}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase shrink-0 ${getStatusBadge(selectedStory.status)}`}>
                      {selectedStory.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-farm-text-light mb-6 bg-farm-beige/50 p-3 rounded-xl w-fit">
                    <div className="w-10 h-10 rounded-full bg-white border border-farm-border flex items-center justify-center font-bold text-farm-text text-lg shadow-sm">
                      {(selectedStory.author?.nama || selectedStory.user?.nama || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-farm-text">{selectedStory.author?.nama || selectedStory.user?.nama || "Unknown User"}</p>
                      <p className="text-xs">
                        {selectedStory.created_at ? new Date(selectedStory.created_at).toLocaleDateString(isId ? "id-ID" : "en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-farm-text-light font-light leading-relaxed whitespace-pre-wrap text-base">
                    {selectedStory.content}
                  </div>
                </div>

                {selectedStory.status === "pending" && (
                  <div className="mt-6 pt-6 border-t border-farm-border flex flex-col gap-4 bg-farm-beige/30 -mx-6 px-6 pb-6">
                    <h4 className="font-medium text-farm-text text-sm">{isId ? "Tindakan Verifikasi" : "Verification Actions"}</h4>
                    {rejectId === selectedStory.id ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={isId ? "Alasan penolakan..." : "Rejection reason..."}
                          className="w-full min-h-[100px] p-3 rounded-lg border border-farm-border text-sm text-farm-text placeholder:text-farm-text-light/60 focus:outline-none focus:ring-2 focus:ring-red-200 resize-y"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => { setRejectId(null); setRejectReason(""); }}
                            className="px-5 py-2.5 text-sm font-bold text-farm-text border border-farm-border bg-white rounded-lg hover:bg-farm-beige transition-colors"
                          >
                            {isId ? "Batal" : "Cancel"}
                          </button>
                          <button
                            onClick={() => handleReject(selectedStory.id)}
                            disabled={actionLoading === selectedStory.id || !rejectReason.trim()}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {actionLoading === selectedStory.id ? "..." : isId ? "Konfirmasi Tolak" : "Confirm Reject"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setRejectId(selectedStory.id)}
                          className="px-6 py-2.5 text-sm font-bold text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                        >
                          {isId ? "Tolak" : "Reject"}
                        </button>
                        <button
                          onClick={() => handleApprove(selectedStory.id)}
                          disabled={actionLoading === selectedStory.id}
                          className="px-6 py-2.5 text-sm font-bold text-white bg-farm-green rounded-lg hover:bg-farm-green-hover transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === selectedStory.id ? "..." : isId ? "Setujui" : "Approve"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className={`pt-6 border-t border-farm-border flex flex-col gap-4 ${selectedStory.status !== 'pending' ? 'mt-6' : ''}`}>
                  <h4 className="font-medium text-red-600 text-sm">{isId ? "Zona Berbahaya" : "Danger Zone"}</h4>
                  {deleteConfirmId === selectedStory.id ? (
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-red-50 p-4 rounded-lg border border-red-100">
                      <span className="text-sm text-red-800 font-medium">
                        {isId ? "Anda yakin ingin menghapus cerita ini permanen?" : "Are you sure you want to permanently delete this story?"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setDeleteConfirmId(null); }}
                          className="px-4 py-2 text-sm font-bold text-farm-text border border-farm-border bg-white rounded-lg hover:bg-farm-beige transition-colors"
                        >
                          {isId ? "Batal" : "Cancel"}
                        </button>
                        <button
                          onClick={() => handleDelete(selectedStory.id)}
                          disabled={actionLoading === selectedStory.id}
                          className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm shrink-0"
                        >
                          {actionLoading === selectedStory.id ? "..." : isId ? "Ya, Hapus" : "Yes, Delete"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-red-50/50 p-4 rounded-lg border border-red-100">
                      <span className="text-sm text-red-600/80 font-medium">
                        {isId ? "Hapus konten ini dari sistem secara permanen" : "Delete this content from the system permanently"}
                      </span>
                      <button
                        onClick={() => setDeleteConfirmId(selectedStory.id)}
                        className="px-6 py-2.5 text-sm font-bold text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-sm shrink-0"
                      >
                        {isId ? "Hapus Cerita" : "Delete Story"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
