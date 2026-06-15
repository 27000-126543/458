import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "transferred" | "cancelled";
  currentStep: number;
  initiatorId: string;
  currentNodeId: string;
  createdAt: string;
  updatedAt: string;
  initiator: { id: string; name: string; avatar: string } | null;
  flow: { id: string; name: string; nodes: { id: string; name: string }[] } | null;
  actions: { id: string; action: string; user: { name: string } | null; comment: string; createdAt: string }[];
}

type TabKey = "pending" | "initiated" | "completed";

const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "待审批", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Clock },
  approved: { label: "已通过", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  rejected: { label: "已驳回", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  transferred: { label: "已转审", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: RotateCcw },
  cancelled: { label: "已取消", color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: AlertCircle },
};

export default function ApprovalList() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approvals");
      const json = await res.json();
      if (json.success) {
        setApprovals(json.data);
      }
    } catch {
      setApprovals([]);
    }
    setLoading(false);
  };

  const filtered = approvals.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (activeTab === "pending") return a.status === "pending";
    if (activeTab === "initiated") return a.initiatorId === currentUser.id;
    if (activeTab === "completed") return a.status === "approved" || a.status === "rejected";
    return true;
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending", label: "待我审批" },
    { key: "initiated", label: "我发起的" },
    { key: "completed", label: "已完成" },
  ];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">审批中心</h1>
          <p className="text-sm text-slate-500 mt-1">管理审批流程，跟踪审批状态</p>
        </div>
        <button
          onClick={() => navigate("/approvals/designer")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建审批
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex glass rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === tab.key
                  ? "bg-emerald/20 text-emerald glow-emerald"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索审批标题..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-dark pl-10 pr-8 appearance-none min-w-[140px]"
          >
            <option value="">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
            <option value="transferred">已转审</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">暂无审批数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const st = statusMap[item.status] || statusMap.pending;
            const StatusIcon = st.icon;
            const currentNode = item.flow?.nodes.find((n) => n.id === item.currentNodeId);

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/approvals/${item.id}`)}
                className="glass-card p-5 cursor-pointer hover:border-emerald/30 transition-all duration-200 animate-slide-in"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-medium text-slate-100 truncate">
                        {item.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          st.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {item.initiator?.name || "未知"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" />
                        当前节点: {currentNode?.name || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
