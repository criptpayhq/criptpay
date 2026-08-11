import { create } from "zustand";
import { handleApiError } from "../lib/error-handler";
import api from "@/lib/api";
import { type BankState } from "@/lib/types";
import toast from "react-hot-toast";

const normalizeBank = (bank: any) => ({
  ...bank,
  id: bank.id ?? bank._id,
  _id: bank._id ?? String(bank.id ?? ""),
  bankName: bank.bankName ?? bank.bank_name ?? "",
  bankCode: bank.bankCode ?? bank.bank_code ?? "",
  accountNumber: bank.accountNumber ?? bank.account_number ?? "",
  accountName: bank.accountName ?? bank.account_name ?? "",
});

const toBankPayload = (bankData: any) => ({
  bank_name: bankData.bank_name ?? bankData.bankName,
  bank_code: bankData.bank_code ?? bankData.bankCode,
  account_number: bankData.account_number ?? bankData.accountNumber,
  account_name: bankData.account_name ?? bankData.accountName,
});

export const useBankStore = create<BankState>((set) => ({
  savedBank: null,
  isLoading: false,
  error: null,

  // Fetch saved bank details
  fetchBankDetails: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/bank", { withCredentials: true });

      if (response.data.success) {
        set({
          savedBank: normalizeBank(response.data.bank),
          isLoading: false,
        });
      } else {
        set({
          savedBank: null,
          isLoading: false,
        });
      }
    } catch (error: any) {
      // If 404, no bank details saved yet (not an error)
      if (error.response?.status === 404) {
        set({
          savedBank: null,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          error: "Failed to fetch bank details",
          isLoading: false,
          savedBank: null,
        });
        handleApiError(error, "Failed to fetch bank details");
      }
    }
  },

  // Save or update bank details
  saveOrUpdateBank: async (bankData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/bank", toBankPayload(bankData), {
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          savedBank: normalizeBank(response.data.bank),
          isLoading: false,
        });
        toast.success(response.data.message);
        return true;
      }
      return false;
    } catch (error: any) {
      set({
        error: "Failed to save bank details",
        isLoading: false,
      });
      handleApiError(error, "Failed to save bank details");
      return false;
    }
  },

  // Delete bank details
  deleteBankDetails: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete("/bank", { withCredentials: true });

      if (response.data.success) {
        set({
          savedBank: null,
          isLoading: false,
        });
        toast.success("Bank details deleted");
      }
    } catch (error: any) {
      set({
        error: "Failed to delete bank details",
        isLoading: false,
      });
      handleApiError(error, "Failed to delete bank details");
    }
  },

  // Clear bank details from state (without API call)
  clearBankDetails: () => {
    set({ savedBank: null });
  },
}));
