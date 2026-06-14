import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { resourceService } from "@/services/resourceService";
import { useTranslation } from "@/hooks/useTranslation";
import { Resource, ResourceType } from "@/types/resources";

export default function ResourcesPage() {
  const { t, locale } = useTranslation();

  // Core resource states
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ResourceType | "">("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Selected item for Modal viewer
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const labels = {
    id: {
      title: "Materi & Dokumen Edukasi",
      subtitle: "Perpustakaan panduan resmi, video tutorial, dan modul pembelajaran agrowisata",
      searchPlaceholder: "Cari judul panduan atau kata kunci...",
      filterAll: "Semua Materi",
      filterDocument: "Panduan PDF",
      filterVideo: "Video Tutorial",
      filterArticle: "Artikel Praktis",
      btnViewDoc: "Buka Panduan",
      btnPlayVideo: "Putar Video",
      btnReadArticle: "Baca Artikel",
      noResources: "Materi tidak ditemukan.",
      close: "Tutup",
      documentViewer: "Pratinjau Dokumen",
      videoViewer: "Pemutar Video",
      articleViewer: "Pembaca Artikel",
      prevPage: "Sebelumnya",
      nextPage: "Berikutnya",
    },
    en: {
      title: "Educational Resources",
      subtitle: "Official guidelines, video tutorials, and agritourism learning modules",
      searchPlaceholder: "Search guides by title or keyword...",
      filterAll: "All Material",
      filterDocument: "PDF Guides",
      filterVideo: "Video Tutorials",
      filterArticle: "Practical Articles",
      btnViewDoc: "Open Guide",
      btnPlayVideo: "Play Video",
      btnReadArticle: "Read Article",
      noResources: "No resources found.",
      close: "Close",
      documentViewer: "Document Preview",
      videoViewer: "Video Player",
      articleViewer: "Article Reader",
      prevPage: "Previous",
      nextPage: "Next",
    },
  }[locale === "id" ? "id" : "en"];

  // Fetch resources list
  const fetchResources = async (resetPage = false) => {
    setIsLoading(true);
    setErrorMsg("");
    const targetPage = resetPage ? 1 : page;
    try {
      const response = await resourceService.getResources(
        targetPage,
        8,
        searchQuery,
        selectedType
      );

      if (response.status === "success" && response.data) {
        setResources(response.data);
        // If length is less than limit (8), we don't have more pages
        setHasMore(response.data.length === 8);
        if (resetPage) setPage(1);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(true);
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(true);
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  useEffect(() => {
    fetchResources(false);
  }, [page]);

  // Helper to convert regular YouTube links to embeddable links
  const getEmbeddableVideoUrl = (url: string | null) => {
    if (!url) return "";
    let videoId = "";
    
    // Check for standard youtube watch URL
    if (url.includes("youtube.com/watch")) {
      const parts = url.split("v=");
      if (parts.length > 1) {
        videoId = parts[1].split("&")[0];
      }
    }
    // Check for short youtube share URL (youtu.be)
    else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      if (parts.length > 1) {
        videoId = parts[1].split("?")[0];
      }
    }
    // Check for youtube embed URL
    else if (url.includes("youtube.com/embed/")) {
      return url;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // Return as fallback
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header Title */}
        <div className="border-b border-farm-border/60 pb-5">
          <h1 className="font-serif text-3xl font-bold text-farm-text">{labels.title}</h1>
          <p className="text-sm text-farm-text-light mt-1 font-light">{labels.subtitle}</p>
        </div>

        {/* Search and Filter Panel */}
        <div className="bg-white border border-farm-border rounded-2xl p-5 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="flex-1 px-4 h-11 border border-farm-border rounded-xl bg-farm-cream text-sm focus:outline-none focus:ring-1 focus:ring-farm-green"
            />
            <button
              type="submit"
              className="h-11 bg-farm-green text-white font-semibold px-6 rounded-xl hover:bg-farm-green-hover transition-colors text-sm shadow-sm"
            >
              Cari
            </button>
          </form>

          {/* Filter Categories Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { type: "", name: labels.filterAll },
              { type: "document", name: labels.filterDocument },
              { type: "video", name: labels.filterVideo },
              { type: "article", name: labels.filterArticle },
            ].map((tab) => {
              const isSelected = selectedType === tab.type;
              return (
                <button
                  key={tab.type}
                  onClick={() => setSelectedType(tab.type as any)}
                  className={`px-4 h-9 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-farm-green border-farm-green text-white shadow-sm"
                      : "border-farm-border text-farm-text bg-farm-cream hover:border-farm-green"
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Grid List */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-farm-border rounded-2xl p-5 h-[240px] animate-pulse space-y-3">
                <div className="h-6 w-1/3 bg-farm-border/30 rounded" />
                <div className="h-12 w-full bg-farm-border/20 rounded" />
                <div className="h-8 w-1/2 bg-farm-border/30 rounded mt-auto" />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-farm-border rounded-2xl p-12 text-center text-sm text-farm-text-light font-light shadow-sm">
            {labels.noResources}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((item) => {
              const isDoc = item.resource_type === "document";
              const isVideo = item.resource_type === "video";
              const isArticle = item.resource_type === "article";
              
              let typeLabel = "";
              let icon = null;
              let btnLabel = "";
              
              if (isDoc) {
                typeLabel = labels.filterDocument;
                btnLabel = labels.btnViewDoc;
                icon = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                  </svg>
                );
              } else if (isVideo) {
                typeLabel = labels.filterVideo;
                btnLabel = labels.btnPlayVideo;
                icon = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                );
              } else {
                typeLabel = labels.filterArticle;
                btnLabel = labels.btnReadArticle;
                icon = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625A2.25 2.25 0 013.375 18V6.125c0-.621.504-1.125 1.125-1.125H9.75" />
                  </svg>
                );
              }

              return (
                <div
                  key={item.id}
                  className="bg-white border border-farm-border hover:border-farm-green rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-[220px] transition-all group"
                >
                  <div>
                    {/* Icon & Badge type */}
                    <div className="flex items-center gap-2 mb-3.5">
                      <div className="w-8 h-8 rounded-lg bg-farm-green-light border border-farm-green/10 flex items-center justify-center text-farm-green group-hover:bg-farm-green group-hover:text-white transition-colors shrink-0">
                        {icon}
                      </div>
                      <span className="text-[9px] font-bold text-farm-gold uppercase tracking-wider bg-farm-beige px-2 py-0.5 rounded-md">
                        {typeLabel}
                      </span>
                    </div>

                    <h4 className="font-serif text-sm font-bold text-farm-text line-clamp-2 leading-snug group-hover:text-farm-green transition-colors mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-xs text-farm-text-light font-light line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveResource(item)}
                    className="mt-4 h-8 inline-flex items-center justify-center rounded-lg bg-farm-green px-4 text-xs font-semibold text-white hover:bg-farm-green-hover transition-colors w-fit shadow-sm"
                  >
                    {btnLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination triggers */}
        {resources.length > 0 && (
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

      {/* Media Viewer Modal */}
      {activeResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white border border-farm-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
            {/* Modal Header */}
            <div className="bg-farm-cream border-b border-farm-border p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-farm-gold uppercase tracking-wider bg-farm-beige px-2 py-0.5 rounded">
                  {activeResource.resource_type}
                </span>
                <h3 className="font-serif font-bold text-farm-text truncate max-w-[500px]">
                  {activeResource.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveResource(null)}
                className="text-xs font-bold text-farm-text hover:text-red-700 bg-farm-border/40 hover:bg-farm-border/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                {labels.close}
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-zinc-50 overflow-y-auto p-6">
              {/* If Document */}
              {activeResource.resource_type === "document" && (
                activeResource.file_url ? (
                  <iframe
                    src={activeResource.file_url}
                    className="w-full h-full border-0 rounded-lg min-h-[500px]"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="text-center p-12 text-sm text-farm-text-light">Berkas panduan tidak tersedia.</div>
                )
              )}

              {/* If Video */}
              {activeResource.resource_type === "video" && (
                activeResource.video_url ? (
                  <div className="aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-farm-border shadow-sm">
                    <iframe
                      src={getEmbeddableVideoUrl(activeResource.video_url)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                      title="YouTube player"
                    />
                  </div>
                ) : (
                  <div className="text-center p-12 text-sm text-farm-text-light">Video tutorial tidak tersedia.</div>
                )
              )}

              {/* If Article */}
              {activeResource.resource_type === "article" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-sm text-farm-text-light italic border-l-4 border-farm-green pl-4 leading-relaxed font-light">
                    {activeResource.description}
                  </p>
                  <hr className="border-farm-border" />
                  <div
                    className="text-xs leading-relaxed text-farm-text whitespace-pre-wrap font-sans space-y-4"
                    dangerouslySetInnerHTML={{ __html: activeResource.content || "" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
