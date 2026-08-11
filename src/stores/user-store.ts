import { create } from "zustand";
import api from "../lib/api";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  nickName: string;
  email: string;
  avatar: string;
  authProvider: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  googleId?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  fetchAllUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,

  fetchAllUsers: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/users");
      set({ users: res.data, loading: false });
    } catch (error: any) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch users");
    }
  },
}));
