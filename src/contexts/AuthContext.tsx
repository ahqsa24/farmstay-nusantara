import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { authService } from "../services/authService";
import { User, LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize Auth state from cookies
  const initializeAuth = async () => {
    setIsLoading(true);
    setError(null);
    const storedToken = Cookies.get("token");

    if (storedToken) {
      setToken(storedToken);
      try {
        const response = await authService.getProfile();
        if (response.status === "success" && response.data) {
          const normalizedProfile: UserProfile = {
            ...response.data,
            role: (response.data.role as any) === "farmstay_owner" ? "owner" : response.data.role,
          };
          setProfile(normalizedProfile);
          setUser({
            id: response.data.id,
            nama: response.data.nama,
            email: response.data.email,
            role: normalizedProfile.role,
            profile_picture_url: response.data.profile_picture_url,
          });
        } else {
          // Token is invalid/expired
          Cookies.remove("token");
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Initialization auth error:", err);
        // Do not force logout on temporary network failures, but clean if unauthorized
        Cookies.remove("token");
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (payload: LoginRequest): Promise<boolean> => {
    setError(null);
    try {
      const response = await authService.login(payload);
      if (response.status === "success" && response.data) {
        const { token: userToken, user: userData } = response.data;
        setToken(userToken);
        
        const normalizedUser: User = {
          ...userData,
          role: (userData.role as any) === "farmstay_owner" ? "owner" : userData.role,
        };
        setUser(normalizedUser);
        
        // Fetch detailed profile to populate full details
        try {
          const profileResponse = await authService.getProfile();
          if (profileResponse.status === "success" && profileResponse.data) {
            const normalizedProfile: UserProfile = {
              ...profileResponse.data,
              role: (profileResponse.data.role as any) === "farmstay_owner" ? "owner" : profileResponse.data.role,
            };
            setProfile(normalizedProfile);
          }
        } catch (e) {
          console.error("Failed to fetch full profile details after login:", e);
        }
        
        return true;
      } else {
        setError(response.message || "Email atau password salah.");
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Terjadi kesalahan saat masuk. Coba lagi.";
      setError(msg);
      return false;
    }
  };

  const register = async (payload: RegisterRequest): Promise<boolean> => {
    setError(null);
    try {
      const response = await authService.register(payload);
      if (response.status === "success") {
        return true;
      } else {
        setError(response.message || "Pendaftaran gagal.");
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Terjadi kesalahan saat mendaftar. Coba lagi.";
      setError(msg);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      router.push("/auth/login");
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.status === "success" && response.data) {
        const normalizedProfile: UserProfile = {
          ...response.data,
          role: (response.data.role as any) === "farmstay_owner" ? "owner" : response.data.role,
        };
        setProfile(normalizedProfile);
        setUser({
          id: response.data.id,
          nama: response.data.nama,
          email: response.data.email,
          role: normalizedProfile.role,
          profile_picture_url: response.data.profile_picture_url,
        });
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
