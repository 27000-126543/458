import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ZoomIn, ZoomOut, GanttChartSquare, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 56;
const LEFT_WIDTH = 300;

const statusGradients: Record<string, string> = {
  in_progress: "from-cyan-500 to-blue-500",
  completed: "from-emerald-500 to-emerald-600",
  blocked: "from-amber-500 to-amber-600",
  pending: "from-slate-500 to-slate-600",
};

const statusColors: Record<string, string> = {
  in_progress: "bg-gradient-to-r from-cyan-500 to-blue-500",
  completed: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  blocked: "bg-gradient-to-r from-amber-500 to-amber-600",
  pending: "bg-gradient-to-r from-slate-500 to-slate-600",
};

interface TaskItem {
  id: string;
  title: string;
  status: string;
  startDate: string;
  dueDate: string;
  assigneeId: string | null;
  dependencies: string[];
  assignee: { name: string } | null;
}

export default function GanttChartPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayWidth, setDayWidth] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setTasks(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(
    (t) => t.startDate && t.dueDate && t.status !== "cancelled"
  );

  const allDates = filtered.flatMap((t) => [
    new Date(t.startDate).getTime(),
    new Date(t.dueDate).getTime(),
  ]);
  const minDate = allDates.length
    ? new Date(Math.min(...allDates))
    : new Date();
  const maxDate = allDates.length
    ? new Date(Math.max(...allDates))
    : new Date();

  const rangeStart = new Date(minDate);
  rangeStart.setDate(rangeStart.getDate() - 7);
  const rangeEnd = new Date(maxDate);
  rangeEnd.setDate(rangeEnd.getDate() + 14);

  const totalDays = Math.ceil(
    (rangeEnd.getTime() - rangeStart.getTime()) / 86400000
  );
  const timelineWidth = totalDays * dayWidth;

  const dayToX = useCallback(
    (date: Date) => {
      return (
        Math.ceil((date.getTime() - rangeStart.getTime()) / 86400000) *
        dayWidth
      );
    },
    [dayWidth, rangeStart]
  );

  const getBarPosition = (task: TaskItem) => {
    const start = new Date(task.startDate);
    const end = new Date(task.dueDate);
    const x = dayToX(start);
    const width = Math.max(dayWidth, dayToX(end) - x + dayWidth);
    return { x, width };
  };

  const todayX = dayToX(new Date());

  const months: { label: string; x: number; width: number }[] = [];
  let cur = new Date(rangeStart);
  while (cur <= rangeEnd) {
    const monthStart = new Date(cur);
    const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const effectiveEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
    const x = dayToX(monthStart);
    const w = dayToX(effectiveEnd) - x + dayWidth;
    months.push({
      label: `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月`,
      x,
      width: w,
    });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const depLines = filtered.flatMap((task) =>
    task.dependencies
      .map((depId) => {
        const dep = filtered.find((t) => t.id === depId);
        if (!dep) return null;
        const depPos = getBarPosition(dep);
        const taskPos = getBarPosition(task);
        const depIdx = filtered.indexOf(dep);
        const taskIdx = filtered.indexOf(task);
        return {
          fromX: depPos.x + depPos.width,
          fromY: HEADER_HEIGHT + depIdx * ROW_HEIGHT + ROW_HEIGHT / 2,
          toX: taskPos.x,
          toY: HEADER_HEIGHT + taskIdx * ROW_HEIGHT + ROW_HEIGHT / 2,
        };
      })
      .filter(Boolean)
  );

  const handleZoom = (delta: number) => {
    setDayWidth((w) => Math.max(12, Math.min(80, w + delta)));
  };

  const handleBarDrag = async (
    taskId: string,
    newStartDate: string,
    newDueDate: string
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, startDate: newStartDate, dueDate: newDueDate }
          : t
      )
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: newStartDate, dueDate: newDueDate }),
    });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GanttChartSquare className="w-5 h-5 text-emerald" />
          <h1 className="text-xl font-heading font-semibold text-slate-100">
            {t("task.ganttTitle")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(8)}
            className="btn-secondary p-2"
            title={t("task.zoomIn")}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-8)}
            className="btn-secondary p-2"
            title={t("task.zoomOut")}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          {t("common.loading")}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 glass-card overflow-auto scrollbar-thin relative"
        >
          <div className="flex min-h-full" style={{ minWidth: LEFT_WIDTH + timelineWidth }}>
            <div
              className="sticky left-0 z-20 bg-slate-800/90 border-r border-slate-700/50"
              style={{ width: LEFT_WIDTH }}
            >
              <div
                className="flex items-center px-4 text-xs font-medium text-slate-400 border-b border-slate-700/50 bg-slate-800/90"
                style={{ height: HEADER_HEIGHT }}
              >
                <span>任务名称</span>
                <span className="ml-auto">执行人</span>
              </div>
              {filtered.map((task, idx) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center px-4 border-b border-slate-700/20 text-sm",
                    idx % 2 === 0 ? "bg-slate-800/30" : "bg-transparent"
                  )}
                  style={{ height: ROW_HEIGHT }}
                >
                  <span className="text-slate-300 truncate flex-1">
                    {task.title}
                  </span>
                  <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                    {task.assignee?.name || "未分配"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <div className="sticky top-0 z-10" style={{ height: HEADER_HEIGHT }}>
                <div className="flex h-full">
                  {months.map((m) => (
                    <div
                      key={m.label + m.x}
                      className="flex-shrink-0 border-r border-slate-700/30 border-b border-slate-700/50 bg-slate-800/90 flex items-center px-3 text-xs text-slate-400"
                      style={{ width: m.width, marginLeft: m.x === months[0]?.x ? 0 : 0 }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative" style={{ height: filtered.length * ROW_HEIGHT }}>
                {Array.from({ length: totalDays }).map((_, i) => {
                  const d = new Date(rangeStart);
                  d.setDate(d.getDate() + i);
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  if (!isWeekend) return null;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 bg-slate-700/10"
                      style={{
                        left: i * dayWidth,
                        width: dayWidth,
                      }}
                    />
                  );
                })}

                {todayX > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: todayX }}
                  >
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-red-500 text-[9px] text-white whitespace-nowrap">
                      今天
                    </div>
                  </div>
                )}

                {filtered.map((task, idx) => {
                  const { x, width } = getBarPosition(task);
                  const barGradients: Record<string, string> = {
                    in_progress: "from-cyan-500 to-blue-500",
                    completed: "from-emerald-500 to-emerald-600",
                    blocked: "from-amber-500 to-amber-600",
                    pending: "from-slate-500 to-slate-600",
                  };
                  return (
                    <GanttBar
                      key={task.id}
                      task={task}
                      x={x}
                      width={width}
                      y={HEADER_HEIGHT + idx * ROW_HEIGHT + 6}
                      height={ROW_HEIGHT - 12}
                      gradient={barGradients[task.status] || barGradients.pending}
                      onDrag={handleBarDrag}
                      rangeStart={rangeStart}
                      dayWidth={dayWidth}
                    />
                  );
                })}

                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: timelineWidth, height: filtered.length * ROW_HEIGHT + HEADER_HEIGHT }}
                >
                  {depLines.map((line, i) => {
                    if (!line) return null;
                    const midX = (line.fromX + line.toX) / 2;
                    return (
                      <path
                        key={i}
                        d={`M ${line.fromX} ${line.fromY - HEADER_HEIGHT} C ${midX} ${line.fromY - HEADER_HEIGHT}, ${midX} ${line.toY - HEADER_HEIGHT}, ${line.toX} ${line.toY - HEADER_HEIGHT}`}
                        fill="none"
                        stroke="rgba(148,163,184,0.3)"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GanttBar({
  task,
  x,
  width,
  y,
  height,
  gradient,
  onDrag,
  rangeStart,
  dayWidth,
}: {
  task: TaskItem;
  x: number;
  width: number;
  y: number;
  height: number;
  gradient: string;
  onDrag: (id: string, start: string, due: string) => void;
  rangeStart: Date;
  dayWidth: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const origX = useRef(0);

  const xToDate = (px: number) => {
    const days = Math.round(px / dayWidth);
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragging.current = true;
    startX.current = e.clientX;
    origX.current = x;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      const newX = origX.current + delta;
      if (barRef.current) {
        barRef.current.style.left = `${newX}px`;
      }
    };
    const onUp = () => {
      dragging.current = false;
      if (barRef.current) {
        const finalX = parseInt(barRef.current.style.left);
        onDrag(task.id, xToDate(finalX), xToDate(finalX + width));
      }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={barRef}
      className={cn(
        "absolute rounded-md bg-gradient-to-r cursor-grab active:cursor-grabbing",
        "flex items-center px-2 text-[11px] text-white font-medium overflow-hidden",
        "hover:shadow-lg transition-shadow",
        gradient
      )}
      style={{ left: x, top: y - HEADER_HEIGHT, width, height, position: "absolute" }}
      onMouseDown={onMouseDown}
      title={task.title}
    >
      <span className="truncate">{task.title}</span>
      <Calendar className="w-3 h-3 ml-auto flex-shrink-0 opacity-60" />
    </div>
  );
}
