import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";

interface GuestGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route guard that ensures the user is NOT logged in.
 * Redirects to dashboard or home page if they are already authenticated.
 */
export const GuestGuard: React.FC<GuestGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading spinner or custom fallback while verifying session
  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memverifikasi status...</p>
          </div>
        </div>
      )
    );
  }

  // If user is guest, render children
  return !isAuthenticated ? <>{children}</> : null;
};

export default GuestGuard;
