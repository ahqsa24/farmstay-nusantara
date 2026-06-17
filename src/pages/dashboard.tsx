import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { complianceService } from "@/services/complianceService";
import { assessmentService } from "@/services/assessmentService";
import { adminService } from "@/services/adminService";
import { consultationService } from "@/services/consultationService";
import { forumService } from "@/services/forumService";
import { farmstayService } from "@/services/farmstayService";
import { useTranslation } from "@/hooks/useTranslation";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isId = locale === "id";

  const [greeting, setGreeting] = useState(isId ? "Selamat Pagi" : "Good Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    let g = "";
    if (hour >= 4 && hour < 11) {
      g = isId ? "Selamat Pagi" : "Good Morning";
    } else if (hour >= 11 && hour < 15) {
      g = isId ? "Selamat Siang" : "Good Afternoon";
    } else if (hour >= 15 && hour < 18) {
      g = isId ? "Selamat Sore" : "Good Afternoon";
    } else {
      g = isId ? "Selamat Malam" : "Good Evening";
    }
    setGreeting(g);
  }, [locale]);

  // Metrics states
  const [complianceProgress, setComplianceProgress] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentReadiness, setAssessmentReadiness] = useState("");
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Checklist items state for Owner Dashboard
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: false,
    1: true,
    2: false,
  });

  // Admin metrics states
  const [adminMetrics, setAdminMetrics] = useState({
    totalUsers: 0,
    totalFarmstays: 0,
    pendingConsultations: 0,
    pendingStories: 0,
  });
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Fetch actual metrics for Owner on mount
  useEffect(() => {
    if (user?.role === "owner") {
      const fetchMetrics = async () => {
        setIsLoadingMetrics(true);
        try {
          // 1. Fetch compliance progress
          const complianceResponse = await complianceService.getPillars();
          if (complianceResponse.status === "success" && complianceResponse.data) {
            const pillars = complianceResponse.data;
            const total = pillars.length;
            const progress = total > 0
              ? Math.round(pillars.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / total)
              : 0;
            setComplianceProgress(progress);
          }

          // 2. Fetch assessment score
          const scoreResponse = await assessmentService.getScore();
          if (scoreResponse.status === "success" && scoreResponse.data) {
            setAssessmentScore(Math.round(scoreResponse.data.percentage || 0));
            setAssessmentReadiness(scoreResponse.data.readiness_level || "");
          }
        } catch (e) {
          console.error("Failed to fetch dashboard metrics:", e);
        } finally {
          setIsLoadingMetrics(false);
        }
      };

      fetchMetrics();
    }

    // Admin metrics
    if (user?.role === "admin") {
      const fetchAdminMetrics = async () => {
        setIsAdminLoading(true);
        try {
          const [usersRes, farmstaysRes, consultationsRes, forumRes] = await Promise.allSettled([
            adminService.getUsers(1, 1),
            farmstayService.adminGetFarmstays(1, 1),
            consultationService.adminGetSessions(1, 1, "", "open"),
            forumService.adminGetStories(1, 1, "pending"),
          ]);

          const getCount = (res: PromiseSettledResult<any>) => {
            if (res.status === "fulfilled" && res.value?.status === "success") {
              if (res.value.meta?.total !== undefined) return res.value.meta.total;
              if (res.value.pagination?.total !== undefined) return res.value.pagination.total;
              const d = res.value.data;
              if (d?.pagination?.total !== undefined) return d.pagination.total;
              if (d?.meta?.total !== undefined) return d.meta.total;
              if (Array.isArray(d)) return d.length;
              if (d?.data && Array.isArray(d.data)) return d.pagination?.total || d.meta?.total || d.data.length;
            }
            return 0;
          };

          setAdminMetrics({
            totalUsers: getCount(usersRes),
            totalFarmstays: getCount(farmstaysRes),
            pendingConsultations: getCount(consultationsRes),
            pendingStories: getCount(forumRes),
          });
        } catch (e) {
          console.error("Failed to fetch admin metrics:", e);
        } finally {
          setIsAdminLoading(false);
        }
      };
      fetchAdminMetrics();
    }
  }, [user]);

  // Translate variables

  // ----------------------------------------------------
  // 1. OWNER DASHBOARD CONTENT VIEW
  // ----------------------------------------------------
  const renderOwnerContent = () => {
    const accommodationName = profile?.detail?.nama_akomodasi || "My Agritourism Farm";

    return (
      <div className="flex flex-col gap-8">
        {/* Header greetings */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-farm-text">
            {`${greeting}, ${user?.nama || ""}`}
          </h1>
          <p className="text-sm text-farm-text-light mt-1 font-light">
            {isId
              ? `Berikut adalah status terbaru untuk ${accommodationName}`
              : `Here is the latest status for ${accommodationName}`}
          </p>
        </div>

        {/* Profile Completion banner */}
        <div className="bg-farm-cream border border-farm-border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <span className="text-sm text-farm-text font-medium">
            {isId ? (
              <>Profil Akomodasi Anda Telah Lengkap <span className="text-farm-green font-bold">100%</span></>
            ) : (
              <>Your Farm Profile is <span className="text-farm-green font-bold">100%</span> Complete</>
            )}
          </span>
          <Link
            href="/dashboard/profile"
            className="h-9 inline-flex items-center justify-center rounded-lg bg-farm-green px-5 text-xs font-semibold text-white hover:bg-farm-green-hover transition-colors shadow-sm"
          >
            {isId ? "Lihat Profil" : "View Profile"}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 ml-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {/* Key Stats Grid (Compliance & Assessment progress) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance card */}
          <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-farm-text">
                {isId ? "Kepatuhan Standard" : "Standard Compliance"}
              </h3>
              <Link href="/dashboard/compliance" className="text-xs font-semibold text-farm-text hover:text-farm-green flex items-center gap-0.5">
                {isId ? "Kelola" : "Manage"}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-4">
              {/* Circular progress representation */}
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#E8F3EC" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#1E5E3A"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - complianceProgress / 100)}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-farm-text">
                  {isLoadingMetrics ? "..." : `${complianceProgress}%`}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-farm-text">
                  {isId ? "Skor Kepatuhan Keseluruhan" : "Overall Compliance Score"}
                </h4>
                <p className="text-xs text-farm-text-light font-light mt-1">
                  {isId
                    ? "Kelayakan dokumen bukti standar keberlanjutan"
                    : "Readiness of sustainability standard documents"}
                </p>
              </div>
            </div>
          </div>

          {/* Assessment card */}
          <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-farm-text">
                {isId ? "Kesiapan Sertifikasi" : "Certification Readiness"}
              </h3>
              {assessmentReadiness && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 py-1 px-2.5 rounded-md uppercase tracking-wider">
                  {assessmentReadiness}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-6">
              {/* Circular progress representation */}
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#FBF9F6" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#C4A46A"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - assessmentScore / 100)}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-farm-text">
                  {isLoadingMetrics ? "..." : `${assessmentScore}%`}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-farm-text">
                  {isId ? "Hasil Penilaian Mandiri" : "Self-Assessment Result"}
                </h4>
                <p className="text-xs text-farm-text-light font-light mt-1">
                  {isId ? "Klik di bawah untuk menilai ulang" : "Click below to review answers"}
                </p>
                <Link href="/dashboard/assessment" className="text-xs font-bold text-farm-green hover:underline mt-1 block">
                  {isId ? "Mulai Penilaian →" : "Start Assessment →"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation grid for Owner */}
        <div>
          <h3 className="text-xs font-bold tracking-widest text-farm-text-light uppercase mb-4">
            {isId ? "Akses Cepat Fitur" : "Quick Action Overview"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: isId ? "Standar Kepatuhan" : "Compliance",
                desc: isId ? "Upload berkas bukti pilar" : "Upload compliance files",
                href: "/dashboard/compliance",
                color: "bg-emerald-50 border-emerald-100",
              },
              {
                title: isId ? "Penilaian Mandiri" : "Assessments",
                desc: isId ? "Kuesioner kriteria mandiri" : "Self-guided assessments",
                href: "/dashboard/assessment",
                color: "bg-amber-50/50 border-amber-100/60",
              },
              {
                title: isId ? "Konsultasi Ahli" : "Consultation",
                desc: isId ? "Chat dengan tim pendamping" : "Chat with sustainability experts",
                href: "/dashboard/consultation",
                color: "bg-purple-50/50 border-purple-100/60",
              },
              {
                title: isId ? "Materi & Panduan" : "Resources Hub",
                desc: isId ? "Akses pustaka video/PDF" : "Browse templates & guides",
                href: "/resources",
                color: "bg-blue-50/50 border-blue-100/60",
              },
              {
                title: isId ? "Panduan Website" : "User Guide",
                desc: isId ? "Langkah panduan platform" : "How-to instructions",
                href: "/dashboard/guide",
                color: "bg-zinc-50 border-zinc-200",
              },
            ].map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className={`p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-28 bg-white ${link.color}`}
              >
                <div>
                  <h4 className="text-xs font-extrabold text-farm-text leading-tight">{link.title}</h4>
                  <p className="text-[10px] text-farm-text-light font-light mt-1 leading-snug">{link.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-farm-green hover:underline">
                  {isId ? "Buka Halaman →" : "Open Page →"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Incomplete Action section */}
        <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold tracking-widest text-farm-text-light uppercase mb-4">
            {isId ? "Tugas Yang Perlu Dilengkapi" : "Incomplete Action Checklist"}
          </h3>
          <div className="flex flex-col border-t border-farm-border/60">
            {[
              isId ? "Unggah sertifikat kepatuhan manajemen air pilar A" : "Upload Pillar A water management compliance template",
              isId ? "Lakukan evaluasi mandiri pilar B (Sosio-Ekonomi)" : "Answer Pillar B (Socio-Economic) self-assessment questions",
              isId ? "Lengkapi data detail nomor izin akomodasi di profil" : "Fill your accommodation license numbers in Account Settings",
            ].map((task, idx) => (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className="flex items-center justify-between h-14 border-b border-farm-border/60 cursor-pointer group"
              >
                <span className={`text-sm transition-colors ${checkedItems[idx] ? "line-through text-farm-text-light" : "text-farm-text"}`}>
                  {task}
                </span>
                <div className={`h-6 w-6 rounded-md border flex items-center justify-center transition-all ${checkedItems[idx] ? "bg-farm-green border-farm-green text-white" : "border-farm-border group-hover:border-farm-green"
                  }`}>
                  {checkedItems[idx] && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Resources & Sharing Session */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Resources (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-farm-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center border-b border-farm-border/60 pb-3 mb-4">
              <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider">
                {isId ? "Dokumen Terbaru" : "Recent Resources"}
              </h3>
              <Link href="/resources" className="text-xs font-bold text-farm-green hover:underline">
                {isId ? "Lihat Semua" : "View All"}
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  title: isId ? "Dasar-Dasar Akomodasi untuk Pemilik Kebun" : "Hospitality Basics for Farm Owners",
                  meta: isId ? "Bacaan 5 menit • Panduan" : "5 min read • Guide",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292" />
                    </svg>
                  ),
                },
                {
                  title: isId ? "Sistem Pengolahan Sampah Organik" : "Waste Management Systems",
                  meta: isId ? "Video 12 menit • Tutorial" : "12 min watch • Video Tutorial",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                    </svg>
                  ),
                },
                {
                  title: isId ? "Aturan Perizinan Lokal 2026" : "Local Licensing Requirements 2026",
                  meta: isId ? "Bacaan 8 menit • Regulasi" : "8 min read • Compliance",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                    </svg>
                  ),
                },
              ].map((item, idx) => (
                <Link
                  href="/resources"
                  key={idx}
                  className="flex items-center justify-between p-3.5 border border-farm-border rounded-xl hover:border-farm-green transition-colors cursor-pointer group bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-farm-beige border border-farm-border flex items-center justify-center text-farm-text group-hover:bg-farm-green group-hover:text-white transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-semibold text-farm-text truncate">{item.title}</h4>
                      <span className="text-[11px] text-farm-text-light font-light mt-0.5">{item.meta}</span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-farm-text-light group-hover:text-farm-green transition-transform group-hover:translate-x-1 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Sharing Session (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-farm-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-farm-border/60 pb-3 mb-4">
              <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider">
                {isId ? "Cerita Komunitas" : "Community Forum"}
              </h3>
              <Link href="/forum" className="text-xs font-bold text-farm-green hover:underline">
                {isId ? "Selengkapnya" : "See More"}
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { time: isId ? "12 jam lalu" : "12 hours ago", likes: 12, text: "Sangat bagus tempatnya dan asri!" },
                { time: isId ? "2 hari lalu" : "2 days ago", likes: 16, text: "Edukasi lingkungan sangat ditekankan di sini." },
                { time: isId ? "3 hari lalu" : "3 days ago", likes: 21, text: "Keluarga saya sangat menikmati menanam wortel." },
              ].map((item, idx) => (
                <div key={idx} className="bg-farm-green-light/20 border border-farm-green/10 rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px] text-farm-text-light font-medium">
                    <span>{item.time}</span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-farm-green">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.728-.38 1.536-.573 2.3-.573v11.5c-.766 0-1.572-.193-2.3-.573a9.042 9.042 0 01-2.861-2.4c-.498-.634-1.225-1.08-2.03-1.08h-2.25A2.25 2.25 0 011 11.25V10.5m1-1.5H3.75" />
                      </svg>
                      {item.likes}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-farm-text leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/forum"
              className="w-full h-11 bg-farm-green text-white font-semibold rounded-lg mt-6 hover:bg-farm-green-hover transition-colors text-xs sm:text-sm flex items-center justify-center shadow-sm"
            >
              {isId ? "Lihat Forum" : "View Forum"}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 2. VISITOR DASHBOARD CONTENT VIEW
  // ----------------------------------------------------
  const renderVisitorContent = () => {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-farm-text">
            {isId ? `Selamat Datang, ${user?.nama}` : `Welcome, ${user?.nama}`}
          </h1>
          <p className="text-sm text-farm-text-light mt-1 font-light">
            {isId
              ? "Jelajahi agrowisata berkelanjutan dan bagikan kisah perjalanan ramah lingkungan Anda"
              : "Explore agritourism and share your sustainable travel experiences"}
          </p>
        </div>

        {/* Grid Quick Navigation for Visitor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: isId ? "Jelajah Akomodasi" : "Explore Farmstays",
              desc: isId ? "Temukan destinasi pariwisata pedesaan di seluruh Indonesia." : "Discover sustainable agritourism destinations in Indonesia.",
              action: isId ? "Cari Akomodasi" : "Browse Farms",
              href: "/resources",
              color: "bg-emerald-50 border-emerald-255",
            },
            {
              title: isId ? "Forum Komunitas" : "Community Forum",
              desc: isId ? "Bagikan ulasan cerita dan pengalaman jalan-jalan berkelanjutan Anda." : "Share your travel stories and experiences on our public board.",
              action: isId ? "Tulis Cerita" : "Write a Story",
              href: "/forum/new",
              color: "bg-amber-50/50 border-amber-200/60",
            },
            {
              title: isId ? "Pusat Materi Edukasi" : "Learning Hub",
              desc: isId ? "Baca panduan pariwisata hijau dan tonton video praktik keberlanjutan." : "Read articles and watch video guides on eco-agritourism.",
              action: isId ? "Akses Materi" : "View Guides",
              href: "/resources",
              color: "bg-blue-50/50 border-blue-200/60",
            },
            {
              title: isId ? "Panduan Penggunaan" : "User Guide",
              desc: isId ? "Lihat tata cara mengoperasikan dan menjelajahi fitur website." : "View website documentation and step-by-step instructions.",
              action: isId ? "Buka Panduan" : "Open Guide",
              href: "/dashboard/guide",
              color: "bg-zinc-50 border-zinc-200",
            },
          ].map((card, idx) => (
            <div key={idx} className={`p-6 border rounded-2xl flex flex-col justify-between shadow-sm min-h-[180px] bg-white ${card.color}`}>
              <div>
                <h4 className="font-serif text-lg font-bold text-farm-text mb-2">{card.title}</h4>
                <p className="text-xs text-farm-text-light font-light leading-relaxed">{card.desc}</p>
              </div>
              <Link
                href={card.href}
                className="h-8 mt-4 inline-flex items-center justify-center rounded-lg bg-farm-green px-4 text-xs font-semibold text-white hover:bg-farm-green-hover transition-colors w-fit shadow-sm"
              >
                {card.action}
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Community Stories */}
        <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-farm-border/60 pb-3 mb-6">
            <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider">
              {isId ? "Kisah Komunitas Terkini" : "Recent Community Stories"}
            </h3>
            <Link href="/forum" className="text-xs font-bold text-farm-green hover:underline">
              {isId ? "Kunjungi Forum" : "View Forum"}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: isId ? "Indahnya Pagi di Ubud Organic Farm" : "Morning Bliss at Ubud Organic Farm",
                author: "Siti Rahma",
                likes: 34,
                text: isId
                  ? "Pengalaman menginap yang luar biasa! Pengelola mengajarkan kami cara menanam sayuran organik dan menyaring air hujan untuk kebutuhan toilet..."
                  : "An amazing experience staying here! The host taught us how to grow organic vegetables and filter rainwater for basic consumption...",
              },
              {
                title: isId ? "Belajar Mengolah Kompos di Bandung Eco-Lodge" : "Composting Classes at Bandung Eco-Lodge",
                author: "Rudi Tabuti",
                likes: 28,
                text: isId
                  ? "Lodge ini benar-benar menerapkan keberlanjutan. Tidak ada sampah plastik sekali pakai, dan semua sisa makanan dijadikan pakan ternak atau kompos..."
                  : "This lodge seriously practices green operations. No single-use plastic, and food waste is composted or fed to chickens...",
              },
            ].map((story, idx) => (
              <Link
                href="/forum"
                key={idx}
                className="border border-farm-border rounded-xl p-5 hover:border-farm-green transition-colors cursor-pointer group bg-white flex flex-col"
              >
                <div>
                  <span className="text-[9px] font-bold text-farm-gold uppercase tracking-wider bg-farm-beige px-2 py-0.5 rounded-full">
                    Story
                  </span>
                  <h4 className="font-serif text-lg font-bold text-farm-text mt-2 group-hover:text-farm-green transition-colors">
                    {story.title}
                  </h4>
                  <span className="text-[10px] text-farm-text-light font-medium block mt-1">
                    By {story.author} • {story.likes} Likes
                  </span>
                  <p className="text-xs text-farm-text-light leading-relaxed font-light mt-3">
                    {story.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 3. ADMIN DASHBOARD CONTENT VIEW
  // ----------------------------------------------------
  const renderAdminContent = () => {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-farm-text">
            {isId ? `Selamat Datang, Admin ${user?.nama || ''}` : `Welcome, Admin ${user?.nama || ''}`}
          </h1>
          <p className="text-sm text-farm-text-light mt-1 font-light">
            {isId
              ? "Ringkasan sistem dan metrik performa Farmstay Nusantara"
              : "System overview and performance metrics for Farmstay Nusantara"}
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: isId ? "Total Pengguna" : "Total Users",
              value: isAdminLoading ? "..." : adminMetrics.totalUsers.toLocaleString(),
              desc: isId ? "Pengguna terdaftar" : "Registered users",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              ),
              color: "bg-blue-50 border-blue-200",
              href: "/admin/users",
            },
            {
              title: isId ? "Total Farmstay" : "Total Farmstays",
              value: isAdminLoading ? "..." : adminMetrics.totalFarmstays.toLocaleString(),
              desc: isId ? "Listing farmstay" : "Farmstay listings",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              ),
              color: "bg-emerald-50 border-emerald-200",
              href: "/admin/farmstays",
            },
            {
              title: isId ? "Konsultasi Aktif" : "Active Consultations",
              value: isAdminLoading ? "..." : adminMetrics.pendingConsultations.toLocaleString(),
              desc: isId ? "Sesi konsultasi terbuka" : "Open consultation sessions",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.083.185.127.391.127.603v9.641a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V9.114c0-.212.044-.418.127-.603m16.24 0A2.25 2.25 0 0018 7.5H6a2.25 2.25 0 00-1.87 1.011m16.11 0l-7.79 5.192a1.875 1.875 0 01-2.08 0L3.89 8.511" />
                </svg>
              ),
              color: "bg-amber-50 border-amber-200",
              href: "/admin/consultations",
            },
            {
              title: isId ? "Cerita Pending" : "Pending Stories",
              value: isAdminLoading ? "..." : adminMetrics.pendingStories.toLocaleString(),
              desc: isId ? "Menunggu verifikasi" : "Awaiting verification",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              ),
              color: "bg-purple-50 border-purple-200",
              href: "/admin/forum",
            },
          ].map((stat, idx) => (
            <Link key={idx} href={stat.href} className={`p-6 border rounded-2xl flex flex-col justify-between shadow-sm bg-white hover:shadow-md transition-shadow ${stat.color}`}>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-farm-text shrink-0">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-3xl font-bold text-farm-text">{stat.value}</h4>
                <p className="text-xs font-semibold text-farm-text mt-1">{stat.title}</p>
                <p className="text-[10px] text-farm-text-light mt-1">{stat.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Navigation grid for Admin */}
        <div>
          <h3 className="text-xs font-bold tracking-widest text-farm-text-light uppercase mb-4">
            {isId ? "Manajemen Platform" : "Platform Management"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: isId ? "Kelola Pengguna" : "Manage Users",
                desc: isId ? "Data visitor dan pemilik" : "Visitor and owner data",
                href: "/admin/users",
              },
              {
                title: isId ? "Kepatuhan Standard" : "Compliance",
                desc: isId ? "Review dokumen kepatuhan" : "Review compliance documents",
                href: "/admin/compliance",
              },
              {
                title: isId ? "Konsultasi Ahli" : "Consultation",
                desc: isId ? "Balas sesi konsultasi" : "Reply to consultations",
                href: "/admin/consultations",
              },
              {
                title: isId ? "Penilaian Mandiri" : "Assessments",
                desc: isId ? "Kelola pilar assessment" : "Manage assessment pillars",
                href: "/admin/assessments",
              },
              {
                title: isId ? "Profil Farmstay" : "Farmstays",
                desc: isId ? "Kelola data farmstay" : "Manage farmstay data",
                href: "/admin/farmstays",
              },
              {
                title: isId ? "Materi & Dokumen" : "Resource",
                desc: isId ? "Kelola artikel dan video" : "Manage articles and videos",
                href: "/admin/resources",
              },
              {
                title: isId ? "Verifikasi Forum" : "Forum Verification",
                desc: isId ? "Moderasi post komunitas" : "Moderate community posts",
                href: "/admin/forum",
              },
              {
                title: isId ? "Chatbot" : "Chatbot",
                desc: isId ? "Atur jawaban otomatis dan WhatsApp" : "Manage auto replies and WhatsApp fallback",
                href: "/admin/chatbot",
              },
            ].map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-28 bg-white border-zinc-200"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-farm-text leading-tight">{link.title}</h4>
                  <p className="text-[10px] text-farm-text-light font-light mt-1 leading-snug">{link.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-farm-green hover:underline">
                  {isId ? "Buka Manajemen →" : "Open Management →"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Head>
        <title>
          {locale === "id"
            ? `${user?.role === "admin" ? "Dashboard Admin" : user?.role === "owner" ? "Dashboard Pemilik" : "Jelajah"} — Farmstay Nusantara`
            : `${user?.role === "admin" ? "Admin Dashboard" : user?.role === "owner" ? "Owner Dashboard" : "Explore"} — Farmstay Nusantara`}
        </title>
      </Head>
      {user?.role === "admin"
        ? renderAdminContent()
        : user?.role === "owner"
          ? renderOwnerContent()
          : renderVisitorContent()}
    </DashboardLayout>
  );
}
