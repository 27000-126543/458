import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

export default function ApprovalList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    pending: { label: t("approval.pending"), color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Clock },
    approved: { label: t("approval.approved"), color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    rejected: { label: t("approval.rejected"), color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    transferred: { label: t("approval.transferred"), color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: RotateCcw },
    cancelled: { label: t("approval.cancelled"), color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: AlertCircle },
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending", label: t("approval.myPending") },
    { key: "initiated", label: t("approval.myInitiated") },
    { key: "completed", label: t("approval.completed") },
  ];

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

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">{t("approval.list")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("approval.subtitle")}</p>
        </div>
        <button
          onClick={() => navigate("/approvals/designer")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("approval.newApproval")}
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
            placeholder={t("common.search")}
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
            <option value="">{t("common.all")}</option>
            <option value="pending">{t("approval.pending")}</option>
            <option value="approved">{t("approval.approved")}</option>
            <option value="rejected">{t("approval.rejected")}</option>
            <option value="transferred">{t("approval.transferred")}</option>
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
          <p className="text-slate-500">{t("approval.noRecords")}</p>
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
                        {item.initiator?.name || t("common.unknownUser")}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" />
                        {t("approval.currentNode")}: {currentNode?.name || "-"}
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
