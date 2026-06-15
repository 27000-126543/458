import { useState, useEffect } from "react";
import { X, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationPanelProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

interface Recommendation {
  user: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    skills: string[];
    loadPercentage: number;
    performanceScore: number;
  };
  scores: {
    skillMatch: number;
    loadScore: number;
    performanceScore: number;
    totalScore: number;
  };
}

export default function RecommendationPanel({
  taskId,
  open,
  onClose,
  onAssigned,
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !taskId) return;
    setLoading(true);
    fetch(`/api/recommendations?taskId=${taskId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setRecommendations(res.data);
      })
      .finally(() => setLoading(false));
  }, [open, taskId]);

  const handleAssign = async (userId: string) => {
    setAssigningId(userId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: userId }),
      });
      const data = await res.json();
      if (data.success) {
        onAssigned?.();
        onClose();
      }
    } finally {
      setAssigningId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-96 h-full glass-strong border-l border-slate-700/50
          animate-slide-in overflow-y-auto scrollbar-thin"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md">
          <h3 className="text-base font-heading font-semibold text-slate-100">
            智能推荐执行人
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-emerald animate-spin" />
            <span className="ml-2 text-sm text-slate-400">分析推荐中...</span>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.user.id}
                className="glass-card p-4 animate-fade-in"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-cyan-blue flex items-center justify-center text-sm font-bold text-white">
                    {rec.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">
                      {rec.user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {rec.user.department} · {rec.user.role}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      rec.scores.totalScore >= 80
                        ? "text-emerald"
                        : rec.scores.totalScore >= 60
                        ? "text-cyan-400"
                        : "text-slate-400"
                    )}
                  >
                    {rec.scores.totalScore}%
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <ScoreBar label="技能匹配" value={rec.scores.skillMatch} />
                  <ScoreBar
                    label="绩效评分"
                    value={rec.scores.performanceScore}
                  />
                  <ScoreBar label="负载余量" value={rec.scores.loadScore} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">当前负载</span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          rec.user.loadPercentage >= 80
                            ? "bg-red-500"
                            : rec.user.loadPercentage >= 60
                            ? "bg-amber"
                            : "bg-emerald"
                        )}
                        style={{ width: `${rec.user.loadPercentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {rec.user.loadPercentage}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleAssign(rec.user.id)}
                    disabled={!!assigningId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs font-medium btn-primary disabled:opacity-50"
                  >
                    {assigningId === rec.user.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UserCheck className="w-3 h-3" />
                    )}
                    分配
                  </button>
                </div>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-12 text-sm text-slate-500">
                暂无推荐人选
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 w-14">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 80
              ? "bg-emerald"
              : value >= 60
              ? "bg-cyan-400"
              : "bg-slate-500"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] text-slate-400 w-8 text-right">
        {value}%
      </span>
    </div>
  );
}
