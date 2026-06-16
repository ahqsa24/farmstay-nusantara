import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { consultationService } from "@/services/consultationService";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { ConsultationSession, ConsultationMessage } from "@/types/consultation";

export default function ConsultationPage() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  // Core consultation states
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ConsultationSession | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);

  // Form states
  const [newSubject, setNewSubject] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);

  // Reply states
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);

  // UI States
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const labels = {
    id: {
      title: "Konsultasi Ahli",
      subtitle: "Hubungi konsultan resmi kami untuk bimbingan langsung mengenai standard keberlanjutan",
      createBtn: "Buat Tiket Konsultasi",
      ticketListTitle: "Tiket Konsultasi",
      noSessions: "Belum ada sesi konsultasi.",
      selectPrompt: "Pilih tiket di sebelah kiri untuk mulai berkonsultasi",
      ticketStatusOpen: "Terbuka",
      ticketStatusProgress: "Sedang Berjalan",
      ticketStatusClosed: "Selesai",
      closedNotice: "Sesi ini telah ditutup. Anda tidak dapat mengirim pesan lagi.",
      messagePlaceholder: "Tulis pesan konsultasi Anda...",
      sendBtn: "Kirim",
      modalTitle: "Mulai Konsultasi Baru",
      subjectLabel: "Subjek / Topik Konsultasi",
      descriptionLabel: "Deskripsi Pertanyaan / Pesan Pertama",
      fileLabel: "Lampiran Tambahan (Optional)",
      submitTicketBtn: "Buka Tiket Sesi",
      cancelBtn: "Batal",
      noMessages: "Belum ada percakapan.",
      attachmentLabel: "Berkas Lampiran:",
      refreshBtn: "Segarkan",
    },
    en: {
      title: "Expert Consultation",
      subtitle: "Contact our official consultants for direct guidance regarding sustainability standards",
      createBtn: "New Consultation Ticket",
      ticketListTitle: "Consultation Tickets",
      noSessions: "No consultation sessions yet.",
      selectPrompt: "Select a ticket from the left panel to start chatting",
      ticketStatusOpen: "Open",
      ticketStatusProgress: "In Progress",
      ticketStatusClosed: "Closed",
      closedNotice: "This session is closed. You cannot send messages anymore.",
      messagePlaceholder: "Write your message here...",
      sendBtn: "Send",
      modalTitle: "Start New Consultation",
      subjectLabel: "Consultation Subject / Topic",
      descriptionLabel: "Description / Initial Message",
      fileLabel: "Supporting Attachment (Optional)",
      submitTicketBtn: "Create Ticket Session",
      cancelBtn: "Cancel",
      noMessages: "No messages yet.",
      attachmentLabel: "Attachment:",
      refreshBtn: "Refresh",
    },
  }[locale === "id" ? "id" : "en"];

  // Fetch all user session tickets
  const fetchSessions = async (autoSelectId?: number) => {
    setIsLoadingSessions(true);
    setErrorMsg("");
    try {
      const response = await consultationService.getSessions();
      if (response.status === "success" && response.data) {
        setSessions(response.data);
        
        // Auto-select or restore selection
        if (autoSelectId) {
          const matched = response.data.find(s => s.id === autoSelectId);
          if (matched) setSelectedSession(matched);
        } else if (selectedSession) {
          const updated = response.data.find(s => s.id === selectedSession.id);
          if (updated) setSelectedSession(updated);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Fetch messages in thread
  const fetchMessages = async (sessionId: number, showLoader = false) => {
    if (showLoader) setIsLoadingMessages(true);
    try {
      const response = await consultationService.getMessages(sessionId);
      if (response.status === "success" && response.data) {
        setMessages(response.data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      if (showLoader) setIsLoadingMessages(false);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchSessions();
  }, []);

  // Poll for messages in active session every 5 seconds
  useEffect(() => {
    if (!selectedSession) return;

    fetchMessages(selectedSession.id, true);

    const timer = setInterval(() => {
      fetchMessages(selectedSession.id, false);
    }, 5000);

    return () => clearInterval(timer);
  }, [selectedSession?.id]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create new session ticket
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessageText.trim()) {
      setErrorMsg(t.common.validationRequired);
      return;
    }

    setIsActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Use FormData to support files
      const formData = new FormData();
      formData.append("subject", newSubject);
      formData.append("message", newMessageText);
      if (newAttachmentFile) {
        formData.append("attachment_file", newAttachmentFile);
        formData.append("file", newAttachmentFile);
      }

      const response = await consultationService.createSession(formData);
      if (response.status === "success" && response.data) {
        setNewSubject("");
        setNewMessageText("");
        setNewAttachmentFile(null);
        setIsModalOpen(false);
        setSuccessMsg("Tiket konsultasi berhasil dibuat!");
        
        // Reload list and select new ticket
        const newTicketId = response.data.id;
        await fetchSessions(newTicketId);
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reply message
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    if (!replyText.trim() && !replyFile) return;

    setIsActionLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("message", replyText);
      if (replyFile) {
        formData.append("attachment_file", replyFile);
        formData.append("file", replyFile);
      }

      const response = await consultationService.sendMessage(selectedSession.id, formData);
      if (response.status === "success") {
        setReplyText("");
        setReplyFile(null);
        // Refresh messages instantly
        await fetchMessages(selectedSession.id, false);
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "in_progress":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "closed":
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      default:
        return "bg-zinc-50 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return labels.ticketStatusOpen;
      case "in_progress":
        return labels.ticketStatusProgress;
      case "closed":
        return labels.ticketStatusClosed;
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-8 h-[calc(100vh-140px)]">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-farm-border/60 pb-4 shrink-0 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-farm-text">{labels.title}</h1>
            <p className="text-sm text-farm-text-light mt-1 font-light">{labels.subtitle}</p>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-farm-green px-5 text-xs font-semibold text-white hover:bg-farm-green-hover shadow transition-colors shrink-0 gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.75-7.75h-15" />
            </svg>
            {labels.createBtn}
          </button>
        </div>

        {/* Banner Messages */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium shrink-0 flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-800 hover:text-black font-bold">×</button>
          </div>
        )}

        {/* Master layout panel */}
        <div className="flex-1 min-h-0 bg-white border border-farm-border rounded-2xl flex shadow-sm overflow-hidden">
          
          {/* Left panel list (4 cols on desktop) */}
          <div className="w-full md:w-80 border-r border-farm-border/60 flex flex-col shrink-0 bg-farm-cream/35">
            <div className="p-4 border-b border-farm-border/60 flex justify-between items-center bg-farm-cream">
              <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider">
                {labels.ticketListTitle} ({sessions.length})
              </h3>
              <button
                onClick={() => fetchSessions()}
                className="text-[10px] font-bold text-farm-green hover:underline flex items-center gap-0.5"
              >
                {labels.refreshBtn}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-farm-border/40">
              {isLoadingSessions && sessions.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-farm-border/30 rounded w-3/4" />
                    <div className="h-3 bg-farm-border/20 rounded w-1/2" />
                  </div>
                ))
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center text-xs text-farm-text-light font-light">
                  {labels.noSessions}
                </div>
              ) : (
                sessions.map((sess) => {
                  const isSelected = selectedSession?.id === sess.id;
                  return (
                    <button
                      key={sess.id}
                      onClick={() => {
                        setSelectedSession(sess);
                        setErrorMsg("");
                      }}
                      className={`w-full text-left p-4 hover:bg-farm-cream/60 transition-colors flex flex-col gap-2 ${
                        isSelected ? "bg-farm-green-light/40 border-l-4 border-farm-green" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <span className="font-serif text-sm font-bold text-farm-text truncate max-w-[140px] md:max-w-[170px]">
                          {sess.subject || sess.topic}
                        </span>
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full uppercase shrink-0 ${getStatusColor(sess.status)}`}>
                          {getStatusLabel(sess.status)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-farm-text-light w-full">
                        <span>Tiket #{sess.id}</span>
                        <span>{new Date(sess.created_at).toLocaleDateString()}</span>
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
                      C
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-serif text-sm font-bold text-farm-text truncate">
                        {selectedSession.subject || selectedSession.topic}
                      </span>
                      <span className="text-[10px] text-farm-text-light">
                        ID: #{selectedSession.id} • {getStatusLabel(selectedSession.status)}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 border text-[9px] font-bold rounded-full uppercase ${getStatusColor(selectedSession.status)}`}>
                    {getStatusLabel(selectedSession.status)}
                  </span>
                </div>

                {/* Messages feed area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent" />
                      <span className="text-xs text-farm-text-light">{t.common.loading}</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-farm-text-light font-light">
                      {labels.noMessages}
                    </div>
                  ) : (
                    messages.map((msg) => {
                      // Check if message is from the user (Sender roles matching or ID check)
                      const isMe = msg.sender_id === user?.id || msg.sender_role === user?.role;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}
                        >
                          <div className={`flex flex-col max-w-[70%] gap-1`}>
                            {/* Sender Info */}
                            {!isMe && (
                              <span className="text-[9px] font-bold text-farm-gold uppercase px-1">
                                {msg.sender_name} ({msg.sender_role})
                              </span>
                            )}
                            
                            {/* Bubble Card */}
                            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-farm-green text-white border-farm-green rounded-tr-none"
                                : "bg-white text-farm-text border-farm-border rounded-tl-none"
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.message}</p>
                              
                              {/* Attachment */}
                              {msg.attachment_url && (
                                <div className={`flex items-center gap-1.5 mt-2.5 pt-2 border-t text-[10px] font-bold ${
                                  isMe ? "border-white/20 text-white" : "border-farm-border/60 text-farm-green"
                                }`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                  </svg>
                                  <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="hover:underline">
                                    {labels.attachmentLabel} {msg.attachment_url.split("/").pop()}
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Timestamp */}
                            <span className={`text-[9px] text-farm-text-light px-1 ${isMe ? "text-right" : "text-left"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input bar footer */}
                <div className="p-4 border-t border-farm-border/60 bg-farm-cream shrink-0">
                  {selectedSession.status === "closed" ? (
                    <div className="bg-zinc-100 border border-zinc-200 p-3 rounded-lg text-center text-xs text-zinc-500 font-medium">
                      {labels.closedNotice}
                    </div>
                  ) : (
                    <form onSubmit={handleSendReply} className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={labels.messagePlaceholder}
                          className="flex-1 p-3 border border-farm-border rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-farm-green resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(e);
                            }
                          }}
                        />

                        <button
                          type="submit"
                          disabled={isActionLoading || (!replyText.trim() && !replyFile)}
                          className="h-12 w-12 rounded-xl bg-farm-green text-white flex items-center justify-center hover:bg-farm-green-hover transition-colors disabled:opacity-50 shrink-0"
                        >
                          {isActionLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* File Clip Attachment */}
                      <div className="flex items-center gap-3">
                        <label className="inline-flex h-8 items-center justify-center rounded-lg border border-farm-border bg-white px-3 text-[10px] font-bold text-farm-text hover:border-farm-green transition-all cursor-pointer">
                          📎 Attachment File
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setReplyFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        <span className="text-[10px] text-farm-text-light truncate max-w-xs">
                          {replyFile ? replyFile.name : ""}
                        </span>
                        {replyFile && (
                          <button
                            type="button"
                            onClick={() => setReplyFile(null)}
                            className="text-red-700 font-bold text-[11px] hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-3 text-farm-text-light font-light">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-farm-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium">{labels.selectPrompt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Ticket Creation Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-farm-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-farm-cream border-b border-farm-border p-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-farm-text text-base">{labels.modalTitle}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-farm-text-light hover:text-black font-extrabold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-farm-text uppercase mb-1">
                  {labels.subjectLabel} *
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  placeholder="Contoh: Integrasi Permakultur / Perbaikan CHSE"
                  className="block w-full px-4 h-10 border border-farm-border rounded-lg bg-farm-cream text-xs focus:outline-none focus:ring-1 focus:ring-farm-green"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-farm-text uppercase mb-1">
                  {labels.descriptionLabel} *
                </label>
                <textarea
                  rows={4}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  required
                  placeholder="Tuliskan pertanyaan awal atau detail kendala yang ingin dikonsultasikan..."
                  className="block w-full p-3 border border-farm-border rounded-lg bg-farm-cream text-xs focus:outline-none focus:ring-1 focus:ring-farm-green resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-farm-text uppercase mb-1">
                  {labels.fileLabel}
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex h-9 items-center justify-center rounded-lg border border-farm-border bg-farm-cream px-4 text-xs font-semibold text-farm-text hover:bg-white hover:border-farm-green transition-all cursor-pointer">
                    Pilih File Lampiran
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setNewAttachmentFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <span className="text-xs text-farm-text-light truncate max-w-[200px]">
                    {newAttachmentFile ? newAttachmentFile.name : "Belum ada berkas"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-farm-border/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-farm-border bg-white px-5 text-xs font-semibold text-farm-text hover:bg-farm-cream transition-colors"
                >
                  {labels.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-farm-green px-5 text-xs font-semibold text-white hover:bg-farm-green-hover disabled:opacity-50 transition-colors shadow"
                >
                  {isActionLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    labels.submitTicketBtn
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
