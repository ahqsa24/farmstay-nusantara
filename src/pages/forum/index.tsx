import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { forumService } from "@/services/forumService";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { ForumStory } from "@/types/forum";

export default function ForumPage() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  // Forum states
  const [stories, setStories] = useState<ForumStory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"public" | "mine">("public");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const labels = {
    id: {
      title: "Forum Berbagi Cerita",
      subtitle: "Bagikan pengalaman agrowisata berkelanjutan Anda atau dapatkan inspirasi dari pengelola lain",
      writeBtn: "Tulis Cerita Baru",
      searchPlaceholder: "Cari cerita komunitas...",
      tabPublic: "Cerita Publik",
      tabMine: "Cerita Saya",
      noStories: "Belum ada cerita yang dibagikan.",
      readMore: "Baca Selengkapnya",
      authorLabel: "Oleh",
      statusDraft: "Draf",
      statusPending: "Menunggu Persetujuan",
      statusApproved: "Disetujui",
      statusRejected: "Ditolak",
      rejectionReason: "Alasan penolakan:",
      prevPage: "Sebelumnya",
      nextPage: "Berikutnya",
    },
    en: {
      title: "Community Stories Forum",
      subtitle: "Share your sustainable agritourism experiences or get inspired by other farm owners",
      writeBtn: "Write a New Story",
      searchPlaceholder: "Search stories...",
      tabPublic: "Public Feed",
      tabMine: "My Stories",
      noStories: "No stories shared yet.",
      readMore: "Read Full Story",
      authorLabel: "By",
      statusDraft: "Draft",
      statusPending: "Pending Review",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      rejectionReason: "Rejection reason:",
      prevPage: "Previous",
      nextPage: "Next",
    },
  }[locale === "id" ? "id" : "en"];

  // Fetch stories feed
  const fetchStories = async (resetPage = false) => {
    setIsLoading(true);
    setErrorMsg("");
    const targetPage = resetPage ? 1 : page;
    try {
      let response;
      if (activeTab === "public") {
        response = await forumService.getStories(targetPage, 6, searchQuery);
      } else {
        response = await forumService.getMyStories(targetPage, 6);
      }

      if (response.status === "success" && response.data) {
        setStories(response.data);
        setHasMore(response.data.length === 6);
        if (resetPage) setPage(1);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(true);
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStories(true);
  };

  const handleNextPage = () => {
    if (hasMore) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  useEffect(() => {
    fetchStories(false);
  }, [page]);

  const getStoryStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case "pending":
        return "bg-purple-50 text-purple-800 border border-purple-200";
      case "rejected":
        return "bg-red-50 text-red-800 border border-red-200";
      default:
        return "bg-zinc-50 text-zinc-600 border border-zinc-200";
    }
  };

  const getStoryStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return labels.statusApproved;
      case "pending":
        return labels.statusPending;
      case "rejected":
        return labels.statusRejected;
      default:
        return labels.statusDraft;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-farm-border/60 pb-5 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-farm-text">{labels.title}</h1>
            <p className="text-sm text-farm-text-light mt-1 font-light">{labels.subtitle}</p>
          </div>

          <Link
            href="/forum/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-farm-green px-5 text-xs font-semibold text-white hover:bg-farm-green-hover shadow transition-colors shrink-0 gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            {labels.writeBtn}
          </Link>
        </div>

        {/* Search and Tabs Controller */}
        <div className="bg-white border border-farm-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Feed switch tabs */}
            <div className="flex border border-farm-border rounded-lg p-0.5 bg-farm-cream w-fit shrink-0">
              <button
                onClick={() => { setActiveTab("public"); setSearchQuery(""); }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "public" ? "bg-farm-green text-white shadow" : "text-farm-text/60"
                }`}
              >
                {labels.tabPublic}
              </button>
              <button
                onClick={() => { setActiveTab("mine"); setSearchQuery(""); }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "mine" ? "bg-farm-green text-white shadow" : "text-farm-text/60"
                }`}
              >
                {labels.tabMine}
              </button>
            </div>

            {/* Inline search bar (only for public feed) */}
            {activeTab === "public" && (
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="flex-1 px-4 h-10 border border-farm-border rounded-xl bg-farm-cream text-xs focus:outline-none focus:ring-1 focus:ring-farm-green"
                />
                <button
                  type="submit"
                  className="h-10 bg-farm-green text-white font-semibold px-4 rounded-xl hover:bg-farm-green-hover transition-colors text-xs shadow-sm shrink-0"
                >
                  Cari
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Stories list rendering */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-farm-border rounded-2xl h-[320px] animate-pulse p-5 space-y-4">
                <div className="h-40 bg-farm-border/30 rounded-xl" />
                <div className="h-6 w-3/4 bg-farm-border/30 rounded" />
                <div className="h-4 w-1/2 bg-farm-border/20 rounded" />
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white border border-farm-border rounded-2xl p-16 text-center text-sm text-farm-text-light font-light shadow-sm">
            {labels.noStories}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-farm-border hover:border-farm-green rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all group"
              >
                {/* Cover photo */}
                <div className="h-44 bg-zinc-100 relative overflow-hidden shrink-0 border-b border-farm-border/40">
                  {story.image_url ? (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-farm-green-light/40 text-farm-green">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.008-.008a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Status badge in "My stories" */}
                  {activeTab === "mine" && (
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shadow-sm ${getStoryStatusBadgeColor(story.status)}`}>
                      {getStoryStatusLabel(story.status)}
                    </span>
                  )}
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-farm-gold uppercase tracking-wider block">
                      {labels.authorLabel} {story.author_name}
                    </span>
                    <h4 className="font-serif text-base font-bold text-farm-text line-clamp-2 leading-snug group-hover:text-farm-green transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-xs text-farm-text-light font-light line-clamp-3 leading-relaxed">
                      {story.content}
                    </p>
                  </div>

                  {/* Rejection notice details */}
                  {activeTab === "mine" && story.status === "rejected" && story.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-800 leading-normal">
                      <span className="font-bold">{labels.rejectionReason}</span> {story.rejection_reason}
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-farm-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-farm-text-light font-light">
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>

                    {/* Go to details */}
                    <Link
                      href={`/forum/${story.id}`}
                      className="text-xs font-bold text-farm-green hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      {labels.readMore} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {stories.length > 0 && (
          <div className="flex justify-between items-center border-t border-farm-border/60 pt-5">
            <button
              onClick={handlePrevPage}
              disabled={page === 1 || isLoading}
              className="px-4 h-9 rounded-lg border border-farm-border text-xs font-semibold text-farm-text bg-white hover:bg-farm-cream disabled:opacity-50 transition-colors"
            >
              ← {labels.prevPage}
            </button>
            <span className="text-xs font-bold text-farm-text-light">
              Page {page}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || isLoading}
              className="px-4 h-9 rounded-lg border border-farm-border text-xs font-semibold text-farm-text bg-white hover:bg-farm-cream disabled:opacity-50 transition-colors"
            >
              {labels.nextPage} →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
