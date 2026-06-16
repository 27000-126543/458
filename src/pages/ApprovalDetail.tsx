import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Clock,
  User,
  MessageSquare,
  Send,
  CheckSquare,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalActionItem {
  id: string;
  action: string;
  comment: string;
  createdAt: string;
  user: { id: string; name: string } | null;
  nodeId: string;
  transferToUser?: { id: string; name: string } | null;
}

interface ApprovalDetailData {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "transferred" | "cancelled";
  currentStep: number;
  initiatorId: string;
  currentNodeId: string;
  createdAt: string;
  updatedAt: string;
  initiator: { id: string; name: string } | null;
  flow: {
    id: string;
    name: string;
    nodes: { id: string; type: string; name: string; approverIds: string[] }[];
    edges: { id: string; source: string; target: string }[];
  } | null;
  currentNode: { id: string; name: string } | null;
  actions: ApprovalActionItem[];
}

interface UserItem {
  id: string;
  name: string;
  avatar?: string;
  department?: { name: string } | null;
}

export default function ApprovalDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApprovalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferToUserId, setTransferToUserId] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/${id}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (showTransferDialog) {
      setLoadingUsers(true);
      fetch("/api/users")
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setUsers(json.data);
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [showTransferDialog]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(transferSearch.toLowerCase())
  );

  const handleAction = async (action: "approve" | "reject" | "transfer") => {
    if (!data) return;

    if (action === "transfer") {
      setShowTransferDialog(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/approvals/${data.id}/action`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId: "u001",
          comment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setComment("");
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferConfirm = async () => {
    if (!data || !transferToUserId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/approvals/${data.id}/action`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer",
          userId: "u001",
          comment,
          transferToUserId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setComment("");
        setShowTransferDialog(false);
        setTransferToUserId("");
        setTransferSearch("");
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const getNodeState = (nodeId: string): "completed" | "current" | "future" => {
    if (!data?.flow || !data.actions) return "future";
    const acted = data.actions.some((a) => a.nodeId === nodeId);
    if (acted) return "completed";
    if (nodeId === data.currentNodeId) return "current";
    return "future";
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return t("approval.pending");
      case "approved": return t("approval.approved");
      case "rejected": return t("approval.rejected");
      case "transferred": return t("approval.transferred");
      default: return status;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "approve": return t("approval.approve");
      case "reject": return t("approval.reject");
      case "transfer": return t("approval.transfer");
      case "submit": return "提交";
      default: return action;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{t("common.notFound")}</p>
      </div>
    );
  }

  const flowNodes = data.flow?.nodes || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/approvals")}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-slate-100">{data.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{data.description}</p>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              data.status === "pending"
                ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                : data.status === "approved"
                ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                : data.status === "rejected"
                ? "text-red-400 bg-red-400/10 border-red-400/20"
                : "text-blue-400 bg-blue-400/10 border-blue-400/20"
            )}
          >
            {getStatusText(data.status)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{t("common.initiator")}: {data.initiator?.name}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t("common.createdAt")}: {formatTime(data.createdAt)}</span>
          {data.currentNode && (
            <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" />{t("approval.currentNode")}: {data.currentNode.name}</span>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-base font-medium text-slate-200 mb-6">{t("approval.approvalFlow")}</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-4 scrollbar-thin">
          {flowNodes.map((node, idx) => {
            const state = getNodeState(node.id);
            return (
              <div key={node.id} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      state === "completed" && "bg-emerald-500/20 border-emerald-400",
                      state === "current" && "bg-amber-500/20 border-amber-400 animate-pulse-glow glow-amber",
                      state === "future" && "bg-slate-700/50 border-slate-600"
                    )}
                  >
                    {state === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {state === "current" && <Clock className="w-5 h-5 text-amber-400" />}
                    {state === "future" && <CheckSquare className="w-5 h-5 text-slate-600" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs max-w-[80px] text-center",
                      state === "completed" && "text-emerald-400",
                      state === "current" && "text-amber-400 font-medium",
                      state === "future" && "text-slate-600"
                    )}
                  >
                    {node.name}
                  </span>
                </div>
                {idx < flowNodes.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-1",
                      state === "completed" ? "bg-emerald-400/40" : "bg-slate-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {data.status === "pending" && (
        <div className="glass-card p-6">
          <h2 className="text-base font-medium text-slate-200 mb-4">审批操作</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("approval.commentPlaceholder")}
            className="input-dark resize-none h-24 mb-4"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 font-medium hover:bg-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t("approval.approve")}
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-400/30 font-medium hover:bg-red-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {t("approval.reject")}
            </button>
            <button
              onClick={() => handleAction("transfer")}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30 font-medium hover:bg-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {t("approval.transfer")}
            </button>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-base font-medium text-slate-200 mb-4">{t("approval.history")}</h2>
        {data.actions.length === 0 ? (
          <p className="text-sm text-slate-600 py-4 text-center">{t("approval.noRecords")}</p>
        ) : (
          <div className="space-y-4">
            {data.actions.map((action) => (
              <div key={action.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      action.action === "approve" && "bg-emerald-500/20",
                      action.action === "reject" && "bg-red-500/20",
                      action.action === "transfer" && "bg-blue-500/20",
                      action.action === "submit" && "bg-slate-500/20"
                    )}
                  >
                    {action.action === "approve" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {action.action === "reject" && <XCircle className="w-4 h-4 text-red-400" />}
                    {action.action === "transfer" && <ArrowRightLeft className="w-4 h-4 text-blue-400" />}
                    {action.action === "submit" && <Send className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="w-px flex-1 bg-slate-700/50 mt-2" />
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">{action.user?.name || t("common.unknownUser")}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        action.action === "approve" && "text-emerald-400 bg-emerald-400/10",
                        action.action === "reject" && "text-red-400 bg-red-400/10",
                        action.action === "transfer" && "text-blue-400 bg-blue-400/10",
                        action.action === "submit" && "text-slate-400 bg-slate-400/10"
                      )}
                    >
                      {getActionText(action.action)}
                    </span>
                    {action.transferToUser && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        {t("approval.transferTo")} {action.transferToUser.name}
                      </span>
                    )}
                  </div>
                  {action.comment && (
                    <p className="text-sm text-slate-400 mt-1">{action.comment}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">{formatTime(action.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTransferDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-slate-200">{t("approval.selectTransferUser")}</h3>
              <button
                onClick={() => {
                  setShowTransferDialog(false);
                  setTransferToUserId("");
                  setTransferSearch("");
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                placeholder={t("approval.searchUser")}
                className="input-dark pl-10 w-full text-sm"
              />
            </div>

            <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2 mb-4">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">{t("approval.noUsers")}</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setTransferToUserId(user.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      transferToUserId === user.id
                        ? "bg-blue-500/20 border border-blue-400/30"
                        : "bg-slate-800/30 border border-transparent hover:bg-slate-700/30"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{user.name}</p>
                      {user.department && (
                        <p className="text-xs text-slate-500">{user.department.name}</p>
                      )}
                    </div>
                    {transferToUserId === user.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 ml-auto" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowTransferDialog(false);
                  setTransferToUserId("");
                  setTransferSearch("");
                }}
                className="btn-secondary text-sm px-4 py-2"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleTransferConfirm}
                disabled={!transferToUserId || submitting}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                {t("approval.confirmTransfer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
