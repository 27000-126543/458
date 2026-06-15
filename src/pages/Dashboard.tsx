import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Bell,
  Target,
  Briefcase,
  BarChart3,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  intensity: number;
}

interface CapacityCard {
  departmentId: string;
  departmentName: string;
  memberCount: number;
  onlineCount: number;
  avgLoad: number;
  activeTasks: number;
  pendingTasks: number;
  completedTasks: number;
  loadStatus: "overloaded" | "balanced" | "available";
}

interface KPIMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeRate: number;
  totalProjects: number;
  activeProjects: number;
  avgProgress: number;
  pendingApprovals: number;
  avgPerformanceScore: number;
}

interface RecentEvent {
  id: string;
  type: string;
  title: string;
  content: string;
  relatedId: string | null;
  relatedType: string | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string } | null;
}

function RingProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = "#10B981",
  trackColor = "rgba(148, 163, 184, 0.1)",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold font-heading text-slate-100">{value}%</span>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = "emerald",
  delay = 0,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: string; up: boolean };
  color?: "emerald" | "cyan" | "amber" | "blue";
  delay?: number;
}) {
  const colorMap = {
    emerald: "from-emerald-400/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    cyan: "from-cyan-400/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20",
    amber: "from-amber-400/20 to-amber-600/5 text-amber-400 border-amber-500/20",
    blue: "from-blue-400/20 to-blue-600/5 text-blue-400 border-blue-500/20",
  };

  const glowMap = {
    emerald: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    cyan: "shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    amber: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    blue: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  };

  return (
    <div
      className={cn(
        "glass-card p-5 border bg-gradient-to-br animate-fade-in",
        colorMap[color],
        glowMap[color]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-heading text-slate-100">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium flex items-center gap-0.5",
                  trend.up ? "text-emerald-400" : "text-red-400"
                )}
              >
                {trend.up ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
            )}
          </div>
          {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            `bg-${color}-500/10`
          )}
          style={{
            background:
              color === "emerald"
                ? "rgba(16, 185, 129, 0.1)"
                : color === "cyan"
                ? "rgba(6, 182, 212, 0.1)"
                : color === "amber"
                ? "rgba(245, 158, 11, 0.1)"
                : "rgba(59, 130, 246, 0.1)",
          }}
        >
          <Icon className="w-6 h-6" style={{ color: "inherit" }} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [capacity, setCapacity] = useState<CapacityCard[]>([]);
  const [kpi, setKpi] = useState<KPIMetrics | null>(null);
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = () => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setHeatmap(json.data.heatmap);
          setCapacity(json.data.capacityCards);
          setKpi(json.data.kpiMetrics);
          setEvents(json.data.recentEvents);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const heatmapWeeks = useMemo(() => {
    const weeks: HeatmapDay[][] = [];
    for (let i = 0; i < heatmap.length; i += 7) {
      weeks.push(heatmap.slice(i, i + 7));
    }
    return weeks;
  }, [heatmap]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return "bg-slate-800/30";
    if (intensity < 0.25) return "bg-emerald-900/40";
    if (intensity < 0.5) return "bg-emerald-700/50";
    if (intensity < 0.75) return "bg-amber-600/60";
    return "bg-red-500/70";
  };

  const getLoadColor = (load: number) => {
    if (load < 60) return "#10B981";
    if (load < 80) return "#F59E0B";
    return "#EF4444";
  };

  const formatEventTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin}分钟前`;
    return `${Math.floor(diffMin / 60)}小时前`;
  };

  const eventTypeIcon: Record<string, { icon: typeof Bell; color: string }> = {
    task_assigned: { icon: Briefcase, color: "text-blue-400 bg-blue-400/10" },
    task_completed: { icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10" },
    task_updated: { icon: Activity, color: "text-cyan-400 bg-cyan-400/10" },
    approval_required: { icon: Clock, color: "text-amber-400 bg-amber-400/10" },
    approval_approved: { icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10" },
    comment_added: { icon: Bell, color: "text-purple-400 bg-purple-400/10" },
    mention: { icon: Bell, color: "text-pink-400 bg-pink-400/10" },
    system: { icon: Zap, color: "text-cyan-400 bg-cyan-400/10" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-100">
            全局仪表盘
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            实时监控全公司任务与资源状态
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2.5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
            <span className="text-sm font-medium text-emerald">实时</span>
            <span className="text-sm text-slate-400 font-mono">
              {formatTime(currentTime)}
            </span>
          </div>
          <div className="text-right hidden lg:block">
            <p className="text-sm text-slate-300 font-medium">
              {formatDate(currentTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Target}
          label="任务完成率"
          value={kpi?.completionRate || 0}
          subValue={`${kpi?.completedTasks || 0} / ${kpi?.totalTasks || 0} 个任务`}
          trend={{ value: "12%", up: true }}
          color="emerald"
          delay={0}
        />
        <KpiCard
          icon={BarChart3}
          label="平均响应时间"
          value="2.4h"
          subValue="较上周缩短 0.6h"
          trend={{ value: "8%", up: true }}
          color="cyan"
          delay={100}
        />
        <KpiCard
          icon={CheckCircle}
          label="审批通过率"
          value={kpi?.onTimeRate || 0}
          subValue={`${kpi?.pendingApprovals || 0} 项待审批`}
          color="amber"
          delay={200}
        />
        <KpiCard
          icon={Users}
          label="活跃任务数"
          value={kpi?.inProgressTasks || 0}
          subValue={`${kpi?.activeProjects || 0} 个进行中项目`}
          trend={{ value: "5%", up: true }}
          color="blue"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold font-heading text-slate-100">
                资源热力图
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                近30天任务分布与工作强度
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>低</span>
              <div className="flex gap-0.5">
                {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                  <div
                    key={i}
                    className={cn("w-4 h-4 rounded-sm", getHeatmapColor(intensity))}
                  />
                ))}
              </div>
              <span>高</span>
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex gap-1">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => {
                    const isToday = day.date === new Date().toISOString().split("T")[0];
                    return (
                      <div
                        key={di}
                        className={cn(
                          "w-5 h-5 rounded-sm heatmap-cell cursor-pointer relative",
                          getHeatmapColor(day.intensity),
                          isToday && "ring-2 ring-emerald/60"
                        )}
                        title={`${day.date}: ${day.total}个任务`}
                      >
                        {day.intensity > 0.7 && (
                          <div className="absolute inset-0 rounded-sm animate-pulse-glow" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: "进行中任务", value: kpi?.inProgressTasks || 0, color: "text-cyan-400" },
              { label: "逾期任务", value: kpi?.overdueTasks || 0, color: "text-red-400" },
              { label: "平均绩效", value: kpi?.avgPerformanceScore || 0, color: "text-emerald-400" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className={cn("text-2xl font-bold font-heading", item.color)}>
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold font-heading text-slate-100">
                部门产能
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">实时负载状态</p>
            </div>
            <Radio className="w-4 h-4 text-emerald animate-pulse" />
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-2">
            {capacity.map((dept, i) => (
              <div
                key={dept.departmentId}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-cyan-blue flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {dept.departmentName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dept.onlineCount}/{dept.memberCount} 人在线
                      </p>
                    </div>
                  </div>
                  <RingProgress
                    value={dept.avgLoad}
                    size={48}
                    strokeWidth={5}
                    color={getLoadColor(dept.avgLoad)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold text-cyan-400">
                      {dept.activeTasks}
                    </p>
                    <p className="text-xs text-slate-500">进行中</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      {dept.pendingTasks}
                    </p>
                    <p className="text-xs text-slate-500">待分配</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      {dept.completedTasks}
                    </p>
                    <p className="text-xs text-slate-500">已完成</p>
                  </div>
                </div>
                {dept.loadStatus === "overloaded" && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                    <AlertTriangle className="w-3 h-3" />
                    <span>负载偏高，建议资源调度</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold font-heading text-slate-100">
                项目进度概览
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">主要项目推进状态</p>
            </div>
            <span className="text-xs text-slate-500">共 {kpi?.totalProjects || 0} 个项目</span>
          </div>
          <div className="space-y-4">
            {[
              { name: "企业ERP升级项目", progress: 78, status: "active", team: 12 },
              { name: "移动办公App开发", progress: 45, status: "active", team: 8 },
              { name: "数据中台建设", progress: 92, status: "active", team: 15 },
              { name: "客户管理系统重构", progress: 30, status: "active", team: 6 },
              { name: "智能客服机器人", progress: 65, status: "active", team: 5 },
            ].map((project, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 hover:border-slate-600/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-cyan-blue flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500">{project.team} 人团队</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-heading text-emerald-400">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-cyan-blue rounded-full transition-all duration-1000"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold font-heading text-slate-100">
                实时动态
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">最新事件流</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
            {events.map((event, i) => {
              const config = eventTypeIcon[event.type] || eventTypeIcon.system;
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      config.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium leading-tight">
                      {event.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {event.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {event.user && (
                        <span className="text-xs text-slate-400">
                          {event.user.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-600">
                        {formatEventTime(event.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
