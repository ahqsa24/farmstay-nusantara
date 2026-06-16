import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/contexts/ToastContext";
import GuestGuard from "@/components/guards/GuestGuard";

export default function Login() {
  const { login, error: authError } = useAuth();
  const { t, locale, router } = useTranslation();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email) {
      errors.email = t.common.validationRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = locale === "id" ? "Format email tidak valid" : "Email format is invalid";
    }
    if (!password) {
      errors.password = t.common.validationRequired;
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
      const success = await login({ email, password });
      if (success) {
        showToast(
          locale === "id" ? "Login berhasil! Selamat datang kembali." : "Login successful! Welcome back.",
          "success"
        );
        router.push("/dashboard");
      } else {
        setGeneralError(t.login.invalidCredentials);
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <Head>
        <title>
          {locale === "id" ? "Masuk — Farmstay Nusantara" : "Login — Farmstay Nusantara"}
        </title>
      </Head>
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
                Selamat Datang Kembali!
              </h2>
              <p className="text-sm text-farm-cream/85 font-light leading-relaxed">
                Akses dashboard Anda untuk mengelola profil farmstay, memeriksa kepatuhan standar keberlanjutan, atau berkonsultasi dengan ahli kami.
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
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-extrabold text-farm-text">
                {t.login.title}
              </h2>
              <p className="text-xs text-farm-text-light font-light mt-1">
                {t.login.subtitle}
              </p>
            </div>

            {generalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{generalError}</span>
              </div>
            )}

            {authError && !generalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
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
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  className={`mt-1.5 block w-full px-4 h-11 border rounded-lg bg-farm-cream placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-farm-green focus:border-farm-green text-xs sm:text-sm text-farm-text transition-colors ${validationErrors.email ? "border-red-400 focus:ring-red-400" : "border-farm-border"
                    }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-[10px] text-red-500 font-semibold">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-farm-text">
                    {t.common.password}
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="font-semibold text-farm-green hover:text-farm-green-hover transition-colors text-[11px]"
                  >
                    {t.login.forgotPassword}
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    className={`block w-full px-4 pr-10 h-11 border rounded-lg bg-farm-cream placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-farm-green focus:border-farm-green text-xs sm:text-sm text-farm-text transition-colors ${validationErrors.password ? "border-red-400 focus:ring-red-400" : "border-farm-border"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-farm-green transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-[10px] text-red-500 font-semibold">{validationErrors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center h-12 px-6 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-semibold text-white bg-farm-green hover:bg-farm-green-hover focus:outline-none disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    t.login.signInBtn
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs sm:text-sm border-t border-farm-border/60 pt-5">
              <span className="text-farm-text-light font-light">{t.login.noAccount} </span>
              <Link
                href="/auth/register"
                className="font-semibold text-farm-green hover:text-farm-green-hover transition-colors"
              >
                {t.login.registerNow}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
