import React, { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";
import chatbotService from "@/services/chatbotService";
import { ChatbotConfig } from "@/types/chatbot";

const defaultForm = {
  isEnabled: false,
  whatsappNumber: "",
  welcomeTitle: "Halo, ada yang bisa saya bantu?",
  welcomeMessage: "Saya bisa menjawab pertanyaan singkat berdasarkan panduan dan FAQ yang tersedia.",
  fallbackMessage: "Saya belum menemukan jawaban yang pas. Silakan hubungi narahubung WhatsApp kami.",
};

export default function AdminChatbotPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const response = await chatbotService.adminGetConfig();
        if (response.status === "success" && response.data) {
          setConfig(response.data);
          setFormData({
            isEnabled: response.data.isEnabled,
            whatsappNumber: response.data.whatsappNumber,
            welcomeTitle: response.data.welcomeTitle,
            welcomeMessage: response.data.welcomeMessage,
            fallbackMessage: response.data.fallbackMessage,
          });
        }
      } catch (error) {
        console.error("Failed to load chatbot config:", error);
        showToast(isId ? "Gagal memuat konfigurasi chatbot." : "Failed to load chatbot config.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [isId, showToast]);

  const updateField = (field: keyof typeof defaultForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await chatbotService.adminUpdateConfig({
        isEnabled: formData.isEnabled,
        whatsappNumber: formData.whatsappNumber,
        welcomeTitle: formData.welcomeTitle,
        welcomeMessage: formData.welcomeMessage,
        fallbackMessage: formData.fallbackMessage,
      });

      if (response.status === "success" && response.data) {
        setConfig(response.data);
        showToast(isId ? "Konfigurasi chatbot tersimpan." : "Chatbot configuration saved.", "success");
      }
    } catch (error) {
      console.error("Failed to save chatbot config:", error);
      showToast(isId ? "Gagal menyimpan konfigurasi chatbot." : "Failed to save chatbot config.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const previewNumber = formData.whatsappNumber.trim();

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Kelola Chatbot — Farmstay Nusantara" : "Manage Chatbot — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6 max-w-5xl">
          <div>
            <h1 className="font-serif text-2xl font-bold text-farm-text">{isId ? "Kelola Chatbot" : "Manage Chatbot"}</h1>
            <p className="mt-1 text-sm font-light text-farm-text-light">
              {isId
                ? "Chatbot ini tidak memakai LLM atau API key. Jawaban diambil dari konten Guide & FAQ dan fallback WhatsApp."
                : "This chatbot does not use an LLM or API key. Responses are powered by Guide & FAQ content with a WhatsApp fallback."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-farm-green border-t-transparent"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-farm-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-farm-border pb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-farm-text">{isId ? "Pengaturan Utama" : "Main Settings"}</h2>
                    <p className="mt-1 text-xs text-farm-text-light">{isId ? "Atur status tampil, salam pembuka, dan narahubung." : "Configure visibility, greeting, and contact fallback."}</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-farm-border px-4 py-2 hover:bg-farm-cream transition-colors">
                    <span className="text-xs font-semibold text-farm-text-light">{isId ? "Tampil" : "Visible"}</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isEnabled}
                        onChange={(e) => updateField("isEnabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-farm-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-farm-green"></div>
                    </div>
                  </label>
                </div>

                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-farm-text-light">{isId ? "Nomor WhatsApp" : "WhatsApp Number"}</label>
                    <input
                      value={formData.whatsappNumber}
                      onChange={(e) => updateField("whatsappNumber", e.target.value)}
                      placeholder={isId ? "+62 812-xxxx-xxxx" : "+62 812-xxxx-xxxx"}
                      className="h-11 w-full rounded-xl border border-farm-border bg-white px-4 text-sm text-farm-text outline-none transition-colors focus:border-farm-green"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-farm-text-light">{isId ? "Judul Salam" : "Greeting Title"}</label>
                    <input
                      value={formData.welcomeTitle}
                      onChange={(e) => updateField("welcomeTitle", e.target.value)}
                      className="h-11 w-full rounded-xl border border-farm-border bg-white px-4 text-sm text-farm-text outline-none transition-colors focus:border-farm-green"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-farm-text-light">{isId ? "Pesan Pembuka" : "Welcome Message"}</label>
                    <textarea
                      rows={4}
                      value={formData.welcomeMessage}
                      onChange={(e) => updateField("welcomeMessage", e.target.value)}
                      className="w-full rounded-xl border border-farm-border bg-white px-4 py-3 text-sm text-farm-text outline-none transition-colors focus:border-farm-green"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-farm-text-light">{isId ? "Pesan Fallback" : "Fallback Message"}</label>
                    <textarea
                      rows={4}
                      value={formData.fallbackMessage}
                      onChange={(e) => updateField("fallbackMessage", e.target.value)}
                      className="w-full rounded-xl border border-farm-border bg-white px-4 py-3 text-sm text-farm-text outline-none transition-colors focus:border-farm-green"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-farm-green px-5 text-sm font-bold text-white transition-colors hover:bg-farm-green-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan Perubahan" : "Save Changes")}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-farm-border bg-[#122A23] p-6 text-white shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">Preview</p>
                  <h3 className="mt-2 font-serif text-xl font-bold">{formData.welcomeTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{formData.welcomeMessage}</p>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <p className="font-semibold text-white">{isId ? "Aksi cepat" : "Quick action"}</p>
                    <p className="mt-1 text-white/70">{isId ? "Jika pertanyaan tidak cocok, chatbot akan mengirim narahubung WhatsApp." : "If no answer matches, the chatbot sends the WhatsApp contact."}</p>
                    <p className="mt-2 text-amber-300 break-all">{previewNumber || (isId ? "Nomor belum diisi" : "Number not set yet")}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-farm-border bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-farm-text">{isId ? "Catatan" : "Notes"}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-farm-text-light">
                    <li>• {isId ? "Jawaban diambil dari data Guide & FAQ aktif." : "Responses are derived from active Guide & FAQ data."}</li>
                    <li>• {isId ? "Kata kunci kontak akan langsung mengarahkan ke WhatsApp." : "Contact keywords go straight to WhatsApp."}</li>
                    <li>• {isId ? "Jika chatbot dimatikan, tombol chatbot tidak tampil." : "When disabled, the chatbot button is hidden."}</li>
                  </ul>
                </div>

                {config && (
                  <div className="rounded-2xl border border-farm-border bg-farm-beige/40 p-6 text-sm text-farm-text-light shadow-sm">
                    <p className="font-semibold text-farm-text">{isId ? "Status Tersimpan" : "Saved Status"}</p>
                    <p className="mt-2">
                      {isId ? "Terakhir disimpan sebagai" : "Last saved as"} {config.isEnabled ? "aktif" : "nonaktif"}.
                    </p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}