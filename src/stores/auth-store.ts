import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import { type User, type AuthState, type AuthResponse, type UserResponse } from "../lib/types";
import { handleApiError } from "../lib/error-handler";
import toast from "react-hot-toast";

const API_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://criptpay-f2lv.onrender.com";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
      isLoading: false,
      isGoogleLoading: false,

      register: async (nickName: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post<AuthResponse>(
            "/auth/register",
            {
              nick_name: nickName,
              email,
              password,
            },
            { withCredentials: true }
          );
          set({
            user: res.data.user,
            isAuthenticated: true,
            isCheckingAuth: false,
            isLoading: false,
          });
          if (res.data.access_token) {
            localStorage.setItem("accessToken", res.data.access_token);
          }
          toast.success("signup successful, welcome!");
        } catch (err) {
          set({ isLoading: false });
          handleApiError(err, "Failed to create account. Please try again.");
          throw err;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
          });
          toast.success("Login successful");
          set({
            user: res.data.user,
            isAuthenticated: true,
            isCheckingAuth: false,
            isLoading: false,
          });
          if (res.data.access_token) {
            localStorage.setItem("accessToken", res.data.access_token);
          }
        } catch (error) {
          set({ isLoading: false });
          handleApiError(error, "Failed to sign in. Please try again.");
        }
      },

      googleLogin: () => {
        set({ isGoogleLoading: true });
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${API_URL}/api/auth/google`;
      },

      setTokensFromURL: async (accessToken: string, refreshToken: string) => {
        try {
          // Store tokens in localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken); // Kept for interface compatibility
          
          // Fetch user profile to verify and authenticate
          const res = await api.get<AuthResponse>("/auth/user", {
            withCredentials: true,
          });
          
          set({
            user: res.data.user,
            isAuthenticated: true,
            isGoogleLoading: false,
          });
          toast.success("Google login successful!");
        } catch (error) {
          console.error("Error setting tokens from URL:", error);
          set({ isGoogleLoading: false });
          toast.error("Failed to complete Google login");
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/auth/logout");
          set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            isLoading: false,
          });
          toast.success("Logged out successfully");
        } catch (error) {
          toast.error("Error logging out");
          console.error(error, "Logout Error");
        }
      },

      checkAuth: async () => {
        // Prevent checking if already checking or loading
        if (get().isCheckingAuth || get().isLoading) {
          console.log("⏸Skipping checkAuth - already checking or loading");
          return;
        }

        const { user, isAuthenticated } = get();

        const hasAuthCandidate =
          Boolean(user) ||
          Boolean(localStorage.getItem("accessToken")) ||
          Boolean(localStorage.getItem("refreshToken")) ||
          /XSRF-TOKEN|laravel_session/.test(document.cookie || "");

        if (!hasAuthCandidate) {
          console.log("Skipping auth check for unauthenticated visitor");
          set({ isCheckingAuth: false });
          return;
        }

        if (user && isAuthenticated) {
          console.log(
            "Optimistic Auth: user present locally and verifying in background...",
          );
        } else {
          set({ isCheckingAuth: true });
        }

        try {
          const res = await api.get<UserResponse>("/auth/user", {
            withCredentials: true,
          });
          console.log("Auth check successful:", res.data.user.email);
          // Update user with fresh data from server
          set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
          console.log(error, "An error occurred");
          
          // Only force logout if we were previously authenticated (optimistic failure)
          // or if it was a standard check
           set({ user: null, isAuthenticated: false, isCheckingAuth: false });

           // Optional: If we were fully authenticated and this failed, we might want to alert the user
           // but silent logout on session expiry is standard.
        }
      },

      refreshToken: async () => {
        // Prevent multiple simultaneous refresh attempts
        if (get().isAuthenticated) return;

        set({ isAuthenticated: true });
        try {
          const response = await api.post("/auth/refresh-token");
          set({ isAuthenticated: false });
          return response.data;
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent to your email!");
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error, "Error sending reset link");
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true });
    try {
      await api.post(`/auth/reset-password`, { 
        token,
        email: new URLSearchParams(window.location.search).get("email"),
        password,
        password_confirmation: password 
      });
      toast.success("Password reset successful! Please login.");
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error, "Error resetting password");
      throw error;
    }
  },
}),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
