import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import AuthGuard from "@/components/guards/AuthGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, logout } = useAuth();
  const { t, locale, router } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const handleLogout = async () => {
    await logout();
  };

  const accommodationName = profile?.detail?.nama_akomodasi || "My Agritourism Farm";

  // Sidebar items based on role
  const ownerNavItems = [
    {
      name: locale === "id" ? "Dashboard" : "Dashboard",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Kepatuhan Standard" : "Compliance",
      href: "/dashboard/compliance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Penilaian Mandiri" : "Assessments",
      href: "/dashboard/assessment",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Konsultasi Ahli" : "Consultation",
      href: "/dashboard/consultation",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.083.185.127.391.127.603v9.641a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V9.114c0-.212.044-.418.127-.603m16.24 0A2.25 2.25 0 0018 7.5H6a2.25 2.25 0 00-1.87 1.011m16.11 0l-7.79 5.192a1.875 1.875 0 01-2.08 0L3.89 8.511" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Materi & Dokumen" : "Resource",
      href: "/resources",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25M10.125 5.17l-1.672-1.04A9.047 9.047 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.378 0 2.682.31 3.846.862l1.672-1.04m-1.393-12.652A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-3.846.862l-1.672-1.04" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Panduan Website" : "Guide",
      href: "/dashboard/guide",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  const visitorNavItems = [
    {
      name: locale === "id" ? "Jelajah" : "Explore",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Cerita Komunitas" : "Forum Stories",
      href: "/forum",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Materi & Dokumen" : "Resources",
      href: "/resources",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25M10.125 5.17l-1.672-1.04A9.047 9.047 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.378 0 2.682.31 3.846.862l1.672-1.04m-1.393-12.652A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-3.846.862l-1.672-1.04" />
        </svg>
      ),
    },
    {
      name: locale === "id" ? "Panduan Website" : "Guide",
      href: "/dashboard/guide",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  const navItems = user?.role === "owner" ? ownerNavItems : visitorNavItems;

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-farm-beige text-farm-text font-sans">
        {/* Desktop Sidebar (Left side) */}
        <aside className="hidden md:flex w-64 bg-farm-cream border-r border-farm-border flex-col justify-between shrink-0 sticky top-0 h-screen">
          <div className="flex flex-col py-8 px-6 overflow-y-auto">
            {/* Profile summary */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-farm-border/60">
              <Link href="/dashboard/profile" className="relative group shrink-0">
                <div className="h-10 w-10 rounded-full bg-farm-green flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-farm-border hover:ring-2 hover:ring-farm-green transition-all">
                  {profile?.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.nama?.substring(0, 2).toUpperCase()
                  )}
                </div>
              </Link>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-sm font-extrabold text-farm-green truncate">
                  {user?.role === "owner" ? "Farmstay Owner" : "Visitor Traveler"}
                </span>
                <span className="text-[10px] text-farm-text-light truncate">
                  {user?.role === "owner" ? accommodationName : user?.email}
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg transition-colors ${
                      isActive
                        ? "bg-farm-green text-white"
                        : "text-farm-text/80 hover:bg-farm-border/30 hover:text-farm-text"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col py-6 px-6 border-t border-farm-border/60 gap-4">
            {user?.role === "owner" && (
              <Link
                href="/forum"
                className={`w-full flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg transition-colors ${
                  router.pathname.startsWith("/forum")
                    ? "bg-farm-green text-white"
                    : "text-farm-text/80 hover:bg-farm-border/30 hover:text-farm-text"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span>Community Forum</span>
              </Link>
            )}

            {/* Language Switcher */}
            <div className="flex items-center justify-between border border-farm-border rounded-lg p-1 bg-farm-beige">
              <span className="text-[10px] font-bold text-farm-text-light pl-2 uppercase">{t.common.language}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all ${
                    locale === "en" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/60 hover:text-farm-text"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("id")}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all ${
                    locale === "id" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/60 hover:text-farm-text"
                  }`}
                >
                  ID
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header (Sticky at top) */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden h-16 bg-farm-cream border-b border-farm-border flex items-center justify-between px-6 sticky top-0 z-40">
            <Link href="/dashboard" className="font-serif text-lg font-bold text-farm-green">
              {t.common.brand}
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Mobile Language selector */}
              <div className="flex items-center border border-farm-border rounded-full p-0.5 bg-farm-beige">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    locale === "en" ? "bg-farm-green text-white" : "text-farm-text/60"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("id")}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    locale === "id" ? "bg-farm-green text-white" : "text-farm-text/60"
                  }`}
                >
                  ID
                </button>
              </div>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-farm-text focus:outline-none"
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
          </header>

          {/* Mobile Sidebar Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-farm-cream border-b border-farm-border px-6 py-4 flex flex-col gap-3 z-30 shadow-md">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg ${
                      isActive ? "bg-farm-green text-white" : "text-farm-text/80 hover:bg-farm-border/30"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {user?.role === "owner" && (
                <Link
                  href="/forum"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg ${
                    router.pathname.startsWith("/forum") ? "bg-farm-green text-white" : "text-farm-text/80"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <span>Community Forum</span>
                </Link>
              )}
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg ${
                  router.pathname === "/dashboard/profile" ? "bg-farm-green text-white" : "text-farm-text/80"
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-farm-green flex items-center justify-center text-white text-[10px] font-bold overflow-hidden border border-farm-border">
                  {profile?.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.nama?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span>{locale === "id" ? "Pengaturan Akun" : "Account Settings"}</span>
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-3.5 h-11 px-4 text-sm font-semibold rounded-lg text-red-700 w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Main Dashboard Content Layout */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
