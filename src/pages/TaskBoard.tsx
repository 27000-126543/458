import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Search, Filter, Plus, LayoutGrid } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import { cn } from "@/lib/utils";

type ColumnId = "pending" | "in_progress" | "review" | "completed";

function DroppableColumn({
  colId,
  children,
  className,
}: {
  colId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${colId}` });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin transition-all duration-200",
        isOver && "bg-emerald-500/10",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  source: string;
  assigneeId: string | null;
  dueDate: string;
  tags: string[];
  assignee: { id: string; name: string; avatar: string } | null;
  project: { id: string; name: string } | null;
}

export default function TaskBoard() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recommendTaskId, setRecommendTaskId] = useState<string | null>(null);

  const columns = [
    { id: "pending" as const, title: t("task.status.pending"), color: "bg-slate-500", accent: "border-slate-500" },
    { id: "in_progress" as const, title: t("task.status.inProgress"), color: "bg-cyan-400", accent: "border-cyan-400" },
    { id: "review" as const, title: t("task.status.review"), color: "bg-amber", accent: "border-amber" },
    { id: "completed" as const, title: t("task.status.completed"), color: "bg-emerald", accent: "border-emerald" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    if (data.success) setTasks(data.data);
    setLoading(false);
  }, [search, priorityFilter, sourceFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getColumnTasks = (colId: ColumnId) => {
    if (colId === "review") return tasks.filter((t) => t.status === "blocked");
    return tasks.filter((t) => t.status === colId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let targetColumn: string | null = null;
    const overId = String(over.id);

    if (overId.startsWith("col-")) {
      const colKey = overId.replace("col-", "");
      targetColumn = colKey === "review" ? "blocked" : colKey;
    } else {
      for (const col of columns) {
        const colId = col.id === "review" ? "blocked" : col.id;
        if (getColumnTasks(col.id as ColumnId).some((t) => t.id === overId)) {
          targetColumn = colId;
          break;
        }
      }
    }

    if (targetColumn && targetColumn !== task.status) {
      const originalStatus = task.status;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetColumn! } : t))
      );
      try {
        const res = await fetch(`/api/tasks/${taskId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: targetColumn }),
        });
        if (!res.ok) throw new Error("failed");
      } catch {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: originalStatus } : t))
        );
      }
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-emerald" />
          <h1 className="text-xl font-heading font-semibold text-slate-100">
            {t("task.board")}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("task.searchPlaceholder")}
              className="input-dark pl-10 w-56 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-dark w-24 text-sm py-1.5"
            >
              <option value="">{t("task.priority")}</option>
              <option value="urgent">{t("task.priorityLabel.urgent")}</option>
              <option value="high">{t("task.priorityLabel.high")}</option>
              <option value="medium">{t("task.priorityLabel.medium")}</option>
              <option value="low">{t("task.priorityLabel.low")}</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="input-dark w-24 text-sm py-1.5"
            >
              <option value="">{t("task.source")}</option>
              <option value="manual">{t("task.sourceLabel.manual")}</option>
              <option value="system">{t("task.sourceLabel.system")}</option>
              <option value="approval">{t("task.sourceLabel.approval")}</option>
              <option value="import">{t("task.sourceLabel.import")}</option>
            </select>
          </div>

          <button className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" />
            {t("task.createTask")}
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto scrollbar-thin pb-4">
          {columns.map((col) => {
            const colTasks = getColumnTasks(col.id as ColumnId);
            return (
              <div
                key={col.id}
                className="flex-1 min-w-[280px] flex flex-col rounded-xl bg-slate-800/30 border border-slate-700/30"
              >
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 border-t-2 rounded-t-xl",
                    col.accent
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <span className="text-sm font-medium text-slate-200">
                    {col.title}
                  </span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <SortableContext
                  items={colTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn colId={col.id}>
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onRecommend={setRecommendTaskId}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-600">
                        {t("task.noTasks")}
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      <RecommendationPanel
        taskId={recommendTaskId || ""}
        open={!!recommendTaskId}
        onClose={() => setRecommendTaskId(null)}
        onAssigned={fetchTasks}
      />
    </div>
  );
}
