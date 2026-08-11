import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Search, Filter, Loader2, Check, Copy, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/myComponents/Header";
import { useTransactionStore } from "@/stores/transaction-store";
import { ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
// Assuming this import contains your Transaction interface definition
import { type Transaction } from "@/lib/types";

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Explicitly type the state array as Transaction[]
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [openId, setOpenId] = useState<string | null>(null);

  // New state to track which specific transaction is refreshing
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Assuming useTransactionStore correctly exports transactions as Transaction[]
  const { isLoading, transactions, fetchAllTransactions } =
    useTransactionStore();

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
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  useEffect(() => {
    // Refresh list every 30 seconds
    const interval = setInterval(() => {
      fetchAllTransactions();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllTransactions]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(
      (tx) =>
        tx.fromCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.toCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Assuming accountNumber is a string
        (tx.accountNumber && tx.accountNumber.includes(searchQuery)) ||
        tx._id.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  // --- FUNCTION TO FORCE STATUS CHECK ---
  const handleRefreshStatus = async (
    e: React.MouseEvent,
    transactionId: string,
  ) => {
    // Added types
    e.stopPropagation();
    setRefreshingId(transactionId);

    try {
      const res = await api.get(`/status/${transactionId}`);
      const data = res.data.data;

      if (data.status === "COMPLETED") {
        toast.success("Transaction confirmed!");
        await fetchAllTransactions();
      } else if (data.status === "BLOCKED") {
        toast.success("Transaction blocked!, contact support");
      } else {
        toast("Status is still pending...");
      }
    } catch (error: any) {
      console.error(error.error | error.details);
      toast.error("Failed to check status", error.error);
    } finally {
      setRefreshingId(null);
    }
  };

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

    if (s === "BLOCKED") {
      return (
        <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">
          Blocked
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

  // FIX: Parameter 'address' now explicitly has a 'string' type
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
          <NavLink to="/api" className={getLinkClass("/api")}>
            API
          </NavLink>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Transaction History
            </h1>
            <p className="text-muted-foreground">
              View and search your transfer history
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 text-black dark:text-white">
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
          {isLoading ? (
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
                filteredTransactions.map((transaction) => (
                  <Card
                    key={transaction._id}
                    className="bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(40,40,40,0.4)] 
                      shadow-xl text-black dark:text-white 
                      border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] 
                      hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 py-2 md:p-6">
                      <div className="flex gap-3 flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 text-sm sm:text-base">
                            <span className="font-medium">
                              {formatAmount(Number(transaction.amount))}{" "}
                              {transaction.fromCurrency}
                            </span>
                            <span className="opacity-70">→</span>
                            <span className="font-medium">
                              {formatAmount(Number(transaction.receiveAmount))}{" "}
                              {transaction.toCurrency}
                            </span>
                            <div className="flex items-center gap-2 mt-1 sm:mt-0">
                              {getStatusBadge(
                                transaction.status,
                                transaction.timestamp,
                              )}
                              {transaction.status === "AWAITING_DEPOSIT" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                  onClick={(e) =>
                                    handleRefreshStatus(e, transaction._id)
                                  }
                                  disabled={refreshingId === transaction._id}
                                >
                                  <RefreshCw
                                    className={cn(
                                      "h-3 w-3",
                                      refreshingId === transaction._id &&
                                        "animate-spin",
                                    )}
                                  />
                                </Button>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(transaction.timestamp)}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setOpenId(
                              openId === transaction._id
                                ? null
                                : transaction._id,
                            )
                          }
                          className="self-center mt-4 md:mt-0 sm:self-auto px-3 py-1 rounded-md bg-black/5 
                            dark:bg-white/10 text-xs sm:text-sm flex items-center gap-1 shrink-0"
                        >
                          {openId === transaction._id ? "Hide" : "View"}
                          {openId === transaction._id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {openId === transaction._id && (
                        <div
                          className="mt-4 border-t border-black/10 dark:border-white/10 
                            pt-4 text-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                          <div>
                            <span className="font-medium">To:</span>{" "}
                            {transaction.accountName}
                          </div>
                          <div>
                            <span className="font-medium">Bank:</span>{" "}
                            {transaction.bankName}
                          </div>
                          <div>
                            <span className="font-medium">Account:</span> ****
                            {/* Added null check for accountNumber to be safe */}
                            {transaction.accountNumber?.slice(-4)}
                          </div>
                          {transaction.address && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Wallet:</span>
                              <span className="font-mono text-xs">
                                {transaction.address.slice(0, 6)}...
                                {transaction.address.slice(-6)}
                              </span>
                              <button
                                onClick={() =>
                                  copyAddress(transaction.address!)
                                } // Non-null assertion is safe here because of the '&&' check above
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                              </button>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Transaction ID:</span>{" "}
                            {transaction._id}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
