import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import GuestGuard from "@/components/guards/GuestGuard";

export default function ResetPassword() {
  const { t, locale, router } = useTranslation();
  const [token, setToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (router.isReady && router.query.token) {
      setToken(router.query.token as string);
    }
  }, [router.isReady, router.query]);

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!password) {
      errors.password = t.common.validationRequired;
    } else {
      if (password.length < 8) {
        errors.password = "Password minimal 8 karakter";
      } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password harus mengandung huruf besar (A-Z)";
      } else if (!/[a-z]/.test(password)) {
        errors.password = "Password harus mengandung huruf kecil (a-z)";
      } else if (!/[0-9]/.test(password)) {
        errors.password = "Password harus mengandung angka (0-9)";
      }
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t.common.validationPasswordMatch;
    }
    if (!token) {
      errors.general = locale === "id" ? "Token reset tidak ditemukan di URL. Silakan minta tautan baru." : "Reset token is missing from URL. Please request a new password reset link.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        token,
        new_password: password,
        new_password_confirmation: confirmPassword,
      });

      if (response.status === "success") {
        setSuccess(true);
      } else {
        setGeneralError(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-farm-beige font-sans flex flex-col md:flex-row">
        {/* Left Side: Brand Panel with Background Image */}
        <div
          className="hidden md:flex md:w-[38%] text-white p-12 flex-col justify-between shrink-0 sticky top-0 h-screen select-none border-r border-farm-border relative overflow-hidden"
          style={{
            backgroundImage: "url('/images/hero_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Green overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-farm-green/90 to-farm-green-dark/95 z-0" />
          <div className="space-y-8 relative z-10">
            <Link href="/" className="inline-flex items-center text-xs font-bold text-farm-cream/80 hover:text-white border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 transition-all">
              ← Kembali ke Beranda
            </Link>
            
            <div className="pt-8">
              <span className="font-serif text-4xl font-bold tracking-tight block">
                {t.common.brand}
              </span>
              <p className="text-sm font-light text-farm-cream/80 mt-1 uppercase tracking-wider font-semibold">
                Agritourism Hub
              </p>
            </div>

            <div className="space-y-4 pt-12">
              <h2 className="font-serif text-3xl font-extrabold leading-tight text-farm-cream">
                Atur Ulang Kata Sandi
              </h2>
              <p className="text-sm text-farm-cream/85 font-light leading-relaxed">
                Buat kata sandi baru yang aman untuk akun Anda. Harap pastikan kata sandi baru memenuhi seluruh kriteria keamanan kompleksitas.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-[10px] font-light text-farm-cream/60 relative z-10">
            {t.footer.copyright}
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-10 md:px-16 lg:px-24 min-h-screen relative bg-farm-beige">
          {/* Mobile Back & Language switcher */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <Link href="/" className="md:hidden inline-flex items-center text-xs font-bold text-farm-green hover:underline">
              ← Beranda
            </Link>
            <div className="md:hidden" /> {/* Spacer */}
            
            <div className="flex items-center border border-farm-border rounded-full p-0.5 bg-farm-cream ml-auto">
              <button onClick={() => changeLanguage("en")} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${locale === "en" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/60"}`}>
                EN
              </button>
              <button onClick={() => changeLanguage("id")} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${locale === "id" ? "bg-farm-green text-white shadow-sm" : "text-farm-text/60"}`}>
                ID
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="mx-auto w-full max-w-md bg-white border border-farm-border rounded-2xl p-6 sm:p-10 shadow-xl mt-6">
            {validationErrors.general && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 font-medium">
                {validationErrors.general}
              </div>
            )}

            {generalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {generalError}
              </div>
            )}

            {success ? (
              <div className="text-center space-y-5 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-farm-text">{t.resetPassword?.title || "Password Reset Successfully"}</h3>
                <p className="text-xs sm:text-sm text-farm-text-light font-light max-w-xs mx-auto leading-relaxed">
                  {t.resetPassword?.successMsg || "Your password has been changed. You can now log in using your new credentials."}
                </p>
                <Link
                  href="/auth/login"
                  className="mt-6 w-full flex justify-center items-center h-12 px-6 border border-farm-border rounded-lg text-xs sm:text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover transition-colors"
                >
                  {t.common.login}
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="text-center mb-6">
                  <h2 className="font-serif text-2xl font-extrabold text-farm-text">
                    {t.resetPassword?.title || "Reset Password"}
                  </h2>
                  <p className="text-xs text-farm-text-light font-light mt-1">
                    {t.resetPassword?.subtitle || "Set your new account password"}
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-farm-text">
                    {t.resetPassword?.newPassword || "New Password"}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    className={`mt-1.5 block w-full px-4 h-11 border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green focus:border-farm-green text-xs sm:text-sm text-farm-text transition-colors ${
                      validationErrors.password ? "border-red-400 focus:ring-red-400" : "border-farm-border"
                    }`}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-[10px] text-red-500 font-semibold">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-farm-text">
                    {t.resetPassword?.confirmNewPassword || "Confirm New Password"}
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) {
                        setValidationErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    className={`mt-1.5 block w-full px-4 h-11 border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green focus:border-farm-green text-xs sm:text-sm text-farm-text transition-colors ${
                      validationErrors.confirmPassword ? "border-red-400 focus:ring-red-400" : "border-farm-border"
                    }`}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-[10px] text-red-500 font-semibold">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full flex justify-center items-center h-12 px-6 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover focus:outline-none disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      t.resetPassword?.resetBtn || "Reset Password"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
