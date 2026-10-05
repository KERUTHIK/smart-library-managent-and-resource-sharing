import React, { useState, useEffect } from "react";
import { notificationsApi } from "../api/client";
import { Card, Button, Badge } from "../components/ui";

const TYPE_ICON: Record<string, string> = {
  success: "✅",
  warning: "⚠️",
  info: "📬",
  danger: "💳",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    notificationsApi
      .getNotifications()
      .then((res) => {
        if (res.notifications) {
          setNotifications(
            res.notifications.map((n: any) => ({
              id: n._id || n.id,
              type: n.uiType || "info",
              title: n.title,
              message: n.message,
              time: formatRelativeTime(n.createdAt),
              read: n.isRead,
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching notifications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  function formatRelativeTime(dateStr?: string) {
    if (!dateStr) return "Just now";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  }

  async function markAllRead() {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Notifications</h1>
          <p className="text-[#64748b] mt-0.5">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-[10px] w-fit">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-[8px] text-sm font-medium cursor-pointer transition-all capitalize ${filter === f ? "bg-white text-[#0f1f3d] shadow-sm" : "text-[#64748b] hover:text-[#0f1f3d]"}`}
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-3">🔔</div>
            <p className="font-semibold text-[#0f1f3d]">No notifications</p>
            <p className="text-sm text-[#64748b] mt-1">You're all caught up!</p>
          </Card>
        )}

        {filtered.map((notif) => (
          <div
            key={notif.id}
            onClick={() => !notif.read && markRead(notif.id)}
            className={`relative flex items-start gap-4 p-4 rounded-[12px] border transition-all cursor-pointer ${!notif.read ? "bg-white border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "bg-[#f8fafc] border-transparent"}`}
          >
            {!notif.read && (
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#0d9488]" />
            )}

            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
              notif.type === "success" ? "bg-emerald-100" :
              notif.type === "warning" ? "bg-amber-100" :
              notif.type === "danger" ? "bg-red-100" :
              "bg-blue-100"
            }`}>
              {TYPE_ICON[notif.type] || "📬"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-semibold ${!notif.read ? "text-[#0f1f3d]" : "text-[#64748b]"}`}>{notif.title}</p>
                <span className="text-[11px] text-[#94a3b8] whitespace-nowrap">{notif.time}</span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
