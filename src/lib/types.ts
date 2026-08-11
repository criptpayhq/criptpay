{
  /*---------- Auth ----------*/
}
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  register: (
    nickName: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => void;
  setTokensFromURL: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export interface User {
  _id?: string;
  id?: string;
  nickName?: string;
  nick_name?: string;
  email: string;
  password?: string;
  hasPassword?: boolean;
  avatar?: string;
  authProvider?: "local" | "google";
  auth_provider?: "local" | "google";
  role?: "user" | "admin";
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date;
  updated_at?: Date;
}

export interface AuthResponse {
  user: User;
  access_token?: string;
  message?: string;
}

export interface UserResponse {
  user: User;
}

{
  /*---------- Transaction ----------*/
}
export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error?: string;

  setTransactions: (transactions: Transaction[]) => void;
  fetchAllTransactions: () => Promise<void>;
}

export interface Transaction {
  _id?: string;
  id?: string;
  user?: User;
  fromCurrency?: string;
  from_currency?: string;
  toCurrency?: string;
  to_currency?: string;
  amount: number;
  receiveAmount?: number;
  receive_amount?: number;
  address: string;
  network?: string;
  networkType?: string;
  network_type?: string;
  bankName?: string;
  bank_name?: string;
  accountNumber?: string;
  account_number?: string;
  accountName?: string;
  account_name?: string;
  status: "pending" | "PENDING" | "processing" | "PROCESSING" | "completed" | "COMPLETED" | "failed" | "FAILED" | "SUCCESS" | "AWAITING_DEPOSIT" | "AWAITING_FUNDS_FROM_SENDER" | "DEPOSIT_RECEIVED" | "AWAITING_BALANCE_REFRESH" | "BALANCE_CONFIRMED_PROCESSING_FUNDS" | "FUNDS_WITHDRAWN" | "ON_CHAIN_CONFIRMED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERY_COMPLETE" | "DELIVERY_FAILED_RESOLVING" | "DELIVERY_CANCELLED" | "PAYMENT_FAILED" | "CANCELLED",
  timestamp: Date | string;
  userId?: string;
  user_id?: string;
  walletId?: string;
  reference?: string;
  beneficiaryId?: string;
  transactionHash?: string;
  transaction_hash?: string;

  country?: string;

  offrampExecuted?: boolean;
  offramp_executed?: boolean;
  offrampStatus?: "pending" | "PENDING" | "processing" | "PROCESSING" | "completed" | "COMPLETED" | "failed" | "FAILED" | "SUCCESS" | "AWAITING_DEPOSIT" | "AWAITING_FUNDS_FROM_SENDER" | "DEPOSIT_RECEIVED" | "AWAITING_BALANCE_REFRESH" | "BALANCE_CONFIRMED_PROCESSING_FUNDS" | "FUNDS_WITHDRAWN" | "ON_CHAIN_CONFIRMED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERY_COMPLETE" | "DELIVERY_FAILED_RESOLVING" | "DELIVERY_CANCELLED" | "PAYMENT_FAILED",
  offramp_status?: string;
  offrampError?: string | null;
  offramp_error?: string | null;
}

export interface TransactionStats {
  totalAmountUSD: number;
  totalAmountNGN: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
}

{
  /* -----Bank------ */
}

export interface Bank {
  _id?: string;
  id?: string;
  bankName?: string;
  bank_name?: string;
  bankCode?: string;
  bank_code?: string;
  accountNumber?: string;
  account_number?: string;
  accountName?: string;
  account_name?: string;
}

export interface BankState {
  savedBank: Bank | null;
  isLoading: boolean;
  error: string | null;

  fetchBankDetails: () => Promise<void>;
  saveOrUpdateBank: (bankData: Omit<Bank, "_id">) => Promise<boolean>;
  deleteBankDetails: () => Promise<void>;
  clearBankDetails: () => void;
}
