import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Search, Filter, Loader2, Copy, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/myComponents/Header";
import toast from "react-hot-toast";
import { type Transaction } from "@/lib/types";
import { useDashboardStore } from "@/stores/dashboard-store";
import api from "@/lib/api";
import UserTable from "@/components/myComponents/UserTable";
// import BusinessTab from "@/components/myComponents/BusinessTab";
import AdminRequestsTab from "@/components/myComponents/AdminRequestsTab";
import AdminNotificationsTab from "@/components/myComponents/AdminNotificationsTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface OfframpButtonProps {
  transaction: Transaction;
  onSuccess: () => void;
}

const OfframpButton = ({ transaction, onSuccess }: OfframpButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [offrampDone, setOfframpDone] = useState(
    transaction.offrampExecuted || false,
  );

  useEffect(() => {
    setOfframpDone(transaction.offrampExecuted || false);
  }, [transaction.offrampExecuted]);

  const handleOfframp = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/execute-offramp/${transaction._id}`);

      if (res.data.success) {
        toast.success("Offramp executed successfully!");
        setOfframpDone(true);
        onSuccess(); // Refresh the table
      } else {
        toast.error(res.data.message || "Offramp failed");
      }
    } catch (error: any) {
      console.error("Offramp error:", error);
      toast.error(error.response?.data?.error || "Failed to execute offramp");
    } finally {
      setLoading(false);
    }
  };

  if (offrampDone) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 cursor-not-allowed"
      >
        ✓ Done
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleOfframp}
      disabled={loading}
      className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Offramping...
        </>
      ) : (
        <>Offramp</>
      )}
    </Button>
  );
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");

  // Explicitly type the state array as Transaction[]
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Assuming useDashboardStore correctly exports transactions as Transaction[]
  const {
    loading,
    transactions,
    fetchAllTransactionsByAdmin,
    stats,
    fetchTransactionStats,
  } = useDashboardStore();

  const handleRefreshStatus = async (transactionId: string) => {
    setRefreshingId(transactionId);
    try {
      await api.get(`/status/${transactionId}`);
      toast.success("Status updated!");
      fetchAllTransactionsByAdmin();
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh status");
      setRefreshingId(null);
    }
  };

  // Manual Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txHash, setTxHash] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const [developerFee, setDeveloperFee] = useState<number | string>(0);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  // Wallet address states
  const [walletEth, setWalletEth] = useState("");
  const [walletSol, setWalletSol] = useState("");
  const [walletTron, setWalletTron] = useState("");
  const [isSavingWallets, setIsSavingWallets] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);

  const openConfirmDialog = (tx: Transaction) => {
    setSelectedTx(tx);
    setTxHash("");
    setIsConfirmOpen(true);
  };

  const handleManualConfirm = async () => {
    if (!selectedTx) return;
    setIsConfirming(true);
    try {
      const res = await api.post("/confirm", {
        transactionId: selectedTx._id,
        transactionHash: txHash,
      });

      if (res.data.success) {
        toast.success("Transaction confirmed successfully!");
        setIsConfirmOpen(false);
        fetchAllTransactionsByAdmin(); // Refresh list
      } else {
        toast.error(res.data.message || "Confirmation failed");
      }
    } catch (error: any) {
      console.error("Manual confirm error:", error);
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to confirm transaction";
      toast.error(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const fetchDeveloperFee = async () => {
    setIsLoadingFee(true);
    try {
      const res = await api.get("/settings/developer-fee");
      if (res.data.success) {
        setDeveloperFee(res.data.fee);
      }
    } catch (error) {
      console.error("Error fetching developer fee:", error);
      toast.error("Failed to fetch developer fee");
    } finally {
      setIsLoadingFee(false);
    }
  };

  const fetchWalletAddresses = async () => {
    setIsLoadingWallets(true);
    try {
      const [ethRes, solRes, tronRes] = await Promise.all([
        api.get("/settings/developer_recipient_eth"),
        api.get("/settings/developer_recipient_sol"),
        api.get("/settings/developer_recipient_tron"),
      ]);
      if (ethRes.data.success) setWalletEth(ethRes.data.value || "");
      if (solRes.data.success) setWalletSol(solRes.data.value || "");
      if (tronRes.data.success) setWalletTron(tronRes.data.value || "");
    } catch (error) {
      console.error("Error fetching wallet addresses:", error);
      toast.error("Failed to fetch wallet addresses");
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const handleSaveWalletAddresses = async () => {
    setIsSavingWallets(true);
    try {
      await Promise.all([
        api.put("/settings/developer_recipient_eth", { value: walletEth || null }),
        api.put("/settings/developer_recipient_sol", { value: walletSol || null }),
        api.put("/settings/developer_recipient_tron", { value: walletTron || null }),
      ]);
      toast.success("Wallet addresses updated successfully");
    } catch (error: any) {
      console.error("Error saving wallet addresses:", error);
      toast.error(error.response?.data?.message || "Failed to update wallet addresses");
    } finally {
      setIsSavingWallets(false);
    }
  };

  const handleSaveFee = async () => {
    setIsSavingFee(true);
    try {
      const res = await api.put("/settings/developer-fee", {
        fee: developerFee,
      });
      if (res.data.success) {
        toast.success("Developer fee updated successfully");
      }
    } catch (error: any) {
      console.error("Error saving developer fee:", error);
      toast.error(error.response?.data?.message || "Failed to update fee");
    } finally {
      setIsSavingFee(false);
    }
  };

  const location = useLocation();

  const getLinkClass = (path: string) => {
    // Added type for 'path'
    const isActive = location.pathname === path;
    return cn(
      "flex-1 text-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm",
      isActive
        ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
        : "bg-transparent text-foreground dark:text-foreground hover:text-foreground dark:hover:text-black",
    );
  };

  useEffect(() => {
    fetchAllTransactionsByAdmin();
    fetchTransactionStats();
  }, [fetchAllTransactionsByAdmin, fetchTransactionStats]);

  useEffect(() => {
    // Refresh list every 5 minutes (300 seconds)
    const interval = setInterval(() => {
      fetchAllTransactionsByAdmin();
      fetchTransactionStats();
    }, 300000);
    return () => clearInterval(interval);
  }, [fetchAllTransactionsByAdmin, fetchTransactionStats]);

  const handleManualRefresh = async () => {
    setIsRefreshingAll(true);
    try {
      await Promise.all([
        fetchAllTransactionsByAdmin(),
        fetchTransactionStats(),
      ]);
      toast.success("Dashboard data refreshed");
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const q = searchQuery.toLowerCase();

    const filtered = transactions.filter((tx) =>
      Object.values(tx).some((value) =>
        String(value).toLowerCase().includes(q),
      ),
    );

    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  // Fetch developer fees when withdrawal tab is opened
  useEffect(() => {
    if (activeTab === "settings") {
      fetchDeveloperFee();
      fetchWalletAddresses();
    }
  }, [activeTab]);

  const getStatusBadge = (status: string, timestamp?: string | Date) => {
    const s = status.toUpperCase();

    // Check for 24h expiry for PENDING or AWAITING_DEPOSIT
    if (s === "PENDING" || s === "AWAITING_DEPOSIT") {
      if (timestamp) {
        const createdDate = new Date(timestamp);
        const now = new Date();
        const diffInHours =
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        if (diffInHours >= 24) {
          return (
            <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">
              Cancelled
            </Badge>
          );
        }
      }
    }

    // Handle completed statuses
    if (s === "COMPLETED" || s === "DELIVERY_COMPLETE") {
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0">
          Completed
        </Badge>
      );
    }

    if (s === "BLOCKED") {
      return (
        <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">
          Blocked
        </Badge>
      );
    }

    // Handle failed statuses
    if (
      s === "FAILED" ||
      s === "DELIVERY_FAILED_RESOLVING" ||
      s === "DELIVERY_CANCELLED" ||
      s === "PAYMENT_FAILED"
    ) {
      return (
        <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">
          Failed
        </Badge>
      );
    }

    // Handle all pending/in-progress statuses
    const pendingStatuses = [
      "PENDING",
      "PROCESSING",
      "AWAITING_DEPOSIT",
      "AWAITING_FUNDS_FROM_SENDER",
      "DEPOSIT_RECEIVED",
      "AWAITING_BALANCE_REFRESH",
      "BALANCE_CONFIRMED_PROCESSING_FUNDS",
      "FUNDS_WITHDRAWN",
      "ON_CHAIN_CONFIRMED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
    ];

    if (pendingStatuses.includes(s)) {
      return (
        <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100 border-0">
          {status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      );
    }

    return <Badge variant="secondary">Unknown</Badge>;
  };

  const formatDate = (date: string | Date | undefined | null) => {
    // Added union type for 'date'
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  };

  const formatAmount = (
    value: number | string | undefined | null,
    currency?: string,
  ) => {
    if (value === undefined || value === null || value === "") return "0";

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return String(value);

    const normalizedCurrency = currency?.toUpperCase();
    const fiatCurrencies = ["NGN", "USD", "EUR", "GBP"];
    const maximumFractionDigits = fiatCurrencies.includes(
      normalizedCurrency || "",
    )
      ? 2
      : 6;

    return numericValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const copyRow = (tx: Transaction) => {
    const rowText = `
        Transaction ID: ${tx._id}
        Date: ${formatDate(tx.timestamp)}
        Status: ${tx.status}
        From: ${formatAmount(tx.amount, tx.fromCurrency)} ${tx.fromCurrency}
        To: ${formatAmount(tx.receiveAmount, tx.toCurrency)} ${tx.toCurrency}
        Account Name: ${tx.accountName}
        Account Number: ${tx.accountNumber}
        Bank: ${tx.bankName}
        Wallet: ${tx.address}
        Network: ${tx.network}
        Reference: ${tx.reference}
        User ID: ${tx.user}
        `.trim();

    navigator.clipboard.writeText(rowText);
    toast.success("Transaction copied!");
  };

  const CopyBtn = ({ value }: { value: string }) => (
    <button
      onClick={() => copyText(value)}
      className="ml-1 inline-flex items-center text-gray-500 hover:text-black dark:hover:text-white"
      title="Copy"
    >
      <Copy className="w-3 h-3" />
    </button>
  );

  const totalTransactions = filteredTransactions.length;

  return (
    // ... rest of the component is the same ...
    <div className="min-h-screen bg-[rgba(255,255,255,0.85)] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Header />
      <div className="max-w-xs mx-auto mb-3 mt-4 md:hidden lg:hidden">
        <div className="bg-[#b1f128] p-1 rounded-lg flex items-center gap-1">
          <NavLink to="/transfer" className={getLinkClass("/transfer")}>
            Transfer
          </NavLink>
          <NavLink to="/history" className={getLinkClass("/history")}>
            History
          </NavLink>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Sub-tabs */}
          <div className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-900/50 p-1 mb-6 w-fit overflow-x-auto">
            {[
              "transactions",
              "users",
              "requests",
              "notifications",
              "settings",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize",
                  activeTab === tab
                    ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300",
                )}
              >
                {tab}
              </button>
            ))}

          </div>

          {activeTab === "users" && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                User Management
              </h1>
              <p className="text-muted-foreground mb-6">
                Manage all registered users
              </p>
              <UserTable />
            </div>
          )}

          {activeTab === "requests" && (
            <div className="mb-8">
              <AdminRequestsTab />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="mb-8">
              <AdminNotificationsTab />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                System Settings
              </h1>
              <p className="text-muted-foreground mb-6">
                Configure system-wide parameters
              </p>

              <Card className="max-w-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10">
                <CardHeader>
                  <CardTitle>Fee Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="dev-fee">
                      Developer Fee Percentage (%)
                    </Label>
                    <div className="flex gap-4">
                      <Input
                        id="dev-fee"
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={developerFee}
                        onChange={(e) => setDeveloperFee(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSaveFee}
                        disabled={isSavingFee || isLoadingFee}
                        className="bg-[#b1f128] text-black hover:bg-[#b1f128]/90"
                      >
                        {isSavingFee ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      This percentage will be applied to all offramp
                      transactions as a developer fee. Set to 0 to remove the
                      fee.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="max-w-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10 mt-6">
                <CardHeader>
                  <CardTitle>Fee Recipient Wallet Addresses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Configure wallet addresses where developer fees will be automatically sent after each offramp transaction completes.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wallet-eth">
                        Ethereum / EVM Wallet (Base, ETH, Polygon, Arbitrum, Optimism, Avalanche, BSC)
                      </Label>
                      <Input
                        id="wallet-eth"
                        placeholder="0x..."
                        value={walletEth}
                        onChange={(e) => setWalletEth(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wallet-sol">
                        Solana Wallet
                      </Label>
                      <Input
                        id="wallet-sol"
                        placeholder="Solana wallet address"
                        value={walletSol}
                        onChange={(e) => setWalletSol(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wallet-tron">
                        Tron Wallet
                      </Label>
                      <Input
                        id="wallet-tron"
                        placeholder="T..."
                        value={walletTron}
                        onChange={(e) => setWalletTron(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveWalletAddresses}
                    disabled={isSavingWallets || isLoadingWallets}
                    className="bg-[#b1f128] text-black hover:bg-[#b1f128]/90"
                  >
                    {isSavingWallets ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Wallet Addresses"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "transactions" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Transaction History
                  </h1>
                  <p className="text-muted-foreground">
                    View and search your transfer history
                  </p>
                </div>
                <Button
                  onClick={handleManualRefresh}
                  disabled={isRefreshingAll}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={cn("w-4 h-4", isRefreshingAll && "animate-spin")}
                  />
                  Refresh Lists
                </Button>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 mt-6">
                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                      Total Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {stats?.totalTransactions || totalTransactions}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                      Total Vol (USD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      $
                      {stats?.totalAmountUSD.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "0.00"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                      Total Vol (NGN)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      ₦{stats?.totalAmountNGN.toLocaleString() || "0"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50/50 dark:bg-green-900/20 backdrop-blur border-green-200/50 dark:border-green-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-green-700 dark:text-green-400">
                      Successful
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-green-700 dark:text-green-400">
                      {stats?.successfulTransactions || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50/50 dark:bg-yellow-900/20 backdrop-blur border-yellow-200/50 dark:border-yellow-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                      {stats?.pendingTransactions || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50/50 dark:bg-red-900/20 backdrop-blur border-red-200/50 dark:border-red-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-red-700 dark:text-red-400">
                      Total Failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-red-700 dark:text-red-400">
                      {stats?.failedTransactions || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6 text-black dark:text-white mt-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex dark:text-white text-black items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
              {loading ? (
                <div className="flex gap-2 justify-center items-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <Card className="bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(40,40,40,0.4)] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] shadow-xl text-black dark:text-white">
                      <CardContent className="p-8 text-center">
                        <div className="text-black dark:text-white">
                          {searchQuery
                            ? "No transactions found matching your search."
                            : "No transactions yet. Start by making your first transfer!"}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
                      <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-900 text-left">
                          <tr>
                            {[
                              "Transaction ID",
                              "Date",
                              "Status",
                              "From",
                              "To",
                              "Account Name",
                              "Account Number",
                              "Bank",
                              "Wallet Address",
                              "Network",
                              "Reference",
                              "TX Hash",
                              "Actions",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {filteredTransactions.map((tx) => (
                            <tr
                              key={tx._id}
                              className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 align-top"
                            >
                              {/* Transaction ID */}
                              <td className="px-3 py-2 break-all">
                                {tx._id}
                                <CopyBtn value={tx._id} />
                              </td>

                              {/* Date */}
                              <td className="px-3 py-2 whitespace-nowrap">
                                {formatDate(tx.timestamp)}
                                <CopyBtn value={formatDate(tx.timestamp)} />
                              </td>

                              {/* Status */}
                              <td className="px-3 py-2">
                                {getStatusBadge(tx.status, tx.timestamp)}
                              </td>

                              {/* From */}
                              <td className="px-3 py-2">
                                {formatAmount(tx.amount, tx.fromCurrency)}{" "}
                                {tx.fromCurrency}
                                <CopyBtn
                                  value={`${formatAmount(tx.amount, tx.fromCurrency)} ${tx.fromCurrency}`}
                                />
                              </td>

                              {/* To */}
                              <td className="px-3 py-2">
                                {formatAmount(tx.receiveAmount, tx.toCurrency)}{" "}
                                {tx.toCurrency}
                                <CopyBtn
                                  value={`${formatAmount(tx.receiveAmount, tx.toCurrency)} ${tx.toCurrency}`}
                                />
                              </td>

                              {/* Account Name */}
                              <td className="px-3 py-2 break-words">
                                {tx.accountName}
                                <CopyBtn value={tx.accountName} />
                              </td>

                              {/* Account Number */}
                              <td className="px-3 py-2">
                                {tx.accountNumber}
                                <CopyBtn value={tx.accountNumber} />
                              </td>

                              {/* Bank */}
                              <td className="px-3 py-2">
                                {tx.bankName}
                                <CopyBtn value={tx.bankName} />
                              </td>

                              {/* Wallet */}
                              <td className="px-3 py-2 break-all font-mono text-xs">
                                {tx.address}
                                <CopyBtn value={tx.address} />
                              </td>

                              {/* Network */}
                              <td className="px-3 py-2">
                                {tx.network}
                                <CopyBtn value={tx.network} />
                              </td>

                              {/* Reference */}
                              <td className="px-3 py-2 break-all">
                                {tx.reference}
                                <CopyBtn value={tx.reference} />
                              </td>

                              {/* TX Hash */}
                              <td className="px-3 py-2 break-all font-mono text-xs text-blue-600 dark:text-blue-400">
                                {tx.transactionHash ? (
                                  <>
                                    {tx.transactionHash}
                                    <CopyBtn value={tx.transactionHash} />
                                  </>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    None
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              {/* <td className="px-3 py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyRow(tx)}
                              className="flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy all
                            </Button>
                          </td> */}
                              {/* Actions */}
                              <td className="px-3 py-2">
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyRow(tx)}
                                    className="flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy all
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRefreshStatus(tx._id)}
                                    disabled={
                                      refreshingId === tx._id ||
                                      ((tx.status.toUpperCase() === "PENDING" ||
                                        tx.status.toUpperCase() ===
                                          "AWAITING_DEPOSIT") &&
                                        new Date().getTime() -
                                          new Date(tx.timestamp).getTime() >=
                                          24 * 60 * 60 * 1000)
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    <RefreshCw
                                      className={cn(
                                        "w-3 h-3",
                                        refreshingId === tx._id &&
                                          "animate-spin",
                                      )}
                                    />
                                    Refresh Status
                                  </Button>

                                  {/* OFFRAMP BUTTON */}
                                  {tx.status !== "COMPLETED" &&
                                  tx.status !== "DELIVERY_COMPLETE" &&
                                  tx.status !== "FAILED" &&
                                  !(
                                    (tx.status.toUpperCase() === "PENDING" ||
                                      tx.status.toUpperCase() ===
                                        "AWAITING_DEPOSIT") &&
                                    new Date().getTime() -
                                      new Date(tx.timestamp).getTime() >=
                                      24 * 60 * 60 * 1000
                                  ) ? (
                                    <OfframpButton
                                      transaction={tx}
                                      onSuccess={fetchAllTransactionsByAdmin}
                                    />
                                  ) : null}

                                  {/* CONFIRM DEPOSIT BUTTON */}
                                  {(() => {
                                    const s = tx.status?.toUpperCase();
                                    return (
                                      s === "AWAITING_DEPOSIT" ||
                                      s === "PENDING" ||
                                      s === "FAILED"
                                    );
                                  })() && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openConfirmDialog(tx)}
                                      className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                    >
                                      Confirm Deposit
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deposit Manually</DialogTitle>
            <DialogDescription>
              Enter the transaction hash to manually confirm this deposit. This
              should be used if the automated listener missed the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tx-hash">Transaction Hash (Optional)</Label>
              <Input
                id="tx-hash"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
            </div>
            {selectedTx && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                <p>Reference: {selectedTx.reference}</p>
                <p>
                  Amount:{" "}
                  {formatAmount(selectedTx.amount, selectedTx.fromCurrency)}{" "}
                  {selectedTx.fromCurrency}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualConfirm} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Deposit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
