import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function GuidePage() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setActiveAccordion(activeAccordion === idx ? null : idx);
  };

  const isOwner = user?.role === "owner";

  // Guide texts translation mapping
  const texts = {
    id: {
      title: "Panduan Penggunaan Website",
      subtitle: `Petunjuk langkah-demi-langkah penggunaan platform Farmstay Hub untuk role ${
        isOwner ? "Owner (Pengelola)" : "Visitor (Pengunjung)"
      }`,
      ownerSteps: [
        {
          title: "1. Mengatur Profil & Data Akomodasi",
          content:
            "Langkah awal adalah mengisi data profil lengkap Anda dan akomodasi agrowisata yang dikelola melalui halaman Pengaturan Akun. Masukkan data tipe akomodasi, kapasitas kamar, jumlah tempat tidur, serta risiko kebencanaan alam dan status kawasan khusus. Informasi ini penting sebagai basis standardisasi pariwisata berkelanjutan.",
        },
        {
          title: "2. Mengisi Penilaian Mandiri (Self-Assessment)",
          content:
            "Masuk ke halaman 'Penilaian Mandiri' untuk menjawab kuesioner keberlanjutan yang terbagi dalam 4 pilar utama. Setiap kali Anda memilih opsi jawaban, sistem akan menyimpan kemajuan Anda secara otomatis (Autosave). Setelah semua kriteria terjawab, klik tombol kirim di bagian bawah halaman untuk memunculkan analisis dan Ringkasan Skor Kesiapan Sertifikasi Anda.",
        },
        {
          title: "3. Melengkapi Bukti Kepatuhan (Standard Compliance)",
          content:
            "Pada halaman 'Kepatuhan Standard', Anda akan menemukan kriteria kepatuhan detail. Anda dapat mengunduh 'Dokumen Contoh' sebagai referensi standar bukti. Unggah bukti dokumen pendukung Anda (berupa file PDF/Gambar atau menyematkan tautan link URL luar) untuk ditinjau oleh tim konsultan dan administrator.",
        },
        {
          title: "4. Melakukan Konsultasi dengan Ahli",
          content:
            "Jika Anda mengalami kesulitan dalam melengkapi standar bukti keberlanjutan atau ingin mendaftar sertifikasi lanjutan, Anda dapat membuat tiket konsultasi di halaman 'Konsultasi Ahli'. Anda bisa berdiskusi langsung secara live chat dengan konsultan kami dan menyertakan lampiran berkas pendukung.",
        },
      ],
      visitorSteps: [
        {
          title: "1. Menjelajah Destinasi Agrowisata (Explore)",
          content:
            "Di halaman utama Dashboard (Explore), Anda dapat melihat rangkuman berita terbaru, direktori farmstay terverifikasi, dan konten komunitas. Gunakan menu ini sebagai gerbang awal untuk menemukan akomodasi pedesaan ramah lingkungan terbaik di Indonesia.",
        },
        {
          title: "2. Membaca & Menulis Cerita Komunitas (Forum)",
          content:
            "Kunjungi halaman 'Cerita Komunitas' untuk membaca cerita dan pengalaman menginap dari sesama pelancong. Anda juga dapat berkontribusi dengan menulis cerita Anda sendiri, menyertakan foto sampul, dan membagikan tips pariwisata ramah lingkungan. Setiap cerita baru akan melalui proses moderasi admin terlebih dahulu sebelum diterbitkan.",
        },
        {
          title: "3. Mengakses Pusat Pembelajaran (Resources)",
          content:
            "Pada halaman 'Materi & Dokumen', Anda dapat menjelajahi artikel edukasi, video tutorial, serta dokumen panduan pariwisata hijau secara gratis. Gunakan filter tab untuk mempermudah pencarian berkas berdasarkan format dokumen yang Anda butuhkan.",
        },
      ],
      commonTip: "Tips Keamanan",
      commonTipContent:
        "Jaga selalu kerahasiaan kata sandi akun Anda. Anda dapat memperbarui kata sandi secara berkala di halaman Pengaturan Akun pada tab 'Ganti Password'.",
    },
    en: {
      title: "Website User Guide",
      subtitle: `Step-by-step instructions on how to use Farmstay Hub for ${
        isOwner ? "Owner (Manager)" : "Visitor (Traveler)"
      } role`,
      ownerSteps: [
        {
          title: "1. Setting Up Profile & Accommodation Data",
          content:
            "Your first step is to complete your personal profile and accommodation details in the Account Settings page. Input your accommodation type, total rooms, beds, natural disaster risks, and special zone status. This information is vital for sustainable tourism classification.",
        },
        {
          title: "2. Filling the Self-Assessment Questionnaire",
          content:
            "Navigate to the 'Assessments' page to answer sustainability questions across 4 main pillars. Your progress is saved automatically (Autosave) every time you click an option. Once all questions in a criteria are completed, submit the batch to calculate and view your Certification Readiness Level.",
        },
        {
          title: "3. Submitting Compliance Evidence",
          content:
            "In the 'Compliance' section, view specific compliance criteria. You can preview 'Example Documents' for reference. Submit your verification files (PDFs/Images or external web links) for each indicator. Once sent, our team will review your evidence.",
        },
        {
          title: "4. Live Chat Consultation",
          content:
            "If you need guidelines or want to request official green certification, open a new ticket in the 'Consultation' section. You can directly chat with our sustainability experts and upload attachments for real-time review.",
        },
      ],
      visitorSteps: [
        {
          title: "1. Explore Farmstay Destinations",
          content:
            "On the Explore homepage, browse curated local and global agritourism destinations. Find eco-friendly farm stays, organic farms, and countryside lodges that practice real sustainability.",
        },
        {
          title: "2. Community Forum Stories",
          content:
            "Go to 'Forum Stories' to read verified reviews and countryside diaries from other eco-travelers. You can also write your own organic farm experience, upload cover photos, and gather likes. All stories are moderated by administrators before public publication.",
        },
        {
          title: "3. Learning Resources Hub",
          content:
            "Access standard documents, video guides, and articles under the 'Resources' page. Filter guides by type (PDF, Video, etc.) to learn how to support local farming and rural communities.",
        },
      ],
      commonTip: "Security Tips",
      commonTipContent:
        "Keep your account password secure. You can update your credentials regularly under the 'Change Password' sub-tab in Account Settings.",
    },
  }[locale === "id" ? "id" : "en"];

  const steps = isOwner ? texts.ownerSteps : texts.visitorSteps;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header Title */}
        <div className="border-b border-farm-border/60 pb-5">
          <Link href="/dashboard" className="text-xs font-bold text-farm-green hover:underline">
            ← {locale === "id" ? "Kembali ke Dashboard" : "Back to Dashboard"}
          </Link>
          <h1 className="font-serif text-3xl font-bold mt-2 text-farm-text">
            {texts.title}
          </h1>
          <p className="text-sm text-farm-text-light mt-1 font-light">
            {texts.subtitle}
          </p>
        </div>

        {/* Accordion Steps List */}
        <div className="bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden divide-y divide-farm-border">
          {steps.map((step, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <div key={idx} className="flex flex-col">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="flex items-center justify-between p-5 text-left font-serif font-bold text-sm sm:text-base text-farm-text hover:bg-farm-cream/50 transition-colors w-full"
                >
                  <span>{step.title}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-4.5 h-4.5 text-farm-text-light transition-transform ${
                      isOpen ? "transform rotate-180" : ""
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="bg-farm-cream/35 px-6 pb-6 pt-1 text-xs sm:text-sm text-farm-text-light leading-relaxed font-light">
                    {step.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Premium Tips Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4 items-start shadow-sm">
          <div className="h-10 w-10 bg-amber-100 border border-amber-300 rounded-lg flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-xs sm:text-sm font-bold text-amber-850">
              {texts.commonTip}
            </h4>
            <p className="text-xs text-amber-900/80 leading-relaxed font-light">
              {texts.commonTipContent}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
