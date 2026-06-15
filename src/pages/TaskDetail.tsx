import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Link2,
  MessageSquare,
  Paperclip,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "待处理", color: "bg-slate-500" },
  in_progress: { label: "进行中", color: "bg-cyan-400" },
  completed: { label: "已完成", color: "bg-emerald" },
  blocked: { label: "已阻塞", color: "bg-amber" },
  cancelled: { label: "已取消", color: "bg-red-500" },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  urgent: { label: "紧急", color: "bg-red-500 text-white" },
  high: { label: "高", color: "bg-orange-500 text-white" },
  medium: { label: "中", color: "bg-yellow-500 text-black" },
  low: { label: "低", color: "bg-emerald text-white" },
};

interface CommentItem {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: { name: string };
}

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  source: string;
  startDate: string;
  dueDate: string;
  tags: string[];
  dependencies: string[];
  assignee: { id: string; name: string; avatar: string } | null;
  creator: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  dependencyTasks: { id: string; title: string; status: string }[];
  estimatedHours: number;
  actualHours: number | null;
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/tasks/${id}`).then((r) => r.json()),
      fetch(`/api/tasks/${id}/comments`).then((r) => r.json()).catch(() => ({
        success: false,
        data: [],
      })),
    ]).then(([taskRes, commentRes]) => {
      if (taskRes.success) setTask(taskRes.data);
      if (commentRes.success) setComments(commentRes.data);
      setLoading(false);
    });
  }, [id]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      const res = await fetch(`/api/tasks/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, userId: "u001" }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setNewComment("");
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-emerald animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20 text-slate-500">任务不存在</div>
    );
  }

  const st = statusMap[task.status] || statusMap.pending;
  const pr = priorityMap[task.priority] || priorityMap.medium;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="glass-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-heading font-semibold text-slate-100 mb-3">
              {task.title}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium",
                  st.color
                )}
              >
                {st.label}
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium",
                  pr.color
                )}
              >
                {pr.label}
              </span>
              {task.project && (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700/60 text-slate-400">
                  {task.project.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {task.description || "暂无描述"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">执行人</p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.assignee ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-gradient-cyan-blue flex items-center justify-center text-[10px] font-bold text-white">
                      {task.assignee.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-300">
                      {task.assignee.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">未分配</span>
                )}
                <button className="text-[11px] text-emerald hover:text-emerald-400 transition-colors ml-2">
                  更换执行人
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">时间范围</p>
              <p className="text-sm text-slate-300 mt-0.5">
                {task.startDate?.slice(0, 10)} → {task.dueDate?.slice(0, 10)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">工时</p>
              <p className="text-sm text-slate-300 mt-0.5">
                预估 {task.estimatedHours}h
                {task.actualHours != null && ` / 实际 ${task.actualHours}h`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">标签</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-slate-700/60 text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {task.dependencyTasks && task.dependencyTasks.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
            <Link2 className="w-4 h-4 text-slate-500" />
            依赖任务
          </h3>
          <div className="space-y-2">
            {task.dependencyTasks.map((dep) => {
              const depSt = statusMap[dep.status] || statusMap.pending;
              return (
                <Link
                  key={dep.id}
                  to={`/tasks/${dep.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg
                    bg-slate-800/40 hover:bg-slate-700/40 transition-colors"
                >
                  <span
                    className={cn("w-2 h-2 rounded-full", depSt.color)}
                  />
                  <span className="text-sm text-slate-300">{dep.title}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    {depSt.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-card p-5 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          评论 ({comments.length})
        </h3>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scrollbar-thin">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">
                {(c as any).user?.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    {(c as any).user?.name || "未知用户"}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">暂无评论</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="输入评论..."
            className="input-dark flex-1 text-sm"
          />
          <button
            onClick={handleSendComment}
            disabled={!newComment.trim()}
            className="btn-primary px-3 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
          <Paperclip className="w-4 h-4 text-slate-500" />
          附件
        </h3>
        <div className="space-y-2 mb-3">
          {["OAuth2.0集成方案.pdf", "看板交互设计稿.fig"].map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 text-sm text-slate-400 hover:bg-slate-700/40 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="flex-1">{name}</span>
              <span className="text-[11px] text-slate-600">2.0 MB</span>
            </div>
          ))}
        </div>
        <button className="btn-secondary text-xs flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" />
          上传附件
        </button>
      </div>
    </div>
  );
}
