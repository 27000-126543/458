import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  actions: {
    id: string;
    action: string;
    comment: string;
    createdAt: string;
    user: { id: string; name: string } | null;
    nodeId: string;
  }[];
}

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApprovalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/approvals/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: "approve" | "reject" | "transfer") => {
    if (!data) return;
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
        <p className="text-slate-500">审批不存在</p>
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
          返回列表
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
                : "text-red-400 bg-red-400/10 border-red-400/20"
            )}
          >
            {data.status === "pending" ? "待审批" : data.status === "approved" ? "已通过" : "已驳回"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />发起人: {data.initiator?.name}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />创建: {formatTime(data.createdAt)}</span>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-base font-medium text-slate-200 mb-6">审批流程</h2>
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
            placeholder="输入审批意见..."
            className="input-dark resize-none h-24 mb-4"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 font-medium hover:bg-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              通过
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-400/30 font-medium hover:bg-red-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              驳回
            </button>
            <button
              onClick={() => handleAction("transfer")}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30 font-medium hover:bg-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              转审
            </button>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-base font-medium text-slate-200 mb-4">审批记录</h2>
        {data.actions.length === 0 ? (
          <p className="text-sm text-slate-600 py-4 text-center">暂无审批记录</p>
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
                      action.action === "transfer" && "bg-blue-500/20"
                    )}
                  >
                    {action.action === "approve" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {action.action === "reject" && <XCircle className="w-4 h-4 text-red-400" />}
                    {action.action === "transfer" && <ArrowRightLeft className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="w-px flex-1 bg-slate-700/50 mt-2" />
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{action.user?.name}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        action.action === "approve" && "text-emerald-400 bg-emerald-400/10",
                        action.action === "reject" && "text-red-400 bg-red-400/10",
                        action.action === "transfer" && "text-blue-400 bg-blue-400/10"
                      )}
                    >
                      {action.action === "approve" ? "通过" : action.action === "reject" ? "驳回" : "转审"}
                    </span>
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
    </div>
  );
}
