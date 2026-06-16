import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { adminService } from "@/services/adminService";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminUserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { locale } = useTranslation();
  const isId = locale === "id";

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getUserDetail(id as string);
        if (response.status === "success" && response.data) {
          setUser(response.data);
        }
      } catch (e) {
        console.error("Failed to fetch user detail:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const getRoleBadge = (roleName: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      owner: "bg-emerald-100 text-emerald-800",
      farmstay_owner: "bg-emerald-100 text-emerald-800",
      visitor: "bg-blue-100 text-blue-800",
    };
    return styles[roleName] || "bg-zinc-100 text-zinc-800";
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "Detail Pengguna — Farmstay Nusantara" : "User Detail — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6">
          {/* Back */}
          <Link href="/admin/users" className="text-sm font-semibold text-farm-green hover:underline flex items-center gap-1 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {isId ? "Kembali ke Daftar Pengguna" : "Back to User List"}
          </Link>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-farm-green border-t-transparent"></div>
                <span className="text-sm text-farm-text-light">{isId ? "Memuat data..." : "Loading..."}</span>
              </div>
            </div>
          ) : !user ? (
            <div className="text-center py-20 text-farm-text-light">
              {isId ? "Pengguna tidak ditemukan." : "User not found."}
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="h-16 w-16 rounded-full bg-farm-green flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden border-2 border-farm-border">
                    {user.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      user.nama?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="font-serif text-2xl font-bold text-farm-text">{user.nama}</h1>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getRoleBadge(user.role?.name || user.role)}`}>
                        {user.role?.name || user.role}
                      </span>
                    </div>
                    <p className="text-sm text-farm-text-light mt-1">{user.email}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-farm-text-light">
                        <strong>{isId ? "Status:" : "Status:"}</strong>{" "}
                        <span className={`font-bold uppercase ${user.status === "active" ? "text-green-700" : "text-red-700"}`}>
                          {user.status}
                        </span>
                      </span>
                      <span className="text-xs text-farm-text-light">
                        <strong>{isId ? "Terdaftar:" : "Registered:"}</strong>{" "}
                        {user.created_at ? new Date(user.created_at).toLocaleDateString(isId ? "id-ID" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Info */}
              {user.profile && (
                <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider mb-4 pb-3 border-b border-farm-border/60">
                    {isId ? "Informasi Profil" : "Profile Information"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(user.profile).map(([key, value]: [string, any]) => {
                      if (key === "id" || key === "user_id" || key === "created_at" || key === "updated_at") return null;
                      if (value === null || value === undefined || value === "") return null;
                      const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-farm-text-light uppercase tracking-wider">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-farm-text font-medium break-all">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Detail (step_data / detail) */}
              {user.detail && (
                <div className="bg-white border border-farm-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-farm-text uppercase tracking-wider mb-4 pb-3 border-b border-farm-border/60">
                    {isId ? "Detail Registrasi" : "Registration Details"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(user.detail).map(([key, value]: [string, any]) => {
                      if (value === null || value === undefined || value === "") return null;
                      const displayValue = Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value);
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-farm-text-light uppercase tracking-wider">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-farm-text font-medium break-all">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
