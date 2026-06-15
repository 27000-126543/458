import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Mail, Cpu, PenLine, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-emerald",
};

const sourceIcons: Record<string, typeof Mail> = {
  manual: PenLine,
  approval: Mail,
  system: Cpu,
  import: Cpu,
};

interface TaskCardProps {
  task: any;
  onRecommend?: (taskId: string) => void;
}

export default function TaskCard({ task, onRecommend }: TaskCardProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const SourceIcon = sourceIcons[task.source] || PenLine;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={cn(
        "glass-card p-3 cursor-pointer group relative overflow-hidden",
        isDragging && "opacity-50 shadow-2xl scale-105 z-50"
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          priorityColors[task.priority] || "bg-slate-500"
        )}
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">
            {task.title}
          </h4>
          <SourceIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags?.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-700/60 text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div className="w-6 h-6 rounded-full bg-gradient-cyan-blue flex items-center justify-center text-[10px] font-bold text-white">
                {task.assignee.name.charAt(0)}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[9px] text-slate-500">
                待定
              </div>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Calendar className="w-3 h-3" />
                {task.dueDate.slice(5)}
              </span>
            )}
          </div>

          {task.status === "pending" && onRecommend && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRecommend(task.id);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md
                text-[10px] font-medium bg-emerald/10 text-emerald
                hover:bg-emerald/20 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              智能推荐
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
