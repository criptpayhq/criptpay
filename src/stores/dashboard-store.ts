import api from "@/lib/api";
import type { Transaction, TransactionStats } from "@/lib/types";
import { handleApiError } from "@/lib/error-handler";
import { create } from "zustand";

interface DashboardState {
  transactions: Transaction[];
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
  fetchAllTransactionsByAdmin: () => Promise<void>;
  fetchTransactionStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  transactions: [],
  stats: null,
  loading: false,
  error: null,

  fetchAllTransactionsByAdmin: async () => {
    set({ loading: true });
    try {
      const response = await api.get<{ transactions: Transaction[] }>("/admin/transactions", {
        withCredentials: true,
      });
      set({ transactions: response.data.transactions || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch transactions", loading: false });
      handleApiError(error, "Fail to fetch transactions, refresh or try again later");
    }
  },

  fetchTransactionStats: async () => {
    try {
      const response = await api.get<TransactionStats>("/stats", {
        withCredentials: true,
      });
      set({ stats: response.data });
    } catch (error) {
      console.error("Failed to fetch statistics", error);
    }
  },
}));

