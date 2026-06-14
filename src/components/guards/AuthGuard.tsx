import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route guard that ensures the user is logged in.
 * Redirects to /auth/login if not authenticated.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Keep track of the page they wanted to visit to redirect back after login
      router.push({
        pathname: "/auth/login",
        query: { redirect: router.asPath },
      });
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner or custom fallback while verifying session
  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memuat sesi...</p>
          </div>
        </div>
      )
    );
  }

  // If user is logged in, render the child component
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
