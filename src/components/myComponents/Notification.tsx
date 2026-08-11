import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data.data.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // every 15 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`p-4 rounded-xl shadow ${
            n.status === "COMPLETED" ? "bg-green-100" : "bg-yellow-100"
          }`}
        >
          <p>
            {n.type} - {n.status}
          </p>
          <p>{n.amount} {n.currency}</p>
        </div>
      ))}
    </div>
  );
}
