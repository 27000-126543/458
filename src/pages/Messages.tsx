import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckSquare,
  MessageSquare,
  AtSign,
  Clock,
  CheckCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

interface NotificationItem {
  id: string;
  userId: string;
  type: "task_assigned" | "task_updated" | "approval_required" | "approval_result" | "comment_added" | "mention" | "deadline_approaching";
  title: string;
  content: string;
  relatedId: string | null;
  relatedType: "task" | "approval" | "project" | null;
  read: boolean;
  createdAt: string;
}

type TabKey = "all" | "task" | "approval" | "mention";

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  task_assigned: { icon: ClipboardList, color: "text-blue-400 bg-blue-400/10" },
  task_updated: { icon: ClipboardList, color: "text-cyan-400 bg-cyan-400/10" },
  approval_required: { icon: CheckSquare, color: "text-amber-400 bg-amber-400/10" },
  approval_result: { icon: CheckSquare, color: "text-emerald-400 bg-emerald-400/10" },
  comment_added: { icon: MessageSquare, color: "text-purple-400 bg-purple-400/10" },
  mention: { icon: AtSign, color: "text-pink-400 bg-pink-400/10" },
  deadline_approaching: { icon: AlertCircle, color: "text-red-400 bg-red-400/10" },
};

const tabList: { key: TabKey; label: string; types: string[] }[] = [
  { key: "all", label: "全部", types: [] },
  { key: "task", label: "任务变更", types: ["task_assigned", "task_updated", "deadline_approaching"] },
  { key: "approval", label: "审批待办", types: ["approval_required", "approval_result"] },
  { key: "mention", label: "@提及", types: ["mention", "comment_added"] },
];

export default function Messages() {
  const navigate = useNavigate();
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const addNotification = useAppStore((s) => s.addNotification);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setNotifications(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    const tab = tabList.find((t) => t.key === activeTab);
    return tab ? tab.types.includes(n.type) : true;
  });

  const unreadCount = filtered.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (item: NotificationItem) => {
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      markNotificationRead(item.id);
    }
    if (item.relatedType === "task" && item.relatedId) {
      navigate(`/tasks/${item.relatedId}`);
    } else if (item.relatedType === "approval" && item.relatedId) {
      navigate(`/approvals/${item.relatedId}`);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}小时前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}天前`;
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">消息中心</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} 条未读消息` : "没有未读消息"}
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <CheckCheck className="w-4 h-4" />
          全部标为已读
        </button>
      </div>

      <div className="flex glass rounded-lg p-1">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === tab.key
                ? "bg-emerald/20 text-emerald glow-emerald"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">暂无消息</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const config = typeConfig[item.type] || typeConfig.task_assigned;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className={cn(
                  "glass-card p-4 cursor-pointer transition-all duration-200",
                  !item.read && "border-l-2 border-l-emerald bg-slate-800/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={cn("text-sm font-medium truncate", !item.read ? "text-slate-100" : "text-slate-400")}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0">
                        {!item.read && (
                          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
                        )}
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className={cn("text-sm mt-0.5 truncate", !item.read ? "text-slate-400" : "text-slate-600")}>
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
