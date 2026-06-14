import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { UserRole } from "../../types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Route guard that restricts access based on user role (e.g. Owner only, Admin only).
 * If user does not have an allowed role, it displays an unauthorized warning screen or custom fallback.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // If auth is loading, let it be handled by AuthGuard or show default loading here
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memeriksa izin...</p>
        </div>
      </div>
    );
  }

  const hasAccess = isAuthenticated && user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Akses Ditolak (403)
            </h1>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini. Halaman ini terbatas untuk akun dengan hak akses:{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {allowedRoles.join(", ")}
              </span>
              .
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-6 font-medium text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
