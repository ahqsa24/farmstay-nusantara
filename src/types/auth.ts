export type UserRole = "owner" | "visitor" | "admin";

export interface User {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  profile_picture_url?: string | null;
  created_at?: string;
}

export interface OwnerStepData {
  nama_akomodasi: string;
  tipe_akomodasi: string;
  rating_bintang: string | number; // e.g., 3, "3 ⭐", "-"
  jumlah_kamar: number;
  jumlah_tempat_tidur: number;
  provinsi: string;
  kabupaten_kota: string;
  alamat_lengkap: string;
  sertifikasi_yang_dimiliki?: string | string[];
  status_manajemen_energi?: string;
  status_manajemen_air?: string;
  status_manajemen_limbah?: string;
  nomor_hp?: string;
  alamat?: string;
}

export interface VisitorStepData {
  nomor_hp: string;
  alamat: string;
}

export interface RegisterRequest {
  nama: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  step_data: OwnerStepData | VisitorStepData;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface ProfileDetails {
  // Common details or dynamically typed details
  phoneNumber?: string;
  address?: string;
  // Owner specific details
  nama_akomodasi?: string;
  tipe_akomodasi?: string;
  rating_bintang?: string | number;
  jumlah_kamar?: number;
  jumlah_tempat_tidur?: number;
  provinsi?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
  luas_area?: string | number;
  tipe_atraksi_utama?: string[];
  jumlah_hotel?: number;
  status_kawasan_khusus?: string[];
  risiko_bencana_alam?: string[];
  situs_sensitif?: string;
  situs_keagamaan?: string;
  sertifikasi_yang_dimiliki?: string | string[];
  status_manajemen_energi?: string;
  status_manajemen_air?: string;
  status_manajemen_limbah?: string;
  // Visitor specific details
  nomor_hp?: string;
  alamat?: string;
}

export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  profile_picture_url: string | null;
  role: UserRole;
  detail: ProfileDetails;
}

export interface UpdateProfileRequest {
  nama: string;
  detail: ProfileDetails;
}
