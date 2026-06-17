import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { consultationService } from "@/services/consultationService";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";

export default function AdminConsultationsPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await consultationService.adminGetSessions(page, 10, search, statusFilter);
      if (response.status === "success") {
        const data = response.data;
        setSessions(Array.isArray(data) ? data : (data as any)?.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch consultations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, [page, statusFilter]);

  const openMessages = async (session: any) => {
    setSelectedSession(session);
    try {
      const res = await consultationService.getMessages(session.id);
      if (res.status === "success" && res.data) {
        setMessages(Array.isArray(res.data) ? res.data : (res.data as any).messages || []);
        window.dispatchEvent(new Event("consultationRead"));
      }
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedSession) return;
    setIsSending(true);
    try {
      await consultationService.adminReply(selectedSession.id, { message: replyText });
      setReplyText("");
      const res = await consultationService.getMessages(selectedSession.id);
      if (res.status === "success" && res.data) {
        setMessages(Array.isArray(res.data) ? res.data : (res.data as any).messages || []);
      }
    } catch (e) {
      console.error("Failed to reply:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = async (sessionId: number) => {
    try {
      await consultationService.adminClose(sessionId);
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status: "closed" } : s));
      if (selectedSession?.id === sessionId) setSelectedSession({ ...selectedSession, status: "closed" });
      showToast(isId ? "Sesi konsultasi berhasil ditutup" : "Consultation session closed", "success");
    } catch (e) {
      console.error("Failed to close session:", e);
      showToast(isId ? "Gagal menutup sesi" : "Failed to close session", "error");
    }
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    
    try {
      await consultationService.adminDelete(sessionToDelete);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
      if (selectedSession?.id === sessionToDelete) setSelectedSession(null);
      showToast(isId ? "Sesi konsultasi berhasil dihapus" : "Consultation session deleted", "success");
    } catch (e) {
      console.error("Failed to delete session:", e);
      showToast(isId ? "Gagal menghapus sesi konsultasi" : "Failed to delete consultation session", "error");
    } finally {
      setIsDeleting(false);
      setSessionToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-amber-100 text-amber-800";
      case "closed": return "bg-zinc-100 text-zinc-600";
      default: return "bg-zinc-100 text-zinc-800";
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Consultation Session — Farmstay Nusantara" : "Consultation Session — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6 h-[calc(100vh-180px)]">
          {/* Header Title & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-farm-border/60 pb-4 shrink-0 gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-farm-text">
                {isId ? "Manajemen Konsultasi" : "Consultation Management"}
              </h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Balas dan kelola sesi konsultasi dari pemilik farmstay" : "Reply and manage consultation sessions from farmstay owners"}
              </p>
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 px-4 appearance-none rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30 cursor-pointer shrink-0 min-w-[150px]"
            >
              <option value="">{isId ? "Semua Status" : "All Status"}</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Master layout panel */}
          <div className="flex-1 min-h-0 bg-white border border-farm-border rounded-2xl flex shadow-sm overflow-hidden">
            {/* Left panel list (4 cols on desktop) */}
            <div className="w-full md:w-80 border-r border-farm-border/60 flex flex-col shrink-0 bg-farm-cream/35">
              <div className="p-4 border-b border-farm-border/60 flex justify-between items-center bg-farm-cream">
                <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider">
                  {isId ? "Tiket Masuk" : "Incoming Tickets"} ({sessions.length})
                </h3>
                <button
                  onClick={() => fetchSessions()}
                  className="text-[10px] font-bold text-farm-green hover:underline flex items-center gap-0.5"
                >
                  {isId ? "Segarkan" : "Refresh"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-farm-border/40">
                {isLoading && sessions.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse space-y-2">
                      <div className="h-4 bg-farm-border/30 rounded w-3/4" />
                      <div className="h-3 bg-farm-border/20 rounded w-1/2" />
                    </div>
                  ))
                ) : sessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-farm-text-light font-light">
                    {isId ? "Tidak ada sesi konsultasi." : "No consultation sessions found."}
                  </div>
                ) : (
                  sessions.map((sess: any) => {
                    const isSelected = selectedSession?.id === sess.id;
                    return (
                      <button
                        key={sess.id}
                        onClick={() => openMessages(sess)}
                        className={`w-full text-left p-4 hover:bg-farm-cream/60 transition-colors flex flex-col gap-2 ${
                          isSelected ? "bg-farm-green-light/40 border-l-4 border-farm-green" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 w-full">
                          <span className="font-serif text-sm font-bold text-farm-text truncate max-w-[140px] md:max-w-[170px]">
                            {sess.subject || sess.topic || `Session #${sess.id}`}
                          </span>
                          <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full uppercase shrink-0 ${getStatusColor(sess.status)}`}>
                            {sess.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-farm-text-light w-full">
                          <span>{sess.owner?.nama || `User #${sess.owner_id || ''}`}</span>
                          <span>{sess.created_at ? new Date(sess.created_at).toLocaleDateString() : ""}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right chat panel (8 cols on desktop) */}
            <div className="hidden md:flex flex-1 flex-col bg-white min-w-0">
              {selectedSession ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Chat header */}
                  <div className="p-4 bg-farm-cream border-b border-farm-border/60 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-farm-green-light border border-farm-green/10 flex items-center justify-center text-farm-green font-bold text-xs shrink-0">
                        U
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif text-sm font-bold text-farm-text truncate">
                          {selectedSession.subject || selectedSession.topic || `Session #${selectedSession.id}`}
                        </span>
                        <span className="text-[10px] text-farm-text-light">
                          {selectedSession.owner?.nama} • {selectedSession.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 border text-[9px] font-bold rounded-full uppercase ${getStatusColor(selectedSession.status)}`}>
                        {selectedSession.status}
                      </span>
                      {selectedSession.status !== "closed" && (
                        <button
                          onClick={() => handleClose(selectedSession.id)}
                          className="text-[10px] font-bold text-red-600 hover:underline px-2"
                        >
                          {isId ? "Tutup Sesi" : "Close Session"}
                        </button>
                      )}
                      {selectedSession.status === "closed" && (
                        <button
                          onClick={() => setSessionToDelete(selectedSession.id)}
                          className="text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors flex items-center gap-1 border border-transparent hover:border-red-200"
                          title={isId ? "Hapus Sesi" : "Delete Session"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          {isId ? "Hapus" : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages feed area */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-zinc-50/50">
                    {!Array.isArray(messages) || messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-60 min-h-[200px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 text-farm-text-light">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <span className="text-sm text-farm-text-light">{isId ? "Belum ada pesan." : "No messages yet."}</span>
                      </div>
                    ) : (
                      messages.map((m: any, idx: number) => {
                        const isAdmin = m.sender?.role === "admin";
                        return (
                          <div key={m.id || idx} className={`flex w-full animate-slide-up ${isAdmin ? "justify-end" : "justify-start"}`}>
                            <div className={`flex gap-3 max-w-[85%] ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                              {/* Avatar */}
                              <div className={`h-8 w-8 rounded-full border shadow-sm flex items-center justify-center shrink-0 font-bold text-xs text-white ${isAdmin ? "bg-farm-green border-farm-green" : "bg-farm-gold border-farm-gold"}`}>
                                {m.sender?.nama ? m.sender.nama.substring(0, 1).toUpperCase() : (isAdmin ? "A" : "U")}
                              </div>

                              <div className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                                <span className={`text-[9px] font-bold uppercase px-1 mb-1 ${isAdmin ? "text-farm-green" : "text-farm-gold"}`}>
                                  {m.sender?.nama || (isAdmin ? "Admin" : "User")} ({m.sender?.role || (isAdmin ? "Admin" : "Owner")})
                                </span>
                                
                                <div className={`px-4 py-3 text-sm shadow-sm ${
                                  isAdmin 
                                    ? "bg-gradient-to-br from-farm-green to-farm-green-hover text-white rounded-2xl rounded-tr-sm" 
                                    : "bg-white border border-farm-border text-farm-text rounded-2xl rounded-tl-sm"
                                }`}>
                                  <p className="whitespace-pre-wrap">{m.message}</p>
                                  
                                  {/* Attachment if exists */}
                                  {m.attachment && (
                                    <div className={`flex items-center gap-1.5 mt-2.5 pt-2 border-t text-[10px] font-bold ${
                                      isAdmin ? "border-white/20 text-white" : "border-farm-border/60 text-farm-green"
                                    }`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                      </svg>
                                      <a href={m.attachment} target="_blank" rel="noreferrer" className="hover:underline">
                                        Attachment
                                      </a>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] mt-1.5 px-1 font-medium text-farm-text-light/60">
                                  {m.created_at ? new Date(m.created_at).toLocaleTimeString(isId ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message input bar footer */}
                  <div className="p-4 border-t border-farm-border/60 bg-farm-cream shrink-0">
                    {selectedSession.status === "closed" ? (
                      <div className="bg-zinc-100 border border-zinc-200 p-3 rounded-lg text-center text-xs text-zinc-500 font-medium">
                        {isId ? "Sesi ini telah ditutup. Anda tidak dapat mengirim pesan lagi." : "This session is closed. You cannot send messages anymore."}
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isId ? "Tulis balasan..." : "Type a reply..."}
                          className="flex-1 p-3 border border-farm-border rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-farm-green resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleReply();
                            }
                          }}
                        />

                        <button
                          onClick={handleReply}
                          disabled={isSending || !replyText.trim()}
                          className="h-12 w-12 rounded-xl bg-farm-green text-white flex items-center justify-center hover:bg-farm-green-hover transition-colors disabled:opacity-50 shrink-0"
                        >
                          {isSending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-3 text-farm-text-light font-light">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-farm-gold">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs font-medium">
                    {isId ? "Pilih tiket di sebelah kiri untuk melihat pesan" : "Select a ticket from the left panel to view messages"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {sessionToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white border border-farm-border rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-serif font-bold text-farm-text text-xl mb-2">
                  {isId ? "Hapus Sesi Konsultasi?" : "Delete Consultation Session?"}
                </h3>
                <p className="text-sm text-farm-text-light">
                  {isId 
                    ? "Tindakan ini tidak dapat dibatalkan. Semua riwayat percakapan beserta lampiran dalam sesi ini akan terhapus permanen." 
                    : "This action cannot be undone. All chat history and attachments in this session will be permanently deleted."}
                </p>
              </div>
              
              <div className="p-4 border-t border-farm-border bg-farm-cream flex gap-3">
                <button
                  onClick={() => setSessionToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 h-11 bg-white border border-farm-border rounded-xl text-sm font-semibold text-farm-text hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  {isId ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-11 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    isId ? "Ya, Hapus Sesi" : "Yes, Delete Session"
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
