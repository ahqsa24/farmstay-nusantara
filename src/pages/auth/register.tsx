import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import GuestGuard from "@/components/guards/GuestGuard";
import { masterDataService } from "@/services/masterDataService";
import { MasterDataItem } from "@/types/resources";

const initialOwnerValues = {
  nama: "",
  email: "",
  password: "",
  password_confirmation: "",
  nomor_hp: "",
  alamat: "",
  nama_akomodasi: "",
  tipe_akomodasi: "",
  rating_bintang: "",
  jumlah_kamar: 0,
  jumlah_tempat_tidur: 0,
  provinsi: "",
  kabupaten_kota: "",
  alamat_lengkap: "",
  sertifikasi_yang_dimiliki: "",
  status_manajemen_energi: "",
  status_manajemen_air: "",
  status_manajemen_limbah: "",
};

export default function Register() {
  const { register, error: authError } = useAuth();
  const { t, locale, router } = useTranslation();

  const [role, setRole] = useState<"none" | "owner" | "visitor">("none");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>([]);
  const [ratingOptions, setRatingOptions] = useState<string[]>([]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const provRes = await masterDataService.getMasterData("province");
        if (provRes.status === "success" && provRes.data && provRes.data.length > 0) {
          setProvinces(provRes.data.map((item: MasterDataItem) => item.label));
        } else {
          setProvinces(["Bali", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "D.I. Yogyakarta", "Nusa Tenggara Barat"]);
        }
      } catch (e) {
        setProvinces(["Bali", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "D.I. Yogyakarta", "Nusa Tenggara Barat"]);
      }

      try {
        const typeRes = await masterDataService.getMasterData("accommodation_type");
        if (typeRes.status === "success" && typeRes.data && typeRes.data.length > 0) {
          setAccommodationTypes(typeRes.data.map((item: MasterDataItem) => item.label));
        } else {
          setAccommodationTypes(['Farmstay', 'Hotel', 'Resort', 'Villa', 'Homestay', 'Guest House', 'Glamping']);
        }
      } catch (e) {
        setAccommodationTypes(['Farmstay', 'Hotel', 'Resort', 'Villa', 'Homestay', 'Guest House', 'Glamping']);
      }

      try {
        const ratingRes = await masterDataService.getMasterData("rating_bintang");
        if (ratingRes.status === "success" && ratingRes.data && ratingRes.data.length > 0) {
          setRatingOptions(ratingRes.data.map((item: MasterDataItem) => item.label));
        } else {
          setRatingOptions(["1 ⭐", "2 ⭐", "3 ⭐", "4 ⭐", "5 ⭐", "Non-Bintang"]);
        }
      } catch (e) {
        setRatingOptions(["1 ⭐", "2 ⭐", "3 ⭐", "4 ⭐", "5 ⭐", "Non-Bintang"]);
      }
    }
    loadMasterData();
  }, []);

  useEffect(() => {
    async function loadCities() {
      try {
        const cityRes = await masterDataService.getMasterData("city");
        if (cityRes.status === "success" && cityRes.data && cityRes.data.length > 0) {
          setCities(cityRes.data.map((item: MasterDataItem) => item.label));
        } else {
          setCities(["Denpasar", "Badung", "Gianyar", "Ubud", "Bandung", "Bogor", "Yogyakarta", "Lombok"]);
        }
      } catch (e) {
        setCities(["Denpasar", "Badung", "Gianyar", "Ubud", "Bandung", "Bogor", "Yogyakarta", "Lombok"]);
      }
    }
    if (role === "owner") {
      loadCities();
    }
  }, [role]);

  const [visitorData, setVisitorData] = useState({
    nama: "",
    email: "",
    password: "",
    password_confirmation: "",
    nomor_hp: "",
    alamat: "",
  });

  const ownerForm = useMultiStepForm({
    totalSteps: 4,
    initialValues: initialOwnerValues,
  });

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const clearError = (key: string) => {
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validateVisitor = () => {
    const errors: Record<string, string> = {};
    if (!visitorData.nama) errors.nama = t.common.validationRequired;
    if (!visitorData.email) {
      errors.email = t.common.validationRequired;
    } else if (!/\S+@\S+\.\S+/.test(visitorData.email)) {
      errors.email = "Format email tidak valid";
    }
    if (!visitorData.password) {
      errors.password = t.common.validationRequired;
    } else {
      if (visitorData.password.length < 8) {
        errors.password = "Password minimal 8 karakter";
      } else if (!/[A-Z]/.test(visitorData.password)) {
        errors.password = "Password harus mengandung huruf besar (A-Z)";
      } else if (!/[a-z]/.test(visitorData.password)) {
        errors.password = "Password harus mengandung huruf kecil (a-z)";
      } else if (!/[0-9]/.test(visitorData.password)) {
        errors.password = "Password harus mengandung angka (0-9)";
      }
    }
    if (visitorData.password !== visitorData.password_confirmation) {
      errors.password_confirmation = t.common.validationPasswordMatch;
    }
    if (!visitorData.nomor_hp) errors.nomor_hp = t.common.validationRequired;
    if (!visitorData.alamat) errors.alamat = t.common.validationRequired;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOwnerStep = (step: number) => {
    const errors: Record<string, string> = {};
    const data = ownerForm.formData;

    if (step === 1) {
      if (!data.nama) errors.nama = t.common.validationRequired;
      if (!data.email) {
        errors.email = t.common.validationRequired;
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Format email tidak valid";
      }
      if (!data.password) {
        errors.password = t.common.validationRequired;
      } else {
        if (data.password.length < 8) {
          errors.password = "Password minimal 8 karakter";
        } else if (!/[A-Z]/.test(data.password)) {
          errors.password = "Password harus mengandung huruf besar (A-Z)";
        } else if (!/[a-z]/.test(data.password)) {
          errors.password = "Password harus mengandung huruf kecil (a-z)";
        } else if (!/[0-9]/.test(data.password)) {
          errors.password = "Password harus mengandung angka (0-9)";
        }
      }
      if (data.password !== data.password_confirmation) {
        errors.password_confirmation = t.common.validationPasswordMatch;
      }
      if (!data.nomor_hp) errors.nomor_hp = t.common.validationRequired;
      if (!data.alamat) errors.alamat = t.common.validationRequired;
    } else if (step === 2) {
      if (!data.nama_akomodasi) errors.nama_akomodasi = t.common.validationRequired;
      if (!data.tipe_akomodasi) errors.tipe_akomodasi = t.common.validationRequired;
      if (!data.rating_bintang) errors.rating_bintang = t.common.validationRequired;
      if (data.jumlah_kamar <= 0) errors.jumlah_kamar = "Must be greater than 0";
      if (data.jumlah_tempat_tidur <= 0) errors.jumlah_tempat_tidur = "Must be greater than 0";
    } else if (step === 3) {
      if (!data.provinsi) errors.provinsi = t.common.validationRequired;
      if (!data.kabupaten_kota) errors.kabupaten_kota = t.common.validationRequired;
      if (!data.alamat_lengkap) errors.alamat_lengkap = t.common.validationRequired;
    } else if (step === 4) {
      if (!data.status_manajemen_energi) errors.status_manajemen_energi = t.common.validationRequired;
      if (!data.status_manajemen_air) errors.status_manajemen_air = t.common.validationRequired;
      if (!data.status_manajemen_limbah) errors.status_manajemen_limbah = t.common.validationRequired;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateVisitor()) return;

    setIsLoading(true);
    try {
      const payload = {
        nama: visitorData.nama,
        email: visitorData.email,
        password: visitorData.password,
        password_confirmation: visitorData.password_confirmation,
        role: "visitor" as const,
        step_data: {
          nomor_hp: visitorData.nomor_hp,
          alamat: visitorData.alamat,
        },
      };

      const isRegistered = await register(payload);
      if (isRegistered) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2500);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        const details = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join("; ");
        setGeneralError(`${data.message || t.common.errorOccurred} (${details})`);
      } else {
        setGeneralError(data?.message || t.common.errorOccurred);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerNext = () => {
    if (validateOwnerStep(ownerForm.currentStep)) {
      ownerForm.nextStep();
      setValidationErrors({});
    }
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerForm.currentStep < 4) {
      handleOwnerNext();
      return;
    }
    setGeneralError("");
    if (!validateOwnerStep(4)) return;

    setIsLoading(true);
    try {
      const data = ownerForm.formData;
      const payload = {
        nama: data.nama,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: "owner" as const,
        step_data: {
          nomor_hp: data.nomor_hp,
          alamat: data.alamat,
          nama_akomodasi: data.nama_akomodasi,
          tipe_akomodasi: data.tipe_akomodasi,
          rating_bintang: data.rating_bintang,
          jumlah_kamar: Number(data.jumlah_kamar),
          jumlah_tempat_tidur: Number(data.jumlah_tempat_tidur),
          provinsi: data.provinsi,
          kabupaten_kota: data.kabupaten_kota,
          alamat_lengkap: data.alamat_lengkap,
          sertifikasi_yang_dimiliki: data.sertifikasi_yang_dimiliki || "-",
          status_manajemen_energi: data.status_manajemen_energi,
          status_manajemen_air: data.status_manajemen_air,
          status_manajemen_limbah: data.status_manajemen_limbah,
        },
      };

      const isRegistered = await register(payload);
      if (isRegistered) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2500);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        const details = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join("; ");
        setGeneralError(`${data.message || t.common.errorOccurred} (${details})`);
      } else {
        setGeneralError(data?.message || t.common.errorOccurred);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <Head>
        <title>
          {locale === "id" ? "Daftar — Farmstay Nusantara" : "Register — Farmstay Nusantara"}
        </title>
      </Head>
      <div className="min-h-screen bg-farm-beige font-sans flex flex-col md:flex-row">
        {/* Success Toast Overlays */}
        {success && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl shadow-lg max-w-sm animate-bounce">
            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-farm-text">Registrasi Berhasil!</h4>
              <p className="text-[10px] text-farm-text-light font-light mt-0.5">
                {locale === "id" ? "Pendaftaran sukses. Mengalihkan ke login..." : "Sign up complete. Redirecting to login..."}
              </p>
            </div>
          </div>
        )}

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
                Bergabung dengan Kami
              </h2>
              <p className="text-sm text-farm-cream/85 font-light leading-relaxed">
                Daftarkan profil akomodasi atau cari referensi farmstay ramah lingkungan. Verifikasi standar keberlanjutan hijau Anda bersama kami.
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
          <div className="mx-auto w-full max-w-2xl bg-white border border-farm-border rounded-2xl p-6 sm:p-10 shadow-xl mt-6">

            {generalError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{generalError}</span>
              </div>
            )}

            {authError && !generalError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            {role === "none" ? (
              /* Step 0: Role Onboarding Screen */
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl font-extrabold text-farm-text">{t.register.roleSelectTitle}</h3>
                  <p className="text-xs sm:text-sm text-farm-text-light mt-1 font-light">
                    {t.register.roleSelectSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Option Owner */}
                  <button
                    onClick={() => setRole("owner")}
                    disabled={success}
                    className="flex flex-col items-center text-center p-6 border-2 border-farm-border rounded-2xl hover:border-farm-green hover:bg-farm-green-light/10 transition-all group bg-white shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-full bg-farm-beige flex items-center justify-center text-farm-green group-hover:bg-farm-green group-hover:text-white transition-colors duration-300 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 9M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h3.75m-8.25-12h3" />
                      </svg>
                    </div>
                    <h4 className="font-serif text-base font-bold text-farm-text">{t.register.roles.owner.title}</h4>
                    <p className="text-[11px] text-farm-text-light font-light leading-relaxed mt-2">
                      {t.register.roles.owner.desc}
                    </p>
                  </button>

                  {/* Option Visitor */}
                  <button
                    onClick={() => setRole("visitor")}
                    disabled={success}
                    className="flex flex-col items-center text-center p-6 border-2 border-farm-border rounded-2xl hover:border-farm-green hover:bg-farm-green-light/10 transition-all group bg-white shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-full bg-farm-beige flex items-center justify-center text-farm-green group-hover:bg-farm-green group-hover:text-white transition-colors duration-300 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <h4 className="font-serif text-base font-bold text-farm-text">{t.register.roles.visitor.title}</h4>
                    <p className="text-[11px] text-farm-text-light font-light leading-relaxed mt-2">
                      {t.register.roles.visitor.desc}
                    </p>
                  </button>
                </div>

                <div className="text-center pt-4 text-xs sm:text-sm border-t border-farm-border/60 pt-5">
                  <span className="text-farm-text-light font-light">{t.register.alreadyHaveAccount} </span>
                  <Link href="/auth/login" className="font-semibold text-farm-green hover:text-farm-green-hover transition-colors">
                    {t.register.loginNow}
                  </Link>
                </div>
              </div>
            ) : role === "visitor" ? (
              /* Visitor Registration Form */
              <form onSubmit={handleVisitorSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-farm-border pb-3 mb-6">
                  <h3 className="font-serif text-xl font-bold text-farm-text">{t.register.visitorSteps.title}</h3>
                  <button type="button" onClick={() => setRole("none")} className="text-xs text-farm-text-light hover:text-farm-green font-semibold">
                    ← Change Role
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-farm-text">{t.common.fullName}</label>
                    <input
                      type="text"
                      disabled={isLoading || success}
                      className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                      value={visitorData.nama}
                      onChange={(e) => setVisitorData({ ...visitorData, nama: e.target.value })}
                    />
                    {validationErrors.nama && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.nama}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-farm-text">{t.common.email}</label>
                    <input
                      type="email"
                      disabled={isLoading || success}
                      className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                      value={visitorData.email}
                      onChange={(e) => setVisitorData({ ...visitorData, email: e.target.value })}
                    />
                    {validationErrors.email && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.email}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-farm-text">{t.common.password}</label>
                    <div className="relative mt-1.5">
                      <input
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading || success}
                        className="block w-full px-4 pr-10 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={visitorData.password}
                        onChange={(e) => setVisitorData({ ...visitorData, password: e.target.value })}
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
                    {validationErrors.password && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.password}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-farm-text">{t.common.confirmPassword}</label>
                    <div className="relative mt-1.5">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={isLoading || success}
                        className="block w-full px-4 pr-10 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={visitorData.password_confirmation}
                        onChange={(e) => setVisitorData({ ...visitorData, password_confirmation: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-farm-green transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? (
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
                    {validationErrors.password_confirmation && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.password_confirmation}</span>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-farm-text">{t.common.phoneNumber}</label>
                    <input
                      type="text"
                      disabled={isLoading || success}
                      className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                      value={visitorData.nomor_hp}
                      onChange={(e) => setVisitorData({ ...visitorData, nomor_hp: e.target.value })}
                    />
                    {validationErrors.nomor_hp && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.nomor_hp}</span>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-farm-text">{t.common.address}</label>
                    <textarea
                      rows={3}
                      disabled={isLoading || success}
                      className="mt-1.5 block w-full p-3.5 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                      value={visitorData.alamat}
                      onChange={(e) => setVisitorData({ ...visitorData, alamat: e.target.value })}
                    />
                    {validationErrors.alamat && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.alamat}</span>}
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-farm-border/60">
                  <button type="button" onClick={() => setRole("none")} className="text-xs font-bold text-farm-text hover:text-farm-green py-2.5 px-5 border border-farm-border rounded-lg bg-white">
                    {t.common.back}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || success}
                    className="inline-flex h-11 items-center justify-center bg-farm-green text-white font-semibold px-6 rounded-lg text-xs sm:text-sm hover:bg-farm-green-hover disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t.common.submit}
                  </button>
                </div>
              </form>
            ) : (
              /* Owner Registration Form - Multi Step 1-4 with Horizontal Stepper (Gambar 2 style) */
              <form onSubmit={handleOwnerSubmit} className="space-y-6">
                <div className="flex items-center justify-between border-b border-farm-border pb-3 shrink-0">
                  <h3 className="font-serif text-xl font-bold text-farm-text">{t.register.ownerSteps.title}</h3>
                  {ownerForm.currentStep === 1 && (
                    <button type="button" onClick={() => setRole("none")} className="text-xs text-farm-text-light hover:text-farm-green font-semibold">
                      ← Change Role
                    </button>
                  )}
                </div>

                {/* Horizontal Stepper Progress Tracker (Gambar 2 style) */}
                <div className="flex items-center w-full max-w-md mx-auto mb-8 border-b border-farm-border/60 pb-6 select-none">
                  {[1, 2, 3, 4].map((stepNumber) => {
                    const isActive = ownerForm.currentStep === stepNumber;
                    const isCompleted = ownerForm.currentStep > stepNumber;

                    let stepName = "";
                    if (stepNumber === 1) stepName = locale === "id" ? "Akun" : "Account";
                    if (stepNumber === 2) stepName = locale === "id" ? "Profil" : "Profile";
                    if (stepNumber === 3) stepName = locale === "id" ? "Lokasi" : "Location";
                    if (stepNumber === 4) stepName = locale === "id" ? "Status" : "Status";

                    return (
                      <div key={stepNumber} className="flex flex-col items-center flex-1 relative">
                        {/* Connecting Line */}
                        {stepNumber > 1 && (
                          <div className={`absolute left-[-50%] top-4 right-[50%] h-[2px] z-0 ${ownerForm.currentStep >= stepNumber ? "bg-farm-green" : "bg-farm-border"
                            }`} />
                        )}

                        {/* Circle Indicator */}
                        <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${isActive
                          ? "bg-farm-green border-farm-green text-white shadow"
                          : isCompleted
                            ? "bg-farm-green border-farm-green text-white"
                            : "bg-white border-farm-border text-farm-text-light"
                          }`}>
                          {isCompleted ? "✓" : stepNumber}
                        </div>

                        {/* Step Name label */}
                        <span className={`text-[10px] font-bold mt-2 text-center transition-colors truncate max-w-[70px] ${isActive ? "text-farm-green" : "text-farm-text-light"
                          }`}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Step 1: Account Credentials */}
                {ownerForm.currentStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="sm:col-span-2 text-xs font-bold text-farm-gold uppercase tracking-wider border-b border-farm-border/40 pb-1">
                      {t.register.ownerSteps.step1}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.common.fullName}</label>
                      <input
                        type="text"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.nama}
                        onChange={(e) => ownerForm.updateFormData({ nama: e.target.value })}
                      />
                      {validationErrors.nama && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.nama}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.common.email}</label>
                      <input
                        type="email"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.email}
                        onChange={(e) => ownerForm.updateFormData({ email: e.target.value })}
                      />
                      {validationErrors.email && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.email}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.common.password}</label>
                      <div className="relative mt-1.5">
                        <input
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading || success}
                          className="block w-full px-4 pr-10 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                          value={ownerForm.formData.password}
                          onChange={(e) => ownerForm.updateFormData({ password: e.target.value })}
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
                      {validationErrors.password && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.password}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.common.confirmPassword}</label>
                      <div className="relative mt-1.5">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          disabled={isLoading || success}
                          className="block w-full px-4 pr-10 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                          value={ownerForm.formData.password_confirmation}
                          onChange={(e) => ownerForm.updateFormData({ password_confirmation: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-farm-green transition-colors focus:outline-none"
                        >
                          {showConfirmPassword ? (
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
                      {validationErrors.password_confirmation && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.password_confirmation}</span>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-farm-text">{t.common.phoneNumber}</label>
                      <input
                        type="text"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.nomor_hp}
                        onChange={(e) => ownerForm.updateFormData({ nomor_hp: e.target.value })}
                      />
                      {validationErrors.nomor_hp && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.nomor_hp}</span>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-farm-text">{t.common.address}</label>
                      <textarea
                        rows={3}
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full p-3.5 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.alamat}
                        onChange={(e) => ownerForm.updateFormData({ alamat: e.target.value })}
                      />
                      {validationErrors.alamat && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.alamat}</span>}
                    </div>
                  </div>
                )}

                {/* Step 2: Accommodation Profile */}
                {ownerForm.currentStep === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="sm:col-span-2 text-xs font-bold text-farm-gold uppercase tracking-wider border-b border-farm-border/40 pb-1">
                      {t.register.ownerSteps.step2}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.accommodationName}</label>
                      <input
                        type="text"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.nama_akomodasi}
                        onChange={(e) => ownerForm.updateFormData({ nama_akomodasi: e.target.value })}
                      />
                      {validationErrors.nama_akomodasi && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.nama_akomodasi}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.accommodationType}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.tipe_akomodasi}
                        onChange={(e) => ownerForm.updateFormData({ tipe_akomodasi: e.target.value })}
                      >
                        <option value="">{t.register.ownerSteps.fields.accommodationTypePlaceholder}</option>
                        {accommodationTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {validationErrors.tipe_akomodasi && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.tipe_akomodasi}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.starRating}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.rating_bintang}
                        onChange={(e) => ownerForm.updateFormData({ rating_bintang: e.target.value })}
                      >
                        <option value="">{t.register.ownerSteps.fields.starRatingPlaceholder}</option>
                        {ratingOptions.map((rating) => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                      {validationErrors.rating_bintang && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.rating_bintang}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.roomCount}</label>
                      <input
                        type="number"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.jumlah_kamar}
                        onChange={(e) => ownerForm.updateFormData({ jumlah_kamar: Number(e.target.value) })}
                      />
                      {validationErrors.jumlah_kamar && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.jumlah_kamar}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.bedCount}</label>
                      <input
                        type="number"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.jumlah_tempat_tidur}
                        onChange={(e) => ownerForm.updateFormData({ jumlah_tempat_tidur: Number(e.target.value) })}
                      />
                      {validationErrors.jumlah_tempat_tidur && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.jumlah_tempat_tidur}</span>}
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {ownerForm.currentStep === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="sm:col-span-2 text-xs font-bold text-farm-gold uppercase tracking-wider border-b border-farm-border/40 pb-1">
                      {t.register.ownerSteps.step3}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.province}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.provinsi}
                        onChange={(e) => ownerForm.updateFormData({ provinsi: e.target.value })}
                      >
                        <option value="">{t.register.ownerSteps.fields.provincePlaceholder}</option>
                        {provinces.map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                      {validationErrors.provinsi && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.provinsi}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.city}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.kabupaten_kota}
                        onChange={(e) => ownerForm.updateFormData({ kabupaten_kota: e.target.value })}
                      >
                        <option value="">{t.register.ownerSteps.fields.cityPlaceholder}</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {validationErrors.kabupaten_kota && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.kabupaten_kota}</span>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-farm-text">{t.common.address}</label>
                      <textarea
                        rows={3}
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full p-3.5 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.alamat_lengkap}
                        onChange={(e) => ownerForm.updateFormData({ alamat_lengkap: e.target.value })}
                      />
                      {validationErrors.alamat_lengkap && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.alamat_lengkap}</span>}
                    </div>
                  </div>
                )}

                {/* Step 4: Sustainability Status */}
                {ownerForm.currentStep === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="sm:col-span-2 text-xs font-bold text-farm-gold uppercase tracking-wider border-b border-farm-border/40 pb-1">
                      {t.register.ownerSteps.step4}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.certificates}</label>
                      <input
                        type="text"
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        placeholder="e.g. CHSE, Green Globe"
                        value={ownerForm.formData.sertifikasi_yang_dimiliki}
                        onChange={(e) => ownerForm.updateFormData({ sertifikasi_yang_dimiliki: e.target.value })}
                      />
                      <span className="text-[9px] text-farm-text-light font-light block mt-1">{t.register.ownerSteps.fields.certificatesHint}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.energyManagement}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.status_manajemen_energi}
                        onChange={(e) => {
                          ownerForm.updateFormData({ status_manajemen_energi: e.target.value });
                          clearError("status_manajemen_energi");
                        }}
                      >
                        <option value="">{t.register.ownerSteps.fields.managementPlaceholder}</option>
                        <option value="Sudah ada">{t.register.ownerSteps.fields.statusReady}</option>
                        <option value="Belum ada">{t.register.ownerSteps.fields.statusNone}</option>
                      </select>
                      {validationErrors.status_manajemen_energi && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.status_manajemen_energi}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.waterManagement}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.status_manajemen_air}
                        onChange={(e) => {
                          ownerForm.updateFormData({ status_manajemen_air: e.target.value });
                          clearError("status_manajemen_air");
                        }}
                      >
                        <option value="">{t.register.ownerSteps.fields.managementPlaceholder}</option>
                        <option value="Sudah ada">{t.register.ownerSteps.fields.statusReady}</option>
                        <option value="Belum ada">{t.register.ownerSteps.fields.statusNone}</option>
                      </select>
                      {validationErrors.status_manajemen_air && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.status_manajemen_air}</span>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-farm-text">{t.register.ownerSteps.fields.wasteManagement}</label>
                      <select
                        disabled={isLoading || success}
                        className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-xs sm:text-sm text-farm-text"
                        value={ownerForm.formData.status_manajemen_limbah}
                        onChange={(e) => {
                          ownerForm.updateFormData({ status_manajemen_limbah: e.target.value });
                          clearError("status_manajemen_limbah");
                        }}
                      >
                        <option value="">{t.register.ownerSteps.fields.managementPlaceholder}</option>
                        <option value="Sudah ada">{t.register.ownerSteps.fields.statusReady}</option>
                        <option value="Belum ada">{t.register.ownerSteps.fields.statusNone}</option>
                      </select>
                      {validationErrors.status_manajemen_limbah && <span className="text-[10px] text-red-500 font-semibold">{validationErrors.status_manajemen_limbah}</span>}
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Buttons */}
                <div className="pt-6 flex items-center justify-between border-t border-farm-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      if (ownerForm.isFirstStep) {
                        setRole("none");
                      } else {
                        ownerForm.prevStep();
                        setValidationErrors({});
                      }
                    }}
                    className="text-xs font-bold text-farm-text hover:text-farm-green py-2.5 px-5 border border-farm-border rounded-lg bg-white"
                  >
                    {t.common.back}
                  </button>

                  {!ownerForm.isLastStep ? (
                    <button
                      type="button"
                      onClick={handleOwnerNext}
                      className="inline-flex h-11 items-center justify-center bg-farm-green text-white font-semibold px-6 rounded-lg text-xs sm:text-sm hover:bg-farm-green-hover shadow-sm"
                    >
                      {t.common.next}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || success}
                      className="inline-flex h-11 items-center justify-center bg-farm-green text-white font-semibold px-6 rounded-lg text-xs sm:text-sm hover:bg-farm-green-hover disabled:opacity-50 shadow-sm"
                    >
                      {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t.common.submit}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
