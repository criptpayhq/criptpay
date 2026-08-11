import { create } from "zustand";
import { handleApiError } from "../lib/error-handler";
import api from "@/lib/api";
import { type Transaction, type TransactionState } from "../lib/types";

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,

  setTransactions: (transactions) => set({ transactions }),

  fetchAllTransactions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<{ data: Transaction[] } | Transaction[]>(
        "/transfers/history",
        { withCredentials: true }
      );
      // Laravel might return { data: [...] } or just [...]
      const transactions = (response.data as any).data || response.data || [];
      set({ transactions, isLoading: false });
    } catch (error) {
      set({
        error: "Failed to fetch transactions",
        isLoading: false,
        transactions: [],
      }); // Reset to empty array on error
      handleApiError(error, "Fail to fetch transactions, refresh or try again later");
    }
  },
}));
