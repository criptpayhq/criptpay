import { create } from "zustand";
import api from "@/lib/api";
import { handleApiError } from "../lib/error-handler";
import toast from "react-hot-toast";

export interface Business {
  _id?: string;
  id: string;
  name: string;
  address: string;
  email: string;
  website?: string;
  description: string;
  type: string;
  isRegistered: boolean;
  is_registered?: boolean;
  status: "new" | "pending" | "active" | "rejected";
  apiKey?: string;
  api_key?: string;
  rejectionReason?: string;
  rejection_reason?: string;
  supportContact?: string;
  support_contact?: string;
  created_at: string;
  owner?: {
      id: string;
      nick_name: string;
      email: string;
  }
}

const normalizeBusiness = (business: any): Business => ({
  ...business,
  id: String(business.id ?? business._id ?? ""),
  _id: business._id ?? String(business.id ?? ""),
  apiKey: business.apiKey ?? business.api_key,
  rejectionReason: business.rejectionReason ?? business.rejection_reason,
  supportContact: business.supportContact ?? business.support_contact,
  isRegistered: business.isRegistered ?? business.is_registered ?? false,
});

const matchesBusinessId = (business: Business, id: string) =>
  String(business.id ?? business._id ?? "") === String(id);

export interface BusinessStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface BusinessState {
  businesses: Business[];
  adminRequests: Business[];
  stats: BusinessStats;
  loading: boolean;
  creating: boolean;
  // User Actions
  fetchMyBusinesses: () => Promise<void>;
  createBusiness: (data: Partial<Business>) => Promise<void>;
  requestApiKey: (id: string) => Promise<void>;
  // Admin Actions
  fetchAdminRequests: () => Promise<void>;
  fetchBusinessStats: () => Promise<void>;
  approveBusiness: (id: string) => Promise<void>;
  rejectBusiness: (id: string, reason: string, supportContact: string) => Promise<void>;
  requestViewApiKeyOtp: (id: string) => Promise<boolean>;
  verifyViewApiKeyOtp: (id: string, otp: string) => Promise<string | null>;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  adminRequests: [],
  stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
  loading: false,
  creating: false,

  fetchMyBusinesses: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/businesses");
      set({
        businesses: Array.isArray(res.data)
          ? res.data.map(normalizeBusiness)
          : [],
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false });
      handleApiError(error, "Failed to fetch businesses");
    }
  },

  createBusiness: async (data) => {
    set({ creating: true });
    try {
      const res = await api.post("/businesses", data);
      set((state) => ({
        businesses: [normalizeBusiness(res.data.business), ...state.businesses],
        creating: false,
      }));
      toast.success("Business profile created!");
    } catch (error: any) {
      set({ creating: false });
      handleApiError(error, "Failed to create business");
    }
  },

  requestApiKey: async (id) => {
    try {
      const res = await api.post(`/businesses/${id}/request-api-key`);
      const updatedBusiness = normalizeBusiness(res.data.business);
      // Update local state
      set((state) => ({
        businesses: state.businesses.map((b) =>
          matchesBusinessId(b, id) ? { ...b, ...updatedBusiness } : b
        ),
      }));
      toast.success("API Key request sent!");
    } catch (error: any) {
      handleApiError(error, "Failed to request API Key");
    }
  },

  fetchAdminRequests: async () => {
      set({ loading: true });
    try {
      const res = await api.get("/admin/businesses");
      set({
        adminRequests: Array.isArray(res.data)
          ? res.data.map(normalizeBusiness)
          : [],
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false });
      handleApiError(error, "Failed to fetch requests");
    }
  },

  fetchBusinessStats: async () => {
    try {
      const res = await api.get("/admin/businesses/stats");
      set({ stats: res.data });
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  },

  approveBusiness: async (id) => {
    try {
        const res = await api.post(`/admin/businesses/${id}/approve`);
        const updatedBusiness = normalizeBusiness(res.data.business);
        set((state) => ({
            adminRequests: state.adminRequests.map((b) =>
              matchesBusinessId(b, id) ? updatedBusiness : b
            ),
            businesses: state.businesses.map((b) =>
              matchesBusinessId(b, id) ? { ...b, ...updatedBusiness } : b
            ),
        }));
        toast.success("Business approved & Key generated!");
    } catch (error: any) {
        handleApiError(error, "Failed to approve");
    }
  },
  rejectBusiness: async (id, reason, supportContact) => {
    try {
        const res = await api.post(`/admin/businesses/${id}/reject`, { reason, supportContact });
        const updatedBusiness = normalizeBusiness(res.data.business);
        set((state) => ({
            adminRequests: state.adminRequests.map((b) =>
              matchesBusinessId(b, id) ? updatedBusiness : b
            ),
            businesses: state.businesses.map((b) =>
              matchesBusinessId(b, id) ? { ...b, ...updatedBusiness } : b
            ),
        }));
        toast.success("Business rejected.");
    } catch (error: any) {
        handleApiError(error, "Failed to reject");
    }
  },

  requestViewApiKeyOtp: async (id) => {
    try {
      await api.post(`/businesses/${id}/request-view-api-key-otp`);
      toast.success("OTP sent to your business email!");
      return true;
    } catch (error: any) {
      handleApiError(error, "Failed to send OTP");
      return false;
    }
  },

  verifyViewApiKeyOtp: async (id, otp) => {
      try {
          const res = await api.post(`/businesses/${id}/verify-view-api-key-otp`, { otp });
          toast.success("Key verified!");
          const fullKey = res.data.apiKey ?? res.data.api_key;
          
          set((state) => ({
            businesses: state.businesses.map((b) =>
              matchesBusinessId(b, id) ? { ...b, apiKey: fullKey } : b
            ),
          }));

          return fullKey;
      } catch (error: any) {
          handleApiError(error, "Invalid OTP");
          return null;
      }
  }

}));
