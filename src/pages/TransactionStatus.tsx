import { useParams, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, FileSearch } from "lucide-react";
import Header from "@/components/myComponents/Header";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { type Transaction } from "@/lib/types";

const TransactionStatus = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<
    "PENDING" | "AWAITING_DEPOSIT" | "COMPLETED" | "FAILED" | "BLOCKED"
  >("AWAITING_DEPOSIT");
  const [transactionData, setTransactionData] = useState<Transaction | null>(
    null,
  );

  // Map all pending-like statuses
  const isPendingStatus = (statusValue: string): boolean => {
    const s = statusValue.toUpperCase();
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
    return pendingStatuses.includes(s);
  };

  const isCompletedStatus = (statusValue: string): boolean => {
    const s = statusValue.toUpperCase();
    return s === "COMPLETED" || s === "DELIVERY_COMPLETE";
  };

  const isBlockedStatus = (statusValue: string): boolean => {
    const s = statusValue.toUpperCase();
    return s === "BLOCKED";
  };

  const isFailedStatus = (statusValue: string): boolean => {
    const s = statusValue.toUpperCase();
    const failedStatuses = [
      "FAILED",
      "DELIVERY_FAILED_RESOLVING",
      "DELIVERY_CANCELLED",
      "PAYMENT_FAILED",
    ];
    return failedStatuses.includes(s);
  };

  // Polling function
  useEffect(() => {
    if (!transactionId) {
      toast.error("No transaction ID provided");
      navigate("/transfer");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/status/${transactionId}`, {
          withCredentials: true,
        });
        const currentStatus =
          res.data?.data?.status || res.data?.status || "AWAITING_DEPOSIT";
        const data = res.data?.data || res.data;

        // Determine the UI status based on the API status
        let uiStatus:
          | "PENDING"
          | "COMPLETED"
          | "FAILED"
          | "AWAITING_DEPOSIT"
          | "BLOCKED" = "AWAITING_DEPOSIT";

        const isExpired =
          data?.timestamp &&
          new Date().getTime() - new Date(data.timestamp).getTime() >=
            24 * 60 * 60 * 1000;

        if (isCompletedStatus(currentStatus)) {
          uiStatus = "COMPLETED";
        } else if (isFailedStatus(currentStatus) || isExpired) {
          uiStatus = "FAILED";
        } else if (isBlockedStatus(currentStatus)) {
          uiStatus = "BLOCKED";
        } else if (isPendingStatus(currentStatus)) {
          uiStatus = "AWAITING_DEPOSIT";
        }

        setStatus(uiStatus);
        setTransactionData(data);

        if (uiStatus === "COMPLETED") clearInterval(interval);

        // Auto-redirect after 3 seconds if completed
        if (uiStatus === "COMPLETED") {
          toast.success("Transaction completed successfully! 🎉");
          setTimeout(() => {
            navigate("/history");
          }, 3000);
          return;
        }

        // Show error if failed
        if (uiStatus === "FAILED") {
          toast.error("Transaction failed. Please contact support.");
          return;
        }
      } catch (err) {
        console.error("Error fetching transaction status:", err);
        toast.error("Failed to fetch transaction status");
      }
    };

    fetchStatus();

    const interval = setInterval(() => {
      // Only poll if still pending
      if (status === "AWAITING_DEPOSIT") {
        fetchStatus();
      } else {
        clearInterval(interval);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [transactionId, navigate]);

  const getLinkClass = (path: string) => {
    const isActive =
      location.pathname === path ||
      (path === "/transfer" && location.pathname.startsWith("/status"));

    return cn(
      "flex-1 text-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm",
      isActive
        ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
        : "bg-transparent text-black dark:text-foreground hover:text-foreground dark:hover:text-black",
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col transition-colors duration-300">
      <Header />

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-xs mx-auto mb-5 md:hidden lg:hidden">
          <div className="bg-[#b1f128] p-1 rounded-lg flex items-center gap-1">
            <NavLink to="/" className={getLinkClass("/transfer")}>
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

        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl w-full max-w-md p-6 text-center space-y-5">
            {status === "AWAITING_DEPOSIT" ? (
              <div className="space-y-10">
                <div className="bg-orange-100 text-black py-2 px-4 rounded-3xl flex items-center gap-2 max-w-sm mx-auto font-medium text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b1f128] opacity-77"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b1f128]"></span>
                  </span>
                  Watching for new deposits...
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <FileSearch className="w-16 h-16 text-gray-400" />
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Deposit might be pending!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-center text-sm max-w-xs">
                    We're watching for your deposit. This page will update
                    automatically. Don't leave this page!
                  </p>
                </div>
                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl text-sm max-w-md mx-auto">
                  💡 Please wait while we detect your deposit. Blockchain
                  confirmations may take a few minutes.
                </div>
              </div>
            ) : status === "COMPLETED" ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
                  <p className="text-green-600 dark:text-green-400 font-semibold text-2xl">
                    Transfer Completed! 🎉
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your funds have been successfully sent to the bank account.
                  </p>
                  {transactionData && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-left w-full mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Amount:</span>{" "}
                        {transactionData.receiveAmount} NGN
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Status:</span> Completed
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Redirecting to history in 3 seconds...
                  </p>
                </div>
                <button
                  onClick={() => navigate("/history")}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View in History
                </button>
              </div>
            ) : status === "BLOCKED" ? (
              <div className="flex flex-col gap-3">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-red-600 dark:text-red-300">
                  Transaction Blocked!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You didn't send what you quoted, Contact support!
                </p>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => {
                      setStatus("AWAITING_DEPOSIT");
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex-1"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate("/transfer")}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium flex-1"
                  >
                    New Transfer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">❌</span>
                  </div>
                  <p className="text-red-600 dark:text-red-400 font-semibold text-2xl">
                    {transactionData?.timestamp &&
                    new Date().getTime() -
                      new Date(transactionData.timestamp).getTime() >=
                      24 * 60 * 60 * 1000
                      ? "Transaction Cancelled"
                      : "Transaction Failed"}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Something went wrong with your transaction.
                  </p>
                </div>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => {
                      setStatus("AWAITING_DEPOSIT");
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex-1"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate("/transfer")}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium flex-1"
                  >
                    New Transfer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
