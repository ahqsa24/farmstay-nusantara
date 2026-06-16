import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profileService";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { masterDataService } from "@/services/masterDataService";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslation();

  const [activeSubTab, setActiveSubTab] = useState<"general" | "password">("general");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // General Profile form state
  const [nama, setNama] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  
  // Owner specific details state
  const [accommodationName, setAccommodationName] = useState("");
  const [accommodationType, setAccommodationType] = useState("");
  const [roomCount, setRoomCount] = useState(0);
  const [bedCount, setBedCount] = useState(0);
  const [selectedDisasters, setSelectedDisasters] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [disasterOptions, setDisasterOptions] = useState<string[]>([]);
  const [zoneOptions, setZoneOptions] = useState<string[]>([]);

  // Password change form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load profile data on mount
  useEffect(() => {
    if (profile) {
      setNama(profile.nama || "");
      setPhoneNumber(profile.detail?.phoneNumber || profile.detail?.nomor_hp || "");
      setAddress(profile.detail?.address || profile.detail?.alamat || "");
      
      if (profile.role === "owner") {
        setAccommodationName(profile.detail?.nama_akomodasi || "");
        setAccommodationType(profile.detail?.tipe_akomodasi || "");
        setRoomCount(profile.detail?.jumlah_kamar || 0);
        setBedCount(profile.detail?.jumlah_tempat_tidur || 0);
        setSelectedDisasters(profile.detail?.risiko_bencana_alam || []);
        setSelectedZones(profile.detail?.status_kawasan_khusus || []);
      }
    }
  }, [profile]);

  useEffect(() => {
    const loadProfileOptions = async () => {
      try {
        const disasterRes = await masterDataService.getMasterData("bencana_alam");
        if (disasterRes.status === "success" && disasterRes.data && disasterRes.data.length > 0) {
          setDisasterOptions(disasterRes.data.map((item) => item.label));
        } else {
          setDisasterOptions(["Banjir", "Gempa Bumi", "Tanah Longsor", "Tsunami", "Gunung Berapi", "Kekeringan"]);
        }
      } catch {
        setDisasterOptions(["Banjir", "Gempa Bumi", "Tanah Longsor", "Tsunami", "Gunung Berapi", "Kekeringan"]);
      }

      try {
        const zoneRes = await masterDataService.getMasterData("kawasan_khusus");
        if (zoneRes.status === "success" && zoneRes.data && zoneRes.data.length > 0) {
          setZoneOptions(zoneRes.data.map((item) => item.label));
        } else {
          setZoneOptions(["Taman Nasional", "Cagar Biosfer", "Geopark", "Kawasan Lindung", "Taman Wisata Alam"]);
        }
      } catch {
        setZoneOptions(["Taman Nasional", "Cagar Biosfer", "Geopark", "Kawasan Lindung", "Taman Wisata Alam"]);
      }
    };

    loadProfileOptions();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const detail: Record<string, any> = {
        phoneNumber,
        address,
      };

      if (user?.role === "owner") {
        detail.nama_akomodasi = accommodationName;
        detail.tipe_akomodasi = accommodationType;
        detail.jumlah_kamar = Number(roomCount);
        detail.jumlah_tempat_tidur = Number(bedCount);
        detail.risiko_bencana_alam = selectedDisasters;
        detail.status_kawasan_khusus = selectedZones;
      } else {
        // Visitor mapping
        detail.nomor_hp = phoneNumber;
        detail.alamat = address;
      }

      const response = await profileService.updateProfile({
        nama,
        detail,
      });

      if (response.status === "success") {
        setSuccessMsg(t.register.successMsg || "Profil berhasil diperbarui!");
        await refreshProfile();
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg(t.common.validationPasswordMatch);
      return;
    }

    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await profileService.updatePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (response.status === "success") {
        setSuccessMsg("Password berhasil diperbarui!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await profileService.uploadProfilePicture(file);
      if (response.status === "success") {
        setSuccessMsg("Foto profil berhasil diunggah!");
        await refreshProfile();
      } else {
        setErrorMsg(response.message || t.common.errorOccurred);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t.common.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (value: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-8">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between border-b border-farm-border/60 pb-5">
            <div>
              <Link href="/dashboard" className="text-xs font-bold text-farm-green hover:underline">
                ← Kembali ke Dashboard
              </Link>
              <h1 className="font-serif text-3xl font-bold mt-2">Pengaturan Akun</h1>
            </div>

            {/* Profile Avatar Trigger */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="h-16 w-16 rounded-full bg-farm-green flex items-center justify-center text-white font-extrabold text-xl overflow-hidden border border-farm-border">
                  {profile?.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.nama.substring(0, 2).toUpperCase()
                  )}
                </div>
                <label className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center px-1">
                  Ubah Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-farm-border/60 gap-6">
            <button
              onClick={() => { setActiveSubTab("general"); setSuccessMsg(""); setErrorMsg(""); }}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeSubTab === "general" ? "border-farm-green text-farm-green" : "border-transparent text-farm-text-light hover:text-farm-text"
              }`}
            >
              Ubah Profil
            </button>
            <button
              onClick={() => { setActiveSubTab("password"); setSuccessMsg(""); setErrorMsg(""); }}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeSubTab === "password" ? "border-farm-green text-farm-green" : "border-transparent text-farm-text-light hover:text-farm-text"
              }`}
            >
              Ganti Password
            </button>
          </div>

          <div className="bg-white border border-farm-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {activeSubTab === "general" ? (
              /* Profile details update form */
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 text-xs font-bold text-farm-gold uppercase tracking-wider border-b border-farm-border/60 pb-1">
                    Informasi Akun Utama
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-farm-text">{t.common.fullName}</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-farm-text">{t.common.phoneNumber}</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-farm-text">{t.common.address}</label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full p-3 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Owner-specific settings */}
                  {user?.role === "owner" && (
                    <>
                      <div className="sm:col-span-2 text-xs font-bold text-farm-gold uppercase tracking-wider border-b border-farm-border/60 pb-1 mt-4">
                        Profil & Status Akomodasi
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-farm-text">Nama Akomodasi</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                          value={accommodationName}
                          onChange={(e) => setAccommodationName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-farm-text">Tipe Akomodasi</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                          value={accommodationType}
                          onChange={(e) => setAccommodationType(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-farm-text">Kamar</label>
                          <input
                            type="number"
                            className="mt-1 block w-full px-3 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                            value={roomCount}
                            onChange={(e) => setRoomCount(Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-farm-text">Tempat Tidur</label>
                          <input
                            type="number"
                            className="mt-1 block w-full px-3 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                            value={bedCount}
                            onChange={(e) => setBedCount(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Multi-select natural disaster risks */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-farm-text mb-2">Risiko Bencana Alam</label>
                        <div className="flex flex-wrap gap-3">
                          {disasterOptions.map((disaster) => {
                            const isChecked = selectedDisasters.includes(disaster);
                            return (
                              <button
                                type="button"
                                key={disaster}
                                onClick={() => handleCheckboxChange(disaster, selectedDisasters, setSelectedDisasters)}
                                className={`px-4 h-9 rounded-lg text-xs font-semibold border transition-all ${
                                  isChecked ? "bg-farm-green border-farm-green text-white" : "border-farm-border text-farm-text bg-farm-cream hover:border-farm-green hover:text-farm-green"
                                }`}
                              >
                                {disaster}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-select special zones */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-farm-text mb-2">Status Kawasan Khusus</label>
                        <div className="flex flex-wrap gap-3">
                          {zoneOptions.map((zone) => {
                            const isChecked = selectedZones.includes(zone);
                            return (
                              <button
                                type="button"
                                key={zone}
                                onClick={() => handleCheckboxChange(zone, selectedZones, setSelectedZones)}
                                className={`px-4 h-9 rounded-lg text-xs font-semibold border transition-all ${
                                  isChecked ? "bg-farm-green border-farm-green text-white" : "border-farm-border text-farm-text bg-farm-cream hover:border-farm-green hover:text-farm-green"
                                }`}
                              >
                                {zone}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-farm-border/60 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-farm-green px-8 text-sm font-semibold text-white shadow hover:bg-farm-green-hover disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan Profil"}
                  </button>
                </div>
              </form>
            ) : (
              /* Password change form */
              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-farm-text">Password Lama</label>
                  <input
                    type="password"
                    className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-text">Password Baru</label>
                  <input
                    type="password"
                    className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-text">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    className="mt-1.5 block w-full px-4 h-11 border border-farm-border rounded-lg bg-farm-cream focus:outline-none focus:ring-1 focus:ring-farm-green text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-4 border-t border-farm-border/60">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-farm-green px-8 text-sm font-semibold text-white shadow hover:bg-farm-green-hover disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Ubah Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }
