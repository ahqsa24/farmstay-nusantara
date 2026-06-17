import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";
import AuthGuard from "@/components/guards/AuthGuard";
import { consultationService } from "@/services/consultationService";
import { forumService } from "@/services/forumService";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, logout } = useAuth();
  const { t, locale, router } = useTranslation();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingConsultations, setPendingConsultations] = useState(0);
  const [pendingForums, setPendingForums] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      const fetchCounts = async () => {
        try {
          const [consultationsRes, forumsRes] = await Promise.all([
            consultationService.adminGetSessions(1, 100, "", ""),
            forumService.adminGetStories(1, 100, "pending"),
          ]);
          if (consultationsRes.status === "success" && consultationsRes.data) {
            const sessions = Array.isArray(consultationsRes.data) ? consultationsRes.data : (consultationsRes.data as any).data || [];
            const unreadCount = sessions.filter((s: any) => s.has_new_message).length;
            setPendingConsultations(unreadCount);
          }
          if (forumsRes.status === "success" && forumsRes.data) {
            setPendingForums(Array.isArray(forumsRes.data) ? forumsRes.data.length : (forumsRes.data as any).data?.length || 0);
          }
        } catch (err) {
          console.error("Failed to fetch notification counts", err);
        }
      };
      
      fetchCounts();
      const intervalId = setInterval(fetchCounts, 60000); // Poll every minute
      
      const handleRead = () => fetchCounts();
      window.addEventListener("consultationRead", handleRead);
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener("consultationRead", handleRead);
      };
    } else if (user?.role === "owner") {
      const fetchCounts = async () => {
        try {
          const consultationsRes = await consultationService.getSessions();
          if (consultationsRes.status === "success" && consultationsRes.data) {
            const sessions = Array.isArray(consultationsRes.data) ? consultationsRes.data : (consultationsRes.data as any).data || [];
            const unreadCount = sessions.filter((s: any) => s.has_new_message).length;
            setPendingConsultations(unreadCount);
          }
        } catch (err) {
          console.error("Failed to fetch notification counts", err);
        }
      };
      
      fetchCounts();
      const intervalId = setInterval(fetchCounts, 60000); // Poll every minute
      
      const handleRead = () => fetchCounts();
      window.addEventListener("consultationRead", handleRead);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("consultationRead", handleRead);
      };
    }
  }, [user?.role]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const handleLogout = async () => {
    await logout();
    showToast(locale === "id" ? "Berhasil keluar dari akun." : "Successfully logged out.", "success");
  };

  const accommodationName = profile?.detail?.nama_akomodasi || "My Agritourism Farm";
  const isId = locale === "id";

  // Navigation items based on role
  const ownerNavItems: NavItem[] = [
    {
      name: isId ? "Dashboard" : "Dashboard",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      name: isId ? "Kepatuhan Standard" : "Compliance",
      href: "/dashboard/compliance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      name: isId ? "Penilaian Mandiri" : "Assessments",
      href: "/dashboard/assessment",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      name: isId ? "Konsultasi Ahli" : "Consultation",
      href: "/dashboard/consultation",
      badge: pendingConsultations,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.083.185.127.391.127.603v9.641a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V9.114c0-.212.044-.418.127-.603m16.24 0A2.25 2.25 0 0018 7.5H6a2.25 2.25 0 00-1.87 1.011m16.11 0l-7.79 5.192a1.875 1.875 0 01-2.08 0L3.89 8.511" />
        </svg>
      ),
    },
    {
      name: isId ? "Materi & Dokumen" : "Resource",
      href: "/resources",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25M10.125 5.17l-1.672-1.04A9.047 9.047 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.378 0 2.682.31 3.846.862l1.672-1.04m-1.393-12.652A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-3.846.862l-1.672-1.04" />
        </svg>
      ),
    },
    {
      name: isId ? "Panduan Website" : "Guide",
      href: "/dashboard/guide",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      name: isId ? "Dashboard Admin" : "Admin Dashboard",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      name: isId ? "Profil Farmstay" : "Farmstays",
      href: "/admin/farmstays",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      name: isId ? "Kepatuhan Standard" : "Compliance",
      href: "/admin/compliance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      name: isId ? "Penilaian Mandiri" : "Assessments",
      href: "/admin/assessments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      name: isId ? "Konsultasi Ahli" : "Consultation",
      href: "/admin/consultations",
      badge: pendingConsultations,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.083.185.127.391.127.603v9.641a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V9.114c0-.212.044-.418.127-.603m16.24 0A2.25 2.25 0 0018 7.5H6a2.25 2.25 0 00-1.87 1.011m16.11 0l-7.79 5.192a1.875 1.875 0 01-2.08 0L3.89 8.511" />
        </svg>
      ),
    },
    {
      name: isId ? "Materi & Dokumen" : "Resource",
      href: "/admin/resources",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25M10.125 5.17l-1.672-1.04A9.047 9.047 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.378 0 2.682.31 3.846.862l1.672-1.04m-1.393-12.652A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-3.846.862l-1.672-1.04" />
        </svg>
      ),
    },
    {
      name: isId ? "Verifikasi Forum" : "Forum Verification",
      href: "/admin/forum",
      badge: pendingForums,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      name: isId ? "Kelola Pengguna" : "Manage Users",
      href: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      name: isId ? "Panduan & FAQ" : "Guide & FAQ",
      href: "/admin/guide",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      name: isId ? "Chatbot" : "Chatbot",
      href: "/admin/chatbot",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v2" />
          <circle cx="12" cy="4" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="5" y="8" width="14" height="12" rx="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11.5C3.5 11.5 2.5 12.5 2.5 14S3.5 16.5 5 16.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11.5c1.5 0 2.5 1 2.5 2.5S20.5 16.5 19 16.5" />
          <circle cx="9" cy="13.5" r="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15" cy="13.5" r="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17c1 .8 2 1 2.5 1s1.5-.2 2.5-1" />
        </svg>
      ),
    },
    {
      name: isId ? "Master Data" : "Master Data",
      href: "/admin/master-data",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 011.875 1.875v1.5a1.875 1.875 0 01-1.875 1.875H5.625A1.875 1.875 0 013.75 7.875v-1.5A1.875 1.875 0 015.625 4.5z" />
        </svg>
      ),
    },
  ];

  const visitorNavItems: NavItem[] = [
    {
      name: isId ? "Jelajah" : "Explore",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      name: isId ? "Cerita Komunitas" : "Forum Stories",
      href: "/forum",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      name: isId ? "Materi & Dokumen" : "Resources",
      href: "/resources",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25M10.125 5.17l-1.672-1.04A9.047 9.047 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.378 0 2.682.31 3.846.862l1.672-1.04m-1.393-12.652A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-3.846.862l-1.672-1.04" />
        </svg>
      ),
    },
    {
      name: isId ? "Panduan Website" : "Guide",
      href: "/dashboard/guide",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  const navItems = user?.role === "admin"
    ? adminNavItems
    : (user?.role === "owner" ? ownerNavItems : visitorNavItems);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-farm-beige text-farm-text font-sans flex flex-col">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-50 w-full border-b border-farm-border bg-farm-cream/90 backdrop-blur-md">
          <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="flex min-h-[64px] py-2 items-center justify-between gap-4 relative">
              {/* Brand Logo & Title (Left) */}
              <div className="flex-1 lg:flex-none lg:w-48 xl:w-60 flex items-center justify-start">
                <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 shrink-0">
                    <img src="/favicon.svg" alt="Farmstay Logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-sm xl:text-base font-black leading-none text-farm-green tracking-tight transition-colors group-hover:text-farm-green-hover">
                      Farmstay Nusantara
                    </span>
                    <span className="text-[9px] xl:text-[10px] font-extrabold text-farm-text-light/85 mt-1 leading-none truncate max-w-[125px] xl:max-w-none">
                      {user?.role === "admin"
                        ? (isId ? "Portal Admin" : "Admin Portal")
                        : (user?.role === "owner" ? accommodationName : (isId ? "Halaman Pengunjung" : "Visitor Board"))}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Horizontal Navigation (Center) */}
              <div className="hidden lg:flex flex-1 items-center justify-center min-w-0 px-2">
                <nav className="flex flex-wrap items-center justify-center gap-1 xl:gap-1.5 py-1">
                  {navItems.map((item) => {
                    const isActive = router.pathname === item.href || (item.href !== "/dashboard" && router.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex relative items-center p-2 rounded-lg transition-all ${isActive
                          ? "bg-farm-green text-white shadow-sm"
                          : "text-farm-text-light hover:text-farm-text hover:bg-farm-border/30"
                          }`}
                      >
                        <div className="shrink-0 relative">
                          {item.icon}
                          {item.badge ? (
                            <span className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-0.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ${isActive ? 'ring-farm-green' : 'ring-farm-cream group-hover:ring-farm-border/30'}`}>
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap flex items-center ${isActive ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100"
                            }`}
                        >
                          <span className="pl-2 pr-1 text-xs font-extrabold">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                  {user?.role === "owner" && (
                    <Link
                      href="/forum"
                      className={`group flex items-center p-2 rounded-lg transition-all ${router.pathname.startsWith("/forum")
                        ? "bg-farm-green text-white shadow-sm"
                        : "text-farm-text-light hover:text-farm-text hover:bg-farm-border/30"
                        }`}
                    >
                      <div className="shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap flex items-center ${router.pathname.startsWith("/forum") ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100"
                          }`}
                      >
                        <span className="pl-2 pr-1 text-xs font-extrabold">{isId ? "Komunitas" : "Community"}</span>
                      </div>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Options Section (Right) */}
              <div className="flex-1 lg:flex-none lg:w-48 xl:w-60 flex items-center justify-end gap-2">
                {/* Language Switcher */}
                <div className="hidden sm:flex items-center border border-farm-border rounded-lg p-0.5 bg-farm-beige shrink-0 mr-1 shadow-inner">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black transition-all ${locale === "en" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/60 hover:text-farm-text"
                      }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage("id")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black transition-all ${locale === "id" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/60 hover:text-farm-text"
                      }`}
                  >
                    ID
                  </button>
                </div>

                {/* Profile Settings Dropdown Menu */}
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 focus:outline-none p-1 -mr-1 rounded-lg hover:bg-farm-border/20 transition-all border border-transparent hover:border-farm-border/40"
                  >
                    <div className="h-9 w-9 rounded-full bg-farm-green flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-farm-border shadow-sm">
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        user?.nama?.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 text-farm-text-light transition-transform duration-250 ${isDropdownOpen ? "rotate-180" : ""}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white border border-farm-border shadow-xl focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3.5 border-b border-farm-border/60 bg-farm-cream">
                        <p className="text-[10px] font-black uppercase tracking-wider text-farm-green">
                          {user?.role === "admin" ? "Admin Portal" : (user?.role === "owner" ? "Farmstay Owner" : "Visitor Traveler")}
                        </p>
                        <p className="text-sm font-extrabold text-farm-text truncate mt-1">{user?.nama}</p>
                        <p className="text-[11px] text-farm-text-light truncate font-light mt-0.5">{user?.email}</p>
                        {user?.role === "owner" && (
                          <p className="text-[10px] text-farm-text-light/80 italic mt-2.5 truncate border-t border-farm-border/30 pt-2">
                            {accommodationName}
                          </p>
                        )}
                      </div>

                      <div className="py-1 bg-white">
                        <Link
                          href="/"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-farm-text hover:bg-farm-beige transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-farm-text-light">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Landing Page</span>
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-farm-text hover:bg-farm-beige transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-farm-text-light">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          <span>{isId ? "Pengaturan Akun" : "Account Settings"}</span>
                        </Link>
                      </div>

                      <div className="border-t border-farm-border/60 py-1 bg-white">
                        <button
                          onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-black text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Hamburger toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-farm-text hover:bg-farm-border/20 rounded-lg focus:outline-none transition-colors border border-farm-border/40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-farm-border bg-farm-cream px-4 py-4 flex flex-col gap-2 z-40 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between border-b border-farm-border/40 pb-3 mb-2 px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-farm-green flex items-center justify-center text-white font-bold text-xs overflow-hidden border border-farm-border">
                  {profile?.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.nama?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-farm-text truncate">{user?.nama}</span>
                  <span className="text-[10px] text-farm-text-light truncate">
                    {user?.role === "admin" ? "Admin" : (user?.role === "owner" ? "Owner" : "Visitor")}
                  </span>
                </div>
              </div>

              <div className="flex items-center border border-farm-border rounded-full p-0.5 bg-farm-beige">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${locale === "en" ? "bg-farm-green text-white" : "text-farm-text/60"
                    }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("id")}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${locale === "id" ? "bg-farm-green text-white" : "text-farm-text/60"
                    }`}
                >
                  ID
                </button>
              </div>
            </div>

            {navItems.map((item) => {
              const isActive = router.pathname === item.href || (item.href !== "/dashboard" && router.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between h-10 px-3 text-sm font-semibold rounded-lg transition-colors ${isActive ? "bg-farm-green text-white" : "text-farm-text/80 hover:bg-farm-border/30"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className="flex h-5 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white shadow-sm">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            {user?.role === "owner" && (
              <Link
                href="/forum"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 h-10 px-3 text-sm font-semibold rounded-lg transition-colors ${router.pathname.startsWith("/forum") ? "bg-farm-green text-white" : "text-farm-text/80 hover:bg-farm-border/30"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span>{isId ? "Komunitas" : "Community"}</span>
              </Link>
            )}

            <div className="border-t border-farm-border/40 my-1"></div>



            <button
              onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
              className="flex items-center gap-3 h-10 px-3 text-sm font-bold text-red-700 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors w-full text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Desktop Main Centered Content */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          <div className="w-full lg:w-[80%] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
