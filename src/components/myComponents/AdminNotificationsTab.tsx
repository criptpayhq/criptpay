import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Calendar } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Notification {
  _id: string;
  type: "WEBHOOK" | "SYSTEM" | "TRANSACTION" | "BUSINESS";
  title: string;
  message: string;
  reference?: string;
  status?: string;
  payload?: any;
  isRead: boolean;
  timestamp: string;
}

const AdminNotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/notifications?page=${page}&search=${searchQuery}`);
      if (response.data.success) {
        setNotifications(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, searchQuery]);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "WEBHOOK": return "default";
      case "SYSTEM": return "secondary";
      case "TRANSACTION": return "outline";
      case "BUSINESS": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "text-gray-500";
    const s = status.toLowerCase();
    if (s.includes("success") || s.includes("completed") || s.includes("delivered")) return "text-green-500";
    if (s.includes("fail") || s.includes("error") || s.includes("rejected")) return "text-red-500";
    if (s.includes("pending") || s.includes("processing")) return "text-yellow-500";
    return "text-blue-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notification Logs</h1>
          <p className="text-muted-foreground">Monitor system events and webhook activity</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => fetchNotifications()} disabled={loading}>
             <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-black dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900 text-left">
            <tr>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Event</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Details</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Reference</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Status</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap font-sans flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Time
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center border-b border-black/5 dark:border-white/5">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading logs...</span>
                  </div>
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center border-b border-black/5 dark:border-white/5 text-muted-foreground">
                  No notifications found.
                </td>
              </tr>
            ) : (
              notifications.map((notif) => (
                <tr key={notif._id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 align-top transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <Badge variant={getBadgeVariant(notif.type)} className="w-fit text-[10px] px-1.5 py-0 h-4">
                        {notif.type}
                      </Badge>
                      <span className="font-semibold text-xs whitespace-nowrap">{notif.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      {notif.message}
                    </p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-mono text-[10px]">
                    {notif.reference || "N/A"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-bold uppercase ${getStatusColor(notif.status)}`}>
                      {notif.status || "---"}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(notif.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsTab;
