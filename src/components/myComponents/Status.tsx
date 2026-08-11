import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import toast from "react-hot-toast";
import api from "@/lib/api";

const Status = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("AWAITING_DEPOSIT");
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [message, setMessage] = useState("Watching for new deposits...");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await api.get(`/status/${id}`);

        const {
          status: newStatus,
          message: newMessage,
          timestamp: newTimestamp,
        } = response.data.data;

        // Map backend statuses to UI friendly ones if needed, or handle directly
        setStatus(newStatus?.toUpperCase()); // Normalize to upper case for comparison
        setMessage(newMessage || "Watching for updates...");
        if (newTimestamp) setTimestamp(newTimestamp);

        if (newStatus?.toUpperCase() === "COMPLETED") {
          toast.success("Deposit confirmed!");
        }
      } catch (error) {
        console.error("Status check failed", error);
      }
    };

    // Initial check
    pollStatus();

    const interval = setInterval(() => {
      if (status !== "COMPLETED" && status !== "FAILED") {
        pollStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, status]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await api.post("/confirm", { transactionId: id });
      if (response.data.success) {
        toast.success(response.data.message || "Confirmation initiated");
        // Optionally refresh status immediately
        const newStatus = response.data.data?.status;
        if (newStatus) setStatus(newStatus.toUpperCase());
      }
    } catch (error: any) {
      toast.error(error.response?.data?.details || "Failed to confirm payment");
    } finally {
      setIsConfirming(false);
    }
  };

  const isExpired =
    (status === "AWAITING_DEPOSIT" || status === "PENDING") &&
    timestamp &&
    new Date().getTime() - new Date(timestamp).getTime() >= 24 * 60 * 60 * 1000;

  const isPending = status === "AWAITING_DEPOSIT" && !isExpired;
  const isProcessing = status === "PROCESSING";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-50 dark:bg-gray-800">
        <CardContent className="p-6 text-center space-y-4">
          {(isPending || isProcessing) && (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
              <h2 className="text-xl font-bold text-black dark:text-white">
                {isProcessing
                  ? "Processing Deposit..."
                  : "Deposit might be pending!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>

              <p className="text-sm text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900 p-2 rounded">
                Please wait while we try to detect deposit on this wallet.
              </p>

              {isPending && (
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="mt-4 px-4 py-2 bg-[#b1f128] text-black font-semibold rounded-lg hover:bg-[#a0da23] disabled:opacity-50 transition-colors"
                >
                  {isConfirming ? "Confirming..." : "I have sent the funds"}
                </button>
              )}
            </>
          )}

          {status === "COMPLETED" && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <h2 className="text-xl font-bold text-black dark:text-white">
                Deposit Confirmed!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your funds have been received and processed.
              </p>
            </>
          )}

          {status === "BLOCKED" && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-300">
                Transaction Blocked!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You didn't send what you quoted, Contact support!
              </p>
            </>
          )}

          {(status === "FAILED" || isExpired) && (
            <div className="text-red-500">
              <h2 className="text-xl font-bold">
                {isExpired ? "Transaction Cancelled" : "Transaction Failed"}
              </h2>
              <p>
                {isExpired
                  ? "This transaction has expired after 24 hours of inactivity."
                  : message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Status;
