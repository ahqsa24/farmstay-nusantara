import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { forumService } from "@/services/forumService";
import { useTranslation } from "@/hooks/useTranslation";
import { ForumStory } from "@/types/forum";

export default function StoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t, locale } = useTranslation();

  // Core details states
  const [story, setStory] = useState<ForumStory | null>(null);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const labels = {
    id: {
      backLink: "← Kembali ke Forum",
      authorPrefix: "Dipublikasikan oleh",
      datePrefix: "pada tanggal",
      loading: "Memuat detail cerita...",
      errorNotFound: "Cerita tidak ditemukan.",
    },
    en: {
      backLink: "← Back to Forum",
      authorPrefix: "Published by",
      datePrefix: "on",
      loading: "Loading story details...",
      errorNotFound: "Story not found.",
    },
  }[locale === "id" ? "id" : "en"];

  const fetchStoryDetails = async (storyId: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await forumService.getStoryDetail(storyId);
      if (response.status === "success" && response.data) {
        setStory(response.data);
      } else {
        setErrorMsg(labels.errorNotFound);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStoryDetails(id as string);
    }
  }, [id]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link href="/forum" className="text-xs font-bold text-farm-green hover:underline">
            {labels.backLink}
          </Link>
        </div>

        {/* Story details layout */}
        {isLoading ? (
          <div className="bg-white border border-farm-border rounded-2xl p-16 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-farm-green border-t-transparent" />
            <span className="text-xs text-farm-text-light">{labels.loading}</span>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50/50 border border-red-200 rounded-2xl p-16 text-center text-sm text-red-800 shadow-sm font-semibold">
            {errorMsg}
          </div>
        ) : story ? (
          <article className="bg-white border border-farm-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {/* Story Header Title area */}
            <div className="p-6 sm:p-8 bg-farm-cream border-b border-farm-border flex flex-col gap-3">
              <span className="text-[9px] font-bold text-farm-gold uppercase tracking-wider bg-farm-beige px-2.5 py-1 rounded w-fit">
                Community Story
              </span>
              
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-farm-text leading-tight">
                {story.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-farm-text-light font-light mt-1">
                <span>
                  {labels.authorPrefix} <span className="font-semibold text-farm-text">{story.author_name}</span>
                </span>
                <span>•</span>
                <span>
                  {labels.datePrefix} {new Date(story.created_at).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Story cover image */}
            {story.image_url && (
              <div className="h-64 sm:h-96 w-full bg-zinc-100 border-b border-farm-border">
                <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Story narrative text */}
            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-sm sm:text-base leading-relaxed text-farm-text whitespace-pre-wrap font-sans">
                {story.content}
              </p>
            </div>
          </article>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
