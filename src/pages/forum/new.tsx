import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { forumService } from "@/services/forumService";
import { useTranslation } from "@/hooks/useTranslation";

export default function NewStoryPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const labels = {
    id: {
      title: "Bagikan Kisah Anda",
      subtitle: "Tulis pengalaman, tantangan, atau inovasi pertanian berkelanjutan yang Anda jalankan",
      backLink: "← Kembali ke Forum",
      cardTitle: "Tulis Cerita Baru",
      labelStoryTitle: "Judul Cerita",
      placeholderTitle: "Masukkan judul cerita yang menarik...",
      labelStoryContent: "Konten / Isi Cerita",
      placeholderContent: "Tuliskan detail cerita Anda di sini. Ceritakan pengalaman, saran, atau kesuksesan yang Anda peroleh...",
      labelCoverFile: "Foto Cover Cerita",
      selectFileBtn: "Pilih Foto Cover",
      submitBtn: "Kirim Cerita ke Moderator",
      successNotice: "Cerita berhasil dikirim dan sedang menunggu persetujuan moderator!",
      promptFileSelect: "Seret foto ke sini atau klik tombol untuk memilih berkas",
      removeFile: "Hapus Foto",
    },
    en: {
      title: "Share Your Experience",
      subtitle: "Write down your agritourism experience, challenges, or green innovations",
      backLink: "← Back to Forum",
      cardTitle: "Write New Story",
      labelStoryTitle: "Story Title",
      placeholderTitle: "Enter an interesting story title...",
      labelStoryContent: "Story Content",
      placeholderContent: "Write your story details here. Share your experiences, tips, or agritourism achievements...",
      labelCoverFile: "Story Cover Image",
      selectFileBtn: "Select Cover Image",
      submitBtn: "Submit Story to Moderator",
      successNotice: "Story submitted successfully and is pending moderator review!",
      promptFileSelect: "Drag image here or click the button to select a file",
      removeFile: "Remove Photo",
    },
  }[locale === "id" ? "id" : "en"];

  const getErrorMessage = (err: any, fallback: string) => {
    const data = err.response?.data;
    if (data?.errors) {
      const details = Object.entries(data.errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
        .join("; ");
      return `${data.message || fallback} (${details})`;
    }
    return data?.message || fallback;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setCoverFile(null);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg(t.common.validationRequired);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (coverFile) {
        formData.append("image_file", coverFile);
        formData.append("file", coverFile);
      }

      const response = await forumService.createStory(formData);
      if (response.status === "success") {
        router.push("/forum?tab=mine");
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err, t.common.errorOccurred));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Title Back navigation */}
        <div>
          <Link href="/forum" className="text-xs font-bold text-farm-green hover:underline">
            {labels.backLink}
          </Link>
          <h1 className="font-serif text-3xl font-bold mt-2 text-farm-text">{labels.title}</h1>
          <p className="text-sm text-farm-text-light mt-1 font-light">{labels.subtitle}</p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white border border-farm-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Story Title */}
            <div>
              <label className="block text-xs font-semibold text-farm-text mb-1.5">
                {labels.labelStoryTitle} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={labels.placeholderTitle}
                className="block w-full px-4 h-11 border border-farm-border rounded-xl bg-farm-cream text-sm focus:outline-none focus:ring-1 focus:ring-farm-green"
              />
            </div>

            {/* Cover Image Picker with Preview option */}
            <div>
              <label className="block text-xs font-semibold text-farm-text mb-1.5">
                {labels.labelCoverFile}
              </label>
              
              {coverPreviewUrl ? (
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-farm-border shadow-sm mb-3">
                  <img src={coverPreviewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-3 right-3 bg-red-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg hover:bg-red-800 shadow transition-colors"
                  >
                    {labels.removeFile}
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-farm-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-farm-cream">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-farm-gold mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.008-.008a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <p className="text-xs text-farm-text-light font-light mb-3">
                    {labels.promptFileSelect}
                  </p>
                  <label className="inline-flex h-9 items-center justify-center rounded-lg border border-farm-border bg-white px-4 text-xs font-semibold text-farm-text hover:border-farm-green hover:text-farm-green transition-all cursor-pointer">
                    {labels.selectFileBtn}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Story Content */}
            <div>
              <label className="block text-xs font-semibold text-farm-text mb-1.5">
                {labels.labelStoryContent} *
              </label>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder={labels.placeholderContent}
                className="block w-full p-4 border border-farm-border rounded-xl bg-farm-cream text-sm focus:outline-none focus:ring-1 focus:ring-farm-green resize-y"
              />
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-farm-border/60 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-farm-green px-8 text-sm font-semibold text-white shadow hover:bg-farm-green-hover disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  labels.submitBtn
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
