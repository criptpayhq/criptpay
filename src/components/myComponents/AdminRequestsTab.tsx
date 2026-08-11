import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusinessStore } from "@/stores/business-store";
import {
  Loader2,
  Eye,
  Copy,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureProtocol } from "@/utils/formatUrl";

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

const AdminRequestsTab = () => {
  const {
    adminRequests,
    fetchAdminRequests,
    fetchBusinessStats,
    stats,
    approveBusiness,
    rejectBusiness,
    loading,
  } = useBusinessStore();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Reject form state
  const [rejectReason, setRejectReason] = useState("");
  const [supportContact, setSupportContact] = useState("");

  useEffect(() => {
    fetchAdminRequests();
    fetchBusinessStats();
  }, [fetchAdminRequests, fetchBusinessStats]);

  const handleOpenDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      await approveBusiness(selectedRequest._id);
      setIsDetailsOpen(false);
    }
  };

  const openRejectModal = () => {
    setIsDetailsOpen(false);
    setIsRejectOpen(true);
    setRejectReason("");
    setSupportContact("");
    // setSupportContact("support@criptpay.com"); // default
  };

  const handleReject = async () => {
    if (selectedRequest) {
      await rejectBusiness(selectedRequest._id, rejectReason, supportContact);
      setIsRejectOpen(false);
      setSelectedRequest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Business Requests
        </h1>
        <p className="text-muted-foreground">
          Manage API key requests from businesses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 dark:bg-green-900/20 backdrop-blur border-green-200/50 dark:border-green-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.approved}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50/50 dark:bg-yellow-900/20 backdrop-blur border-yellow-200/50 dark:border-yellow-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 dark:bg-red-900/20 backdrop-blur border-red-200/50 dark:border-red-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-gray-900 text-left">
              <tr>
                <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10">
                  Business
                </th>
                <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10">
                  Owner
                </th>
                <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10">
                  Type
                </th>
                <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10">
                  Status
                </th>
                <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10">
                  Date
                </th>
                <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {adminRequests.map((req) => (
                <tr
                  key={req._id}
                  className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <td className="px-3 py-3">
                    <div className="font-medium">{req.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.email}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div>{req.owner?.nickName || "Unknown"}</div>
                  </td>
                  <td className="px-3 py-3">{req.type}</td>
                  <td className="px-3 py-3">
                    <Badge
                      variant="outline"
                      className={`capitalize 
                        ${req.status === "active" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : ""}
                        ${req.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" : ""}
                        ${req.status === "rejected" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" : ""}
                        ${req.status === "new" ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" : ""}
                    `}
                    >
                      {req.status}
                    </Badge>
                  </td>
                  {/* <td className="px-3 py-3">{new Date(req.createdAt).toLocaleDateString()}</td> */}
                  <td className="px-3 py-3">{formatDate(req.createdAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(req)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Review
                    </Button>
                  </td>
                </tr>
              ))}
              {adminRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white border-black/10 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-semibold">{selectedRequest.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span>{selectedRequest.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span>{selectedRequest.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  <span>{selectedRequest.address}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Registered:</span>{" "}
                  <span>{selectedRequest.isRegistered ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span>{" "}
                  <span>{selectedRequest.owner?.nickName}</span>
                </div>
                {selectedRequest.website && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Website:</span>{" "}
                    <a
                      href={ensureProtocol(selectedRequest.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedRequest.website}
                    </a>
                  </div>
                )}
              </div>
              {selectedRequest.apiKey && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs font-mono text-muted-foreground mb-1">
                    API Key
                  </p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-bold truncate pr-2">
                      {selectedRequest.apiKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(selectedRequest.apiKey)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Description:
                </p>
                <p className="text-sm border p-2 rounded-md bg-muted/20">
                  {selectedRequest.description}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              {(selectedRequest?.status === "pending" ||
                selectedRequest?.status === "rejected") && (
                <>
                  <Button variant="destructive" onClick={openRejectModal}>
                    {selectedRequest?.status === "rejected"
                      ? "Update Rejection"
                      : "Reject"}
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApprove}
                  >
                    {selectedRequest?.status === "rejected"
                      ? "Approve Now"
                      : "Approve"}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white border-black/10 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Reason for Rejection
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete business details..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Support Contact Info
              </label>
              <Input
                value={supportContact}
                onChange={(e) => setSupportContact(e.target.value)}
                placeholder="Email or Whatsapp link"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequestsTab;
