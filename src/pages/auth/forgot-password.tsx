import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { useTranslation } from "@/hooks/useTranslation";
import GuestGuard from "@/components/guards/GuestGuard";

export default function ForgotPassword() {
  const { t, locale, router } = useTranslation();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const validate = () => {
    if (!email) {
      setValidationError(t.common.validationRequired);
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError(locale === "id" ? "Format email tidak valid" : "Email format is invalid");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
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
                Lupa Kata Sandi?
              </h2>
              <p className="text-sm text-farm-cream/85 font-light leading-relaxed">
                Masukkan alamat email yang terdaftar pada akun Anda. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi Anda.
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
            {success ? (
              <div className="text-center space-y-5 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-farm-text">Link Sent</h3>
                <p className="text-xs sm:text-sm text-farm-text-light font-light max-w-xs mx-auto leading-relaxed">
                  {t.forgotPassword.successMsg}
                </p>
                <Link
                  href="/auth/login"
                  className="mt-6 w-full flex justify-center items-center h-12 px-6 border border-farm-border rounded-lg text-xs sm:text-sm font-semibold text-farm-text bg-farm-cream hover:bg-farm-border/30 transition-colors"
                >
                  {t.forgotPassword.backToLogin}
                </Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="text-center mb-6">
                  <h2 className="font-serif text-2xl font-extrabold text-farm-text">
                    {t.forgotPassword.title}
                  </h2>
                  <p className="text-xs text-farm-text-light font-light mt-1">
                    {t.forgotPassword.subtitle}
                  </p>
                </div>

                {generalError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>{generalError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-farm-text">
                    {t.common.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                    className={`mt-1.5 block w-full px-4 h-11 border rounded-lg bg-farm-cream placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-farm-green focus:border-farm-green text-xs sm:text-sm text-farm-text transition-colors ${
                      validationError ? "border-red-400 focus:ring-red-400" : "border-farm-border"
                    }`}
                  />
                  {validationError && (
                    <p className="mt-1 text-[10px] text-red-500 font-semibold">{validationError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center h-12 px-6 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover focus:outline-none disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      t.forgotPassword.sendBtn
                    )}
                  </button>

                  <Link
                    href="/auth/login"
                    className="w-full flex justify-center items-center h-11 text-xs sm:text-sm font-semibold text-farm-green hover:text-farm-green-hover transition-colors"
                  >
                    {t.forgotPassword.backToLogin}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
